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
