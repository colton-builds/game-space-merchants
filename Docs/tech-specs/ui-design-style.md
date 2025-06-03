# UI Design Style Guide: 16-Bit Retro Arcade

## Overview
The UI for Space Merchant should evoke the look and feel of classic 16-bit arcade games, blending nostalgia with modern usability. All visual elements should reinforce the retro theme while supporting clear, intuitive gameplay.

## Color Palette
- **Primary Colors:** Bright, saturated colors reminiscent of SNES/Genesis palettes (e.g., #00eaff, #ffb300, #ff3c38, #00e676, #f7f7f7, #22223b)
- **Accent Colors:** Neon pinks, purples, and greens for highlights and interactive elements
- **Backgrounds:** Deep blues, purples, and black gradients for space ambiance
- **Borders/Outlines:** Use 1-2px solid black or white outlines for all UI elements

## Fonts
- **Main Font:** Pixel/bitmap font (e.g., Press Start 2P, Arcade Classic, or custom 8x8/16x16 bitmap font)
- **Font Size:** Use large, blocky text for titles; smaller, readable pixel text for menus and labels
- **Text Effects:** All-caps, drop shadows, and/or colored outlines for emphasis

## Buttons & Panels
- **Buttons:** Rectangular or pill-shaped with thick borders, pixelated edges, and color fill. Use hover/active states with color shifts or glow effects.
- **Panels:** Opaque or semi-transparent with pixel borders, subtle scanline overlays, and drop shadows for depth
- **Spacing:** Generous padding and clear separation between elements

## Iconography
- **Icons:** Pixel art icons for settings, volume, arrows, etc. (16x16 or 32x32 px)
- **Indicators:** Use blinking or animated pixel effects for notifications or active states

## Layout Principles
- **Alignment:** Grid-based layout, left-aligned or center-aligned for menus
- **Consistency:** All UI elements should use the same pixel grid and color palette
- **Effects:** Optional scanlines, CRT curvature, and subtle screen flicker for added retro feel

## Additional Effects
- **Transitions:** Use simple wipes, fades, or slide-ins with pixelated edges
- **Sound:** UI sounds should be chiptune/8-bit/16-bit style

## Sound (UI Interactions)
- **Slider:** Play `click_low.mp3` each time the slider handle moves to a new notch/value
- **Button Hover:** Play `buttonover.wav` when the mouse moves over any button
- **Button Click:** Play `buttonclick.wav` when a button is clicked

(See also: Docs/ui-specs/settings-page.md for implementation details)

---
All new UI components, including the settings menu, should follow these guidelines for a cohesive retro arcade experience. 