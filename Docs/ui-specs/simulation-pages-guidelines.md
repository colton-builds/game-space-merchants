# Simulation Pages: General Guidelines

## Purpose
Simulation pages are dedicated scenes for demonstrating, testing, and iterating on individual game features or mechanics in isolation. They provide a controlled environment for rapid prototyping and user feedback.

## Layout
- **Two-Panel Structure:**
  - **Left Panel (1/5 width):**
    - Simulation title
    - Description of the feature/functionality being simulated
    - Call-to-action (CTA) guiding the user on what to do/test
    - Optional: Controls (sliders, buttons, toggles) for adjusting simulation parameters
  - **Right Panel (4/5 width):**
    - Main simulation/game window
    - Updates in real-time based on left panel settings

## Navigation
- Each simulation page must have an "Exit" button (top or bottom of left panel) to return to the simulations menu.
- The simulations menu lists all available simulations and launches the selected one.

## Interactivity
- All UI elements (buttons, sliders, etc.) must use the retro 16-bit arcade style (see UI design style guide).
- All interactive elements must provide visual and audio feedback (hover, click, etc.).
- Simulation settings should update the right panel in real-time.

## Extensibility
- New simulations should be easy to add: create a new scene, add to the simulations menu, and follow this layout.
- Each simulation should be self-contained and not affect the main game state.

## Reference
- See [ui-design-style.md](ui-design-style.md) for visual and audio style requirements. 