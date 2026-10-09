---
version: alpha
name: Murat Kurul Portfolio
description: Dark editorial portfolio site for Murat Kurul, a multidisciplinary designer working across apparel, product and brand. Case studies may wear their own project palette.
colors:
  bg: "#0B0B0C"
  surface: "#141416"
  line: "#232326"
  line-strong: "#34343A"
  text: "#E8E4DA"
  text-2: "#B3B0A8"
  muted: "#8E8B83"
  accent: "#E8E4DA"
  on-accent: "#0B0B0C"
typography:
  sans:
    fontFamily: Archivo
  mono:
    fontFamily: JetBrains Mono
  serif:
    fontFamily: Instrument Serif
  script:
    fontFamily: Caveat Brush
  body:
    fontFamily: Archivo
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  display:
    fontFamily: Archivo
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: -0.045em
  label:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0.14em
spacing:
  header-h: 60px
omitted:
  - section: rounded
    reason: No radius tokens; pills use a fully rounded radius and everything else is square.
---

# Murat Kurul Portfolio

## Overview

A personal portfolio presenting apparel, product and brand projects to design teams. The home page is a dark editorial frame: oversized uppercase display type, monospaced uppercase labels, and full-bleed project imagery led by a draggable 3D carousel. Each case study can switch to its project's own palette so the page reads like that project's brand book.

## Colors

The default theme is near-black with a warm off-white text colour; there is no hue accent, so `accent` equals `text`. Hierarchy comes from the three text steps (`text`, `text-2`, `muted`) and two hairline steps (`line`, `line-strong`). Every text step must hold WCAG AA contrast on its ground; `muted` is the lowest step allowed for small text.

## Themes

Each project has its own palette, taken from its pages in the portfolio PDF. A palette is applied with a class that redefines the same tokens: `theme-*` on a case study's `body`, or `tone-*` on a single project band on the home page. Only the values below change.

| Token | Default | `theme-liman` | `tone-terracotta` | `theme-fresha` | `theme-postura` | `theme-night` |
| --- | --- | --- | --- | --- | --- | --- |
| bg | #0B0B0C | #F1ECE2 | #A54A27 | #1F3A29 | #DDE1E7 | #1D2338 |
| surface | #141416 | #E6DFD1 | #933F20 | #284A35 | #CDD3DB | #252C45 |
| line | #232326 | #D8CFBF | rgba(241,236,226,0.28) | #34573F | #C3C9D2 | #323A57 |
| line-strong | #34343A | #C3B8A4 | rgba(241,236,226,0.55) | #4C7457 | #A6AEBA | #4A5378 |
| text | #E8E4DA | #1F2B3B | #F1ECE2 | #ECEEEA | #0E1116 | #ECE6DA |
| text-2 | #B3B0A8 | #364255 | #F1ECE2 | #CBD8C8 | #2E3540 | #CBC6BC |
| muted | #8E8B83 | #5B6575 | #F1ECE2 | #A8BCA5 | #4A5260 | #A6A29B |
| accent | #E8E4DA | #A54A27 | #F1ECE2 | #A9C9A4 | #1A56A8 | #C9A14A |
| on-accent | #0B0B0C | #F1ECE2 | #A54A27 | #1F3A29 | #FFFFFF | #1D2338 |

`theme-night` adds `signal` (#C0272D), used only for blocks and swatches, and `flash`, a violet-to-teal gradient used only as a thin rule, as on the jacket's seam tape. Liman's terracotta is darkened for text so small type passes AA.

## Typography

`display` is uppercase Archivo set tight and large; its size is fluid with the viewport. `label` is the monospaced uppercase voice for metadata, section heads, tags and controls. `serif` is reserved for pull quotes. `script` is loaded only on the Liman case study, for the wordmark and taglines. Headings balance their lines; paragraphs use pretty wrapping.

## Layout

Pages use a single fluid side gutter that is never narrower than a phone's 16px margin. Every two-column composition collapses to one column on phones, with media placed above text on the home work list. The fixed header reserves `header-h` plus the top safe-area inset, and anchored sections scroll clear of it. Wide artwork that is unreadable at phone width scrolls sideways inside its own region instead of shrinking.

## Components

The hero is a stage that takes the colour of the project in front: as the 3D carousel turns, the background glow and a giant outlined project name crossfade to that project's tone, and a "now showing" bar names the project with a direct link. The ring rotates one transform per frame, pauses off-screen, in hidden tabs and for reduced motion, and always offers previous, pause/play and next buttons. Carousel cards duplicate destinations in the work list, so the ring is hidden from assistive technology; the bar's link is the keyboard route.

On the home page each project sits in a full-width band in its own palette, like flipping through the printed portfolio. Text and images reveal on scroll only when motion is allowed. Fresha's band includes a live readout that cycles the device's three answers. Grids built from hairline cells give each cell its own border, so incomplete rows never show an empty filled block.
