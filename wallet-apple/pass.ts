import { PKPass } from "passkit-generator";
import { Buffer } from "node:buffer";
import { X509Certificate } from "node:crypto";
import forge from "node-forge";

// Artwork comes from approved, separately exported pass assets. The concept
// sheet, its demo QR codes and example names must never become a real pass.
const RANG: Record<string, {name:string; bg:string; fg:string; asset:string}> = {
  bronze: {name:"Bronze",bg:"rgb(120, 83, 63)",fg:"rgb(255, 240, 218)",asset:"bronze"},
  silber: {name:"Silber",bg:"rgb(196, 203, 209)",fg:"rgb(36, 37, 42)",asset:"silber"},
  gold: {name:"Gold",bg:"rgb(200, 172, 116)",fg:"rgb(50, 37, 25)",asset:"gold"},
  platin: {name:"Platin",bg:"rgb(208, 208, 201)",fg:"rgb(48, 49, 47)",asset:"platin"},
  diamant: {name:"Diamant",bg:"rgb(209, 226, 236)",fg:"rgb(32, 51, 66)",asset:"diamant"},
};
export function assetNamen(rang:string|null):string[] {
  const r=rang?RANG[rang.toLocaleLowerCase("de-DE")]:RANG.bronze;
  if(!r) throw new Error("Rangdesign fehlt");
  return ["","@2x","@3x"].flatMap(s=>[`icon${s}.png`,`${r.asset}/logo${s}.png`,`${r.asset}/strip${s}.png`]);
}
export type PassDaten = {
  object_id:string; pass_type:string; team_id:string; rang:string|null;
  vorname:string; nachname:string; kundennummer:string; stand:number;
  naechste:string; club_url:string; mitglied_seit?:string; rangfortschritt?:{name:string; fehlen:number}|null; auth_token?:string; web_service_url?:string;
};
export type Einrichtung = {
  cert:string; key:string; wwdr:string; passphrase?:string;
  assets:Record<string,string>;
};

function bild(assets:Record<string,string>,name:string):Buffer {
  const value=assets[name];
  if (!value || value.length>4_000_000) throw new Error("Passbild fehlt: "+name);
  const b=Buffer.from(value,"base64");
  if (b.length<24 || b.subarray(0,8).toString("hex")!=="89504e470d0a1a0a") throw new Error("Ungültiges PNG");
  return b;
}

export function pruefeSignierung(d:Pick<PassDaten,"pass_type"|"team_id">,e:Einrichtung):string {
  const cert=new X509Certificate(e.cert);
  const jetzt=Date.now();
  if(jetzt<Date.parse(cert.validFrom)||jetzt>=Date.parse(cert.validTo)) throw new Error("Zertifikat abgelaufen oder noch nicht gültig");
  // Deno serializes the attribute as uid=, Node as UID=. Values stay case-sensitive.
  const subject=cert.subject.split("\n").map(line=>line.replace(/^uid=/i,"UID="));
  if(!subject.includes("UID="+d.pass_type)||!subject.includes("OU="+d.team_id)) throw new Error("Zertifikat passt nicht zur Karte");
  // The hosted Edge runtime cannot reliably decrypt macOS PKCS8 exports or
  // execute X509 checkPrivateKey/verify. Use the same pinned RSA implementation
  // as passkit-generator for actual cryptographic checks, not just PEM parsing.
  const signer=forge.pki.certificateFromPem(e.cert),issuer=forge.pki.certificateFromPem(e.wwdr);
  const key=forge.pki.decryptRsaPrivateKey(e.key,e.passphrase??"");
  if(!key) throw new Error("Signierschlüssel konnte nicht geöffnet werden");
  if(!key.n.equals(signer.publicKey.n)||!key.e.equals(signer.publicKey.e)||!issuer.verify(signer)) throw new Error("Zertifikatskette oder Schlüssel passt nicht");
  const digest=forge.md.sha256.create().update("La Perle Wallet signing-key validation","utf8");
  if(!signer.publicKey.verify(digest.digest().getBytes(),key.sign(digest))) throw new Error("Signierschlüssel passt nicht");
  // Plaintext exists only in memory during signing; never persist or log it.
  return forge.pki.privateKeyToPem(key);
}

export function erstellePass(d:PassDaten,e:Einrichtung):Buffer {
  const signerKey=pruefeSignierung(d,e);
  const club=new URL(d.club_url);
  if(club.protocol!=="https:"||club.hostname.endsWith(".invalid")||club.username||club.password) throw new Error("Club-Adresse fehlt");
  const rang=d.rang ? RANG[d.rang.toLocaleLowerCase("de-DE")] : RANG.bronze;
  if(!rang) throw new Error("Rangdesign fehlt");
  if(!Number.isSafeInteger(d.stand)||!d.object_id||!d.kundennummer) throw new Error("Kartendaten fehlen");
  const buffers:Record<string,Buffer>={};
  for(const suffix of ["","@2x","@3x"]) {
    buffers[`icon${suffix}.png`]=bild(e.assets,`icon${suffix}.png`);
    buffers[`logo${suffix}.png`]=bild(e.assets,`${rang.asset}/logo${suffix}.png`);
    buffers[`strip${suffix}.png`]=bild(e.assets,`${rang.asset}/strip${suffix}.png`);
  }
  const pass=new PKPass(buffers,{signerCert:e.cert,signerKey,wwdr:e.wwdr},{
    formatVersion:1,passTypeIdentifier:d.pass_type,teamIdentifier:d.team_id,serialNumber:d.object_id,
    organizationName:"La Perlé Beauty Boutique",description:"La Perlé Club – deine Kundenkarte",
    backgroundColor:rang.bg,foregroundColor:rang.fg,labelColor:rang.fg,
    sharingProhibited:true,
    ...(d.web_service_url && d.auth_token ? {webServiceURL:d.web_service_url,authenticationToken:d.auth_token} : {}),
  });
  pass.type="storeCard";
  pass.headerFields.push({key:"perlen",label:"PERLEN",value:d.stand});
  pass.primaryFields.push({key:"mitglied",label:d.rang?`${rang.name.toUpperCase()} · LA PERLÉ CLUB`:"LA PERLÉ CLUB",value:[d.vorname,d.nachname].filter(Boolean).join(" ")});
  if(d.mitglied_seit) pass.secondaryFields.push({key:"mitglied_seit",label:"MITGLIED SEIT",value:d.mitglied_seit,textAlignment:"PKTextAlignmentLeft"});
  if(d.rang) {
    const next=d.rangfortschritt;
    pass.secondaryFields.push({key:"rangfortschritt",label:next?`BIS ${next.name.toLocaleUpperCase("de-DE")}`:"DEIN STATUS",
      value:next?`Noch ${next.fehlen.toLocaleString("de-DE")} ${next.fehlen===1?"Perle":"Perlen"}`:"Höchster Rang erreicht"});
  }

  pass.backFields.push(
    {key:"kundennummer",label:"Kundennummer",value:d.kundennummer},
    {key:"club",label:"Dein Club und aktueller Punktestand",value:club.href},
    {key:"naechste",label:"Bis zur nächsten Prämie",value:d.naechste},
    {key:"aktualisierung",label:"Karte aktualisieren",value:d.web_service_url?"Dein Perlenstand und Rang werden automatisch aktualisiert. Aktiviere dafür automatische Updates in den Karteneinstellungen.":"Öffne deinen Club und füge die Karte erneut hinzu, um deinen aktuellen Stand zu übernehmen."},
  );
  pass.setBarcodes({format:"PKBarcodeFormatQR",message:d.kundennummer,messageEncoding:"iso-8859-1",altText:d.kundennummer});
  // Stable serial number replaces the same card on re-download or service update.
  return pass.getAsBuffer();
}
