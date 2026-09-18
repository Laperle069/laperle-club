const {stripTypeScriptTypes}=require('node:module'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const crypto=require('node:crypto');
const key=crypto.generateKeyPairSync('rsa',{modulusLength:2048}).privateKey.export({type:'pkcs8',format:'pem'});
const card={aktiv:true,issuer_id:'3388000000023188314',class_id:'3388000000023188314.laperle_club',object_id:'3388000000023188314.test',
 kundennummer:'LP000240',vorname:'Anna',nachname:'Test',stand:240,rang:'Silber',club_url:'https://club.example.org/?t=PRIVATE-TEST-LINK',naechste:'Noch 10 Perlen'};
async function run(options={}){
 let handler;const calls=[];
 const env={SUPABASE_URL:'https://db.example.test',PUBLIC_API_KEY:'sb_publishable_test',GOOGLE_SERVICE_ACCOUNT:JSON.stringify({client_email:'test@example.iam.gserviceaccount.com',private_key:key})};
 if(options.noKey)env.GOOGLE_SERVICE_ACCOUNT='{}';
 const c=vm.createContext({Deno:{env:{get:k=>env[k]},serve:fn=>handler=fn},Request,Response,URL,URLSearchParams,AbortSignal,TextEncoder,Uint8Array,atob,btoa,crypto:crypto.webcrypto,console,fetch:async(url,init)=>{
  calls.push({url,init});
  if(url.endsWith('/wallet_kartendaten'))return Response.json({...card,aktiv:!options.disabled});
  if(url.endsWith('/wallet_gespeichert'))return Response.json({ok:true});
  if(url==='https://oauth2.googleapis.com/token')return Response.json({access_token:'test-access',expires_in:3600});
  if(url.includes('/loyaltyClass/'))return new Response('{}',{status:options.classStatus||200});
  if(url.endsWith('/loyaltyClass'))return Response.json({id:card.class_id});
  if(url.endsWith('/loyaltyObject'))return new Response('{}',{status:options.objectStatus||200});
  if(url.includes('/loyaltyObject/'))return new Response('{}',{status:options.patchStatus||200});
  throw Error('Unexpected '+url);
 }});
 vm.runInContext(stripTypeScriptTypes(fs.readFileSync(path.join(__dirname,'../../wallet/index.ts'),'utf8'),{mode:'strip'}),c);
 const response=await handler(new Request('https://edge.example.test/link',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:options.token??'test-customer-token'})}));
 return {response,calls,body:await response.json()};
}
(async()=>{
 let r=await run();assert.equal(r.response.status,200);
 const jwt=r.body.url.split('/').pop(),payload=JSON.parse(Buffer.from(jwt.split('.')[1],'base64url'));
 assert.ok(jwt.length<1800);assert.deepEqual(payload.payload.loyaltyObjects,[{id:card.object_id}]);assert.ok(!JSON.stringify(payload).includes('PRIVATE-TEST-LINK'));
 assert.ok(crypto.verify('RSA-SHA256',Buffer.from(jwt.split('.').slice(0,2).join('.')),crypto.createPublicKey(key),Buffer.from(jwt.split('.')[2],'base64url')));
 console.log('PASS Google Save-Link kurz, echt signiert und ohne persönlichen Club-Zugang im JWT');
 const obj=JSON.parse(r.calls.find(x=>x.url.endsWith('/loyaltyObject')).init.body);
 assert.equal(obj.barcode.value,card.kundennummer);assert.equal(obj.secondaryLoyaltyPoints.balance.string,'Silber');console.log('PASS Echte Kunden-, Punkte- und Rangdaten im Google-Objekt');
 r=await run({objectStatus:409});assert.ok(r.calls.some(x=>x.init.method==='PATCH'));console.log('PASS Bereits vorhandene Google-Karte wird aktualisiert');
 r=await run({classStatus:403});assert.equal(r.response.status,500);assert.ok(!r.calls.some(x=>x.url.endsWith('/loyaltyClass')));console.log('PASS Fehlende Google-Berechtigung legt keine neue Klasse an');
 r=await run({objectStatus:400});assert.equal(r.response.status,500);assert.ok(!r.calls.some(x=>x.url.endsWith('/wallet_gespeichert')));console.log('PASS Fehlgeschlagene Ausgabe wird nicht registriert');
 r=await run({noKey:true});assert.equal(r.response.status,503);assert.ok(!r.calls.some(x=>x.url.includes('googleapis')));console.log('PASS Fehlender Schlüssel klar abgefangen ohne Google-Aufruf');
 r=await run({disabled:true});assert.equal(r.body.bereit,false);assert.equal(r.calls.length,1);console.log('PASS Ausgeschaltetes Wallet erzeugt keine externe Karte');
 r=await run({token:{bad:'type'}});assert.equal(r.response.status,400);assert.equal(r.calls.length,0);console.log('PASS Falscher Token-Typ wird vor Datenbankzugriff abgelehnt');
})().catch(e=>{console.error('FAIL',e.message);process.exitCode=1});
