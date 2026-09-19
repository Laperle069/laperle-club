import { walletService } from "./service.ts";
import { X509Certificate } from "node:crypto";
import { Buffer } from "node:buffer";
import { erstellePass, assetNamen, pruefeSignierung, type Einrichtung } from "./pass.ts";
import { oeffentlicheZertifikate } from "./certificates.ts";

const DB=Deno.env.get("SUPABASE_URL")??"";
const KEY=Deno.env.get("PUBLIC_API_KEY")??Deno.env.get("SUPABASE_ANON_KEY")??"";
const headers={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"content-type, apikey, authorization",
  "Access-Control-Allow-Methods":"POST, OPTIONS","Cache-Control":"no-store","Content-Type":"application/json"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
// Public approved artwork stays in its own environment; unknown projects require an override.
const ASSET_BASE=Deno.env.get("APPLE_PASS_ASSET_BASE_URL") || (DB==="https://xzxplhvkabgfyglmkcii.supabase.co" ? "https://xzxplhvkabgfyglmkcii.supabase.co/storage/v1/object/public/wallet-artwork/metallic-facets-v2/apple/" : DB==="https://byiocfdghgbxxdcmaqoh.supabase.co" ? "https://byiocfdghgbxxdcmaqoh.supabase.co/storage/v1/object/public/oeffentlich/club-wallet/metallic-facets-v2/apple/" : "");
const bildCache=new Map<string,{bis:number,assets:Record<string,string>}>();
async function ladeBilder(rang:string|null):Promise<Record<string,string>> {
  const base=new URL(ASSET_BASE);
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

const SERVICE=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")??"";
async function serviceRpc(name:string,args:Record<string,unknown>) {
 const res=await fetch(DB+"/rest/v1/rpc/"+name,{method:"POST",headers:{apikey:SERVICE,...(SERVICE.startsWith("eyJ")?{Authorization:`Bearer ${SERVICE}`}:{ }),"Content-Type":"application/json"},body:JSON.stringify(args),signal:AbortSignal.timeout(10_000)});
 if(!res.ok) throw new Error("Wallet service unavailable");
 return res.json();
}
function signing():Einrichtung { return {...oeffentlicheZertifikate(Deno.env.get("APPLE_SIGNER_CERT"),Deno.env.get("APPLE_WWDR_CERT")),key:Deno.env.get("APPLE_SIGNER_KEY")??"",passphrase:Deno.env.get("APPLE_SIGNER_KEY_PASSPHRASE")||undefined,assets:{}}; }
async function render(data:any) {
 const e=signing();e.assets=await ladeBilder(data.rang);
 return new Uint8Array(erstellePass({...data,web_service_url:DB+"/functions/v1/wallet-apple"},e));
}
async function authorized(secret:string) {
 if(!SERVICE||secret.length<32||secret.length>512) return false;
 return await serviceRpc("wallet_worker_authorized",{p_secret:secret})===true;
}
let apnsClient:ReturnType<typeof Deno.createHttpClient>|undefined;
async function push(token:string,topic:string) {
 if(!apnsClient) {
  const e=signing(),key=pruefeSignierung({pass_type:topic,team_id:"FPDU6B86GK"},e);
  apnsClient=Deno.createHttpClient({cert:e.cert,key,http2:true,http1:false});
 }
 const result=await fetch("https://api.push.apple.com/3/device/"+encodeURIComponent(token),{
  method:"POST",client:apnsClient,headers:{"apns-topic":topic,"apns-priority":"5","Content-Type":"application/json"},body:"{}",signal:AbortSignal.timeout(10_000)});
 let reason;try {reason=(await result.json()).reason;}catch{}
 return {status:result.status,reason};
}
async function check() {
 const sizes:Record<string,number>={};
 for(const rang of ["Bronze","Silber","Gold","Platin","Diamant"]) {
  const bytes=await render({object_id:"laperle_readiness_probe",pass_type:"pass.de.laperlebeauty.club",team_id:"FPDU6B86GK",
   rang,vorname:"Wallet",nachname:"Prüfung",kundennummer:"LP000000",stand:0,naechste:"Technische Prüfung",
   club_url:"https://laperle-beauty.de",auth_token:"readiness-only-not-a-customer-token"});
  sizes[rang]=bytes.length;
 }
 return {signingReady:true,rankPassBytes:sizes,certificateValidTo:new X509Certificate(signing().cert).validTo};
}
Deno.serve(async(req:Request)=>{
  try { const result=await walletService(req,{rpc:serviceRpc,render,push,authorized,check});if(result) return result; } catch {return json({fehler:"Wallet-Aktualisierung vorübergehend nicht verfügbar."},503);}
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
    const e:Einrichtung={...oeffentlicheZertifikate(Deno.env.get("APPLE_SIGNER_CERT"),Deno.env.get("APPLE_WWDR_CERT")),key:Deno.env.get("APPLE_SIGNER_KEY")??"",
      passphrase:Deno.env.get("APPLE_SIGNER_KEY_PASSPHRASE")||undefined,
      assets:{}};
    if(!e.cert||!e.key||!e.wwdr||!ASSET_BASE) return json({bereit:false,fehler:"Apple Wallet wird gerade eingerichtet. Bitte versuche es später erneut."},503);
    e.assets=await ladeBilder(d.rang);
    const pass=erstellePass({...d,web_service_url:DB+"/functions/v1/wallet-apple"},e);
    return new Response(new Uint8Array(pass),{headers:{...headers,
      "Content-Type":"application/vnd.apple.pkpass","Content-Disposition":'attachment; filename="LaPerle-Club.pkpass"'}});
  } catch {
    // Never return certificate/key/parser details or the personal customer link.
    return json({fehler:"Die Wallet-Karte konnte gerade nicht erstellt werden. Bitte versuche es später erneut."},503);
  }
});
