"""Read-only verification of every approved production Wallet image."""
import concurrent.futures
import hashlib
import json
from pathlib import Path
import urllib.request

manifest = json.loads((Path(__file__).resolve().parents[1] / 'release/wallet-artwork-manifest.json').read_text())

def verify(entry):
    url = manifest['productionBaseUrl'] + entry['file']
    with urllib.request.urlopen(url, timeout=30) as response:
        if response.headers.get_content_type() != 'image/png':
            raise ValueError('Unexpected content type: ' + entry['file'])
        data = response.read(3_000_001)
    if len(data) != entry['bytes'] or hashlib.sha256(data).hexdigest() != entry['sha256']:
        raise ValueError('Image differs from approved artwork: ' + entry['file'])
    return entry['file']

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    files = list(pool.map(verify, manifest['files']))
print(json.dumps({'verified': len(files), 'baseUrl': manifest['productionBaseUrl'], 'allHashesMatch': True}))
