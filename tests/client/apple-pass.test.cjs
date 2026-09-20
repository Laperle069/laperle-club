// Generates an ephemeral test CA/key. No production signing credentials required.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict');
const {stripTypeScriptTypes}=require('node:module'),{execFileSync}=require('node:child_process');
const deps=process.env.WALLET_TEST_NODE_MODULES||path.resolve(__dirname,'../../wallet-apple/node_modules');
const {PKPass}=require(path.join(deps,'passkit-generator'));
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'laperle-pass-test-'));
const run=(bin,args)=>execFileSync(bin,args,{cwd:temp,stdio:['ignore','pipe','pipe']});
const ok=(n,c)=>{assert.ok(c,n);console.log('PASS '+n)};
try{
 run('openssl',['req','-x509','-newkey','rsa:2048','-nodes','-keyout','ca.key','-out','ca.pem','-days','1','-subj','/CN=Temporary Test CA']);
 run('openssl',['req','-newkey','rsa:2048','-nodes','-keyout','signer.key','-out','signer.csr','-subj','/UID=pass.de.laperlebeauty.club/OU=FPDU6B86GK/CN=Temporary Test Pass']);
 run('openssl',['x509','-req','-in','signer.csr','-CA','ca.pem','-CAkey','ca.key','-CAcreateserial','-out','signer.pem','-days','1']);
 let src=fs.readFileSync(path.resolve(__dirname,'../../wallet-apple/pass.ts'),'utf8').replace(/^import .*;\n/gm,'').replace(/export /g,'');
 const forge=require(path.join(deps,'node-forge'));
 const c=vm.createContext({PKPass,forge,Buffer,URL,...require('node:crypto')});
 vm.runInContext(stripTypeScriptTypes(src,{mode:'strip'})+'\nglobalThis.make=erstellePass;globalThis.names=assetNamen;',c);
 const e={cert:fs.readFileSync(path.join(temp,'signer.pem'),'utf8'),key:fs.readFileSync(path.join(temp,'signer.key'),'utf8'),wwdr:fs.readFileSync(path.join(temp,'ca.pem'),'utf8'),assets:{}};
 const certSource=fs.readFileSync(path.resolve(__dirname,'../../wallet-apple/certificates.ts'),'utf8').replace(/^import .*;\n/gm,'').replace(/export /g,'');
 vm.runInContext(stripTypeScriptTypes(certSource,{mode:'strip'})+'\nglobalThis.certs=oeffentlicheZertifikate;',c);
 const bundled=c.certs('incomplete PEM',undefined);
 ok('Apple: öffentliche Zertifikate ersetzen fehlenden oder beschädigten PEM-Import',new (require('node:crypto').X509Certificate)(bundled.cert).verify(new (require('node:crypto').X509Certificate)(bundled.wwdr).publicKey));
 ok('Apple: gültige konfigurierte Zertifikate haben für Rotation Vorrang',c.certs(e.cert,e.wwdr).cert===e.cert&&c.certs(e.cert,e.wwdr).wwdr===e.wwdr);
 // Reproduce macOS PBES2/PBKDF2-SHA1 imports that fail in Deno native crypto.
 const testPassphrase='ephemeral-test-password';
 e.key=forge.pki.encryptRsaPrivateKey(forge.pki.privateKeyFromPem(e.key),testPassphrase,{algorithm:'aes256',count:2048});
 e.passphrase=testPassphrase;
 // Tiny PNG fixture exercises signing/package code, not production artwork.
 const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=';
 const d={object_id:'laperle_test',pass_type:'pass.de.laperlebeauty.club',team_id:'FPDU6B86GK',rang:'Silber',vorname:'Anna',nachname:'Test',kundennummer:'LP000240',stand:240,rangfortschritt:{name:'Gold',fehlen:120},mitglied_seit:'20.09.2026',naechste:'Noch 10 Perlen',club_url:'https://club.example.org/?t=TEST-NOT-REAL'};
 for(const rank of ['Bronze','Silber','Gold','Platin','Diamant']){
  for(const name of c.names(rank))e.assets[name]=process.env.WALLET_ARTWORK_DIR?fs.readFileSync(path.join(process.env.WALLET_ARTWORK_DIR,name)).toString("base64"):png;
  const pass=c.make({...d,rang:rank},e);fs.writeFileSync(path.join(temp,rank+'.pkpass'),pass);
 }
 if(process.env.WALLET_DENO_TEST==='1'){
  fs.writeFileSync(path.join(temp,'fixture.json'),JSON.stringify({d,e}));
  fs.writeFileSync(path.join(temp,'native-test.ts'),`import {erstellePass} from ${JSON.stringify(path.resolve(__dirname,'../../wallet-apple/pass.ts'))};
const {d,e}=JSON.parse(Deno.readTextFileSync(${JSON.stringify(path.join(temp,'fixture.json'))}));
Deno.writeFileSync(${JSON.stringify(path.join(temp,'Silber.pkpass'))},erstellePass(d,e));`);
  execFileSync('npx',['--yes','deno','run','--no-check','--allow-read','--allow-write','--node-modules-dir=manual','--config',path.resolve(__dirname,'../../wallet-apple/deno.json'),path.join(temp,'native-test.ts')],{stdio:['ignore','pipe','pipe']});
  console.log('PASS Apple: Signierung zusätzlich in Deno-Laufzeit ausgeführt');
 }
 run('python3',['-c',"import zipfile; zipfile.ZipFile('Silber.pkpass').extractall('unpacked')"]);
 const pass=JSON.parse(fs.readFileSync(path.join(temp,'unpacked/pass.json')));
 ok('Apple: fünf Rangkarten als signierte PKPass-Pakete erzeugt',fs.existsSync(path.join(temp,'Diamant.pkpass')));
 ok('Apple: ursprüngliches Eintrittsdatum sichtbar',pass.storeCard.secondaryFields.some(f=>f.key==='mitglied_seit'&&f.value==='20.09.2026'));
 ok('Apple: nächster Rang auf Vorderseite',pass.storeCard.secondaryFields.some(f=>f.key==='rangfortschritt'&&f.label==='BIS GOLD'&&f.value==='Noch 120 Perlen'));
 ok('Apple: Name prominent und allein im Hauptfeld',pass.storeCard.primaryFields.length===1&&pass.storeCard.primaryFields[0].key==='mitglied'&&pass.storeCard.primaryFields[0].value==='Anna Test');
 ok('Apple: Eintrittsdatum direkt unter dem Namen',pass.storeCard.secondaryFields[0].key==='mitglied_seit');
 ok('Apple: Silber mit dunkler Schrift',pass.foregroundColor==='rgb(36, 37, 42)');
 ok('Apple: native QR-Daten ohne Club-Token',pass.barcodes[0].message==='LP000240'&&!pass.barcodes[0].message.includes('TEST-NOT-REAL'));
 ok('Apple: stabile Seriennummer und echter Punktestand',pass.serialNumber===d.object_id&&pass.storeCard.headerFields[0].value===240);
 ok('Apple: keine vorgetäuschte Push-Anbindung',!pass.webServiceURL&&!pass.authenticationToken);
 const updateData={...d,web_service_url:'https://wallet.example.org/service',auth_token:'a'.repeat(32)};
 fs.writeFileSync(path.join(temp,'updates.pkpass'),c.make(updateData,e));
 run('python3',['-c',"import zipfile; zipfile.ZipFile('updates.pkpass').extractall('updates')"]);
 const up=JSON.parse(fs.readFileSync(path.join(temp,'updates/pass.json')));
 ok('Apple: Update-Pass enthält HTTPS-Dienst und separaten stabilen Token',up.webServiceURL===updateData.web_service_url&&up.authenticationToken===updateData.auth_token);

 run('openssl',['cms','-verify','-inform','DER','-in','unpacked/signature','-content','unpacked/manifest.json','-CAfile','ca.pem','-purpose','any','-binary','-out','verified.json']);
 ok('Apple: CMS-Signatur mit unabhängiger OpenSSL-Prüfung gültig',true);
 const manifest=JSON.parse(fs.readFileSync(path.join(temp,'unpacked/manifest.json')));
 for(const [file,hash] of Object.entries(manifest))assert.equal(require('node:crypto').createHash('sha1').update(fs.readFileSync(path.join(temp,'unpacked',file))).digest('hex'),hash);
 ok('Apple: Manifest stimmt mit allen Paketdateien überein',true);
 assert.throws(()=>c.make({...d,team_id:'WRONG'},e));ok('Apple: falsche Team-ID verhindert Ausgabe',true);
 assert.throws(()=>c.make(d,{...e,passphrase:'wrong'}));ok('Apple: falsches Schlüsselpasswort verhindert Ausgabe',true);
 assert.throws(()=>c.make(d,{...e,wwdr:e.cert}));ok('Apple: unpassendes Ausstellerzertifikat verhindert Ausgabe',true);
 assert.throws(()=>c.make(d,{...e,key:fs.readFileSync(path.join(temp,'ca.key'),'utf8')}));ok('Apple: fremder privater Schlüssel verhindert Ausgabe',true);
 assert.throws(()=>c.make(d,{...e,assets:{}}));ok('Apple: fehlendes freigegebenes Artwork verhindert Ausgabe',true);
 assert.throws(()=>c.make({...d,club_url:'https://test.invalid/club/'},e));ok('Apple: Platzhalter-Clubadresse verhindert Ausgabe',true);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
