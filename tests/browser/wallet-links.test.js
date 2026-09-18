const {start}=require('./umgebung');const assert=require('node:assert/strict');
(async()=>{const u=await start({viewport:{width:390,height:844}});try{
 await u.sql("select selbst_registrieren('Wallet','Test','wallet-browser@example.org','FFM-01','de',null)");
 const [k]=await u.sql("select zugangstoken from kundin where email='wallet-browser@example.org'");
 const calls=[];
 await u.page.route('**/functions/v1/wallet*/**',async route=>{
  calls.push({url:route.request().url(),headers:route.request().headers(),body:route.request().postDataJSON()});
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({bereit:false}),headers:{'Access-Control-Allow-Origin':'*'}});
 });
 await u.page.goto(u.url+'/club/?t='+k.zugangstoken+'#einwilligungen');await u.page.waitForSelector('#club:not(.hide)');
 await u.page.click('#walletTop');assert.equal(await u.page.evaluate(()=>document.activeElement.id),'appleWalletBtn');console.log('PASS Oberer Wallet-Button führt zur Plattformauswahl');
 await u.page.click('#appleWalletBtn');await u.page.waitForFunction(()=>document.querySelector('#note').textContent.includes('Apple Wallet'));
 assert.ok(calls[0].url.endsWith('/wallet-apple/pass'));assert.equal(calls[0].body.token,k.zugangstoken);console.log('PASS Apple-Button verwendet eigenen geschützten Endpunkt');
 await u.page.click('#walletBtn');await u.page.waitForFunction(()=>document.querySelector('#note').textContent.includes('Google Wallet'));
 assert.ok(calls[1].url.endsWith('/wallet/link'));assert.ok(!calls[1].headers.authorization);console.log('PASS Google-Button verwendet Google-Endpunkt ohne Publishable-Key als JWT');
 assert.ok(await u.page.locator('#walletBtn').isEnabled());assert.ok(await u.page.locator('#appleWalletBtn').isEnabled());console.log('PASS Nicht eingerichtete Wallets zeigen Rückmeldung und geben Buttons wieder frei');
 const overflow=await u.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.ok(!overflow);console.log('PASS Wallet-Auswahl passt auf 390px');
 assert.ok(!u.konsole.some(x=>x.startsWith('pageerror')));console.log('PASS Wallet-Auswahl ohne JavaScript-Fehler');
}finally{await u.ende()}})().catch(e=>{console.error('FAIL',e.message);process.exitCode=1});
