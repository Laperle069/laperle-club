// =====================================================================
//  La Perlé Treueprogramm – Edge Function "wallet"
//
//  Zwei Aufgaben:
//   1. /link   – erzeugt den signierten "In Google Wallet speichern"-Link
//                für eine Kundin. Aufruf aus dem Clubbereich.
//   2. /sync   – aktualisiert die Punktestände auf bereits gespeicherten
//                Karten. Läuft automatisch, alle paar Minuten.
//
//  Anlegen im Supabase-Dashboard: Edge Functions → Deploy a new function
//  → Name "wallet" → diesen Inhalt einfügen → Deploy.
//
//  Secrets: GOOGLE_SERVICE_ACCOUNT, SYNC_GEHEIMNIS; PUBLIC_API_KEY
//  (oder automatisch SUPABASE_ANON_KEY). Dienstzugriff über DIENST_KEY
//  oder automatisch SUPABASE_SERVICE_ROLE_KEY. SUPABASE_URL liefert die Umgebung.
//  /link prüft den Kundentoken, /sync das eigene Geheimnis. Gateway-JWT-Prüfung
//  muss für diese Funktion aus sein; siehe AKTUELL_START_HIER.md.
//
//  Der private Schlüssel verlässt Supabase nie und steht in keiner Seite.
// =====================================================================

let KONTO: Record<string, string> = {};
try { const k = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT") ?? "{}"); if (k && typeof k === "object") KONTO = k; } catch { /* Fehlende Einrichtung darf den Worker nicht zum Absturz bringen. */ }
// Ausschließlich das Projekt der laufenden Edge-Umgebung verwenden.
const DB_URL = Deno.env.get("SUPABASE_URL") ?? "";
// Öffentlicher Schlüssel: reicht für /link, weil wallet_kartendaten den
// Kundentoken prüft und für anon freigegeben ist.
const OEFFENTLICH = Deno.env.get("PUBLIC_API_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY") ?? "";
// Dienstschlüssel: NUR für /sync. Fehlt er, wird /sync abgelehnt – niemals
// auf den öffentlichen zurückfallen (B10).
const DIENST = Deno.env.get("DIENST_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
// Eigenes Geheimnis, das der Aufrufer von /sync mitschicken muss
const SYNC_GEHEIMNIS = Deno.env.get("SYNC_GEHEIMNIS") ?? "";

// Jeder externe Aufruf hat ein Zeitlimit; keine neuen PATCHes kurz vor Lease-Ende.
async function zeitFetch(input: string, init: RequestInit = {}): Promise<Response> {
  return fetch(input, { ...init, signal: AbortSignal.timeout(10_000) });
}

// ---------------------------------------------------------------------
//  Signieren mit RS256
// ---------------------------------------------------------------------

function b64url(daten: Uint8Array | string): string {
  const bytes = typeof daten === "string" ? new TextEncoder().encode(daten) : daten;
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function schluessel(): Promise<CryptoKey> {
  const pem = (KONTO.private_key ?? "")
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const roh = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  return await crypto.subtle.importKey(
    "pkcs8", roh,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"],
  );
}

async function signieren(nutzlast: Record<string, unknown>): Promise<string> {
  const kopf = { alg: "RS256", typ: "JWT" };
  const text = `${b64url(JSON.stringify(kopf))}.${b64url(JSON.stringify(nutzlast))}`;
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5", await schluessel(), new TextEncoder().encode(text),
  );
  return `${text}.${b64url(new Uint8Array(sig))}`;
}

// ---------------------------------------------------------------------
//  Zugriffstoken für die Wallet-API besorgen
// ---------------------------------------------------------------------

let tokenZwischenspeicher: { wert: string; bis: number } | null = null;

async function zugriffstoken(): Promise<string> {
  if (tokenZwischenspeicher && tokenZwischenspeicher.bis > Date.now() + 60_000) {
    return tokenZwischenspeicher.wert;
  }
  const jetzt = Math.floor(Date.now() / 1000);
  const jwt = await signieren({
    iss: KONTO.client_email,
    scope: "https://www.googleapis.com/auth/wallet_object.issuer",
    aud: "https://oauth2.googleapis.com/token",
    iat: jetzt, exp: jetzt + 3600,
  });
  const antwort = await zeitFetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const d = await antwort.json();
  if (!d.access_token) throw new Error("Kein Zugriffstoken: " + JSON.stringify(d));
  tokenZwischenspeicher = { wert: d.access_token, bis: Date.now() + d.expires_in * 1000 };
  return d.access_token;
}

// ---------------------------------------------------------------------
//  Datenbank ansprechen
// ---------------------------------------------------------------------

async function rpc(name: string, args: Record<string, unknown>, schluessel: string) {
  const antwort = await zeitFetch(`${DB_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": schluessel,
      ...(schluessel.startsWith("eyJ") ? { "Authorization": `Bearer ${schluessel}` } : {}),
    },
    body: JSON.stringify(args),
  });
  if (!antwort.ok) {
    // Keine Schlüsselreste, keine Stacktraces nach außen
    throw new Error(`${name}: ${antwort.status}`);
  }
  return await antwort.json();
}

// Zeitkonstanter Vergleich, damit man das Geheimnis nicht Zeichen für
// Zeichen erraten kann
function gleich(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// ---------------------------------------------------------------------
//  Kartenvorlage sicherstellen
//  Fehlt die Klasse bei Google, legt die Funktion sie selbst an.
//  Damit hängt nichts mehr an einem von Hand ausgefüllten Formular.
// ---------------------------------------------------------------------

const gepruefteKlassen = new Set<string>();
const feld = (fieldPath:string) => ({firstValue:{fields:[{fieldPath}]}});
// Three native rows: name, membership date, then balance and next rank.
const kartenLayout = {cardRowTemplateInfos:[
  {oneItem:{item:feld("object.accountName")}},
  {oneItem:{item:feld("object.textModulesData['mitglied_seit']")}},
  {twoItems:{startItem:feld("object.loyaltyPoints.balance"),endItem:feld("object.secondaryLoyaltyPoints.balance")}},
]};

async function klasseSicherstellen(d: any) {
  if (gepruefteKlassen.has(d.class_id)) return;
  const at = await zugriffstoken();
  const url = "https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass";

  const da = await zeitFetch(`${url}/${d.class_id}`, {
    headers: { "Authorization": `Bearer ${at}` },
  });
  if (da.ok) {
    const current=await da.json();
    if(JSON.stringify(current.classTemplateInfo?.cardTemplateOverride)!==JSON.stringify(kartenLayout)) {
      const changed=await zeitFetch(`${url}/${d.class_id}`,{method:"PATCH",
        headers:{Authorization:`Bearer ${at}`,"Content-Type":"application/json"},
        body:JSON.stringify({reviewStatus:"UNDER_REVIEW",accountNameLabel:"Mitglied",classTemplateInfo:{...current.classTemplateInfo,cardTemplateOverride:kartenLayout}})});
      if(!changed.ok) { const error=await changed.json().catch(()=>({})); throw new Error("Kartenlayout: "+changed.status+" "+String(error.error?.message??"").slice(0,150)); }
    }
    gepruefteKlassen.add(d.class_id); return;
  }
  if (da.status !== 404) throw new Error("Klasse nicht erreichbar: " + da.status);

  const vorlage = {
    id: d.class_id,
    issuerName: "La Perlé Beauty Boutique",
    programName: "La Perlé Club",
    classTemplateInfo:{cardTemplateOverride:kartenLayout},
    reviewStatus: "UNDER_REVIEW",
    // V33: Seitenhintergrund der Midnight-Privé-Palette; Textfarbe setzt Google automatisch (hell auf dunkel)
    hexBackgroundColor: "#21191A",
    programLogo: {
      sourceUri: { uri: d.logo_url ?? "" },
      contentDescription: { defaultValue: { language: "de", value: "La Perlé" } },
    },
    countryCode: "DE",
    multipleDevicesAndHoldersAllowedStatus: "MULTIPLE_HOLDERS",
    accountNameLabel: "Mitglied",
    accountIdLabel: "Kundennummer",
    homepageUri: {
      uri: "https://laperle-beauty.de",
      description: "Mein Punktestand",
    },
    textModulesData: [{
      header: "So sammelst du",
      body: "Ein Euro Umsatz, eine Perle. Prämien löst du direkt bei uns im Studio ein – "
          + "sag am Empfang einfach Bescheid.",
      id: "erklaerung",
    }],
    linksModuleData: {
      uris: [{
        uri: "https://beautinda.de/salon/51EsvFBHxDRcmZqOg3rC",
        description: "Termin buchen",
        id: "termin",
      }],
    },
  };

  const neu = await zeitFetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${at}`, "Content-Type": "application/json" },
    body: JSON.stringify(vorlage),
  });
  if (!neu.ok) {
    const text = await neu.text();
    // 409 heißt: existiert bereits – dann ist alles gut
    if (neu.status !== 409) throw new Error("Kartenvorlage: " + text);
  }
  gepruefteKlassen.add(d.class_id);
}

// ---------------------------------------------------------------------
//  Wie die Karte aussieht
// ---------------------------------------------------------------------

function rangArtwork(rang: string | null): Record<string, unknown> {
  const base = Deno.env.get("GOOGLE_PASS_ASSET_BASE_URL") || (DB_URL === "https://xzxplhvkabgfyglmkcii.supabase.co" ? "https://xzxplhvkabgfyglmkcii.supabase.co/storage/v1/object/public/wallet-artwork/metallic-facets-v2/google/" : DB_URL === "https://byiocfdghgbxxdcmaqoh.supabase.co" ? "https://laperle069.github.io/laperle-club/assets/wallet/refined-metallic-v4/google/" : "");
  if (!base) return {};
  const slug = (rang ?? "Bronze").toLocaleLowerCase("de-DE");
  if (!["bronze","silber","gold","platin","diamant"].includes(slug)) throw new Error("Rangdesign fehlt");
  const url = new URL(base.endsWith("/") ? base : base + "/");
  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) throw new Error("Bildadresse ungültig");
  return {hexBackgroundColor:({bronze:"#78533F",silber:"#C4CBD1",gold:"#C8AC74",platin:"#D0D0C9",diamant:"#D1E2EC"} as Record<string,string>)[slug],heroImage:{sourceUri:{uri:new URL(`${slug}/hero.png`,url).href},
    contentDescription:{defaultValue:{language:"de",value:`La Perlé Club – ${rang ?? "Mitglied"}`}}}};
}

function rangFortschritt(d: any) {
  if(!d.rang) return {label:"Rang",balance:{string:"Mitglied"}};
  const next=d.rangfortschritt;
  return next
    ? {label:`${d.rang} → ${next.name}`,balance:{string:`Noch ${next.fehlen.toLocaleString("de-DE")} ${next.fehlen===1?"Perle":"Perlen"}`}}
    : {label:d.rang,balance:{string:"Höchster Rang erreicht"}};
}

function kartenobjekt(d: any) {
  return {
    ...rangArtwork(d.rang),
    id: d.object_id,
    classId: d.class_id,
    state: "ACTIVE",
    accountId: d.kundennummer,
    accountName: `${d.vorname} ${d.nachname}`,
    loyaltyPoints: {
      label: "Perlen",
      balance: { int: d.stand },
    },
    secondaryLoyaltyPoints: rangFortschritt(d),
    barcode: {
      type: "QR_CODE",
      value: d.kundennummer,
      alternateText: d.kundennummer,
    },
    textModulesData: [
      { header: "Bis zur nächsten Prämie", body: d.naechste, id: "naechste" },
      ...(d.mitglied_seit ? [{header:"Mitglied seit",body:d.mitglied_seit,id:"mitglied_seit"}] : []),
    ],
    linksModuleData: {
      uris: [
        { uri: d.club_url, description: "Mein Punktestand", id: "club" },
        { uri: "https://beautinda.de/salon/51EsvFBHxDRcmZqOg3rC",
          description: "Termin buchen", id: "termin" },
      ],
    },
  };
}

// ---------------------------------------------------------------------
//  Anfragen beantworten
// ---------------------------------------------------------------------

const kopfzeilen = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (anfrage) => {
  if (anfrage.method === "OPTIONS") return new Response("ok", { headers: kopfzeilen });
  if (anfrage.method !== "POST") return new Response("Method not allowed", {status:405,headers:kopfzeilen});
  if (!DB_URL || !OEFFENTLICH) return new Response(JSON.stringify({fehler:"Wallet ist noch nicht eingerichtet."}),{status:503,headers:kopfzeilen});

  try {
    const pfad = new URL(anfrage.url).pathname.split("/").pop();

    // Read-only readiness check. No passes created and no customer data returned.
    if (pfad === "check") {
      const secret = anfrage.headers.get("x-sync-geheimnis") ?? "";
      if (!DIENST || secret.length < 32 || secret.length > 512 || await rpc("wallet_worker_authorized", {p_secret:secret}, DIENST) !== true)
        return new Response(JSON.stringify({fehler:"Nicht berechtigt"}),{status:401,headers:kopfzeilen});
      if (!KONTO.client_email || !KONTO.private_key)
        return new Response(JSON.stringify({ready:false,reason:"GOOGLE_SERVICE_ACCOUNT fehlt"}),{status:503,headers:kopfzeilen});
      const settingsResponse = await zeitFetch(DB_URL + "/rest/v1/einstellung?select=schluessel,wert&schluessel=in.(google_issuer_id,google_class_id,club_basis_url)", {
        headers:{apikey:DIENST,...(DIENST.startsWith("eyJ")?{Authorization:`Bearer ${DIENST}`}:{})},
      });
      if (!settingsResponse.ok) throw new Error("Einstellungen nicht erreichbar");
      const settings = Object.fromEntries((await settingsResponse.json()).map((x:any)=>[x.schluessel,x.wert]));
      if (!/^\d+\.[A-Za-z0-9._-]+$/.test(settings.google_class_id) || !settings.google_class_id.startsWith(settings.google_issuer_id+".")) throw new Error("Klassen-ID fehlt");
      const at = await zugriffstoken();
      const result = await zeitFetch("https://walletobjects.googleapis.com/walletobjects/v1/loyaltyClass/"+encodeURIComponent(settings.google_class_id),{headers:{Authorization:`Bearer ${at}`}});
      const data = result.ok ? await result.json() : {};
      const club = new URL(settings.club_basis_url);
      const clubReady = club.protocol==="https:" && !club.hostname.endsWith(".invalid") && !club.username && !club.password;
      return new Response(JSON.stringify({ready:result.ok&&String(data.reviewStatus).toUpperCase()==="APPROVED"&&clubReady,
        apiStatus:result.status,classReviewStatus:data.reviewStatus??null,clubReady,
        publishingAccess:"In Google Wallet Console bzw. beim Gerätetest prüfen"}),{headers:kopfzeilen});
    }

    // --- Link zum Speichern erzeugen -------------------------------
    if (pfad === "link") {
      const { token } = await anfrage.json();
      if (typeof token !== "string" || !token || token.length > 512) return new Response(JSON.stringify({fehler:"Bitte öffne deinen persönlichen Club-Link erneut."}),{status:400,headers:kopfzeilen});

      const d = await rpc("wallet_kartendaten", { p_token: token }, OEFFENTLICH);
      if (!d.aktiv) {
        return new Response(JSON.stringify({ bereit: false }), { headers: kopfzeilen });
      }

      if (!KONTO.client_email || !KONTO.private_key) {
        return new Response(JSON.stringify({bereit:false,fehler:"Google Wallet wird gerade eingerichtet. Bitte versuche es später erneut."}),{status:503,headers:kopfzeilen});
      }
      if (!/^\d+\.[A-Za-z0-9._-]+$/.test(d.class_id) || !d.class_id.startsWith(d.issuer_id + ".")) throw new Error("Ungültige Klasse");
      const club = new URL(d.club_url);
      if (club.protocol !== "https:" || club.hostname.endsWith(".invalid") || club.username || club.password) throw new Error("Club-Adresse fehlt");
      await klasseSicherstellen(d);
      // Objekt vorab speichern: der Save-JWT bleibt kurz und enthält keinen Club-Zugang.
      const at = await zugriffstoken();
      const objekt = kartenobjekt(d);
      const objektUrl = "https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject";
      const headers = {Authorization:`Bearer ${at}`,"Content-Type":"application/json"};
      let gespeichert = await zeitFetch(objektUrl,{method:"POST",headers,body:JSON.stringify(objekt)});
      if (gespeichert.status === 409) {
        gespeichert = await zeitFetch(`${objektUrl}/${encodeURIComponent(d.object_id)}`,{method:"PATCH",headers,body:JSON.stringify(objekt)});
      }
      if (!gespeichert.ok) throw new Error("Kartenausgabe: " + gespeichert.status);
      // Bedeutet „ausgegeben“, keine Bestätigung, dass die Kundin den Pass gespeichert hat.
      await rpc("wallet_gespeichert",{p_token:token},OEFFENTLICH);

      const jwt = await signieren({
        iss: KONTO.client_email,
        aud: "google",
        typ: "savetowallet",
        iat: Math.floor(Date.now() / 1000),
        origins: [],
        payload: { loyaltyObjects: [{id:d.object_id}] },
      });

      return new Response(JSON.stringify({
        bereit: true,
        url: `https://pay.google.com/gp/v/save/${jwt}`,
      }), { headers: kopfzeilen });
    }

    // --- Punktestände auf gespeicherten Karten aktualisieren --------
    if (pfad === "sync") {
      // Berechtigung: eigenes Geheimnis im Header, exakt verglichen.
      // Ohne gesetztes Geheimnis oder ohne Dienstschlüssel: immer ablehnen.
      const kopf = anfrage.headers.get("x-sync-geheimnis") ?? "";
      if (!DIENST || !(SYNC_GEHEIMNIS && gleich(kopf, SYNC_GEHEIMNIS)) && !(kopf.length >= 32 && kopf.length <= 512 && await rpc("wallet_worker_authorized", {p_secret:kopf}, DIENST) === true)) {
        return new Response(JSON.stringify({ fehler: "Nicht berechtigt" }),
          { status: 401, headers: kopfzeilen });
      }

      const offen = await rpc("wallet_offene_karten", { p_grenze: 50 }, DIENST);
      if (!offen.length) {
        return new Response(JSON.stringify({ aktualisiert: 0 }), { headers: kopfzeilen });
      }

      const at = await zugriffstoken();
      // Besitzkennung verhindert verspätete Quittierungen. Periodischer Vollabgleich
      // repariert auch externe Änderungen nach einem Worker-Absturz (ohne Quittung).
      const quittungen: { object_id: string; lease_id: string; version: number; ok?: boolean; status?: number; fehler?: string }[] = [];
      let fehlgeschlagen = 0;

      for (const k of offen) {
        if (!k.lease_id || Date.now() + 20_000 >= Date.parse(k.lease_bis)) break;
        try {
          if(k.class_id) await klasseSicherstellen(k);
          const antwort = await zeitFetch(
            `https://walletobjects.googleapis.com/walletobjects/v1/loyaltyObject/${k.object_id}`,
            {
              method: "PATCH",
              headers: { "Authorization": `Bearer ${at}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                ...rangArtwork(k.rang),
                accountName: [k.vorname,k.nachname].filter(Boolean).join(" "),
                linksModuleData: { uris: [{ uri:k.club_url, description:"Mein Punktestand", id:"club" },
                  {uri:"https://beautinda.de/salon/51EsvFBHxDRcmZqOg3rC",description:"Termin buchen",id:"termin"}] },
                loyaltyPoints: { label: "Perlen", balance: { int: k.stand } },
                secondaryLoyaltyPoints: rangFortschritt(k),
                textModulesData: [
                  { header: "Bis zur nächsten Prämie", body: k.naechste, id: "naechste" },
                  ...(k.mitglied_seit ? [{header:"Mitglied seit",body:k.mitglied_seit,id:"mitglied_seit"}] : []),
                ],
              }),
            },
          );
          if (antwort.ok) {
            quittungen.push({ object_id: k.object_id, lease_id: k.lease_id, version: k.version, ok: true });
          } else {
            const text = (await antwort.text()).slice(0, 200);
            quittungen.push({ object_id: k.object_id, lease_id: k.lease_id, version: k.version, ok: false, status: antwort.status, fehler: text });
            fehlgeschlagen++;
            if (antwort.status === 429) break;     // Anbieter bremst: Rest bleibt für den nächsten Lauf (Lease läuft ab)
          }
        } catch (e) {
          quittungen.push({ object_id: k.object_id, lease_id: k.lease_id, version: k.version, ok: false, status: 0, fehler: (e instanceof Error ? e.message : String(e)).slice(0, 200) });
          fehlgeschlagen++;
        }
      }

      if (quittungen.length) await rpc("wallet_quittieren", { p_quittungen: quittungen }, DIENST);
      return new Response(JSON.stringify({
        aktualisiert: quittungen.length - fehlgeschlagen, fehlgeschlagen, offen: offen.length,
      }), { headers: kopfzeilen });
    }

    return new Response(JSON.stringify({ fehler: "Unbekannter Pfad" }),
      { status: 404, headers: kopfzeilen });

  } catch (e) {
    return new Response(JSON.stringify({ fehler: "Wallet-Anfrage konnte nicht abgeschlossen werden. Bitte später erneut versuchen." }),
      { status: 500, headers: kopfzeilen });
  }
});
