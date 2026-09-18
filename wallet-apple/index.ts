import { Buffer } from "node:buffer";
import { erstellePass, assetNamen, type Einrichtung } from "./pass.ts";

const DB=Deno.env.get("SUPABASE_URL")??"";
const KEY=Deno.env.get("PUBLIC_API_KEY")??Deno.env.get("SUPABASE_ANON_KEY")??"";
const headers={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"content-type, apikey, authorization",
  "Access-Control-Allow-Methods":"POST, OPTIONS","Cache-Control":"no-store","Content-Type":"application/json"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
const bildCache=new Map<string,{bis:number,assets:Record<string,string>}>();
async function ladeBilder(rang:string|null):Promise<Record<string,string>> {
  const base=new URL(Deno.env.get("APPLE_PASS_ASSET_BASE_URL")??"");
  if(base.protocol!=="https:"||base.username||base.password||base.search||base.hash) throw new Error("Bildadresse fehlt");
  if(!base.pathname.endsWith("/")) base.pathname+="/";
  const cacheKey=base.href+":"+(rang??"bronze");
  const cached=bildCache.get(cacheKey);if(cached&&cached.bis>Date.now()) return cached.assets;
  const entries=await Promise.all(assetNamen(rang).map(async name=>{
    const res=await fetch(new URL(name,base),{signal:AbortSignal.timeout(10_000),redirect:"error"});
    if(!res.ok||Number(res.headers.get("content-length")??0)>3_000_000) throw new Error("Passbild nicht verfügbar");
    const bytes=new Uint8Array(await res.arrayBuffer());
    if(bytes.length>3_000_000) throw new Error("Passbild zu groß");
    // Buffer is Node-compatible in the Edge runtime and avoids spread argument limits.
    return [name,Buffer.from(bytes).toString("base64")];
  }));
  const assets=Object.fromEntries(entries);
  bildCache.set(cacheKey,{bis:Date.now()+3600_000,assets});return assets;
}

Deno.serve(async(req:Request)=>{
  if(req.method==="OPTIONS") return new Response("ok",{headers});
  if(req.method!=="POST") return json({fehler:"Methode nicht erlaubt."},405);
  if(new URL(req.url).pathname.split("/").pop()!=="pass") return json({fehler:"Unbekannter Pfad."},404);
  if(!DB||!KEY) return json({bereit:false},503);
  let token:unknown;
  try { ({token}=await req.json()); } catch { return json({fehler:"Ungültige Anfrage."},400); }
  if(typeof token!=="string"||!token||token.length>512) return json({fehler:"Bitte öffne deinen persönlichen Club-Link erneut."},400);
  try {
    const res=await fetch(DB+"/rest/v1/rpc/wallet_apple_kartendaten",{method:"POST",
      headers:{"Content-Type":"application/json",apikey:KEY,...(KEY.startsWith("eyJ")?{Authorization:`Bearer ${KEY}`}:{})},
      body:JSON.stringify({p_token:token}),signal:AbortSignal.timeout(10_000)});
    if(!res.ok) return json({fehler:"Die Karte konnte nicht geladen werden. Bitte öffne deinen Club-Link erneut."},res.status>=500?503:401);
    const d=await res.json();
    if(!d.aktiv) return json({bereit:false});
    const e:Einrichtung={cert:Deno.env.get("APPLE_SIGNER_CERT")??"",key:Deno.env.get("APPLE_SIGNER_KEY")??"",
      wwdr:Deno.env.get("APPLE_WWDR_CERT")??"",passphrase:Deno.env.get("APPLE_SIGNER_KEY_PASSPHRASE")||undefined,
      assets:{}};
    if(!e.cert||!e.key||!e.wwdr||!Deno.env.get("APPLE_PASS_ASSET_BASE_URL")) return json({bereit:false,fehler:"Apple Wallet wird gerade eingerichtet. Bitte versuche es später erneut."},503);
    e.assets=await ladeBilder(d.rang);
    const pass=erstellePass(d,e);
    return new Response(new Uint8Array(pass),{headers:{...headers,
      "Content-Type":"application/vnd.apple.pkpass","Content-Disposition":'attachment; filename="LaPerle-Club.pkpass"'}});
  } catch {
    // Never return certificate/key/parser details or the personal customer link.
    return json({fehler:"Die Wallet-Karte konnte gerade nicht erstellt werden. Bitte versuche es später erneut."},503);
  }
});
