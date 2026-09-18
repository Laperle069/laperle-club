const {start}=require('./umgebung');const assert=require('node:assert/strict');
(async()=>{const u=await start({viewport:{width:390,height:844}});try{
 await u.sql("select selbst_registrieren('Mail','Test','mail-link@example.org','FFM-01','de',null)");
 const [k]=await u.sql("select id,organisation_id,zugangstoken from kundin where email='mail-link@example.org'");
 await u.sql("insert into einloesung(organisation_id,kundin_id,quelle,bezeichnung,art,nennwert,gueltig_bis,begruendung) values($1,$2,'aktion','Testgeschenk','betrag','10 €',now()+interval '7 days','Nur Test')",[k.organisation_id,k.id]);
 for(const id of ['einwilligungen','praemienBox','gewinneBox']){
  await u.page.goto('about:blank');
  await u.page.goto(u.url+'/club/?t='+k.zugangstoken+'#'+id);await u.page.waitForSelector('#club:not(.hide)');
  await u.page.waitForFunction(id=>document.activeElement?.id===id,id,{timeout:5000});
  assert.equal(await u.page.locator('#feier.an').count(),0);console.log('PASS Mail-Link fokussiert '+id+' nach asynchronem Laden');
 }
 assert.ok(!u.konsole.some(x=>x.startsWith('pageerror')));console.log('PASS Mail-Link ohne JavaScript-Fehler');
}finally{await u.ende()}})().catch(e=>{console.error('FAIL',e.message);process.exitCode=1});
