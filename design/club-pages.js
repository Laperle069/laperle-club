/* Native vertical pages. Existing nodes, IDs, handlers and server state are retained. */
(() => {
 'use strict';
 const club=document.querySelector('#club');
 if(!club||club.classList.contains('lp-pages'))return;
 const find=s=>club.querySelector(s);
 if(!find('#missionBox')||!find('.lp-rank-card'))return;
 const make=(tag,cls,text)=>{const el=document.createElement(tag);el.className=cls;if(text)el.textContent=text;return el;};
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const viewport=make('div','lp-page-viewport');
 viewport.setAttribute('aria-label','Deine Clubabschnitte');
 const navigation=make('nav','lp-page-navigation');navigation.setAttribute('aria-label','Clubabschnitte');
 const prev=make('button','lp-page-arrow','↑'),next=make('button','lp-page-arrow','↓');
 prev.type=next.type='button';
 const label=make('label','lp-page-picker'),caption=make('span','lp-page-caption','Abschnitt wählen');
 const select=make('select','lp-page-select');select.setAttribute('aria-label','Abschnitt wählen');
 const status=make('span','lp-page-status');status.setAttribute('aria-live','polite');status.setAttribute('aria-atomic','true');
 label.append(caption,select);navigation.append(prev,label,next,status);
 const collection=make('div','lp-collection');
 for(const selector of ['.lp-chain-intro','#necklace','#member .foot','.lp-chain-action']){const el=find(selector);if(el)collection.append(el);}
 const allRewards=find('#alleZeigen').parentElement;
 const definitions=[
  ['start','Start',[find('.greeting'),find('#member'),find('#terminBtn')]],
  ['kette','Perlenkette',[collection]],
  ['moment','Für dich',[find('.reward-heading'),find('#bannerBox')]],
  ['fortschritt','Prämienfortschritt',[find('#featured'),find('#frLeer'),find('#rewardAvailable'),find('#rewardProgress'),allRewards]],
  ['praemien','Alle Prämien',[find('#praemienBox')]],
  ['rang','Dein Rang',[find('.lp-rank-card'),find('#nextBox'),find('#track')]],
  ['ziele','Dein Ziel',[find('#missionBox')]],
  ['gewinne','Deine Gewinne',[find('#gewinneBox')]],
  ['advent','Adventskalender',[find('#adventBox')]],
  ['einladen','Freundinnen einladen',[find('#empfBox')]],
  ['bewertung','Deine Erfahrung',[find('#reviewBox'),find('#bewBox')]],
  ['bestenliste','Bestenliste',[find('#boardBand')]],
  ['profil','Profil & Wallet',[find('#profilBox'),find('#walletAuswahl'),find('.legal')]]
 ];
 const pages=definitions.map(([key,title,nodes])=>{
  const page=make('section','lp-page'),pane=make('div','lp-page-pane'),content=make('div','lp-page-content');
  page.dataset.page=key;page.setAttribute('aria-label',title);
  pane.tabIndex=0;pane.setAttribute('role','region');pane.setAttribute('aria-label',title+' – Inhalt');
  const sources=nodes.filter(Boolean);content.append(...sources);pane.append(content);page.append(pane);viewport.append(page);
  return {key,title,page,pane,content,sources};
 });
 // Empty presentation columns are no longer needed; unknown content is preserved.
 for(const old of club.querySelectorAll(':scope > .lp-intro,:scope > .lp-journey'))if(!old.children.length)old.remove();
 club.append(viewport,navigation);club.classList.add('lp-pages');
 let visible=[],current=pages[0],scrollFrame=0,syncFrame=0,resizeFrame=0;
 const moving=new Map();
 const shown=el=>!el.hidden&&!el.classList.contains('hide')&&!el.classList.contains('lp-rank-compact')&&el.style.display!=='none';
 const activeClub=()=>!club.hidden&&!club.classList.contains('hide');
 function controls(){
  const i=visible.indexOf(current);if(i<0)return;
  select.value=current.key;prev.disabled=i===0;next.disabled=i===visible.length-1;
  prev.setAttribute('aria-label',i>0?'Vorheriger Abschnitt: '+visible[i-1].title:'Erster Abschnitt');
  next.setAttribute('aria-label',i<visible.length-1?'Nächster Abschnitt: '+visible[i+1].title:'Letzter Abschnitt');
  status.textContent=String(i+1).padStart(2,'0')+' / '+String(visible.length).padStart(2,'0');
  caption.textContent=i===0?'Nach unten wischen · oder wählen':'Abschnitt wählen';
 }
 function activate(page,animate=true){
  if(!page||page===current)return;
  current.page.classList.remove('lp-page-current');current=page;page.page.classList.add('lp-page-current');
  controls();
  if(animate&&!reduced.matches&&!page.content.contains(document.activeElement)){
   clearTimeout(moving.get(page));page.content.classList.remove('lp-page-arrive');
   page.content.classList.add('lp-page-arrive');
   moving.set(page,setTimeout(()=>{page.content.classList.remove('lp-page-arrive');moving.delete(page);},420));
  }
 }
 function go(page,focus=false){
  if(!page||page.page.hidden)return;
  const adjacent=Math.abs(visible.indexOf(page)-visible.indexOf(current))===1;
  viewport.scrollTo({top:page.page.offsetTop,behavior:reduced.matches||!adjacent?'instant':'smooth'});
  if(focus)page.pane.focus({preventScroll:true});
  activate(page);
 }
 function sync(){
  syncFrame=0;const before=visible.map(p=>p.key).join();
  for(const p of pages)p.page.hidden=!(p.key==='moment'?shown(find('#bannerBox')):p.sources.some(shown));
  visible=pages.filter(p=>!p.page.hidden);
  if(visible.map(p=>p.key).join()!==before){
   select.replaceChildren(...visible.map(p=>{const o=document.createElement('option');o.value=p.key;o.textContent=p.title;return o;}));
   if(!visible.includes(current)){current.page.classList.remove('lp-page-current');current=visible[0];}
   current?.page.classList.add('lp-page-current');
   if(activeClub()&&current)viewport.scrollTo({top:current.page.offsetTop,behavior:'instant'});
  }
  controls();
 }
 const schedule=()=>{if(!syncFrame)syncFrame=requestAnimationFrame(sync);};
 const changes=new MutationObserver(schedule);
 for(const el of [club,...pages.flatMap(p=>p.sources)])changes.observe(el,{attributes:true,attributeFilter:['class','hidden','style']});
 // No touch/wheel interception: browser snapping and scroll chaining preserve pinch zoom,
 // long lists, form input, screen-reader navigation and native momentum.
 viewport.addEventListener('scroll',()=>{
  if(scrollFrame)return;
  scrollFrame=requestAnimationFrame(()=>{
   scrollFrame=0;if(!visible.length||!activeClub())return;
   const p=visible.reduce((a,b)=>Math.abs(a.page.offsetTop-viewport.scrollTop)<Math.abs(b.page.offsetTop-viewport.scrollTop)?a:b);
   activate(p);
  });
 },{passive:true});
 prev.onclick=()=>go(visible[visible.indexOf(current)-1]);next.onclick=()=>go(visible[visible.indexOf(current)+1]);
 select.onchange=()=>go(visible.find(p=>p.key===select.value));
 // Only the explicitly focused section region owns these keys. Forms keep their keys.
 viewport.addEventListener('keydown',e=>{
  if(!e.target.classList.contains('lp-page-pane'))return;
  const index=visible.findIndex(p=>p.pane===e.target);
  const page=e.key==='PageDown'?visible[index+1]:e.key==='PageUp'?visible[index-1]:e.key==='Home'?visible[0]:e.key==='End'?visible.at(-1):null;
  if(page){e.preventDefault();go(page,true);}
 });
 if(typeof ResizeObserver==='function')new ResizeObserver(()=>{
  if(resizeFrame)return;resizeFrame=requestAnimationFrame(()=>{resizeFrame=0;if(activeClub()&&current)viewport.scrollTo({top:current.page.offsetTop,behavior:'instant'});});
 }).observe(viewport);
 reduced.addEventListener('change',()=>{if(reduced.matches){for(const [p,t] of moving){clearTimeout(t);p.content.classList.remove('lp-page-arrive');}moving.clear();if(current&&activeClub())viewport.scrollTo({top:current.page.offsetTop,behavior:'instant'});}});
 sync();
})();
