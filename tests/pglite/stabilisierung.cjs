const {create}=require('./engine.cjs');
const assert=require('node:assert/strict');
(async()=>{
 const e=await create();
 const q=async(s,p)=>(await e.query(s,p)).rows;
 const v=async(s,p)=>Object.values((await q(s,p))[0])[0];
 const ok=(name,condition)=>{assert.ok(condition,name);console.log('PASS '+name)};
 const denied=async(name,sql,args)=>{await assert.rejects(()=>q(sql,args));console.log('PASS '+name)};
 try{
 const tok=(await v("select terminal_anmelden('FFM-01','1234')")).token;
 await q("select selbst_registrieren('Ada','Test','ada@example.org','FFM-01','de',null)");
 const k=(await q("select * from kundin where email='ada@example.org'"))[0];
 await q("update einstellung set wert='123' where schluessel='google_issuer_id'");
 // Ausgabe benötigt ab der nativen Wallet-Migration eine aktivierte Plattform.
 await q("update einstellung set wert='true' where schluessel='wallet_aktiv'");
 const d=await v('select wallet_kartendaten($1)',[k.zugangstoken]);
 ok('Wallet-Vertrag erhält Logo und persönliche Zielzeile',Object.hasOwn(d,'logo_url')&&Object.hasOwn(d,'zeile'));
 await q("update einstellung set wert='true' where schluessel='wallet_aktiv';update funktion set aktiv=false where schluessel='wallet'");
 ok('Wallet-Funktionsschalter bleibt wirksam',!(await v('select wallet_kartendaten($1)',[k.zugangstoken])).aktiv);
 await q("update funktion set aktiv=true where schluessel='wallet'");
 await q('select wallet_gespeichert($1)',[k.zugangstoken]);
 const claim=async()=> (await v('select wallet_offene_karten(50)'))[0];
 const ack=async(c,rest)=>v('select wallet_quittieren($1::jsonb)',[JSON.stringify([{object_id:c.object_id,version:c.version,lease_id:c.lease_id,...rest}])]);
 const row=async()=>(await q('select * from wallet_pass where kundin_id=$1',[k.id]))[0];
 let a=await claim();ok('Wallet erste Abgleichpflicht mit Lease und aktuellem Club-Link',a.lease_id&&a.club_url.endsWith(k.zugangstoken));
 ok('Wallet aktive Lease wird nicht erneut vergeben',(await v('select wallet_offene_karten(50)')).length===0);
 await q("update wallet_pass set gesperrt_bis=now()-interval '1 minute',stand_version=stand_version+1 where kundin_id=$1",[k.id]);
 let b=await claim();await ack(b,{ok:true});await ack(a,{ok:true});
 let w=await row();ok('Verspäteter alter Worker lässt neuen Abgleich offen',w.aktualisierung_noetig&&w.stand_version>w.quittiert_version);
 let c=await claim();await ack(c,{ok:true});ok('Neuer Abgleich bestätigt aktuellen Stand',!(await row()).aktualisierung_noetig);
 await q("update wallet_pass set abgeglichen_am=now()-interval '2 hours' where kundin_id=$1",[k.id]);
 c=await claim();ok('Periodischer Vollabgleich repariert nicht quittierte Fremdänderungen',!!c);await ack(c,{ok:true});
 for(const st of [500,404,500,404,404]){
  await q('update wallet_pass set stand_version=stand_version+1,naechster_versuch=null where kundin_id=$1',[k.id]);c=await claim();await ack(c,{status:st});
 }
 ok('Nur aufeinanderfolgende 404 zählen zur Rücknahme',!(await row()).zurueckgezogen_am);
 await q('update wallet_pass set naechster_versuch=null where kundin_id=$1',[k.id]);c=await claim();await ack(c,{status:404});
 ok('Dritter aufeinanderfolgender 404 nimmt Karte zurück',!!(await row()).zurueckgezogen_am);
 const revived=await v('select wallet_kartendaten($1)',[k.zugangstoken]);ok('Erneuter Wallet-Aufruf reaktiviert dasselbe Objekt ohne Unique-Fehler',revived.object_id===d.object_id&&!(await row()).zurueckgezogen_am);
 await q("update wallet_pass set gesperrt_bis=null,lease_id=null where kundin_id=$1",[k.id]);
 const noLease=await ack({object_id:d.object_id,version:0},{ok:true});ok('Quittierung ohne Besitzkennung wird nicht bestätigt',noLease.quittiert===0);
 await q("update einstellung set wert='true' where schluessel='altlink_rotation_freigegeben'");
 await denied('Rotation trotz Freigabe bei ausgeschaltetem Maildienst gesperrt','select job_altlinks_ersetzen(false)');
 await q("update einstellung set wert='true' where schluessel='mail_aktiv'; update einstellung set wert='test-only' where schluessel='mail_api_key'");
 await q('delete from nachricht; delete from net._http_queue; delete from net._http_response');
 await q("insert into nachricht(organisation_id,kundin_id,kanal,anlass,betreff,text,schluessel) values($1,$2,'email','willkommen','Test','Test','stabilisierung')",[k.organisation_id,k.id]);
 await q('select job_mail_senden(10)');await q('select net._mock_zustellen(503)');await q('select job_mail_pruefen()');
 let n=(await q("select * from nachricht where schluessel='stabilisierung'"))[0];ok('Mail HTTP 503 bleibt unklar statt automatische Doppelzustellung',n.status==='unklar');
 ok('Mail unklar wird nicht automatisch erneut versendet',await v('select job_mail_senden(10)')===0);
 await denied('Mailklärung verlangt dokumentierten Prüfnachweis','select admin_mail_klaeren($1,$2,$3,$4)',[tok,n.id,'nicht_gesendet','kurz']);
 await q('set role anon');
 await q('select admin_mail_klaeren($1,$2,$3,$4)',[tok,n.id,'nicht_gesendet','Anbieterprotokoll: Annahme ausgeschlossen.']);
 await q('reset role');
 ok('Manuell ausgeschlossene Annahme erlaubt dokumentierte Wiederholung',await v("select status='offen' from nachricht where id=$1",[n.id]));
 ok('Entscheidung hat Audit-Eintrag',await v('select count(*)::int from mail_klaerung where nachricht_id=$1',[n.id])===1);
 await q('select job_mail_senden(10)');await q('select net._mock_zustellen(201)');await q('select job_mail_pruefen()');await q('select job_mail_pruefen()');
 ok('Mailbestätigung nur einmal gezählt',await v('select bestaetigt=1 from mail_kontingent where tag=_mail_tag()'));
 const posts=await v('select admin_nachrichten($1,false)',[tok]);ok('Postausgang liefert ID für sichere Klärung',posts.zeilen.some(x=>x.id===n.id));
 await q('set role anon');await q('select admin_zugangsmail($1,$2)',[tok,k.kundennummer]);await q('reset role');
 await denied('Zugangsmail ist gegen sofortige Wiederholung geschützt','select admin_zugangsmail($1,$2)',[tok,k.kundennummer]);
 ok('Zugangsmail ändert keinen Kundentoken',await v('select zugangstoken=$1 from kundin where id=$2',[k.zugangstoken,k.id]));
 ok('Interne Admin-Helfer für anon gesperrt',await v("select not has_function_privilege('anon','_admin(text,text)','execute')"));
 ok('Mail-Audit für anon unlesbar',await v("select not has_table_privilege('anon','mail_klaerung','select')"));
 // Explizite Rollenbindung funktioniert auch bei mehrfach verschachteltem Aufruf.
 ok('Admin-Aufruf unabhängig vom PG_CONTEXT-Stack',await v('select admin_kennzahlen($1,current_date-30,current_date) is not null',[tok]));
 ok('Alle Verwaltungsfunktionen verwenden den Studiotag Europe/Berlin',await v("select count(*)=0 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'admin_%' and not ('TimeZone=Europe/Berlin'=any(coalesce(p.proconfig,'{}'::text[])))"));
 console.log('INFO Einzelverbindung: Parallelität und echte Provider hier nicht geprüft.');
 }finally{await e.end()}
})().catch(e=>{console.error('FAIL',e.message,e.detail||'');process.exitCode=1});
