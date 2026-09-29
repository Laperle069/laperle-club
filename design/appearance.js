/* Device-local appearance; no customer data or account changes. */
(() => {
 const root=document.documentElement,key='lp-theme-'+(location.pathname.includes('/terminal')?'terminal':'club');
 const system=matchMedia('(prefers-color-scheme:dark)');
 let saved;try{saved=localStorage.getItem(key);}catch{}
 let theme=['light','dark'].includes(saved)?saved:(system.matches?'dark':'light');
 function apply(value,persist=false){theme=value;root.dataset.lpAppearance=value;root.dataset.lpTheme=value;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',value==='dark'?'#21191A':'#FFFDF9');document.querySelectorAll('.lp-palette button,.lp-theme button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.theme===value)));if(persist)try{localStorage.setItem(key,value);saved=value;}catch{}document.dispatchEvent(new Event('lp:themechange'));}
 apply(theme);
 document.addEventListener('click',e=>{const b=e.target.closest('.lp-theme button[data-theme]');if(b)apply(b.dataset.theme,true);});
 document.addEventListener('DOMContentLoaded',()=>{for(const bar of document.querySelectorAll('.lp-scope .brandbar')){if(bar.querySelector('.lp-palette'))continue;const group=document.createElement('div');group.className='lp-palette';group.setAttribute('role','group');group.setAttribute('aria-label','Darstellung');for(const [value,label] of [['light','Hell'],['dark','Dunkel']]){const b=document.createElement('button');b.type='button';b.dataset.theme=value;b.textContent=label;b.onclick=()=>apply(value,true);group.append(b);}bar.append(group);}apply(theme);});
 system.addEventListener('change',e=>{if(!saved)apply(e.matches?'dark':'light');});
})();
