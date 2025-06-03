# Settings Page UI Specs

## Overview
The Settings page provides players with access to key game options, including audio volume, and should be styled in accordance with the 16-bit retro arcade UI design guide.

## Layout
- **Panel:** Centered modal or full-screen overlay with pixel art borders and scanline background
- **Sections:**
  - Title bar ("SETTINGS")
  - Volume control
  - (Future) Key bindings, graphics options, etc.
- **Spacing:** Generous padding, clear separation between controls

## Controls
- **Volume:**
  - Pixel art speaker icon
  - Horizontal slider styled as a pixel bar (0-100%)
  - Numeric value display (e.g., "VOL: 80%")
  - Mute/unmute button (pixel art icon)
- **Back/Close:**
  - Large, clearly labeled pixel button ("BACK" or "CLOSE")

## Visual Style
- **Font:** Pixel/bitmap font (see UI design style doc)
- **Colors:** Use palette from UI design style doc
- **Borders:** 1-2px solid black or white, pixelated edges
- **Effects:** Scanlines, subtle CRT curvature, and drop shadows
- **Icons:** All icons should be pixel art (16x16 or 32x32 px)

## Interactivity
- **Slider:** Draggable handle with snap-to-pixel increments
- **Buttons:** Color shift or glow on hover/active
- **Sound:** Chiptune/retro sound on interaction

## Reference
See [ui-design-style.md](../tech-specs/ui-design-style.md) for full visual guidelines. 