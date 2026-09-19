# Automatic Wallet updates — 2026-09-18

Implemented in TEST xzxplhvkabgfyglmkcii only. Production is unchanged.

## Flow

Points ledger inserts (including reward spending), reward/rank rules and customer name/link changes mark existing passes for update. A minutely pg_cron job calls authenticated Google and Apple workers via pg_net. It skips disabled platforms and the disabled wallet feature. The scheduler secret lives in Vault; only service_role can validate it. Configure `wallet_edge_basis_url` to the chosen project's HTTPS functions/v1 root on future deployment. Never copy the TEST URL into production settings.

Google uses its existing lease/version queue and PATCH API, including current holder names and approved rank artwork; the background belongs to the Google class. Apple's passes now include the webServiceURL and separate stable authenticationToken. Wallet registers each device/pass pair; the worker sends an empty APNs notification using the existing pass-signing certificate over mutual TLS / HTTP2. Devices request changed serial numbers and download freshly signed passes. No customer points or link tokens are transmitted in APNs payloads.

## API

- POST /wallet-apple/pass — existing customer-link authenticated issuance.
- POST/DELETE /wallet-apple/v1/devices/{device}/registrations/{type}/{serial} — ApplePass authentication, idempotent registration/removal.
- GET /wallet-apple/v1/devices/{device}/registrations/{type}?passesUpdatedSince={tag} — registered device scope only; 204 if unchanged.
- GET /wallet-apple/v1/passes/{type}/{serial} — ApplePass authentication; signed latest pass and Last-Modified. Same-second timestamps deliberately return 200 to avoid missed changes.
- POST /wallet-apple/v1/log — acknowledges without recording potentially sensitive device logs.
- POST /wallet-apple/sync — scheduler-secret authenticated worker.
- POST /wallet-apple/check — scheduler-secret authenticated APNs certificate probe with an all-zero invalid device token. No customer notification.

Version/lease receipts retain changes made while a push is in flight. Transient delivery failures back off. APNs Unregistered/BadDeviceToken removes only the matching device/token registrations; a refreshed token is protected. DeviceTokenNotForTopic is retained as a configuration failure. Global wallet mutation locking keeps update sequence order consistent across commits.

## Verification

- Local PostgreSQL-compatible test: registrations, duplicate registration, bad tokens, device isolation, update tags, live balances, exclusive claims, booking during an in-flight update, token refresh/cleanup, unregistration, activation gates, restricted RPC/table access.
- Same SQL assertions passed on live TEST in a rolled-back transaction; no synthetic customer persisted.
- Apple HTTP protocol tests: authentication, status codes, invalid cursors, conditional fetching, failed pushes, invalid device cleanup.
- Google worker regression tests passed.
- PKPass tests use ephemeral signing keys, inspect update metadata and verify CMS signature independently with OpenSSL.
- Live APNs probe returned HTTP 400 BadDeviceToken with the all-zero token: certificate-authenticated transport is working; this is not proof of device delivery.
- Security advisors reviewed: new registrations table is intentionally service-only, with RLS and no public policies; new privileged RPCs are not callable by anon/authenticated. Existing broader-project warnings were not changed.
- Deno local typecheck could not fetch npm registry packages due to environment network restrictions. Hosted deployment and live APNs check succeeded.

## Remaining device acceptance test

The platform issuance switches remain OFF. The reachable TEST club URL is configured. Enable TEST issuance for the controlled iPhone/Android acceptance test as documented in ../wallet/FINALISIERUNG.md. Existing Apple passes issued without webServiceURL must be downloaded and added once again to enrol for automatic updates. On iPhone, enable automatic updates in Wallet pass settings. Verify points, spending, rank/color changes and removal/reinstallation. APNs delivery and Wallet refresh are controlled by Apple and may be delayed; minutely polling is not a one-minute delivery guarantee.
