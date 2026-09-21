# Club corrections QA — 2026-09-20

- Browser: 360, 390, 768, 1024, 1280 px frames, document scrollWidth equals clientWidth at every width. Scrollbars account for 15 px.
- Light and dark mode visually inspected; no overlapping hero/necklace/content. Theme setting is persisted locally.
- Nine configured rewards rendered; five available and four disabled for synthetic balance 1280. Available reward opens its details without redemption.
- Five configured ranks and 720 remaining rank pearls to Platin verified.
- Browser goal path: choose five intimate-laser visits, start, simulate five distinct days, reach completion, completed goal no longer selectable.
- Browser confirmed opening animations: shutters lp-open-left/right 1.45 s; lp-gift-rise 1.75 s. No result animation before RPC success.
- Four JSDOM interaction tests pass: rewards/theme/rank/reviews, goal completion, optional product image/text fallback, reduced-motion behavior. Demo controls stay expanded between simulated visits.
- Three source-boundary tests pass with only the two explicitly permitted source changes normalized.
- Static validation passes for six Site entrypoints, eleven inline scripts, references and TEST isolation.
- Database transactional tests pass: exact category, distinct treatment days, duplicate suppression, one reward, no restart of completed template, full correction and restoration of the same pending reward, invalid token rejection, denied direct table/refresh access. All synthetic records rolled back.
- Supabase advisors: no findings relating to the new mission tables/functions after explicit deny-all policies. This is not a claim that historic project warnings were resolved.

Limits: no live production transactions; no actual customer records used; no active goal templates deployed to production. Real goal rewards must be configured and enabled by the studio. Public review links open profiles, not verified direct review composers. Product image preview uses an in-memory object URL and uploads nothing. No device GPU/performance metrics claimed. Existing draft PR remains unmerged.

## Connected TEST integration — 2026-09-21

The existing authenticated TEST Club now uses the reviewed presentation assets and post-render interaction hook; its original registration, session, consent and Wallet handlers are preserved. The standalone no-login design preview remains isolated.

- New `tests/sql/club-mission-journey.sql` passes against TEST: actual public login RPC with transaction-local synthetic staff; admin draft and activation; customer selection; final category-matched booking through `punkte_buchen`; duplicate replay; identical reward visible in both `kunde_laden.gewinne` and `kundin_laden.offene_einloesungen`; configured 30-day expiry; staff authorization and logout. All fixture rows and changes roll back.
- Treatment missions now own their section independently of personal-note loading. A failure/disabled state in `kunde_ziel` cannot hide the mission, and its heading cannot be overwritten by a slower response.
- The new theme controller also updates the established registration/postbox theme controls, using the same device-local preference.
- Five focused interaction tests, the existing 24 UI regression tests and static validation pass. The connected-page interaction test uses the actual shipped HTML and its complete inline application.
- Additional browser QA of the connected local fixture route was blocked by the browser runtime (`ERR_BLOCKED_BY_CLIENT`); no claim of a new visual pass for that route. The previous responsive visual checks remain documented above. No production schema, customer data, source main branch or goal offers activated.
