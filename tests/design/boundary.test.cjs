const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const cp=require('node:child_process');const path=require('node:path');
const root=path.resolve(__dirname,'../..');
const base='6ac9a6e';
for(const file of ['club/index.html','terminal/index.html'])test(file+': protected application and contracts remain identical',()=>{
 const before=cp.execFileSync('git',['show',base+':'+file],{cwd:root,encoding:'utf8',maxBuffer:5e6});let after=fs.readFileSync(path.join(root,file),'utf8');
 // Explicitly authorized additions: one post-render hook and the exact treatment category.
 after=after.replace('  queueMicrotask(() => window.LaPerleClub?.render(d));\n','').replace('<option value="laser_intim">Laser · Intim</option>','');
 const blocks=(s,re)=>[...s.matchAll(re)].map(m=>m[1]);
 assert.deepEqual(blocks(after,/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g).filter(Boolean),blocks(before,/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g).filter(Boolean),'every inline application script is byte-for-byte unchanged');
 assert.deepEqual(blocks(after,/<style[^>]*>([\s\S]*?)<\/style>/g),blocks(before,/<style[^>]*>([\s\S]*?)<\/style>/g),'shared original CSS is unchanged');
 assert.deepEqual(blocks(after,/\bid="([^"]+)"/g),blocks(before,/\bid="([^"]+)"/g),'all IDs and their order are preserved');
 assert.deepEqual(blocks(after,/(<(?:input|select|option|textarea)\b[^>]*>)/g),blocks(before,/(<(?:input|select|option|textarea)\b[^>]*>)/g),'field attributes are unchanged');
});
test('presentation scripts have no data transport, storage or event cancellation',()=>{
 for(const file of ['relaunch.js','pearl-webgl.js']){const s=fs.readFileSync(path.join(root,'design',file),'utf8');assert.doesNotMatch(s,/\b(?:fetch|XMLHttpRequest|WebSocket|localStorage|sessionStorage|supabase|preventDefault|stopPropagation)\s*[.(]/);}
});
