"""Apply a manifest of checked, nonoverlapping byte edits to a public Pages build."""
import hashlib
import json
from pathlib import Path
import sys

root = Path(sys.argv[1]).resolve()
release = json.loads(Path(sys.argv[2]).read_text(encoding='utf-8'))

def digest(data):
    return hashlib.sha256(data).hexdigest()

def within(site_path):
    path = (root / site_path).resolve()
    if not path.is_relative_to(root) or path == root:
        raise ValueError(f'Invalid public asset: {site_path}')
    return path

if digest(within('index.html').read_bytes()) != release['whenIndex']:
    print('Skipped delta for a different index revision.')
    sys.exit(0)

outputs = []
for item in release['files']:
    data = within(item['source']).read_bytes()
    if digest(data) != item['before']:
        raise ValueError(f"Unexpected original content: {item['source']}")
    result = bytearray()
    previous = 0
    for start, stop, text in item['edits']:
        if not previous <= start <= stop <= len(data):
            raise ValueError('Invalid edit range')
        result.extend(data[previous:start])
        result.extend(text.encode('utf-8'))
        previous = stop
    result.extend(data[previous:])
    if digest(result) != item['after']:
        raise ValueError(f"Unexpected final content: {item['target']}")
    outputs.append((within(item['target']), result))
for path, data in outputs:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
print(f'Verified {len(outputs)} public assets.')
