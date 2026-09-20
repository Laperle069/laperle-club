// Native SVG design: immutable exports; retain Wallet's own text and barcode layout.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require(process.env.SHARP_MODULE||'/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve(__dirname,'..'),out=path.join(root,'assets/wallet/refined-metallic-v4');
const palette={
 bronze:{name:'Bronze',base:'#78533F',shade:'#503A30',light:'#78533F',ink:'#FFF0DA'},
 silber:{name:'Silber',base:'#C4CBD1',shade:'#9CA8B2',light:'#EDF1F4',ink:'#24252A'},
 gold:{name:'Gold',base:'#C8AC74',shade:'#A88C56',light:'#E8D5A8',ink:'#322519'},
 platin:{name:'Platin',base:'#D0D0C9',shade:'#AAAFA9',light:'#F1F1E9',ink:'#30312F'},
 diamant:{name:'Diamant',base:'#D1E2EC',shade:'#A5BDC9',light:'#F5FBFF',ink:'#203342'}
};
function artwork(rank,w,h){const p=palette[rank];return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 1000 328" preserveAspectRatio="none"><defs>
 <linearGradient id="metal" x1="0" y1=".2" x2="1" y2=".8"><stop stop-color="${p.shade}"/><stop offset=".34" stop-color="${p.base}"/><stop offset=".52" stop-color="${p.light}"/><stop offset=".73" stop-color="${p.base}"/><stop offset="1" stop-color="${p.shade}"/></linearGradient>
 <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${p.base}"/><stop offset=".22" stop-color="${p.base}" stop-opacity="0"/><stop offset=".78" stop-color="${p.base}" stop-opacity="0"/><stop offset="1" stop-color="${p.base}"/></linearGradient>
 <pattern id="brush" width="1000" height="3" patternUnits="userSpaceOnUse"><path d="M0 0H1000" stroke="white" stroke-opacity=".035" stroke-width=".5"/><path d="M0 1.5H1000" stroke="black" stroke-opacity=".025" stroke-width=".4"/></pattern>
 </defs><path fill="url(#metal)" d="M0 0H1000V328H0Z"/><path fill="url(#brush)" d="M0 0H1000V328H0Z"/>
 <g opacity="${rank==='bronze'?'.45':'1'}">${rank==='diamant'?'<path d="M760 0L920 50 710 190Z" fill="white" opacity=".12"/><path d="M920 50L1000 210 710 190Z" fill="white" opacity=".055"/><path d="M710 190L1000 210 820 328Z" fill="black" opacity=".05"/><path d="M760 0L920 50 710 190 820 328M710 190L1000 210" fill="none" stroke="white" opacity=".17" stroke-width="1"/>':`<path d="M850 0H965L680 328H565Z" fill="white" opacity=".065"/><path d="M1000 55V170L850 328H735Z" fill="black" opacity=".025"/>${[750,825,940,1050].map(x=>`<path d="M${x} 0L${x-290} 328" stroke="white" opacity=".11" stroke-width=".7"/>`).join('')}`}</g>
 <path fill="url(#edge)" d="M0 0H1000V328H0Z"/></svg>`;}
const original=fs.readFileSync(path.join(out,'source/original-logo.svg'),'utf8');
function vector(ink,box,strong=false){return original.replace('viewBox="0 0 1080 872.57"',`viewBox="${box}"`).replace('.st0{fill:#b49153}',`.st0{fill:${ink}${strong?`;stroke:${ink};stroke-width:3;stroke-linejoin:round`:''}}`);}
const uri=s=>'data:image/svg+xml;base64,'+Buffer.from(s).toString('base64');
function logo(p){return `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="50" viewBox="0 0 160 50"><image href="${uri(vector(p.ink,'240 110 600 235'))}" x="0" y="5" width="100" height="40"/><image href="${uri(vector(p.ink,'350 350 380 235',true))}" x="105" y="5" width="55" height="40"/></svg>`;}
const manifest=[],embedded={};
async function png(file,svg,w,h){const b=await sharp(Buffer.from(svg)).resize(w,h).png({palette:true,colours:256,effort:10}).toBuffer();fs.mkdirSync(path.dirname(path.join(out,file)),{recursive:true});fs.writeFileSync(path.join(out,file),b);manifest.push({file,width:w,height:h,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')});if(file.startsWith('apple/'))embedded[file.slice(6)]=b.toString('base64');}
(async()=>{let rows=[];for(const [rank,p] of Object.entries(palette)){
 const svg=artwork(rank,1125,369);fs.writeFileSync(path.join(out,`source/${rank}.svg`),svg);
 for(let i=1;i<=3;i++){const s=i===1?'':`@${i}x`;await png(`apple/${rank}/strip${s}.png`,svg,375*i,123*i);await png(`apple/${rank}/logo${s}.png`,logo(p),160*i,50*i);}
 await png(`google/${rank}/hero.png`,artwork(rank,1032,812),1032,812);
 rows.push(`<g transform="translate(0,${rows.length*200})"><rect width="900" height="190" rx="12" fill="${p.base}"/><image href="${uri(artwork(rank,900,130))}" y="35" width="900" height="130"/><image href="${uri(logo(p))}" x="20" y="55" width="240" height="75"/><text x="855" y="112" text-anchor="end" font-family="sans-serif" font-size="28" fill="${p.ink}">${p.name}</text></g>`);
 }
 // Existing approved icons stay byte-for-byte unchanged and are bundled too.
 for(const suffix of ['', '@2x', '@3x']) {
  const file=`apple/icon${suffix}.png`,b=fs.readFileSync(path.join(out,file)),meta=await sharp(b).metadata();
  manifest.push({file,width:meta.width,height:meta.height,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')});
  embedded[file.slice(6)]=b.toString('base64');
 }
 fs.writeFileSync(path.join(root,'wallet-apple/refined-artwork.ts'),'// Generated by scripts/export-refined-wallet.cjs from native SVG sources.\nexport const refinedAssets:Record<string,string> = '+JSON.stringify(embedded)+';\n');
 fs.writeFileSync(path.join(out,'palette.json'),JSON.stringify(palette,null,2));fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({design:'refined-metallic-v4',files:manifest},null,2));
 await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1000">${rows.join('')}</svg>`)).png().toFile('/tmp/wallet-refined-preview.png');
 console.log('Exported',manifest.length,'native PNG assets; Apple bundle',fs.statSync(path.join(root,'wallet-apple/refined-artwork.ts')).size,'bytes');
})().catch(e=>{console.error(e);process.exitCode=1});
