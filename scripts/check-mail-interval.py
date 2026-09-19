"""Protect the owner's fixed ten-second mail dispatch requirement."""
from pathlib import Path
import re
ROOT = Path(__file__).resolve().parents[1]
canonical = (ROOT / 'release/mail-dispatch-interval.sql').read_text()
assert "schedule := '10 seconds'" in canonical, 'Mail dispatch must remain at 10 seconds'
violations = []
for path in ROOT.rglob('*.sql'):
    if '.git' in path.parts or 'node_modules' in path.parts:
        continue
    sql = path.read_text()
    for match in re.finditer(r"cron\.schedule\(\s*'laperle_mail'\s*,\s*'([^']+)'", sql, re.I):
        if match[1] != '10 seconds':
            violations.append(str(path.relative_to(ROOT)))
assert not violations, 'Conflicting mail schedules: ' + ', '.join(violations)
print('PASS: mail dispatch remains fixed at 10 seconds')
