/* Preference-only recommendations. Answers stay in this page; only the selected
 * server-configured goal ID is sent when the customer explicitly starts it. */
(() => {
 'use strict';
 const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n;};
 const questions=[
  {key:'area',title:'Wofür möchtest du dir Zeit nehmen?',note:'Wähle den Bereich, auf den du dich im Studio freust.',choices:[['gesicht','Gesichtspflege','Pflegemomente für mich'],['laser','Laserhaarentfernung','Meine Behandlungstermine begleiten'],['any','Ich bin noch offen','Zeig mir die Möglichkeiten']]},
  {key:'experience',title:'Wie möchtest du beginnen?',note:'Dein Ziel soll zu deinen bisherigen Besuchen passen.',choices:[['new','Etwas kennenlernen','Mit einer überschaubaren Etappe beginnen'],['regular','Meine Routine fortsetzen','An meine regelmäßigen Besuche anknüpfen']]},
  {key:'length',title:'Welche Etappe spricht dich an?',note:'Gezählt werden passende Behandlungstage – ohne Zeitdruck oder vorgegebene Terminabstände.',choices:[['short','2 bis 3 Behandlungstage','Ein kürzeres Sammelziel'],['medium','4 bis 5 Behandlungstage','Eine größere Etappe'],['any','Ich möchte offen bleiben','Die Länge ist mir nicht so wichtig']]},
  {key:'gift',title:'Worüber würdest du dich freuen?',note:'Du siehst nur Geschenke, die das Studio für seine Ziele hinterlegt hat.',choices:[['saving','Ein Preisvorteil','Rabatt oder Guthaben'],['treatment','Ein Behandlungsgeschenk','Ein zusätzlicher Studiomoment'],['any','Ich lasse mich überraschen','Beides klingt gut']]},
  {key:'priority',title:'Was soll beim Vorschlag zuerst zählen?',note:'Damit ordnen wir die freigegebenen Ziele für dich.',choices:[['fit','Mein Wunschbereich','Mein Interesse steht an erster Stelle'],['short','Eine kurze Etappe','Lieber ein kleineres Sammelziel'],['gift','Mein Wunschgeschenk','Die Belohnung ist mir besonders wichtig']]}
 ];
 let step=0,answers={},view='intro';
 function areaMatches(v,a){return a==='any'||!a||(a==='laser'?v.kategorie?.startsWith('laser'):v.kategorie===a);}
 function giftMatches(v,a){return a==='any'||!a||(a==='saving'?['prozent','betrag'].includes(v.belohnung_art):v.belohnung_art==='gratisleistung');}
 function rank(options,a){return options.map((v,i)=>{let score=0;const reasons=[];
  if(a.area&&a.area!=='any'&&areaMatches(v,a.area)){score+=a.priority==='fit'?12:6;reasons.push('Dein Wunschbereich');}
  if((a.length==='short'&&v.anzahl<=3)||(a.length==='medium'&&v.anzahl>=4&&v.anzahl<=5)){score+=5;reasons.push('Deine gewünschte Etappenlänge');}
  if(a.gift&&a.gift!=='any'&&giftMatches(v,a.gift)){score+=a.priority==='gift'?12:4;reasons.push('Dein Wunschgeschenk');}
  if(a.experience==='new')score+=Math.max(0,6-v.anzahl);
  if(a.priority==='short')score+=20/Math.max(1,v.anzahl);
  return {goal:v,score,reasons,index:i};
 }).sort((a,b)=>b.score-a.score||a.index-b.index);}
 function mount(host,options,onChoose){
  function focusTitle(){const h=host.querySelector('h3');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}
  function button(text,fn,cls='secondary'){const b=el('button',text,cls);b.type='button';b.onclick=fn;return b;}
  function show(next,focus=true){view=next;draw();if(focus)focusTitle();}
  function draw(){host.replaceChildren();host.classList.add('lp-goal-picker');
   if(view==='intro'){
    host.append(el('span','Dein persönlicher Weg','eyebrow'),el('h3','Ein Ziel, das zu dir passt.'),el('p','Fünf kurze Fragen. Danach zeigen wir dir freigegebene Sammelziele und das Geschenk, das dich am Ziel erwartet.'));
    host.append(button('Mein Ziel finden',()=>{step=0;show('questions');},'btn'),button('Alle Ziele ansehen',()=>show('all'),'linkbtn'));return;
   }
   if(view==='questions'){
    const q=questions[step],meta=el('div',null,'lp-quiz-meta');meta.append(el('span',`Frage ${step+1} von ${questions.length}`),el('span','Deine Wünsche'));
    const dots=el('div',null,'lp-quiz-dots');dots.setAttribute('aria-hidden','true');for(let i=0;i<questions.length;i++)dots.append(el('i',null,i<=step?'done':''));
    host.append(meta,dots,el('h3',q.title),el('p',q.note));const form=el('form'),group=el('fieldset');const legend=el('legend',q.title,'lp-sr-only');group.append(legend);
    const next=el('button',step===4?'Meine Ziele entdecken':'Weiter','btn');next.type='submit';next.disabled=!answers[q.key];
    for(const [value,label,description] of q.choices){const l=el('label',null,'lp-choice'),input=el('input');input.type='radio';input.name='goalPreference';input.value=value;input.required=true;input.checked=answers[q.key]===value;input.onchange=()=>{answers[q.key]=value;next.disabled=false;};const text=el('span',label);text.append(el('small',description));l.append(input,text);group.append(l);}
    const actions=el('div',null,'lp-quiz-actions');actions.append(button('Zurück',()=>{if(step>0)step--;else view='intro';draw();focusTitle();},'linkbtn'),next);form.append(group,actions);form.onsubmit=e=>{e.preventDefault();if(!answers[q.key])return;if(step<4)step++;else view='results';draw();focusTitle();};host.append(form);return;
   }
   const all=view==='all',ranked=rank(options,all?{}:answers),matching=all?ranked:ranked.filter(x=>areaMatches(x.goal,answers.area));
   host.append(el('span',all?'Freigegebene Ziele':'Deine Auswahl','eyebrow'),el('h3',all?'Welcher Weg ist deiner?':matching.length?'Diese Ziele passen zu deinen Wünschen.':'Für deinen Wunschbereich ist noch kein Ziel freigegeben.'));
   if(!all)host.append(el('p','Die Auswahl richtet sich nach deinen Antworten. Welche Behandlung und welche Terminabstände zu dir passen, klärt ihr im Studio.'));
   const form=el('form'),group=el('fieldset');group.append(el('legend','Wähle dein Ziel'));
   for(const {goal:v,reasons} of (all?ranked:matching.slice(0,3))){const label=el('label',null,'lp-goal-result'),input=el('input');input.type='radio';input.name='clubMission';input.value=v.id;input.required=true;
    const content=el('span');content.append(el('small',`${v.anzahl} Behandlungstage`,'lp-result-count'),el('strong',v.titel));if(!all&&reasons.length)content.append(el('small',reasons.join(' · ')));content.append(el('span',`Dein Geschenk: ${v.belohnung}`,'lp-result-gift'));label.append(input,content);group.append(label);}
   if(group.querySelector('input')){const start=el('button','Dieses Ziel starten','btn');start.type='submit';form.append(group,start);form.onsubmit=e=>{e.preventDefault();const id=new FormData(form).get('clubMission');if(id)onChoose(start,id);};host.append(form);}
   const actions=el('div',null,'lp-quiz-actions');actions.append(button('Antworten ändern',()=>{step=0;show('questions');},'linkbtn'));if(!all)actions.append(button('Alle Ziele ansehen',()=>show('all'),'linkbtn'));host.append(actions);
  }
  draw();
 }
 window.LaPerleGoalPicker={mount,rank};
})();
