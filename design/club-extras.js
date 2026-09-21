/* Customer interactions. All rewards/progress come from RPC responses; no client-side grants. */
(() => {
 'use strict';
 const club=document.querySelector('#club');if(!club)return;
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==null)n.textContent=text;if(cls)n.className=cls;return n;};
 const number=n=>Number(n||0).toLocaleString('de-DE');
 const safeImage=value=>{try{const u=new URL(value,location.href);return value&&(u.protocol==='https:'||u.origin===location.origin)?u.href:null;}catch{return null;}};
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 let missionData,missionBusy=false,loadGeneration=0;
 const dialog=node('dialog',null,'lp-detail-dialog');dialog.setAttribute('aria-label','Prämie ansehen');document.body.append(dialog);
 function showReward(p){
  dialog.replaceChildren();const close=node('button','×','lp-close');close.type='button';close.setAttribute('aria-label','Schließen');close.onclick=()=>dialog.close();dialog.append(close,node('p',number(p.punkte)+' Perlen','eyebrow'),node('h2',p.bezeichnung));
  const src=safeImage(p.bild);if(src){const img=node('img',null);img.src=src;img.alt=p.bezeichnung;img.onerror=()=>img.remove();dialog.append(img);}
  dialog.append(node('p',p.beschreibung||''),node('p','Diese Prämie ist für dich verfügbar. Zeige sie beim nächsten Besuch am Empfang. Dort wird sie eingelöst und dein Perlenstand aktualisiert.'));
  const done=node('button','Verstanden','btn');done.type='button';done.onclick=()=>dialog.close();dialog.append(done);dialog.showModal();
 }
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 function renderRewards(d){
  const list=document.querySelector('#praemien');list.replaceChildren();
  const all=[...(d.praemien||[])].sort((a,b)=>a.punkte-b.punkte);
  for(const [index,p] of all.entries()){const b=node('button',null,'item'+(p.erreichbar?' frei':''));b.type='button';b.id='praemie-'+p.id;b.disabled=!p.erreichbar;b.append(node('span',String(index+1).padStart(2,'0'),'lp-reward-no'),node('span',number(p.punkte)+' Perlen','pts'),node('strong',p.bezeichnung));if(p.beschreibung)b.append(node('span',p.beschreibung,'lp-reward-description'));
   const src=safeImage(p.bild);if(src){const img=node('img',null);img.src=src;img.alt='';img.loading='lazy';img.onerror=()=>img.remove();b.append(img);}
   b.append(node('span',p.erreichbar?'Freigeschaltet · Prämie ansehen':`Noch ${number(Math.max(0,p.punkte-d.stand))} Perlen bis zur Freischaltung`,'small'));if(p.erreichbar)b.onclick=()=>showReward(p);list.append(b);
  }
  if(!all.length)list.append(node('p','Aktuell sind keine Prämien hinterlegt.','leer'));
  const featured=all.find(p=>p.erreichbar);if(featured)document.querySelector('#featured').onclick=()=>showReward(featured);
 }
 const rankCard=node('section',null,'lp-rank-card');document.querySelector('.lp-journey').insertBefore(rankCard,document.querySelector('#nextBox'));
 function renderRank(d){const l=d.level;rankCard.hidden=!l||d.funktionen?.level===false;if(rankCard.hidden)return;
  rankCard.replaceChildren(node('span','Dein aktueller Rang','eyebrow'),node('h3',l.name),node('p',l.vorteil||''));
  rankCard.append(node('p',l.naechste?`Noch ${number(l.naechste.fehlen)} Rangperlen bis ${l.naechste.name}.`:'Du hast den höchsten Rang erreicht.'));
  const detail=node('details',null),summary=node('summary','Alle Ränge & Vorteile'),list=node('ol',null,'lp-rank-list');
  for(const r of l.alle||[]){const item=node('li',null);item.dataset.rank=String(r.stufe);if(r.stufe===l.stufe)item.setAttribute('aria-current','true');item.append(node('span',String(r.stufe).padStart(2,'0'),'lp-rank-badge'));item.append(node('strong',r.name+(r.stufe===l.stufe?' · dein Rang':'')),node('span','Ab '+number(r.ab_punkten)+' gesammelten Rangperlen'),node('small',r.vorteil||'Deine Clubvorteile'));list.append(item);}
  detail.append(summary,list,node('p','Dein Rang richtet sich nach deinen insgesamt gesammelten Perlen. Das Einlösen von Prämien senkt deinen Rang nicht. Die hinterlegten Rangvorteile gelten, solange du diesen Rang hast.'));rankCard.append(detail);
  document.querySelector('#nextBox').classList.add('lp-rank-compact');
 }
 const wordmark=node('figcaption',null,'lp-pearl-wordmark'),logo=node('img',null);logo.src=club.querySelector('.lp-brand').src;logo.alt='La Perlé Beauty Boutique';wordmark.append(logo);club.querySelector('.lp-pearl-object')?.append(wordmark);
 const chainIntro=node('div',null,'lp-chain-intro');chainIntro.append(node('span','Deine persönliche Perlenkette','eyebrow'),node('h3','Ein Besuch. Eine Erinnerung.'),node('p','Sammle bei deinen Behandlungen Perlen für deine Prämien. Die sechs Plätze zeigen deine letzten Besuche – tippe eine Perle an und entdecke ihre Geschichte.'));document.querySelector('#necklace').before(chainIntro);
 const chainAction=node('a','Neue Perlen sammeln · Termin buchen','lp-chain-action');chainAction.href=document.querySelector('#terminBtn').href;chainAction.target='_blank';chainAction.rel='noopener';document.querySelector('#member').append(chainAction);
 // Existing targeted campaign content now appears under the requested moment heading.
 document.querySelector('.reward-heading').after(document.querySelector('#bannerBox'));
 // Public reviews remain independent of the optional, rewarded private feedback form.
 const review=node('section',null);review.id='reviewBox';const feedback=document.querySelector('#fbBox');feedback.before(review);
 review.append(node('span','Deine Erfahrung','eyebrow'),node('h2','Wie war dein Besuch?'),node('p','Teile deine Erfahrung auf Google oder Beautinda.','lead'));
 const links=node('div',null,'lp-review-links');
 for(const [label,url] of [['Auf Google bewerten','https://www.google.com/maps?q=La+Perl%C3%A9+Beauty+Boutique,+Bruchfeldstra%C3%9Fe+33,+60528+Frankfurt+am+Main'],['Auf Beautinda bewerten','https://beautinda.de/salon/51EsvFBHxDRcmZqOg3rC']]){const a=node('a',label,'secondary');a.href=url;a.target='_blank';a.rel='noopener noreferrer';links.append(a);}
 review.append(links,node('p','Die Links öffnen unser jeweiliges Profil. Öffentliche Bewertungen sind freiwillig und werden nicht mit Perlen belohnt.','small'));
 const privateDetails=node('details',null);privateDetails.append(node('summary','Feedback direkt an das Studio'),feedback);review.append(privateDetails);
 // Goals: retain personal notes separately; the mission cannot be self-completed by the customer.
 const goal=document.querySelector('#zielBox'),mission=node('div',null,'lp-mission'),missionSection=node('section',null,'lp-mission-section');missionSection.id='missionBox';mission.setAttribute('aria-live','polite');
 goal.before(missionSection);missionSection.append(node('span','Worauf du hinarbeitest','eyebrow'),node('h2','Dein nächstes Ziel'),mission,goal);
 const personal=node('details',null);personal.append(node('summary','Persönlichen Wunsch hinterlegen'),document.querySelector('#zielInhalt'));goal.append(personal);
 function updateMission(){
  const demoOpen=mission.querySelector('.lp-demo-controls')?.open;const data=missionData;mission.replaceChildren();if(!data)return;
  if(data.aus){mission.append(node('p','Neue Behandlungsziele werden hier angezeigt, sobald das Studio sie freigibt.'));return;}
  const current=data.mission;
  if(current){mission.append(node('span',current.abgeschlossen?'Ziel erreicht':'Dein Behandlungsziel','eyebrow'),node('h3',current.titel));
   const max=Number(current.anzahl),count=Math.min(max,Number(current.fortschritt));mission.append(node('p',`${count} von ${max} Behandlungstagen`));
   const progress=node('progress',null);progress.max=max;progress.value=count;progress.setAttribute('aria-label','Fortschritt deines Behandlungsziels');mission.append(progress);
   const steps=node('div',null,'lp-milestones');steps.setAttribute('aria-hidden','true');for(let i=1;i<=max;i++)steps.append(node('span',i<=count?'✓':String(i),i<=count?'done':''));mission.append(steps);
   mission.append(node('p',(current.abgeschlossen?'Für dich freigeschaltet: ':'Deine Abschlussprämie: ')+current.belohnung));
   mission.append(node('p',current.abgeschlossen?'Deine Prämie ist für den Empfang hinterlegt.':`Noch ${max-count} passende Behandlungstage. Fortschritt wird vom Studio mit der Buchung bestätigt – höchstens einmal pro Tag.`));
   if(!current.abgeschlossen){const cancel=node('button','Ziel beenden','linkbtn');cancel.type='button';cancel.onclick=()=>runMission(cancel,'mission_beenden',{});mission.append(cancel);}
   else{const note=node('p','Du kannst jetzt ein anderes Ziel wählen.','small');mission.append(note);}
  }
  if(!current||current.abgeschlossen){
   const options=(data.vorlagen||[]).filter(v=>!(data.erledigt||[]).includes(v.id));
   if(options.length&&window.LaPerleGoalPicker){const picker=node('div');mission.append(picker);window.LaPerleGoalPicker.mount(picker,options,(button,id)=>runMission(button,'mission_starten',{p_vorlage_id:id}));}
   else if(options.length){const form=node('form',null),fieldset=node('fieldset',null);fieldset.append(node('legend','Wähle dein Ziel'));
    for(const [i,v] of options.entries()){const label=node('label',null),input=node('input',null);input.type='radio';input.name='clubMission';input.value=v.id;input.required=true;const text=node('span',v.titel);text.append(node('small',`${v.anzahl} passende Behandlungstage · ${v.belohnung}`));label.append(input,text);fieldset.append(label);}
    const start=node('button','Dieses Ziel starten','btn');start.type='submit';form.append(fieldset,start);form.onsubmit=e=>{e.preventDefault();const id=new FormData(form).get('clubMission');if(id)runMission(start,'mission_starten',{p_vorlage_id:id});};mission.append(form);
   }else if(!current)mission.append(node('p','Aktuell sind keine neuen Behandlungsziele freigegeben.'));
  }
  if(window.LaPerleDemo?.missionBooking){const demo=node('details',null,'lp-demo-controls');demo.open=!!demoOpen;demo.append(node('summary','Demo: Fortschritt ausprobieren'),node('p','Beispielbuchung auf dem nächsten Behandlungstag. Keine echte Buchung.'));const btn=node('button','Passenden Besuch simulieren','secondary');btn.type='button';btn.disabled=!current||current.abgeschlossen;btn.onclick=async()=>{btn.disabled=true;window.LaPerleDemo.missionBooking();await loadMissions();};demo.append(btn);mission.append(demo);}
 }
 async function loadMissions(){const gen=++loadGeneration;try{const data=await rpc('kunde_missionen',{p_token:token});if(gen!==loadGeneration)return;missionData=data;updateMission();}catch{if(gen!==loadGeneration)return;mission.replaceChildren(node('p','Die Behandlungsziele konnten gerade nicht geladen werden.','small'));const retry=node('button','Erneut versuchen','secondary');retry.type='button';retry.onclick=loadMissions;mission.append(retry);}}
 async function runMission(button,fn,args){if(missionBusy)return;missionBusy=true;button.disabled=true;try{await rpc(fn,{p_token:token,...args});await loadMissions();}catch(e){sagen(e.message,true);}finally{missionBusy=false;if(button.isConnected)button.disabled=false;}}
 function giftContent(container,text,image){container.replaceChildren();const src=safeImage(image);if(src){const img=node('img',null);img.src=src;img.alt=text;img.onerror=()=>img.remove();container.append(img);}container.append(node('span',text));}
 const opening=new Map();
 function renderAdvent(d){
  for(const [i,b] of [...document.querySelectorAll('#advent .door')].entries()){const t=d.advent?.[i];if(!t)continue;b.dataset.day=t.tag;const result=b.querySelector('.hinten');b.querySelector(':scope > .bild')?.remove();
   if(t.geoeffnet)giftContent(result,t.gewinn||'',t.bild);
   const running=opening.get(t.tag);if(running&&running.until>performance.now()){giftContent(result,running.text,running.image);b.classList.add('auf','lp-door-opening');b.style.setProperty('--lp-door-elapsed',Math.max(0,performance.now()-running.start)+'ms');}
   if(b.disabled)continue;
   b.onclick=async()=>{
    if(b.getAttribute('aria-busy')==='true')return;b.disabled=true;b.setAttribute('aria-busy','true');
    try{const r=await rpc('advent_oeffnen',{p_token:token,p_tag:+t.tag});b.removeAttribute('aria-busy');giftContent(result,r.bezeichnung,r.bild||t.bild);const start=performance.now();opening.set(t.tag,{start,until:start+1850,text:r.bezeichnung,image:r.bild||t.bild});
     b.classList.add('auf');if(!reduced.matches)b.classList.add('lp-door-opening');b.setAttribute('aria-label',`Türchen ${t.tag}: ${r.bezeichnung}`);sagen(`Türchen ${r.tag}: ${r.bezeichnung}`);
     // Inputs remain usable throughout; only data refresh waits for the reveal to finish.
     setTimeout(()=>{opening.delete(t.tag);b.classList.remove('lp-door-opening');laden();},reduced.matches?0:1850);
    }catch(e){b.removeAttribute('aria-busy');b.disabled=false;sagen(e.message,true);}
   };
  }
 }
 let demoBuilt=false;
 function demoEditor(){if(demoBuilt||!window.LaPerleDemo?.setAdventImage)return;demoBuilt=true;const box=node('details',null,'lp-demo-controls');box.append(node('summary','Demo: Produktbild ausprobieren'));const label=node('label','Produktfoto für Türchen 3 (optional)'),input=node('input',null);input.type='file';input.accept='image/png,image/jpeg,image/webp';label.append(input);const clear=node('button','Ohne Bild anzeigen','secondary');clear.type='button';const info=node('p','Das Foto bleibt nur in dieser Vorschau. Ohne Foto erscheint ausschließlich der Gewinntext.','small');input.onchange=()=>{const file=input.files[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>3*1024*1024){sagen('Bitte PNG, JPG oder WebP bis 3 MB wählen.',true);return;}const u=URL.createObjectURL(file);window.LaPerleDemo.setAdventImage(u);laden();};clear.onclick=()=>{input.value='';window.LaPerleDemo.setAdventImage(null);laden();};box.append(label,clear,info);document.querySelector('#adventBox').append(box);}
 function render(d){chainAction.href=document.querySelector('#terminBtn').href;renderRewards(d);renderRank(d);renderAdvent(d);demoEditor();loadMissions();}
 window.LaPerleClub={render};
 if(typeof daten!=='undefined'&&daten)render(daten);
})();
