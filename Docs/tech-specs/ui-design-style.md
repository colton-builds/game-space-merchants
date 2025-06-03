# UI Design Style Guide: 16-Bit Retro Arcade

## Overview
The UI for Space Merchant should evoke the look and feel of classic 16-bit arcade games, blending nostalgia with modern usability. All visual elements should reinforce the retro theme while supporting clear, intuitive gameplay.

## Color Palette
- **Primary Colors:** Bright, saturated colors reminiscent of SNES/Genesis palettes (e.g., #00eaff, #ffb300, #ff3c38, #00e676, #f7f7f7, #22223b)
- **Accent Colors:** Neon pinks, purples, and greens for highlights and interactive elements
- **Backgrounds:** Deep blues, purples, and black gradients for space ambiance
- **Borders/Outlines:** Use 1-2px solid black or white outlines for all UI elements

## Fonts
- **Main Font:** Bold, all-caps, pixel/bitmap font (e.g., Press Start 2P, Arcade Classic, or custom 8x8/16x16 bitmap font)
- **Weight:** Heavy/bold, with thick strokes and a blocky, monospaced appearance
- **Text Effects:** All-caps, drop shadows, and/or colored outlines for emphasis
- **Decorative:** Use shadow or outline effects for extra pop on titles or important labels

## Dialog Windows & Panels
- **Shape:** Rectangular with sharp, 90-degree corners
- **Borders:** Thick, black, pixelated borders (1-2px), sometimes double or with a dotted pattern at the top for header bars
- **Header Bar:** Many dialogs have a header bar with a different color or a dotted pattern, sometimes including a close (X) button or icon
- **Shadow:** Each window has a drop shadow or dotted shadow, enhancing the "floating" effect
- **Spacing:** Generous padding and clear separation between elements
- **Playful Pixel Art:** Use simple, pixel-style icons (envelope, info, chat bubble, warning triangle, etc.) for context

## Buttons
- **Shape:** Rectangular, with sharp corners
- **Borders:** Thick, black, pixelated borders, matching the dialog window style
- **Background:** Solid fill, usually white or a very light pastel
- **Text:** All-caps, bold, pixel/bitmap font, centered in the button
- **Spacing:** Generous padding inside the button, making the text easy to read
- **States:** Use simple color or border changes for hover/click interaction

## Iconography
- **Icons:** Pixel art icons for settings, volume, arrows, etc. (16x16 or 32x32 px)
- **Indicators:** Use blinking or animated pixel effects for notifications or active states

## Iconography (ASCII/Unicode)
- Use only ASCII/unicode character-based icons for basic UI elements (e.g., speech bubble, information "i", question mark, etc.).
- Icons should be constructed by arranging unicode/text characters in formation, not by using Phaser's graphics API for circles or squares.
- Icons must be modular and reusable across the app.
- Use icons sparingly—only for essential UI cues and as relevant features emerge.

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

## Simulation Page Navigation
- The exit button for all simulation pages should be placed in the top left corner of the left-hand panel, ensuring consistency and aligning with modern UI design principles.

---
All new UI components, including the settings menu, should follow these guidelines for a cohesive retro arcade experience. 