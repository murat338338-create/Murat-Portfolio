# Mobile layout & positioning audit

Written against: c81aad9

## Design language
- Audited surface: home page (`Portfolio.dc.html`, served at muratkurul.com/) and the AERØ case study (`AERO.dc.html`), at a 375×812 phone viewport and at desktop width.
- Design sources: no DESIGN.md existed at audit time. Runtime source is the inline styles in each `.dc.html` page plus the `<helmet><style>` block; the owner's current portfolio PDF and CV (Oct 2026) define positioning and copy.
- Documented decisions: dark ground `#0B0B0C`, warm off-white text `#E8E4DA`; Archivo (display/body), JetBrains Mono (labels), Instrument Serif (quote). Uppercase display type with tight negative tracking.
- Governing owners and consumers: every layout is an inline `style` attribute on the element itself; there is no stylesheet that can respond to viewport width.
- Explicit exceptions: None documented

## Findings
| # | Problem | Evidence | Proposed change | Scope | Confidence |
| --- | --- | --- | --- | --- | --- |
| 1 | Two-column layouts never stack on phones. Project text is squeezed into a ~117px column and the About copy is pushed past the right edge and clipped. | At 375px: `article` grids resolve to `116.9px 146.1px`; About grid `102px 153px`; three About text blocks end at x=410 on a 375px viewport (clipped by `overflow-x:hidden`). AERØ page has five more multi-column grids (39px/52px columns). Inline styles cannot carry media queries. | Move layout into a stylesheet and collapse every two-column grid to one column below ~760px. | All pages | High |
| 2 | Header name and nav collide on phones ("MURAT KURULWORK"). | Rendered 375px header: name and first nav link touch with no gap; header is `justify-content:space-between` with no `gap` and no wrap. | Give the header a gap and shorten the phone nav. | All pages | High |
| 3 | Site positioning contradicts the owner's current portfolio and CV. | Site: "Industrial & product design", "Multidisciplinary designer", 3 projects. Portfolio PDF p.1/p.3 and CV: "Apparel & Product Design", projects AERØ, Liman, Night Court, Anatude, dissertation, Contex Textile. | Rewrite hero, work list and About to match the portfolio PDF. Owner decision (Oct 2026): keep the “Multidisciplinary designer” headline; the work list, case studies and About follow the PDF. | Home + case studies | High |

## Improve first
Finding 1: it breaks reading on every page at phone width and has a single root cause, inline-only layout.

## Related observation (performance, requested by owner)
The hero carousel calls React `setState` on every animation frame, re-rendering the whole single-component page ~60×/s; on phones this competes with scrolling. The ring should be rotated by writing one `transform` directly, outside the render loop.
