// ---------------------------------------------------------------
const SUPABASE_URL = "https://xzxplhvkabgfyglmkcii.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_sydmJdsf2txAUuOYvog9KA_6QKSVolK";
const STUDIO = "FFM-01";
const BUCHUNG = "https://beautinda.de/salon/51EsvFBHxDRcmZqOg3rC";  // Terminbuchung
// ---------------------------------------------------------------

const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const $ = id => document.getElementById(id);
const P = new URLSearchParams(location.search);
let token = P.get("t") || "", daten = null;
const sanft = () => matchMedia("(prefers-reduced-motion: reduce)").matches;   // Systempräferenz (V29)

const sagen = (m, bad) => { const n = $("note"); n.textContent = m; n.className = "note on" + (bad ? " bad" : "");
  clearTimeout(n._t); n._t = setTimeout(() => n.className = "note", 3800); };
const zeig = id => { ["reg","fertig","club"].forEach(s => $(s).classList.toggle("hide", s !== id)); window.scrollTo(0, 0); };
const datum = s => s ? new Date(s).toLocaleDateString("de-DE", { day: "2-digit", month: "short" }) : "–";
const datumLang = s => s ? new Date(s).toLocaleDateString("de-DE", { day: "numeric", month: "long" }) : "–";
const zahl = n => (+n || 0).toLocaleString("de-DE");

// ---------- N02: sichere Ausgabe – Text bleibt Text ----------
function esc(v) {
  if (v === null || v === undefined) return "";
  return String(v).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}
function urlOk(v) {
  if (!v) return "";
  try { const u = new URL(String(v), location.href);
        return (u.protocol === "https:" || u.protocol === "http:" || u.protocol === "mailto:") ? u.href : ""; }
  catch (e) { return ""; }
}
// Element mit Textknoten bauen: el("b", "Text", {class:"x"})
function el(tag, text, attrs) { const e = document.createElement(tag); if (text != null) e.textContent = text;
  for (const k in (attrs || {})) e.setAttribute(k, attrs[k]); return e; }

async function rpc(fn, args) {
  const { data, error } = await db.rpc(fn, args);
  if (error) throw new Error((error.message || "Fehler").replace(/^.*?: /, ""));
  return data;
}
// Mehrfachklick-Schutz für alle Knöpfe, die schreiben (V35)
const laeuft = new Set();
async function mitSperre(btn, fn) {
  if (laeuft.has(btn)) return; laeuft.add(btn); btn.disabled = true; btn.classList.add("laedt");
  try { await fn(); } finally { laeuft.delete(btn); btn.disabled = false; btn.classList.remove("laedt"); }
}

// ---------- Beitreten (N08: kein Zugang im Browser, nur per Mail) ----------
const geladen = Date.now();
let letzteMail = "";
$("regForm").addEventListener("submit", e => { e.preventDefault(); registrieren(); });
async function registrieren() {
  if ($("rHp").checked || Date.now() - geladen < 2000) { sagen("Einen Moment noch – dann klappt es.", true); return; }
  const v = $("rVor").value.trim(), n = $("rNach").value.trim(), m = $("rMail").value.trim();
  if (!v || !n || !m) { sagen("Bitte Vorname, Nachname und E-Mail ausfüllen.", true); return; }
  await mitSperre($("rBtn"), async () => {
    try {
      const r = await rpc("selbst_registrieren", { p_vorname: v, p_nachname: n, p_email: m,
        p_studio_kennung: STUDIO, p_sprache: (navigator.language || "de").slice(0, 2), p_werberin: P.get("ref") || null });
      // Vertrag 030: {status:'bestaetigen', vorname} – nie ein Token
      letzteMail = m;
      $("fName").textContent = (r && r.vorname ? r.vorname + ", schau" : "Schau") + " in dein Postfach.";
      $("fText").textContent = `Wir haben eine E-Mail an ${m} geschickt. Öffne den Link darin – erst dann ist dein Konto aktiv.`;
      zeig("fertig");
    } catch (e) { sagen(e.message, true); }
  });
}
$("fNochmal").onclick = () => mitSperre($("fNochmal"), async () => {
  try { await rpc("selbst_registrieren", { p_vorname: $("rVor").value.trim() || "–", p_nachname: $("rNach").value.trim() || "–",
      p_email: letzteMail, p_studio_kennung: STUDIO, p_sprache: "de", p_werberin: null });
    sagen("Wenn es ein Konto zu dieser Adresse gibt, ist der Link unterwegs."); }
  catch (e) { sagen(e.message, true); }
});
$("fZurueck").onclick = () => zeig("reg");

// ---------- Wallet ----------
async function walletKarte(btn) {
  await mitSperre(btn, async () => {
    try {
      const a = await fetch(SUPABASE_URL + "/functions/v1/wallet/link", { method: "POST",
        headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY, "Authorization": "Bearer " + SUPABASE_ANON_KEY },
        body: JSON.stringify({ token }) });
      const d = await a.json();
      if (d.bereit && d.url) { try { await rpc("wallet_gespeichert", { p_token: token }); } catch (e) {} location.href = d.url; return; }
      if (d.fehler) sagen("Wallet: " + d.fehler, true);
      else if (d.bereit === false) sagen("Die Wallet-Karte ist noch nicht freigeschaltet.", true);
      else sagen("Unerwartete Antwort der Wallet-Funktion.", true);
    } catch (e) { sagen("Wallet nicht erreichbar.", true); }
  });
}
$("walletBtn").onclick = () => walletKarte($("walletBtn"));
$("walletTop").onclick = () => walletKarte($("walletTop"));

// ---------- Club laden ----------
let ladeGen = 0;                                  // jede Ladung ist ein neuer Snapshot (V26)
async function laden() {
  const meine = ++ladeGen;
  try {
    const d = await rpc("kunde_laden", { p_token: token });
    if (meine !== ladeGen) return;
    d.einwilligungen = await rpc("kunde_einwilligungen", { p_token: token }).catch(() => ({}));
    if (meine !== ladeGen) return;
    daten = d; zeichnen(); zeig("club");
    feierEinreihen(d.feier || [], meine);
  } catch (e) { sagen(e.message, true); zeig("reg"); }
}

// ---------- Kette (V09): höchstens sechs belegte Buchungen, links alt → rechts neu ----------
const POS = [[6,42],[21,64],[39,73],[58,72],[77,56],[94,26]];
const anlaesse = { behandlung:"Behandlung", produkt:"Produkt", gutscheinkauf:"Geschenkgutschein", willkommensbonus:"Willkommensbonus",
  gluecksrad:"Glücksrad", advent:"Adventskalender", aktion:"Aktion", empfehlung:"Empfehlung", einloesung:"Prämie eingelöst",
  korrektur:"Korrektur", verfall:"Verfallen", import:"Übernahme" };
function ketteZeichnen(verlauf) {
  const n = $("necklace"); n.querySelectorAll(".pearl").forEach(p => p.remove());
  // Der Vertrag liefert Buchungen (punktebewegung), keine Besuche – deshalb "Buchungen"
  const eintraege = (verlauf || []).filter(v => v.betrag > 0).slice(0, 6).reverse();
  $("kettenZahl").textContent = eintraege.length ? String(eintraege.length).padStart(2, "0") : "";
  if (!eintraege.length) {
    $("kettenNotiz").textContent = "Deine Geschichte beginnt mit deinem ersten Eintrag.";
    POS.forEach((p, i) => { const d = el("span", null, { class: `pearl deko p${i+1}`, "aria-hidden": "true" }); n.appendChild(d); });
    return;
  }
  $("kettenNotiz").textContent = "Deine Buchungen. Deine Geschichte.";
  const start = 6 - eintraege.length;                       // freie Positionen links bleiben dekorativ
  for (let i = 0; i < start; i++) n.appendChild(el("span", null, { class: `pearl deko p${i+1}`, "aria-hidden": "true" }));
  eintraege.forEach((v, i) => {
    const b = el("button", null, { type: "button", class: `pearl p${start + i + 1}`, "aria-pressed": "false",
      "aria-label": `Buchung vom ${datumLang(v.zeitpunkt)} ansehen` });
    b.onclick = () => {
      n.querySelectorAll(".pearl[aria-pressed]").forEach(x => x.setAttribute("aria-pressed", "false"));
      b.setAttribute("aria-pressed", "true");
      $("kettenNotiz").textContent = `${datumLang(v.zeitpunkt)} · ${anlaesse[v.anlass] || v.anlass} · ${zahl(v.betrag)} Perlen`;
    };
    n.appendChild(b);
  });
}

// ---------- Hauptkomposition ----------
function zeichnen() {
  const d = daten, F = d.funktionen || {};
  $("gruss").innerHTML = "";
  if (d.vorname) { $("gruss").append("Schön, dass du da bist,", document.createElement("br"), el("em", d.vorname + ".")); }
  else $("gruss").textContent = "Schön, dass du da bist.";
  $("kNr").textContent = d.kundennummer || "";
  $("terminBtn").href = BUCHUNG;

  // Karte
  const stand = +d.stand || 0, st = $("kStand");
  st.textContent = zahl(stand);
  st.parentElement.classList.toggle("lang", stand >= 100000); st.parentElement.classList.toggle("sehrlang", stand >= 10000000);
  $("rang").hidden = !(d.level && F.level !== false);
  if (d.level) $("rang").querySelector("span").textContent = d.level.name;
  ketteZeichnen(d.verlauf);

  // Prämie (V10): verfügbare zuerst (bestehende Reihenfolge nach Punkten), sonst die nächste
  const alle = d.praemien || [], frei = alle.filter(p => p.erreichbar);
  const hervor = frei[0] || alle.find(p => !p.erreichbar) || null;
  $("featured").classList.toggle("hide", !hervor); $("frLeer").classList.toggle("hide", !!hervor);
  $("rewardZahl").textContent = alle.length ? `${String(Math.max(1, alle.indexOf(hervor) + 1)).padStart(2,"0")} / ${String(alle.length).padStart(2,"0")}` : "";
  if (hervor) {
    $("rewardTitel").textContent = hervor.erreichbar ? "Ein Moment für dich." : "Dein nächster Moment.";
    $("frStatus").textContent = hervor.erreichbar ? "Für dich verfügbar" : `Noch ${zahl(hervor.punkte - stand)} Perlen`;
    $("frName").textContent = hervor.bezeichnung;
    $("frDetail").textContent = hervor.beschreibung || (hervor.erreichbar ? "Beim nächsten Besuch am Empfang einlösen." : "Kommt beim nächsten Besuch näher.");
    $("frPunkte").textContent = `${zahl(hervor.punkte)} Perlen`;
  }
  $("featured").onclick = () => praemienZeigen();
  // Liste aller Prämien
  const pl = $("praemien"); pl.innerHTML = "";
  alle.forEach(p => {
    const it = el("div", null, { class: "item" + (p.erreichbar ? " frei" : ""), id: "praemie-" + p.id, tabindex: "-1" });
    it.append(el("strong", p.bezeichnung), el("span", p.erreichbar ? "erreicht – am Empfang einlösbar" : `noch ${zahl(p.punkte - stand)} Perlen`, { class: "small" }),
              el("span", `${zahl(p.punkte)}`, { class: "pts" }));
    pl.appendChild(it);
  });
  if (!alle.length) pl.innerHTML = '<p class="leer">Aktuell sind keine Prämien hinterlegt.</p>';

  // Rangfortschritt (V10): nur aus dem Levelvertrag, nicht mit Prämien vermischt
  const l = d.level; const nb = $("nextBox"), tr = $("track");
  if (!l || F.level === false) { nb.classList.add("hide"); tr.classList.add("hide"); }
  else {
    nb.classList.remove("hide"); tr.classList.remove("hide");
    if (l.naechste) {
      const anteil = Math.max(0, Math.min(100, +l.naechste.anteil || 0));
      $("nextLabel").textContent = "Dein nächster Rang";
      $("nextText").textContent = `Noch ${zahl(l.naechste.fehlen)} Perlen bis ${l.naechste.name}`;
      $("nextProzent").textContent = `${Math.round(anteil)} %`;
      tr.setAttribute("aria-valuenow", Math.round(anteil)); tr.firstElementChild.style.width = anteil + "%";
    } else {
      $("nextLabel").textContent = "Dein Rang";
      $("nextText").textContent = "Du hast den höchsten Rang erreicht.";
      $("nextProzent").textContent = ""; tr.setAttribute("aria-valuenow", 100); tr.firstElementChild.style.width = "100%";
    }
  }

  // Module (V12)
  $("gebBox").classList.toggle("hide", !d.geburtsdatum_fehlt);
  const em = d.empfehlung;
  $("empfBox").classList.toggle("hide", !em);
  if (em) {
    $("empfText").textContent = "Wenn eine Freundin über deinen Link beitritt, bekommst du dieselbe Punktzahl gutgeschrieben wie sie für ihre erste Behandlung. Einmal je Freundin.";
    const z = $("empfZahlen"); z.innerHTML = "";
    [[em.geworben, "eingeladen"], [em.eingeloest, "schon da gewesen"]].forEach(([n, t]) => { const dv = el("div"); dv.append(el("span", zahl(n)), el("small", t)); z.appendChild(dv); });
    $("empfLink").textContent = em.link;
    $("empfTeilen").onclick = async () => {
      const teilen = { title: "La Perlé Club", text: em.text, url: em.link };
      if (navigator.share) { try { await navigator.share(teilen); } catch (e) {} }
      else { try { await navigator.clipboard.writeText(em.text + " " + em.link); sagen("Einladung kopiert – jetzt in WhatsApp einfügen."); } catch (e) {} }
    };
    $("empfKopieren").onclick = async () => { try { await navigator.clipboard.writeText(em.link); sagen("Link kopiert."); } catch (e) {} };
  }

  const g = d.gewinne || []; $("gewinneBox").classList.toggle("hide", !g.length);
  const gw = $("gewinne"); gw.innerHTML = "";
  g.forEach(x => { const c = el("div", null, { class: "card gewinn", style: "margin-top:10px" });
    if (urlOk(x.bild)) c.appendChild(el("img", null, { class: "bild", src: urlOk(x.bild), alt: "" }));
    const t = el("div"); t.append(el("div", x.bezeichnung, { style: "font:500 18px var(--mp-heading)" }), el("div", "einlösbar bis " + datum(x.gueltig_bis), { class: "small" }));
    c.appendChild(t); gw.appendChild(c); });

  const adv = d.advent || [], dez = new Date().getMonth() === 11;
  $("adventBox").classList.toggle("hide", !dez && !adv.some(t => t.geoeffnet));
  const av = $("advent"); av.innerHTML = "";
  adv.forEach(t => {
    const b = el("button", null, { type: "button", class: "door" + (t.geoeffnet ? " auf" : "") + (t.verpasst ? " verpasst" : ""), "aria-label": "Türchen " + t.tag });
    if (t.geoeffnet || !t.offen) b.disabled = true;
    if (urlOk(t.bild)) b.appendChild(el("img", null, { class: "bild", src: urlOk(t.bild), alt: "" }));
    b.append(el("span", String(t.tag), { class: "vorn", style: "position:relative" }), el("span", t.geoeffnet ? (t.gewinn || "") : "", { class: "hinten" }));
    if (!b.disabled) b.onclick = () => mitSperre(b, async () => {
      try { const r = await rpc("advent_oeffnen", { p_token: token, p_tag: +t.tag });
        b.querySelector(".hinten").textContent = r.bezeichnung; b.classList.add("auf"); b.disabled = true;
        sagen(`Türchen ${r.tag}: ${r.bezeichnung}`); setTimeout(laden, 900);
      } catch (e) { sagen(e.message, true); } });
    av.appendChild(b);
  });

  boardLaden(); zusatzLaden(); zielLaden();

  const ew = d.einwilligungen || {};
  const texte = { email_werbung: ["E-Mails von uns", "wenn der nächste Schritt ansteht oder es etwas Neues gibt"],
    push: ["Hinweise auf der Karte", "kurze Notiz, wenn sich etwas an deinem Stand ändert"],
    geburtstag: ["Geburtstagsgruß", "eine Kleinigkeit an deinem Tag"] };
  const ewBox = $("einwilligungen"); ewBox.innerHTML = "";
  Object.entries(texte).forEach(([k, [t, u]]) => {
    const row = el("div", null, { class: "switch" }); const txt = el("div"); txt.append(el("div", t, { style: "font-size:16px" }), el("div", u, { class: "small" }));
    const sw = el("button", null, { type: "button", class: "sw", "aria-pressed": String(!!ew[k]), "aria-label": t, role: "switch", "aria-checked": String(!!ew[k]) });
    sw.onclick = () => mitSperre(sw, async () => {
      const an = sw.getAttribute("aria-pressed") !== "true";
      try { await rpc("einwilligung_setzen", { p_token: token, p_art: k, p_an: an, p_wortlaut: t + " – " + u });
        sw.setAttribute("aria-pressed", String(an)); sw.setAttribute("aria-checked", String(an)); }
      catch (e) { sagen(e.message, true); } });
    row.append(txt, sw); ewBox.appendChild(row);
  });
}
function praemienZeigen(id) {
  const ziel = id ? $("praemie-" + id) : null;
  const box = ziel || $("praemienBox");
  box.scrollIntoView({ behavior: sanft() ? "auto" : "smooth", block: "start" });
  box.focus({ preventScroll: true });
}
$("alleZeigen").onclick = () => praemienZeigen();

// ---------- Feier (V22–V29) ----------
// Quelle ist ausschließlich kunde_laden.feier. Eine Feier je Snapshot, gestartet 300 ms
// nach dem Rendern, nur bei sichtbarem Dokument und wenn kein Formular/Modal aktiv ist.
let feierWarte = null, feierTimer = null, feierGezeigt = null, feierOffen = false, feierRueckgabe = null, feierStand = null, hintergrundInert = [];
function feierEinreihen(liste, gen) {
  if (!liste.length) return;
  const level = liste.find(f => f.art === "level"), praemie = liste.find(f => f.art === "praemie");
  const schl = (level ? "L" + level.stufe : "") + (praemie ? "P" + praemie.punkte + "x" + (praemie.anzahl || 1) : "");
  if (feierOffen && feierGezeigt === schl) return;              // identische laufende Darstellung nicht neu starten
  feierWarte = { level, praemie, schl, gen };
  feierStartPlanen();
}
// Ein Formularablauf gilt als aktiv, solange ein Feld den Fokus hat (auch leer), ein
// Schalter/Auswahlfeld gerade bedient wird oder die letzte Eingabe keine 3 s her ist.
// So übernimmt die Feier den Fokus nicht überraschend mitten in einer Bearbeitung.
let letzteEingabe = 0;
["input", "change", "focusin", "pointerdown", "keydown"].forEach(ev => document.addEventListener(ev, e => {
  const z = e.target; if (!z || !z.closest) return;
  if (z.closest("input, textarea, select, label, form, .field, .schalter, [role=switch], [role=checkbox]")) letzteEingabe = Date.now();
}, true));
function formularAktiv() {
  const a = document.activeElement;
  const bearbeitet = !!(a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA" || a.tagName === "SELECT" || a.isContentEditable));
  return bearbeitet || (Date.now() - letzteEingabe < 3000) || feierOffen;
}
function feierStartPlanen() {
  clearTimeout(feierTimer);
  if (!feierWarte) return;
  if (document.hidden) return;                                    // beim Sichtbarwerden erneut planen
  feierTimer = setTimeout(() => {
    if (!feierWarte || document.hidden) return;
    if (formularAktiv()) { feierTimer = setTimeout(feierStartPlanen, 1500); return; }
    if (feierWarte.gen !== ladeGen) { feierWarte = null; return; }
    feiern(feierWarte); feierWarte = null;
  }, 300);
}
function feiern(f) {
  const box = $("feier"), name = daten && daten.vorname ? daten.vorname : null;
  const art = f.level && f.praemie ? "both" : f.level ? "level" : "unlock";
  box.dataset.kind = art;
  box.classList.remove("mp-play");
  box.classList.toggle("mp-reduced", sanft());
  $("feierKarteListe").classList.add("hide"); $("feierKarteListe").innerHTML = "";
  if (f.level) {
    $("feierKlein").textContent = "Dein nächstes Kapitel";
    $("feierTitel").textContent = "Ein neuer Glanz.";
    $("feierText").textContent = name ? `Willkommen im Rang ${f.level.name}, ${name}.` : `Willkommen im Rang ${f.level.name}.`;
    $("feierKarte").classList.remove("hide");
    if (f.praemie) { $("feierKarteName").textContent = f.praemie.name; $("feierKarteText").textContent = "Außerdem für dich freigeschaltet – beim nächsten Besuch am Empfang einlösen."; }
    else { $("feierKarteName").textContent = (f.level.name || "").toUpperCase(); $("feierKarteText").textContent = f.level.vorteil || "Ein besonderer Moment für deine Treue."; }
    $("feierZu").textContent = f.praemie ? "Prämie ansehen" : "Meinen Club ansehen";
  } else {
    $("feierKlein").textContent = "Für dich freigeschaltet";
    $("feierTitel").textContent = "Etwas Besonderes.";
    $("feierText").textContent = "Deine Treue verdient eine Auszeit.";
    $("feierKarte").classList.remove("hide");
    $("feierKarteName").textContent = f.praemie.name;
    $("feierKarteText").textContent = "Beim nächsten Besuch am Empfang einlösen.";
    $("feierZu").textContent = "Prämie ansehen";
  }
  // mehrere freigeschaltete Prämien: erste hervorgehoben, die übrigen verfügbaren als Liste
  if (f.praemie && (f.praemie.anzahl || 1) > 1 && daten) {
    // Der Vertrag liefert nur die Zahl (anzahl), nicht die neuen IDs – die Liste zeigt deshalb
    // ausdrücklich „Weitere verfügbare Prämien“ (Abweichung A2 gegenüber V24, offen ausgewiesen).
    const ul = $("feierKarteListe"); const weitere = (daten.praemien || []).filter(p => p.erreichbar && p.bezeichnung !== f.praemie.name);
    if (weitere.length) { ul.appendChild(el("li", "Weitere verfügbare Prämien", { class: "titel" })); weitere.forEach(p => ul.appendChild(el("li", p.bezeichnung))); ul.classList.remove("hide"); }
  }
  const dust = $("feierDust"); dust.innerHTML = "";
  for (let i = 0; i < 12; i++) { const dot = el("i"), a = i / 12 * Math.PI * 2;
    dot.style.setProperty("--x", Math.cos(a) * 96 + "px"); dot.style.setProperty("--y", Math.sin(a) * 82 + "px");
    dot.style.setProperty("--delay", (i % 3) * .07 + "s"); dust.appendChild(dot); }
  feierGezeigt = f.schl; feierOffen = true; feierRueckgabe = document.activeElement; feierStand = { level: f.level ? f.level.stufe : null, praemien: f.praemie ? (f.praemie.anzahl || 1) : null };
  // V28: Hintergrund wirklich deaktivieren (inert) – Tastatur, Zeiger und assistive Technik erreichen nur den Dialog
  hintergrundInert = [...document.body.children].filter(c => c !== box && c.id !== "toast" && !c.inert);
  hintergrundInert.forEach(c => { c.inert = true; });
  box.classList.add("an"); document.body.style.overflow = "hidden";
  void box.offsetWidth; box.classList.add("mp-play");
  $("feierAnsage").textContent = $("feierKlein").textContent + ". " + $("feierTitel").textContent + " " + $("feierText").textContent;
  $("feierZu").focus();
  $("feierZu").onclick = () => { const zuPraemie = f.praemie; feierSchliessen(); if (zuPraemie) { const p = (daten.praemien || []).find(x => x.bezeichnung === zuPraemie.name && x.erreichbar); praemienZeigen(p && p.id); } };
}
async function feierSchliessen() {
  const box = $("feier"); if (!feierOffen) return;
  feierOffen = false; box.classList.remove("an", "mp-play"); document.body.style.overflow = "";
  hintergrundInert.forEach(c => { c.inert = false; }); hintergrundInert = [];
  const r = feierRueckgabe && document.body.contains(feierRueckgabe) ? feierRueckgabe : $("gruss");
  if (r && r.focus) { r.setAttribute && !r.hasAttribute("tabindex") && r.tagName === "H1" && r.setAttribute("tabindex", "-1"); r.focus(); }
  // Quittierung nur bis zum GEZEIGTEN Stand (Rangstufe, Prämienzahl) – Fortschritt, der während
  // des offenen Dialogs dazukam, bleibt unquittiert und wird beim nächsten Laden gefeiert.
  const st = feierStand || {};
  try { await rpc("feier_quittieren", { p_token: token, p_level: st.level ?? null, p_praemien: st.praemien ?? null }); } catch (e) { console.warn("Quittierung fehlgeschlagen", e); }
  if (feierWarte) feierStartPlanen();                              // in der Zwischenzeit eingereihte Feier nachholen
}
$("feierZuX").onclick = feierSchliessen;
document.addEventListener("keydown", e => {
  if (!feierOffen) return;
  if (e.key === "Escape") { e.preventDefault(); feierSchliessen(); return; }
  if (e.key === "Tab") {                                          // Fokus bleibt im Dialog (V28)
    const f = [...$("feier").querySelectorAll("button:not([disabled])")], i = f.indexOf(document.activeElement);
    if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  }
});
$("feier").addEventListener("click", e => { if (e.target === $("feier")) feierSchliessen(); });
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { $("feier").classList.remove("mp-play"); clearTimeout(feierTimer); }   // Bewegung beenden, Endzustand bleibt
  else feierStartPlanen();                                          // ausstehende Starts nachholen, laufende nicht wiederholen
});

// ---------- Das Ziel ----------
async function zielLaden() {
  try {
    const z = await rpc("kunde_ziel", { p_token: token });
    if (z.aus) { $("zielBox").classList.add("hide"); return; }
    $("zielBox").classList.remove("hide");
    const box = $("zielInhalt"); box.innerHTML = "";
    if (!z.ziel) {
      $("zielTitel").textContent = "Was möchtest du erreichen?";
      box.append(el("p", "Schreib es in deinen Worten. Wir behalten es im Blick – und du kannst es jederzeit ändern oder löschen.", { class: "lead", style: "margin-bottom:8px" }));
      const f = el("div", null, { class: "field" }); f.append(el("label", "Dein Ziel", { for: "zielText" }), el("textarea", null, { id: "zielText", maxlength: "180", placeholder: "Zum Beispiel: Im Sommer ohne Rasieren an den Strand" }));
      const sw = el("div", null, { class: "switch" }); const txt = el("div"); txt.append(el("div", "Das Studio darf es sehen", { style: "font-size:16px" }), el("div", "Dann kann Lorin am Empfang darauf eingehen", { class: "small" }));
      const b = el("button", null, { type: "button", class: "sw", id: "zielSicht", "aria-pressed": "true", role: "switch", "aria-checked": "true", "aria-label": "sichtbar" });
      let sichtbar = true; b.onclick = () => { sichtbar = !sichtbar; b.setAttribute("aria-pressed", String(sichtbar)); b.setAttribute("aria-checked", String(sichtbar)); };
      sw.append(txt, b);
      const hint = el("p", "Bitte keine Angaben zu Gesundheit, Diagnosen oder Körperzonen – dafür ist dieses Feld nicht gedacht.", { class: "small", style: "margin:8px 0 12px" });
      const btn = el("button", "Ziel festhalten", { type: "button", class: "btn", id: "zielBtn" });
      btn.onclick = () => mitSperre(btn, async () => {
        const t = $("zielText").value.trim(); if (!t) { sagen("Schreib kurz auf, worauf du hinarbeitest.", true); return; }
        try { await rpc("ziel_setzen", { p_token: token, p_text: t, p_sichtbar: sichtbar }); sagen("Notiert. Wir behalten es im Blick."); zielLaden(); }
        catch (e) { sagen(e.message, true); } });
      box.append(f, sw, hint, btn); return;
    }
    const zi = el("div", null, { class: "ziel" + (z.erreicht_am ? " geschafft" : "") });
    zi.append(el("p", z.ziel, { class: "satz" }));
    const akt = el("div", null, { class: "zielaktionen" });
    if (z.erreicht_am) {
      $("zielTitel").textContent = "Geschafft";
      zi.append(el("p", `Erreicht am ${datum(z.erreicht_am)}. Schön, dass wir dabei sein durften.`, { class: "seit" }));
      const neu = el("button", "Neues Ziel setzen", { type: "button", class: "linkbtn" });
      neu.onclick = () => mitSperre(neu, async () => { try { await rpc("ziel_setzen", { p_token: token, p_text: null, p_sichtbar: true }); zielLaden(); } catch (e) { sagen(e.message, true); } });
      akt.append(neu);
    } else {
      $("zielTitel").textContent = "Dein Ziel";
      const monate = z.tage_seitdem != null ? Math.round(z.tage_seitdem / 30.4) : 0;
      zi.append(el("p", `Seit du dir das vorgenommen hast: ${z.besuche_seitdem} ${z.besuche_seitdem === 1 ? "Besuch" : "Besuche"}${monate >= 1 ? ` in ${monate} ${monate === 1 ? "Monat" : "Monaten"}` : ""}.`, { class: "seit" }));
      const fertig = el("button", "Ich habe es erreicht", { type: "button", class: "secondary" });
      fertig.onclick = () => mitSperre(fertig, async () => { try { await rpc("ziel_erreicht", { p_token: token }); sagen("Das freut uns wirklich."); zielLaden(); } catch (e) { sagen(e.message, true); } });
      const aend = el("button", "ändern", { type: "button", class: "linkbtn" });
      aend.onclick = () => { const neu = prompt("Worauf arbeitest du hin?", z.ziel); if (neu === null) return;
        mitSperre(aend, async () => { try { await rpc("ziel_setzen", { p_token: token, p_text: neu, p_sichtbar: z.sichtbar }); zielLaden(); } catch (e) { sagen(e.message, true); } }); };
      const weg = el("button", "löschen", { type: "button", class: "linkbtn" });
      weg.onclick = () => mitSperre(weg, async () => { try { await rpc("ziel_setzen", { p_token: token, p_text: null, p_sichtbar: true }); sagen("Gelöscht."); zielLaden(); } catch (e) { sagen(e.message, true); } });
      akt.append(fertig, aend, weg);
    }
    zi.append(akt); box.append(zi);
  } catch (e) { $("zielBox").classList.add("hide"); }
}

// ---------- Feedback, Mitteilung, Bewertung ----------
let fbSterne = 0, fbNps = null;
async function zusatzLaden() {
  try {
    const z = await rpc("kunde_zusatz", { p_token: token });
    $("fbBox").classList.toggle("hide", !z.feedback_offen);
    if (z.feedback_offen) {
      $("fbLead").textContent = z.feedback_punkte ? `Zwei Minuten, und du bekommst ${z.feedback_punkte} Perlen dafür. Deine Antwort sehen nur wir.` : "Zwei Minuten. Deine Antwort sehen nur wir.";
      const st = $("fbSterne"); st.innerHTML = "";
      [1,2,3,4,5].forEach(n => { const b = el("button", "★", { type: "button", "aria-label": n + " Sterne", "aria-pressed": "false" });
        b.onclick = () => { fbSterne = n; st.querySelectorAll("button").forEach((x, i) => { x.classList.toggle("an", i < n); x.setAttribute("aria-pressed", String(i < n)); }); }; st.appendChild(b); });
      const np = $("fbNps"); np.innerHTML = "";
      for (let n = 0; n <= 10; n++) { const b = el("button", String(n), { type: "button", "aria-pressed": "false" });
        b.onclick = () => { fbNps = n; np.querySelectorAll("button").forEach((x, i) => { x.classList.toggle("an", i === n); x.setAttribute("aria-pressed", String(i === n)); }); }; np.appendChild(b); }
    }
    const ban = z.banner;
    $("bannerBox").classList.toggle("hide", !ban);
    if (ban) {
      $("bannerTitel").textContent = ban.titel || ""; $("bannerText").textContent = ban.text || "";
      const std = Math.round((new Date(ban.gueltig_bis) - new Date()) / 3600000);
      $("bannerKicker").textContent = std > 0 && std <= 24 ? `Nur noch ${std} Stunden` : "Aktuell";
      const link = urlOk(ban.link_url);
      if (link) { $("bannerLink").style.display = "inline-flex"; $("bannerLink").href = link; $("bannerLink").textContent = ban.link_text || "Mehr dazu"; }   // N02: URL geprüft, Text als Text
      else $("bannerLink").style.display = "none";
    }
    $("bewBox").classList.toggle("hide", !z.bewertung);
    if (z.bewertung) $("bewLink").href = urlOk(z.bewertung.url) || "#";
  } catch (e) { /* Zusatzmodule sind optional */ }
}
$("fbBtn").onclick = () => mitSperre($("fbBtn"), async () => {
  if (!fbSterne) { sagen("Bitte wähl zuerst die Sterne.", true); return; }
  try { const r = await rpc("feedback_abgeben", { p_token: token, p_sterne: fbSterne, p_was_gut: $("fbGut").value || null, p_was_besser: $("fbBesser").value || null, p_weiterempfehlung: fbNps });
    sagen(r.punkte ? `Danke dir! ${r.punkte} Perlen sind gutgeschrieben.` : "Danke dir!"); laden(); }
  catch (e) { sagen(e.message, true); } });
$("bewFertig").onclick = () => mitSperre($("bewFertig"), async () => { try { await rpc("bewertung_status_setzen", { p_token: token, p_status: "erledigt" }); sagen("Danke dir – wir fragen nicht mehr."); $("bewBox").classList.add("hide"); } catch (e) { sagen(e.message, true); } });
$("bewNie").onclick = () => mitSperre($("bewNie"), async () => { try { await rpc("bewertung_status_setzen", { p_token: token, p_status: "nicht_fragen" }); sagen("Alles klar, das war's dazu."); $("bewBox").classList.add("hide"); } catch (e) { sagen(e.message, true); } });

// ---------- Bestenliste ----------
async function boardLaden() {
  try {
    const b = await rpc("bestenliste", { p_token: token, p_monat: null });
    if (b.aus) { $("boardBand").classList.add("hide"); return; }
    $("boardBand").classList.remove("hide");
    const box = $("boardBox"); box.innerHTML = "";
    const monat = new Date(b.monat + "-01").toLocaleDateString("de-DE", { month: "long", year: "numeric" });
    if (!b.dabei) {
      const c = el("div", null, { class: "card" });
      c.append(el("div", "Willst du mitspielen?", { style: "font:500 22px var(--mp-heading)" }),
        el("p", "Such dir einen Spitznamen aus – deinen echten Namen sieht niemand. Du kannst jederzeit wieder aussteigen.", { class: "small", style: "margin:6px 0 0" }));
      const f = el("div", null, { class: "field" }); f.append(el("label", "Spitzname", { for: "spName" }), el("input", null, { id: "spName", maxlength: "18", placeholder: "z. B. Perlentaucherin" }));
      const btn = el("button", "Mitmachen", { type: "button", class: "btn", style: "margin-top:12px" });
      btn.onclick = () => mitSperre(btn, async () => { const n = $("spName").value.trim(); if (!n) { sagen("Bitte einen Spitznamen eintragen.", true); return; }
        try { await rpc("spitzname_setzen", { p_token: token, p_name: n, p_dabei: true }); sagen("Du bist dabei. Viel Erfolg!"); boardLaden(); } catch (e) { sagen(e.message, true); } });
      c.append(f, btn); box.append(c); return;
    }
    box.append(el("p", `${monat} · ${b.teilnehmerinnen} ${b.teilnehmerinnen === 1 ? "Teilnehmerin" : "Teilnehmerinnen"}`, { class: "small", style: "margin-bottom:4px" }));
    const liste = b.liste || [], bd = el("div", null, { class: "board" });
    liste.forEach(z => { const r = el("div", null, { class: `brow p${z.platz}${z.ich ? " ich" : ""}` });
      r.append(el("span", String(z.platz), { class: "pl" }), el("span", z.spitzname + (z.ich ? " · du" : ""), { class: "nm" }), el("span", zahl(z.punkte), { class: "pn" })); bd.append(r); });
    if (!liste.length) bd.append(el("p", "In diesem Monat war noch niemand da. Sei die Erste.", { class: "lead" }));
    box.append(bd);
    box.append(el("p", b.ich ? `Du stehst auf Platz ${b.ich.platz} von ${b.ich.von} mit ${zahl(b.ich.punkte)} Perlen in diesem Monat.` : "In diesem Monat hast du noch keine Perlen gesammelt.", { class: "small", style: "margin-top:10px" }));
    const p = el("p", null, { class: "small", style: "margin-top:8px" }); p.append(`Als ${b.spitzname} dabei · `);
    const aus = el("button", "nicht mehr teilnehmen", { type: "button", class: "linkbtn" });
    aus.onclick = () => mitSperre(aus, async () => { try { await rpc("spitzname_setzen", { p_token: token, p_name: null, p_dabei: false }); sagen("Du bist raus aus der Bestenliste."); boardLaden(); } catch (e) { sagen(e.message, true); } });
    p.append(aus); box.append(p);
  } catch (e) { $("boardBand").classList.add("hide"); }
}

$("gebBtn").onclick = () => mitSperre($("gebBtn"), async () => {
  if (!$("gebDatum").value) { sagen("Bitte ein Datum wählen.", true); return; }
  try { await rpc("geburtsdatum_setzen", { p_token: token, p_datum: $("gebDatum").value }); sagen("Gespeichert. Wir melden uns an deinem Tag."); laden(); }
  catch (e) { sagen(e.message, true); } });

if (token) laden(); else zeig("reg");
