# Fixed operating requirements

- `laperle_mail` runs every **10 seconds** (`10 seconds` in pg_cron).
- This is the owner's explicit permanent preference. Do not reset it during installation, deployment, restoration, or unrelated changes. Change it only after a new explicit owner instruction.
- Reapply `release/mail-dispatch-interval.sql` after restoring or reinstalling scheduled jobs. Verify the existing job is present, active and scheduled as `10 seconds`.
- `scripts/check-mail-interval.py` checks the canonical setting and installer SQL. GitHub Actions runs the check on pushes and pull requests. This detects source regressions; it does not prevent an administrator changing the database directly.
- Keep existing dispatch quotas, consent checks, duplicate protection and response reconciliation intact.

- Current participation policy: adults aged 18 or over only. Registration and explicit terms acceptance must reject the former guardian/minor selection. Apply `privacy-adults-only.sql` after the initial privacy migrations; terms version 2026-09-19.4 is current. Older versioned legal documents are retained only as historical evidence.
