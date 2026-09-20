/* Lüster: presentation adapter only. No network, session access, RPC interception or outcomes. */
(() => {
 'use strict';
 const scriptURL = document.currentScript.src;
 const config = { enable3D: true };
 const reduced = matchMedia('(prefers-reduced-motion: reduce)');
 const club = document.getElementById('club');
 const terminal = document.getElementById('sKundin');
 const scopes = [...document.querySelectorAll('.lp-scope')];
 const seen = new WeakSet(), watched = new WeakSet(), doors = new WeakSet();
 const running = new Map(), counts = new Map(), renderers = new Set();
 let frame = 0, active = false, previousCustomer = '', shaderLoaded = false;
 let wheelStage, wheelTimer, wheelImage, wheelAngle = '';
 const isVisible = el => !!el && !el.closest('.hide,[hidden]') && el.getClientRects().length > 0;
 const canMove = () => !reduced.matches && !document.hidden;
 const motionClasses = ['lp-enter','lp-enter-greeting','lp-enter-side','lp-enter-row','lp-progress-in','lp-customer-in','lp-door-open','lp-success'];
 function finish(el) {
  const timer = running.get(el); if (timer) clearTimeout(timer);
  running.delete(el); el.classList.remove(...motionClasses);
 }
 function play(el, name, duration = 850) {
  if (!el || !canMove() || el.contains(document.activeElement)) return;
  finish(el); el.classList.add(name);
  running.set(el, setTimeout(() => finish(el), duration));
 }
 function finishCount(node) {
  const state = counts.get(node); if (!state) return;
  state.settle();
 }
 function count(node) {
  if (!node || !canMove() || !isVisible(node)) return;
  finishCount(node);
  const text = node.textContent.trim();
  if (!/^\d[\d.]*$/.test(text)) return;
  const value = Number(text.replaceAll('.', ''));
  if (!Number.isSafeInteger(value) || value < 1) return;
  // Real value remains in the original live region; the disposable visual copy has no semantics.
  const copy = document.createElement('span'); copy.className = 'lp-count-copy';
  copy.setAttribute('aria-hidden','true'); copy.textContent = text;
  const style = getComputedStyle(node);
  for (const key of ['fontFamily','fontSize','fontWeight','lineHeight','letterSpacing','fontVariantNumeric']) copy.style[key] = style[key];
  copy.style.inset='auto';copy.style.left=node.offsetLeft+'px';copy.style.top=node.offsetTop+'px';
  node.parentElement.append(copy);node.classList.add('lp-count-source');
  const start = performance.now(); const state = {copy,frame:0}; counts.set(node,state);
  function step(now) {
   if (!canMove() || node.textContent.trim() !== text || !isVisible(node)) return settle();
   const p = Math.min(1,(now-start)/900), eased = 1-Math.pow(1-p,3);
   copy.textContent = Math.round(value*eased).toLocaleString('de-DE');
   if(p<1) state.frame=requestAnimationFrame(step); else settle();
  }
  function settle(){ cancelAnimationFrame(state.frame);copy.remove();node.classList.remove('lp-count-source');counts.delete(node); }
  state.settle=settle;state.frame=requestAnimationFrame(step);
 }
 function reveal(el) {
  if (seen.has(el) || !isVisible(el)) return;
  seen.add(el);
  if (el.matches('.item,.brow')) {
   const i=[...el.parentElement.children].indexOf(el);
   el.style.setProperty('--lp-delay',Math.min(3,i)*60+'ms');play(el,'lp-enter-row',700);
  } else if(el.matches('.track>span')) play(el,'lp-progress-in');
  else if(el.id==='featured') play(el,'lp-enter-side');
  else play(el,'lp-enter');
 }
 const observer = typeof IntersectionObserver==='function' ? new IntersectionObserver(entries=>{
  for(const entry of entries) if(entry.isIntersecting && isVisible(entry.target)) {reveal(entry.target);observer.unobserve(entry.target);}
 },{threshold:.14}) : null;
 function watch() {
  if(!club || !isVisible(club)) return;
  club.querySelectorAll('#featured,#rewardProgress,#empfBox,#adventBox,#zielBox,#gewinneBox,.reward-list .item,#boardBox .brow,.track>span').forEach(el=>{
   if(watched.has(el)) return; watched.add(el);
   if(observer) observer.observe(el); else seen.add(el);
  });
  club.querySelectorAll('.door.auf').forEach(d=>doors.add(d));
 }
 function updateRank() {
  const label=club?document.querySelector('#rang span')?.textContent:document.querySelector('#kRang span')?.textContent;
  const rank=(label||'').trim().toLowerCase();
  document.querySelectorAll('.lp-pearl-object').forEach(el=>{if(el.dataset.rank!==rank)el.dataset.rank=rank;});
  renderers.forEach(r=>r.invalidate());
 }
 function activate() {
  frame=0;
  const next=club ? isVisible(club) : isVisible(document.getElementById('sHome')) || isVisible(terminal);
  if(next && !active){
   if(club){ play(club.querySelector('.greeting'),'lp-enter-greeting');play(document.getElementById('member'),'lp-enter');count(document.getElementById('kStand')); }
   loadShader();
  }
  active=next;
  if(!active){closeStage();return;}
  if(terminal && isVisible(terminal)){
   const customer=document.getElementById('kNr').textContent;
   if(customer && customer!==previousCustomer){previousCustomer=customer;play(terminal.querySelector('.customer'),'lp-customer-in',200);}
  }
  updateRank();watch();
 }
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(activate);};
 const dom=new MutationObserver(records=>{
  let structural=false;
  for(const r of records){
   if(r.type==='childList') structural=true;
   if(r.type==='attributes' && ['class','hidden'].includes(r.attributeName)){
    const el=r.target;
    if(el.matches('.door.auf')&&!doors.has(el)){doors.add(el);play(el,'lp-door-open',800);}
    if(el.matches('#note.on:not(.bad),#toast.on:not(.err)')&&active&&!String(r.oldValue||'').split(/\s+/).includes('on'))play(el,'lp-success',650);
    if(el.matches('#club,#sHome,#sKundin'))structural=true;
   }
  }
  if(structural)schedule();
 });
 // Observe semantic changes only. Style writes and decorative animation frames cannot loop this observer.
 scopes.forEach(root=>dom.observe(root,{subtree:true,childList:true,attributes:true,attributeOldValue:true,attributeFilter:['class','hidden']}));
 for(const id of ['note','toast']){const el=document.getElementById(id);if(el)dom.observe(el,{attributes:true,attributeOldValue:true,attributeFilter:['class'],childList:true});}
 function stopAll(){
  for(const el of [...running.keys()])finish(el);
  for(const s of [...counts.values()])s.settle();
  document.querySelectorAll('.lp-celebrate').forEach(el=>el.classList.remove('lp-celebrate'));
  closeStage();renderers.forEach(r=>r.pause());
 }
 document.addEventListener('focusin',e=>{for(const el of [...running.keys()])if(el.contains(e.target))finish(el);closeStage();},true);
 document.addEventListener('pointerdown',e=>{
  if(e.target.closest('input,textarea,select,button,a,summary')){
   for(const el of [...running.keys()])if(el.contains(e.target))finish(el);
   closeStage();
  }
 },{capture:true,passive:true});
 // The existing application calls this interface ONLY for its real celebration events.
 window.LaPerleCelebration={
  play(root){if(!root)return;root.classList.add('lp-choreography');if(canMove()){root.classList.add('lp-celebrate');setTimeout(()=>root.classList.remove('lp-celebrate'),root.classList.contains('mp-compact')?650:1600);}},
  stop(root){root?.classList.remove('lp-celebrate');}
 };
 function closeStage(){clearTimeout(wheelTimer);wheelStage?.classList.remove('lp-show');}
 document.addEventListener('keydown',closeStage,{capture:true});
 function mirrorWheel(){
  const source=document.getElementById('wheel'),angle=source?.style.transform;
  if(angle==='rotate(0deg)'){wheelAngle='';return;}
  if(!source||!angle||angle===wheelAngle)return;
  wheelAngle=angle;
  if(!canMove()||!isVisible(source))return;
  if(!wheelStage){
   wheelStage=document.createElement('div');wheelStage.className='lp-wheel-stage';wheelStage.setAttribute('aria-hidden','true');
   wheelImage=document.createElement('canvas');wheelImage.width=520;wheelImage.height=520;
   const pin=document.createElement('span');pin.className='lp-wheel-pointer';
   wheelStage.append(wheelImage,pin);document.body.append(wheelStage);
  }
  const context=wheelImage.getContext('2d');if(!context)return;
  context.clearRect(0,0,520,520);context.drawImage(source,0,0);
  wheelImage.style.transition='none';wheelImage.style.transform='rotate(0deg)';
  wheelStage.classList.add('lp-show');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(!canMove()||!wheelStage.classList.contains('lp-show'))return;
   wheelImage.style.transition='';wheelImage.style.transform=angle;
  }));
  wheelTimer=setTimeout(closeStage,4850);
 }
 const wheel=document.getElementById('wheel');
 if(wheel)new MutationObserver(mirrorWheel).observe(wheel,{attributes:true,attributeFilter:['style']});
 function loadShader(){
  if(shaderLoaded||!config.enable3D||!canMove()||navigator.connection?.saveData||(navigator.deviceMemory&&navigator.deviceMemory<=2)||(navigator.hardwareConcurrency&&navigator.hardwareConcurrency<=2))return;
  shaderLoaded=true;
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if(!active||!canMove()) {shaderLoaded=false;return;}
   const script=document.createElement('script');script.src=new URL('pearl-webgl.js',scriptURL).href;script.async=true;
   script.onload=()=>{if(!config.enable3D||!canMove())return;document.querySelectorAll('.lp-pearl-object').forEach(el=>{const r=window.LaPerlePearl?.mount(el);if(r)renderers.add(r);});};
   script.onerror=()=>{shaderLoaded=false;};document.head.append(script);
  }));
 }
 let scrollFrame=0;
 window.addEventListener('scroll',()=>{
  if(scrollFrame||!club||!active||!canMove())return;
  scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;const pearl=club.querySelector('.lp-pearl-object');if(pearl&&isVisible(pearl))pearl.style.setProperty('--lp-parallax',Math.min(18,window.scrollY*.06)+'px');});
 },{passive:true});
 reduced.addEventListener('change',()=>{if(reduced.matches){stopAll();renderers.forEach(r=>r.destroy());renderers.clear();shaderLoaded=false;}else{loadShader();}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();else renderers.forEach(r=>r.invalidate());});
 window.addEventListener('pagehide',()=>{stopAll();renderers.forEach(r=>r.destroy());renderers.clear();});
 window.LaPerleDesign={disable3D(){config.enable3D=false;renderers.forEach(r=>r.destroy());renderers.clear();},get threeDEnabled(){return config.enable3D;}};
 schedule();
})();
