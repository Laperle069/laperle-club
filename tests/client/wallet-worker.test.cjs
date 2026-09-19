const {stripTypeScriptTypes}=require('node:module'),vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
async function run(cards=[],options={}){
 let handler;const calls=[],ack=[];
 const env={SUPABASE_URL:'https://db.example.test',PUBLIC_API_KEY:'sb_publishable_test',DIENST_KEY:'sb_secret_test',SYNC_GEHEIMNIS:'test-secret'};
 const c=vm.createContext({Deno:{env:{get:k=>env[k]},serve:fn=>handler=fn},Request,Response,URL,AbortSignal,TextEncoder,Uint8Array,atob,btoa,crypto:require('node:crypto').webcrypto,console,fetch:async(url,init)=>{
 calls.push({url,init});
 if(url.endsWith('/wallet_offene_karten')) return Response.json(cards);
 if(url.endsWith('/wallet_quittieren')) {ack.push(...JSON.parse(init.body).p_quittungen);return Response.json({quittiert:ack.length});}
 if(url.includes('walletobjects.googleapis.com')) {if(options.timeout) throw new Error('timeout');return new Response('{}',{status:options.status||200});}
 throw Error('Unexpected '+url);
 }});
 vm.runInContext(stripTypeScriptTypes(fs.readFileSync(require('node:path').join(__dirname,'../../wallet/index.ts'),'utf8'),{mode:'strip'}),c);
 vm.runInContext('tokenZwischenspeicher={wert:"mock",bis:Date.now()+3600000}',c);
 const response=await handler(new Request('https://edge.example.test/sync',{method:options.method||'POST',headers:{'x-sync-geheimnis':options.secret??'test-secret'}}));
 return {response,calls,ack};
}
(async()=>{
 const card={object_id:'issuer.customer',version:7,lease_id:'lease-a',lease_bis:new Date(Date.now()+180000).toISOString(),club_url:'https://club.example.test/?t=new',stand:50,rang:'Gold',vorname:'Anna',nachname:'Neu',naechste:'Noch 20'};
 let r=await run([card]);assert.equal(r.response.status,200);assert.equal(r.ack[0].lease_id,'lease-a');
 const patch=r.calls.find(x=>x.init.method==='PATCH');assert.equal(JSON.parse(patch.init.body).linksModuleData.uris[0].uri,card.club_url);assert.ok(patch.init.signal);assert.equal(JSON.parse(patch.init.body).accountName,'Anna Neu');assert.ok(!('hexBackgroundColor' in JSON.parse(patch.init.body)));console.log('PASS Wallet Worker überträgt Club-Link, Timeout und Besitzkennung');
 assert.ok(!r.calls[0].init.headers.Authorization);console.log('PASS Neuer Supabase-API-Key wird nicht als JWT missbraucht');
 r=await run([{...card,lease_bis:new Date(Date.now()+5000).toISOString()}]);assert.ok(!r.calls.some(x=>x.init.method==='PATCH'));console.log('PASS Kein neuer PATCH kurz vor Lease-Ende');
 r=await run([card],{timeout:true});assert.equal(r.ack[0].ok,false);assert.equal(r.ack[0].lease_id,'lease-a');console.log('PASS Transportfehler quittiert mit korrekter Besitzkennung');
 r=await run([card,card],{status:429});assert.equal(r.ack.length,1);console.log('PASS Wallet 429 beendet Batch nach erster Ablehnung');
 r=await run([card],{secret:'falsch'});assert.equal(r.response.status,401);assert.equal(r.calls.length,0);console.log('PASS Wallet Sync ohne Geheimnis verweigert jeden Datenbankaufruf');
 r=await run([card],{method:'GET'});assert.equal(r.response.status,405);console.log('PASS Wallet Sync verlangt POST');
})().catch(e=>{console.error('FAIL',e.message);process.exitCode=1});
