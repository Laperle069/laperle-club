#!/usr/bin/env python3
"""Build the production candidate without publishing or touching either database."""
import argparse, pathlib, shutil, re, json, hashlib, urllib.request
p=argparse.ArgumentParser();p.add_argument('--source',required=True);p.add_argument('--output',required=True);p.add_argument('--public-key',required=True);a=p.parse_args()
if not a.public_key.startswith('sb_publishable_'):p.error('A publishable key is required')
src=pathlib.Path(a.source);out=pathlib.Path(a.output)
if out.exists():p.error('Output already exists; preserve previous releases')
base='/laperle-club';out.mkdir(parents=True)
for area in ('club','backend','terminal'):shutil.copytree(src/area,out/area)
assets=out/'club/assets/vendor';assets.mkdir(parents=True,exist_ok=True)
manifest=[]
def download(url,target):
 request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
 with urllib.request.urlopen(request,timeout=30) as response: data=response.read()
 target.write_bytes(data);manifest.append({'url':url,'file':str(target.relative_to(out)),'sha256':hashlib.sha256(data).hexdigest()});return data
# Versions are pinned, and only static vendor assets are fetched.
download('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.4/dist/umd/supabase.js',assets/'supabase-2.57.4.js')
download('https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',assets/'jsQR-1.4.0.js')
css=download('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@400;500&display=swap',assets/'fonts.css').decode()
for i,url in enumerate(dict.fromkeys(re.findall(r'url\((https://[^)]+)\)',css))):
 filename='font-'+str(i)+pathlib.PurePosixPath(urllib.parse.urlparse(url).path).suffix
 download(url,assets/filename);css=css.replace(url,filename)
(assets/'fonts.css').write_text(css)
for f in out.rglob('*'):
 if f.suffix not in ('.html','.js') or 'vendor' in f.parts:continue
 s=f.read_text()
 s=s.replace('https://xzxplhvkabgfyglmkcii.supabase.co','https://byiocfdghgbxxdcmaqoh.supabase.co')
 s=re.sub(r'const SUPABASE_ANON_KEY = "[^"]+";',f'const SUPABASE_ANON_KEY = "{a.public_key}";',s)
 s=s.replace('const STUDIO = "TEST-01";','const STUDIO = "FFM-01";')
 s=s.replace('window.LP_TESTBETRIEB = true;','window.LP_TESTBETRIEB = false;')
 s=re.sub(r'<aside class="test-hinweis".*?</aside>','',s,flags=re.S)
 s=re.sub(r'<link[^>]+href="https://fonts\.googleapis\.com/css2[^>]+>',f'<link rel="stylesheet" href="{base}/club/assets/vendor/fonts.css">',s)
 s=re.sub(r'<link[^>]+href="https://fonts\.(?:googleapis|gstatic)\.com"[^>]*>','',s)
 s=re.sub(r'https://cdn\.jsdelivr\.net/npm/@supabase/supabase-js@[^"<]+',f'{base}/club/assets/vendor/supabase-2.57.4.js',s)
 s=re.sub(r'https://cdn\.jsdelivr\.net/npm/jsqr[^"<]+',f'{base}/club/assets/vendor/jsQR-1.4.0.js',s,flags=re.I)
 s=re.sub(r'(["\'])/(club|backend|terminal)/',r'\1'+base+r'/\2/',s)
 f.write_text(s)
# Old personal links at the repository root preserve their tokens and anchors.
(out/'index.html').write_text('''<!doctype html><html lang="de"><meta charset="utf-8"><meta name="referrer" content="no-referrer"><title>La Perlé Club</title><script>location.replace('./club/'+location.search+location.hash);</script><a href="./club/">Zum Club</a></html>''')
(out/'.nojekyll').write_text('')
(out/'robots.txt').write_text('User-agent: *\nDisallow: /\n')
(out/'asset-provenance.json').write_text(json.dumps(manifest,indent=2))
print('Customer release prepared:',out)
