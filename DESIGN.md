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

Themes are applied with a class on `body` and redefine the same tokens. Only the values below change.

| Token | Default | `theme-liman` | `theme-night` |
| --- | --- | --- | --- |
| bg | #0B0B0C | #F1ECE2 | #1C1C1E |
| surface | #141416 | #E6DFD1 | #252527 |
| line | #232326 | #D8CFBF | #333336 |
| line-strong | #34343A | #C3B8A4 | #46464A |
| text | #E8E4DA | #1F2B3B | #ECE5D3 |
| text-2 | #B3B0A8 | #364255 | #C9C2B0 |
| muted | #8E8B83 | #5B6575 | #9E9787 |
| accent | #E8E4DA | #A54A27 | #C49A3E |
| on-accent | #0B0B0C | #F1ECE2 | #1C1C1E |
| lacquer | — | — | #A8261E |

`theme-liman` darkens the label's terracotta for `accent` so small text on it passes AA. In `theme-night`, `lacquer` is used only as a block background with rice-paper text, never as a text colour.

## Typography

`display` is uppercase Archivo set tight and large; its size is fluid with the viewport. `label` is the monospaced uppercase voice for metadata, section heads, tags and controls. `serif` is reserved for pull quotes. `script` is loaded only on the Liman case study, for the wordmark and taglines. Headings balance their lines; paragraphs use pretty wrapping.

## Layout

Pages use a single fluid side gutter that is never narrower than a phone's 16px margin. Every two-column composition collapses to one column on phones, with media placed above text on the home work list. The fixed header reserves `header-h` plus the top safe-area inset, and anchored sections scroll clear of it. Wide artwork that is unreadable at phone width scrolls sideways inside its own region instead of shrinking.

## Components

The hero carousel positions cards once and rotates only the ring's transform each frame. It pauses when off-screen, when the tab is hidden, and when the user prefers reduced motion, and it always offers previous, pause/play and next buttons. Carousel cards duplicate destinations in the work list, so the ring is hidden from assistive technology. Grids built from hairline cells give each cell its own border, so incomplete rows never show an empty filled block.
