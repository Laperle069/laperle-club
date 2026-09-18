const {create}=require('./engine.cjs');
const assert=require('node:assert/strict');
(async()=>{const e=await create();const q=async(s,p)=>(await e.query(s,p)).rows;
const v=async(s,p)=>Object.values((await q(s,p))[0])[0];
const ok=(n,c)=>{assert.ok(c,n);console.log('PASS '+n)};
try{
 await q("select selbst_registrieren('Wallet','Test','wallet-ausgabe@example.org','FFM-01','de',null)");
 const k=(await q("select * from kundin where email='wallet-ausgabe@example.org'"))[0];
 await q("update einstellung set wert='false' where schluessel in ('wallet_aktiv','apple_wallet_aktiv')");
 for(const rpc of ['wallet_kartendaten','wallet_apple_kartendaten']){
  await assert.rejects(()=>q(`select ${rpc}('ungültig')`));
  ok(rpc+': persönlicher Token erforderlich',true);
  ok(rpc+': abgeschaltet ohne personenbezogene Kartendaten',Object.keys(await v(`select ${rpc}($1)`,[k.zugangstoken])).join() === 'aktiv');
 }
 ok('Keine Ausstellung bei ausgeschalteten Wallets',await v('select count(*)=0 from wallet_pass'));
 await q("update einstellung set wert='true' where schluessel in ('wallet_aktiv','apple_wallet_aktiv')");
 await q("update einstellung set wert='https://club.example.org/' where schluessel='club_basis_url'");
 const g=await v('select wallet_kartendaten($1)',[k.zugangstoken]);
 const a=await v('select wallet_apple_kartendaten($1)',[k.zugangstoken]);
 ok('Getrennte Karten für Apple und Google',g.object_id!==a.object_id&&await v('select count(*)=2 from wallet_pass'));
 ok('Apple verwendet vorhandene Pass-ID und Team-ID',a.pass_type==='pass.de.laperlebeauty.club'&&a.team_id==='FPDU6B86GK');
 ok('Google verwendet vorhandene vollständige Klassen-ID',g.class_id==='3388000000023188314.laperle_club');
 ok('QR-Daten sind Kundennummer, Club-Zugang separat',a.kundennummer===k.kundennummer&&a.club_url.endsWith('?t='+k.zugangstoken));
 ok('Wiederholter Download behält Apple-Seriennummer',(await v('select wallet_apple_kartendaten($1)',[k.zugangstoken])).object_id===a.object_id);
 await q("update kundin set status='gesperrt' where id=$1",[k.id]);
 await assert.rejects(()=>q('select wallet_apple_kartendaten($1)',[k.zugangstoken]));ok('Gesperrte Kundin bekommt keinen Pass',true);
 const rights=await v('select rechte_setzen()');ok('Exakte RPC-Rechte vollständig',rights.nicht_erwartet_aber_offen.length===0&&rights.fuer_anon_aufrufbar===rights.erwartet);
}finally{await e.end()}})().catch(e=>{console.error('FAIL',e.message);process.exitCode=1});
