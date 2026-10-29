---
version: 1
name: Murat Kurul Portfolio — Harbour theme
description: The home page of muratkurul.com (index.html, home.css, home.js, assets/home/). An arc of work rises over dusk on the bay of İzmir, then the full portfolio follows on warm paper. Case-study pages keep the dark theme in DESIGN.md.
colors:
  paper: "#F4EFE6"
  paper-2: "#ECE5D8"
  paper-3: "#E2D9C9"
  ink: "#1B1F2C"
  ink-2: "#444858"
  ink-3: "#62656F"
  line: "rgba(27,31,44,0.14)"
  line-2: "rgba(27,31,44,0.28)"
  accent: "#B04E2C"
  dusk-blue: "#9DB3DF"
  dusk-lilac: "#CDBFE0"
  dusk-peach: "#F2B79A"
typography:
  display:
    fontFamily: Instrument Serif
    lineHeight: 0.92
    letterSpacing: -0.025em
  text:
    fontFamily: Instrument Sans
    fontSize: 17px
    lineHeight: 1.55
  small:
    fontFamily: Instrument Sans
    fontSize: 14px
    letterSpacing: 0.005em
  micro:
    fontFamily: Instrument Sans
    fontSize: 12.5px
    letterSpacing: 0.02em
rounded:
  sm: 6px
  md: 12px
  pill: 999px
motion:
  spring-default: { damping: 1.0, response: 0.4 }
  spring-momentum: { damping: 0.82, response: 0.5 }
  spring-launch: { damping: 0.72, response: 0.6 }
  press: 100ms
  ui: 220ms
  reveal: 700ms
---

# Harbour theme

## Idea

Liman, Murat's label, means harbour, named for childhood summers in İzmir. The home page opens on dusk over the bay of İzmir: project cards shoot up out of the water one by one and settle into an arch on the horizon. Below it the full portfolio continues on warm paper, as if the evening light carried down the page.

## Colour

One warm paper family and one ink family; no second grey family. `accent` is a desaturated İzmir terracotta taken from the sky photograph and Liman's palette. It marks only the things that act or count: links on hover, project numbers, the availability dot. The dusk tones appear only in the hero photograph and in the concept imagery, never as UI fills. No section switches to a dark background.

## Type

Instrument Serif and Instrument Sans are drawn as a pair. Serif carries every display role (name, project titles, statements, the email); Sans carries reading text and interface. Tracking tightens as size grows (display −0.025em, body 0, micro +0.02em) and leading loosens as size falls. Labels are sentence case in `ink-3`, never all-caps monospace. Numbers use tabular figures.

## Motion

Springs, not fixed durations, for anything the visitor can touch (Apple's damping/response model). The entrance uses an under-damped launch spring because the cards are thrown; everything the visitor drags settles with momentum projection to the nearest card and a velocity hand-off. Scroll reveals use the `reveal` ease-out. Reduced motion swaps every movement for a short cross-fade and stops the idle spin.

## Structure and dividers

The page reads as numbered chapters (Selected work, Research and industry, Digital, More work, Next, About, Contact). A **chapter** opens with a full-width `ink` rule, a label row (accent chapter number, scope on the right) and the title at hero size. Inside a chapter, every project or item opens with a **ledger** row on a `line-2` rule: accent number, name, role and length, year. Number, title, role and year are always visible without hovering. "Next" sits on a full-bleed `paper-2` band so concepts never read as finished work. Product images that sell the object (the Fresha scanner) are shown uncropped, with nothing overlaid on the product.

## Signature interactions

Researched from Awwwards and Muzli portfolio picks (Luca Nardi's typographic index, Robin Noguier's progress rail, scroll-reactive images and per-project colour), adapted to this theme:

- **Index**: the six projects as hero-size serif rows on hairlines. Pointing at a row dims the rest, slides it in italic, and a thumbnail follows the pointer on critically damped springs. Mouse only; on touch it is a plain list.
- **Floating pill**: past the sky the header detaches into a centred paper-glass pill. Bar and pill swap behind a 160ms fade so layout never animates.
- **Rail**: while Selected work is on screen, a tick rail in the right margin marks the current project (number / 06); hovering a tick names it. Hidden under 1240px so it never covers copy.
- **Project tint**: `--bg` washes the page in the current project's tone (stone, sage, terracotta, sky, lilac, glacier) and returns to paper outside Selected work.
- **Media**: project pictures open with a curtain (clip-path) and settle from 1.14 scale; while scrolling they skew up to ±3.2° with scroll speed and spring back.
- **View label**: over anything that opens a project (project pictures and the arc's cards), an 80px ink disc (56px and ring-less over the arc's small cards) grows out of the mouse pointer on a slightly springy reveal. It carries the project's name in Instrument Serif italic, an arrow in the project's tone, a hairline ring in that tone, and "View case study" set around the edge. The ring turns with how far the pointer travels and eases to a stop; it never spins on its own. Pressing shrinks it to 0.88. It steps aside while the arc is dragged. On touch screens, and for anyone with reduced motion, a frosted "View *Project* ↗" tag sits on the picture instead. Mouse versus touch is decided by the input actually used, not once at load.
- **Signature**: the page ends on the name set across the full width, cropped on its baseline, with live London time in the footer.

All of it is off under reduced motion except the colour tint, which changes without a transition.

## Blur

Taken from the shovel.studio reference (frosted pills over photos, blur crossfades, photos melting into blur at their edges). Blur is used only where it does a job, and never animated on a large surface:

- **Edge blur**: while the floating pill shows, a progressive blur (four masked `backdrop-filter` bands, 1 → 14px) softens content as it reaches the top edge, instead of a hard cut under the pill.
- **Haze**: scrolling out of the hero cross-fades the sky into a pre-blurred copy of itself. Only opacity animates.
- **Focus-in**: chapter and project titles sharpen from a 10px blur as they arrive; the index thumbnail blur-crossfades between projects.
- **Frosted labels**: "Concept in progress" sits on every concept image; on touch screens, project pictures carry a "View Project →" pill because there is no cursor label.

Frosted surfaces use one recipe: 16px blur, 72% paper fill, inset highlight. Under `prefers-reduced-transparency` they turn solid and the edge blur becomes a plain paper fade.

## Case studies

Each project page (aero/, fresha/, liman/, postura/, night-court/) and the privacy page load home.css then case.css and case.js. The page is washed in its project's tone (the same tints as the home page). Structure follows the case-study skill (owl-listener/designer-skills): an "All work" link, a ledger with the project number, type and year, the title at hero size, a one-line pitch, the intro, and a facts panel whose first row is My role. Then a full-width cover, numbered chapters with a sticky "On this page" index that tracks the section in view, a large Next project panel, and the signature footer. A hairline at the top of the window shows reading progress.

Where the browser supports cross-document view transitions, navigating between pages cross-fades and each project title (view-transition-name: title-<project>) glides from the home page into its case study. Reduced motion turns this off.

Only facts from the CV and portfolio PDF appear in the facts panels and copy. AI-generated images keep their captions.

## Materials

The header becomes a translucent paper material (blur + saturate, bright top edge) once the hero scrolls away; under `prefers-reduced-transparency` it turns solid. A fixed grain overlay at very low opacity keeps the paper from reading flat.

Images never sit in a box of a different colour from the page. Product renders and device mockups (Fresha scanner, app and side render, Night Court jacket, both Digital mockups) are transparent WebP cut-outs (`.frame.is-cutout`) that float on the page tint with a soft ink-tinted drop shadow; the image is padded inside its frame so the reveal curtain never clips the shadow into a visible edge. Paper scans and line drawings (`.is-paper`, `.pan`) multiply into a frame filled with the page's own `--bg`. An inset laid over a photo (`.is-tint`) takes the page tint too. Photographs keep their own frame.

## Honesty rules

AI-generated imagery is labelled where it appears. Concept projects in "Next" are marked as concepts in progress, never as finished work.
