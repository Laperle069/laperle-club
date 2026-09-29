/* Original analytical sphere shader. No geometry library, textures, requests or business data. */
(() => {
 'use strict';
 const vertex=`attribute vec2 position;varying vec2 uv;void main(){uv=position;gl_Position=vec4(position,0.,1.);}`;
 const fragment=`precision mediump float;
 varying vec2 uv;uniform vec2 light;uniform float tier;uniform float time;
 void main(){
  vec2 p=uv*1.28;float rr=dot(p,p);if(rr>1.){gl_FragColor=vec4(0.);return;}
  float z=sqrt(max(0.,1.-rr));vec3 normal=normalize(vec3(p,z));
  float lat=atan(normal.y,normal.x);float bands=sin(lat*9.+z*19.+time*.08)*.007;
  normal=normalize(normal+vec3(bands,sin(z*70.)*.006,bands));
  if(tier>3.5){normal=normalize(floor(normal*9.+.5)/9.);}
  vec3 lamp=normalize(vec3(-.65+light.x*.32,.8+light.y*.32,1.7));
  float diffuse=max(dot(normal,lamp),0.);vec3 halfV=normalize(lamp+vec3(0.,0.,1.));
  float spec=pow(max(dot(normal,halfV),0.),tier>3.5?110.:45.);
  float fres=pow(1.-z,2.1);
  vec3 pearl=vec3(.965,.914,.875);vec3 gold=vec3(.875,.745,.584);vec3 clay=vec3(.776,.671,.659);
  vec3 base=mix(pearl,gold,tier<.5?.46:tier<1.5?.08:tier<2.5?.5:.07);
  float nacre=sin((1.-z)*23.+normal.y*3.+light.x)*.5+.5;
  vec3 material=mix(base,mix(clay,pearl,nacre),.25);
  vec3 color=material*(.44+.58*diffuse)+vec3(1.,.987,.976)*spec*.48;
  color=mix(color,clay,fres*.3);color+=vec3(.09,.065,.045)*pow(max(normal.y,0.),2.);
  float edge=1.-smoothstep(.985,1.,rr);gl_FragColor=vec4(color,edge);
 }`;
 const tiers={bronze:0,silber:1,gold:2,platin:3,diamant:4};
 function mount(root){
  const canvas=root.querySelector('canvas');if(!canvas)return null;
  let gl;try{gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,depth:false,powerPreference:'low-power'});}catch(_){return null;}
  if(!gl)return null;
  const shaders=[];let program,buffer;
  function compile(type,source){const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error('Shader unavailable');return s;}
  try{program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Program unavailable');gl.useProgram(program);
   buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
   const loc=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  }catch(_){shaders.forEach(s=>gl.deleteShader(s));if(program)gl.deleteProgram(program);return null;}
  const uLight=gl.getUniformLocation(program,'light'),uTier=gl.getUniformLocation(program,'tier'),uTime=gl.getUniformLocation(program,'time');
  let raf=0,until=0,visible=false,dead=false,x=0,y=0,targetX=0,targetY=0;
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  function resize(){const box=root.getBoundingClientRect();if(!box.width||!box.height)return;const dpr=Math.min(2,devicePixelRatio||1),w=Math.round(box.width*dpr),h=Math.round(box.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}}
  function draw(now){raf=0;if(dead||!visible||document.hidden||media.matches)return;
   resize();x+=(targetX-x)*.14;y+=(targetY-y)*.14;gl.useProgram(program);gl.uniform2f(uLight,x,y);gl.uniform1f(uTier,tiers[root.dataset.rank]??0);gl.uniform1f(uTime,now/1000);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLES,0,6);root.classList.add('lp-webgl');
   if(now<until)raf=requestAnimationFrame(draw);
  }
  function invalidate(){if(dead||!visible||document.hidden||media.matches)return;until=performance.now()+900;if(!raf)raf=requestAnimationFrame(draw);}
  function pause(){cancelAnimationFrame(raf);raf=0;}
  const host=root.parentElement;
  function pointer(e){const b=host.getBoundingClientRect();targetX=Math.max(-1,Math.min(1,(e.clientX-b.left)/b.width*2-1));targetY=1-Math.max(0,Math.min(2,(e.clientY-b.top)/b.height*2));invalidate();}
  function leave(){targetX=targetY=0;invalidate();}
  function scroll(){if(!visible)return;targetY=Math.max(-1,Math.min(1,root.getBoundingClientRect().top/innerHeight));invalidate();}
  const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)invalidate();else pause();});io.observe(root);
  const ro=typeof ResizeObserver==='function'?new ResizeObserver(invalidate):null;ro?.observe(root);
  host.addEventListener('pointermove',pointer,{passive:true});host.addEventListener('pointerleave',leave,{passive:true});window.addEventListener('scroll',scroll,{passive:true});
  function lost(){pause();root.classList.remove('lp-webgl');dead=true;}
  canvas.addEventListener('webglcontextlost',lost);
  function destroy(){pause();dead=true;io.disconnect();ro?.disconnect();host.removeEventListener('pointermove',pointer);host.removeEventListener('pointerleave',leave);window.removeEventListener('scroll',scroll);canvas.removeEventListener('webglcontextlost',lost);root.classList.remove('lp-webgl');gl.deleteBuffer(buffer);gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));}
  return {invalidate,pause,destroy};
 }
 window.LaPerlePearl={mount};
})();
