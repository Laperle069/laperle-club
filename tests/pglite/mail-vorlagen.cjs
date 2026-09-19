const {create}=require('./engine.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
(async()=>{
 const e=await create(); const q=async(s,p)=>(await e.query(s,p)).rows;const v=async(s,p)=>Object.values((await q(s,p))[0])[0];
 const ok=(n,c)=>{assert.ok(c,n);console.log('PASS '+n)};
 try {
 await q("update einstellung set wert='https://club.example.org/' where schluessel='club_basis_url';update einstellung set wert='https://reviews.example.org/form' where schluessel='google_bewertung_url'");
 const data={Vorname:'Anna',Anzahl:25,'Prämie':'Gesichtsbehandlung','Geburtstagsgeschenk':'10 € Geburtstagsgutschein',Datum:'02.10.2026'};
 const templates=JSON.parse(fs.readFileSync(path.join(root,'mail/vorlagen.json'),'utf8'));
 const out=path.join(root,'mail/vorschau');fs.mkdirSync(out,{recursive:true});
 for(const [name,source] of Object.entries(templates)){
  const t=await v('select _mail_vorlage($1,$2::jsonb)',[name,JSON.stringify(data)]);
  const b=await v("select _mail_ausgabe($1::jsonb,'https://club.example.org/?t=DEMO','https://club.example.org/?t=DEMO#einwilligungen')",[JSON.stringify(t)]);
  ok(name+': freigegebener Button, Vorschau, HTML und Klartext',b.htmlContent.includes(source.button)&&b.htmlContent.includes(t.vorschau)&&b.textContent.includes(source.button+': https://'));
  ok(name+': keine unersetzten Platzhalter',!(/\[(Vorname|Anzahl|Prämie|Datum|Geburtstagsgeschenk)\]/.test(b.htmlContent)));
  if(source.ziel==='buchung'||source.ziel==='bewertung'){
   const main=b.htmlContent.match(/<a href="([^"]+)" style="display:inline-block/)[1];
   ok(name+': externes Ziel ohne Kundentoken',!main.includes('DEMO')&&main.startsWith(source.ziel==='bewertung'?'https://reviews.example.org/':'https://beautinda.de/'));
  }
  fs.writeFileSync(path.join(out,name+'.html'),b.htmlContent);
 }
 const unnamed=await v("select _mail_vorlage('geburtstag',$1::jsonb)",[JSON.stringify({...data,Vorname:''})]);
 ok('Fehlender Vorname: saubere Anrede und Betreff',unnamed.vorher.startsWith('Hallo,\n')&&!unnamed.betreff.includes(', '));
 const x=await v("select _mail_ausgabe(_mail_vorlage('willkommen',$1::jsonb),'https://club.example.org/?t=DEMO')",[JSON.stringify({Vorname:'<img src=x onerror=alert(1)>[Datum]'})]);
 ok('Kundentext bleibt sicher, keine rekursive Ersetzung',!x.htmlContent.includes('<img src=x')&&x.htmlContent.includes('&lt;img')&&x.htmlContent.includes('[Datum]'));
 await assert.rejects(()=>q("select _mail_vorlage('praemie_nah','{}')"));ok('Fehlende Prämienangaben werden nicht versendet',true);
 await assert.rejects(()=>q("select _mail_https('javascript:alert(1)')"));ok('Unsicheres Linkprotokoll wird abgewiesen',true);
 await q("select selbst_registrieren('Anna','Test','mail-vorlagen@example.org','FFM-01','de',null)");
 const k=(await q("select * from kundin where email='mail-vorlagen@example.org'"))[0];
 const tok=(await v("select terminal_anmelden('FFM-01','1234')")).token;
 ok('Registrierung reiht neue Willkommensmail ein',await v("select mail_inhalt->>'vorlage'='willkommen' and betreff like 'Anna,%' from nachricht where kundin_id=$1 and schluessel='willkommen'",[k.id]));
 await q("select selbst_registrieren('Anna','Test','mail-vorlagen@example.org','FFM-01','de',null)");
 ok('Erneute Registrierung verwendet Zugangsvorlage',await v("select count(*)=1 from nachricht where kundin_id=$1 and mail_inhalt->>'vorlage'='zugang'",[k.id]));
 await q("select _mail_einreihen($1,'rueckkehr1','vermisst','ohne_einwilligung')",[k.id]);
 ok('Marketing ohne Einwilligung bleibt gesperrt',await v("select count(*)=0 from nachricht where schluessel='ohne_einwilligung'"));
 await q("select einwilligung_setzen($1,'email_werbung',true,'Test');",[k.zugangstoken]);
 await q("select einwilligung_setzen($1,'geburtstag',true,'Test');",[k.zugangstoken]);
 await q("update kundin set geburtsdatum=(current_date-interval '25 years')::date where id=$1",[k.id]);
 await q("update aktion set gueltig_tage=7 where ausloeser='geburtstag'");
 await q('select job_geburtstag()');await q('select job_geburtstag()');
 ok('Geburtstagsgeschenk genau einmal und korrekte variable Frist',await v("select count(*)=1 and bool_and(gueltig_bis::date=current_date+7) from einloesung where kundin_id=$1 and quelle='aktion'",[k.id]));
 ok('Geburtstagsmail enthält wirklichen Vorteil und Ablaufdatum',await v("select text like '%10.00 € Geburtstagsgutschein%' and text like '%'||to_char(current_date+7,'DD.MM.YYYY')||'%' from nachricht where kundin_id=$1 and anlass='geburtstag'",[k.id]));
 await q("insert into punktebewegung(organisation_id,kundin_id,betrag,anlass,begruendung) values($1,$2,100,'import','Test')",[k.organisation_id,k.id]);
 await q("update praemie set punkte=125 where organisation_id=$1",[k.organisation_id]);
 await q('select job_praemie_nah()');await q('select job_praemie_nah()');
 ok('Prämienmail einmal pro Quartal mit konkreten Perlen',await v("select count(*)=1 and bool_and(text like '%25 Perlen%') from nachricht where kundin_id=$1 and anlass='praemie_nah'",[k.id]));
 await q("update einstellung set wert='true' where schluessel='mail_aktiv';update einstellung set wert='test-only' where schluessel='mail_api_key'");
 await q('select admin_zugangsmail($1,$2)',[tok,k.kundennummer]);
 ok('Supportweg verwendet freigegebene Wiederherstellung',await v("select count(*)=1 from nachricht where mail_inhalt->>'vorlage'='zugang_hilfe' and kundin_id=$1",[k.id]));
 await q("select _mail_einreihen($1,'bewertung','programm','test_bewertung')",[k.id]);
 await q("update einstellung set wert='' where schluessel='google_bewertung_url'");
 await q('select job_mail_senden(40)');
 ok('Fehlender Bewertungslink blockiert nur betroffene Mail ohne Sendeversuch',await v("select status='fehler_temporaer' and versuche=0 and request_id is null from nachricht where schluessel='test_bewertung'"));
 const payload=(await q("select body from net._http_queue where body->>'subject' like 'Anna, willkommen%'"))[0].body;
 ok('Versand verwendet HTML und vollständige Textalternative',payload.htmlContent.includes('Meinen Club entdecken')&&payload.textContent.includes('?t='+k.zugangstoken)&&payload.replyTo.email==='info@laperle-beauty.de');
 await q('select admin_mail_test($1,$2)',[tok,'preview@example.org']);
 ok('Testmail verwendet neue Vorlage',await v("select count(*)=1 from net._http_queue where body->>'subject' like 'TEST – %' and body->>'textContent' like '%Meinen Club entdecken%'"));
 await q("set role anon");await assert.rejects(()=>q("select _mail_vorlage('willkommen','{}')"));await q('reset role');
 ok('Interne Mailfunktionen nicht öffentlich aufrufbar',true);
 const rights=await v('select rechte_setzen()');ok('RPC-Rechte weiterhin vollständig',rights.nicht_erwartet_aber_offen.length===0&&rights.fuer_anon_aufrufbar===rights.erwartet);
 console.log('INFO Kein echter E-Mail-Versand. Vorschauen mit erfundenen Testdaten.');
 }finally{await e.end()}
})().catch(e=>{console.error('FAIL',e.message,e.detail||'');process.exitCode=1});
