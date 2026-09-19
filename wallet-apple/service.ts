// Apple Wallet web service. Dependencies are injected for protocol tests.
export type Dependencies = {
 rpc:(name:string,args:Record<string,unknown>)=>Promise<any>;
 render:(data:any)=>Promise<Uint8Array>;
 push:(token:string,topic:string)=>Promise<{status:number;reason?:string}>;
 authorized:(secret:string)=>Promise<boolean>;
 check?:()=>Promise<Record<string,unknown>>;
};
const response=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
const empty=(status:number)=>new Response(null,{status});
const valid=(s:unknown)=>typeof s==='string' && s.length>0 && s.length<=256 && !/[\x00-\x20\x7f]/.test(s);
export async function walletService(req:Request,deps:Dependencies):Promise<Response|null> {
 const url=new URL(req.url),path=url.pathname.replace(/^.*\/wallet-apple/,'');
 const rpc=(action:string,data:Record<string,unknown>)=>deps.rpc('wallet_apple_service',{p_action:action,p_data:data});
 if(path==='/check') {
  if(req.method!=='POST') return empty(405);
  if(!await deps.authorized(req.headers.get('x-sync-geheimnis')??'')) return empty(401);
  // All-zero token cannot address a customer. Checks real APNs certificate authentication.
  const result=await deps.push('0'.repeat(64),'pass.de.laperlebeauty.club');
  return response({...await deps.check?.(),apnsReady:result.status===400&&result.reason==='BadDeviceToken',status:result.status,reason:result.reason});
 }
 if(path==='/sync') {
  if(req.method!=='POST') return empty(405);
  if(!await deps.authorized(req.headers.get('x-sync-geheimnis')??'')) return empty(401);
  const cards=await rpc('claim',{}),receipts=[];let failed=0;
  for(const c of cards) {
   if(!c.lease_id||Date.now()+20_000>=Date.parse(c.lease_bis)) break;
   let ok=true,status=0;
   for(const device of c.devices??[]) {
    if(Date.now()+15_000>=Date.parse(c.lease_bis)) {ok=false;break;}
    try {
     const result=await deps.push(device.push_token,c.pass_type);
     if(result.status===410 && result.reason==='Unregistered' || result.status===400 && result.reason==='BadDeviceToken') {
      await rpc('invalid_device',device);
     } else if(result.status!==200) {ok=false;status=result.status;}
    } catch {ok=false;status=0;}
   }
   if(!ok) failed++;
   // Provider 404/410 must not retire the entire pass via Google's receipt policy.
   receipts.push({object_id:c.object_id,version:c.version,lease_id:c.lease_id,ok,
    status:status===429?429:0,fehler:ok?undefined:'APNs delivery failed ('+status+')'});
   if(status===429) break;
  }
  if(receipts.length) await deps.rpc('wallet_quittieren',{p_quittungen:receipts});
  return response({notified:receipts.length-failed,failed});
 }
 if(!path.startsWith('/v1/')) return null;
 const parts=path.split('/').filter(Boolean).map(decodeURIComponent);
 if(parts[1]==='log' && parts.length===2) {
  // Device logs are untrusted and can contain personal tokens; never persist them.
  return empty(req.method==='POST'?200:405);
 }
 if(parts[1]==='devices'&&parts[3]==='registrations'&&(parts.length===5||parts.length===6)) {
  const [, ,device_id,,pass_type,serial]=parts;
  if(!valid(device_id)||!valid(pass_type)||serial!==undefined&&!valid(serial)) return empty(400);
  if(serial===undefined) {
   if(req.method!=='GET') return empty(405);
   const since=url.searchParams.get('passesUpdatedSince');
   if(since!==null&&!/^[0-9]{1,18}$/.test(since)) return empty(400);
   const list=await rpc('list',{device_id,pass_type,since});
   return list?response(list):empty(204);
  }
  if(!['POST','DELETE'].includes(req.method)) return empty(405);
  const token=req.headers.get('authorization')?.match(/^ApplePass ([^\s]+)$/)?.[1];
  if(!valid(token)) return empty(401);
  let push_token;
  if(req.method==='POST') {
   try {({pushToken:push_token}=await req.json());}catch{return empty(400);}
   if(!valid(push_token)) return empty(400);
  }
  const result=await rpc(req.method==='POST'?'register':'unregister',{device_id,pass_type,serial,token,push_token});
  return result?empty(req.method==='POST'&&result.created?201:200):empty(401);
 }
 if(parts[1]==='passes'&&parts.length===4) {
  if(req.method!=='GET') return empty(405);
  const [, ,pass_type,serial]=parts;
  const token=req.headers.get('authorization')?.match(/^ApplePass ([^\s]+)$/)?.[1];
  if(!valid(token)) return empty(401);
  if(!valid(pass_type)||!valid(serial)) return empty(400);
  const data=await rpc('pass',{pass_type,serial,token});
  if(!data) return empty(401);
  const updated=Date.parse(data.updated_at),since=Date.parse(req.headers.get('if-modified-since')??'');
  // Equality deliberately returns 200: two changes in one second must not be lost.
  if(Number.isFinite(since)&&since>updated) return empty(304);
  const bytes=await deps.render(data);
  return new Response(bytes,{headers:{'Content-Type':'application/vnd.apple.pkpass',
   'Last-Modified':new Date(updated).toUTCString(),'Cache-Control':'private, no-cache'}});
 }
 return empty(404);
}
