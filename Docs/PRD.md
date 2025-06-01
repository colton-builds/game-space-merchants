# Space Economy Simulation Game - Product Requirements Document

## 1. Product Overview
The Space Economy Simulation Game is a real-time space trading game where players manage trade routes between planets with dynamic economies. Players navigate a solar system, trade commodities, and respond to economic events while managing their resources and ship capabilities.

## 2. Core Gameplay

### 2.1 Player Spaceship
- Initial mass: 100 units
- Starting location: Earth-like home planet
- Movement capabilities:
  - Surface traversal using left/right keys
  - Orbital movement around planet circumference
  - Spacebar for launch/thrust control
    - Maximum 3 thrust bursts between planetary landings
- Orientation: Always faces away from current planet's center
- Cargo capacity: Limited by MAX_CARGO_TONS
- Boost system:
  - Maximum 5 boost pulses
  - Boosts reset upon planetary landing
  - Boost duration: BOOST_DURATION_FRAMES
- Ship Upgrades:
  - Three upgrade levels available
  - Level 1 (Starting): 100 tons cargo, 3 boost pulses
  - Level 2 (Medium): 250 tons cargo, 5 boost pulses
  - Level 3 (Large): 500 tons cargo, 8 boost pulses
- Error Recovery:
  - Eject to nearest planet functionality
  - Cost: 1M credits
  - 1-minute cooldown period

### 2.2 Physics System
- Launch mechanics:
  - Initial trajectory determined by:
    - Launch thrust force
    - Ship momentum
    - Ship mass
  - Continuous influence from:
    - Gravitational forces of nearby celestial bodies
    - Current velocity and momentum
- Collision detection with planets and star
- Escape pod system for emergency landings
- Gravitational Force Calculation:
  - Base formula: F = G * (m1 * m2) / r²
  - Configurable gravitational constant
  - Force magnitude capping
  - Minimum distance threshold
  - Scaled by gameplay balance factor

### 2.3 Celestial Mechanics
- Eight planets with unique characteristics
- Orbital mechanics:
  - Planets orbit sun at varying distances
  - Unique orbital speeds per planet
  - Stable orbital mechanics
- Gravitational forces:
  - Scale with celestial body size
  - Stars: Significant but balanced gravitational influence
  - Planets: Proportional to mass and distance
- Boundary System:
  - Outer gravitational well beyond outermost planet
  - Exponential force increase with distance
  - Inner boundary preventing star entry
  - Collision detection with star's radius

## 3. Economic System

### 3.1 Market Mechanics
- Dynamic commodity markets with supply/demand mechanics
- Price fluctuations based on:
  - Supply/demand balance
  - Distance (for energy units)
  - Market conditions
- Minimum price margins maintained
- Storage capacity management
- Production and consumption rate modifiers

### 3.2 Trading System
- Buy/sell prices based on supply ratios
- Price factors influenced by:
  - Supply/demand balance
  - Distance (for energy units)
  - Market conditions
- Minimum price margins maintained
- Cargo capacity limits
- Money management system

### 3.3 Production Chains
- Complex production chains with input/output requirements
- Production requires input commodities
- Storage capacity limits affect production
- Distance affects energy unit prices

## 4. Event System

### 4.1 Event Categories
- Environmental
- Economic
- Social/Political
- Technological

### 4.2 Event Mechanics
- Random events affecting planetary economies
- Configurable event frequency and impact
- Event log tracking system
- Events can modify:
  - Production rates
  - Consumption rates
  - Supply quantities
  - Demand quantities
- Multiple simultaneous events possible
- Events can target specific commodities or all commodities

## 5. User Interface

### 5.1 Game View
- General player view: top-down view of solar system with planets orbiting star
- Camera centered on the planet the player is on
- When launched, the camera follows the player's ship
- Minimap System:
  - Size: 200px diameter
  - Position: Top-right corner
  - Dynamic scale based on system size
  - Opacity: 0.8
  - Features:
    - Planet orbital paths
    - Planet names
    - Trade routes
    - Event markers
    - Interactive elements
    - Visual effects

### 5.2 Trade Interface
- Buy/Sell mode toggle
- Commodity list with:
  - Current prices
  - Supply/Demand ratings
  - Player inventory
  - Quick trade buttons (1x, 5x, 10x)
- Monetary Display:
  - Format: M (millions), B (billions), T (trillions)
  - Example: $1.23M, $4.56B, $7.89T
  - Dynamic formatting based on amount

### 5.3 Map View
- Solar system overview
- Planet information
- Trade route visualization
- Commodity filter
- Event log
- Full Map Features:
  - Planet details panel
  - Economy report
  - Commodity list
  - Data table with sortable columns

### 5.4 Settings
- Physics settings
- Gameplay settings
- Event settings
- Key bindings
- UI layout and appearance

## 6. Technical Requirements

### 6.1 Project Structure
```
project/
├── index.html
├── src/
│   ├── game/
│   │   ├── scenes/        # Game scenes (main menu, gameplay, etc.)
│   │   ├── entities/      # Game objects (ship, planets, etc.)
│   │   └── systems/       # Game systems (physics, economy, etc.)
│   ├── audio/            # Audio management
│   └── ui/               # UI components
├── assets/
│   ├── images/          # Game sprites and UI elements
│   └── sounds/          # Sound effects and music
└── styles/              # CSS styles
```

### 6.2 Technology Stack
- **Game Engine**: Phaser.js
  - 2D game development
  - Built-in physics support
  - Scene management
  - Asset loading
- **Physics Engine**: Matter.js
  - Gravitational mechanics
  - Collision detection
  - Orbital dynamics
- **Audio System**: Howler.js
  - Sound effect management
  - Background music
  - Audio optimization
- **Styling**: Tailwind CSS
  - Responsive design
  - Modern UI components
  - Utility-first approach

### 6.3 Resource Libraries
#### Audio Resources
- **Freesound** (https://freesound.org/)
  - Requires attribution
  - Large collection of sound effects
  - Community-driven
- **OpenGameArt** (https://opengameart.org/)
  - Free to use
  - Both audio and visual assets
  - Open source community
- **Kenney Game Assets** (https://kenney.nl/assets)
  - Free to use
  - High-quality game assets
  - No attribution required

#### Art Resources
- **OpenGameArt** (https://opengameart.org/)
  - Free game art
  - Various styles and themes
  - Community contributions
- **Kenney Game Assets** (https://kenney.nl/assets)
  - Professional quality
  - Consistent style
  - Space-themed assets available
- **Itch.io** (https://itch.io/game-assets/free)
  - Mix of free and paid assets
  - Unique art styles
  - Regular updates
- **Game-Icons.net** (https://game-icons.net/)
  - Free game icons
  - SVG format
  - Customizable colors

### 6.4 Deployment
- **GitHub Pages**
  - Free hosting
  - Automatic updates
  - Version control
  - Easy sharing via URL
  - No server setup required

### 6.5 Performance
- Target frame rate: 30 FPS
- Minimum acceptable: 20 FPS
- VSync: Enabled
- Real-time simulation with time scaling
- Smooth orbital mechanics
- Responsive UI
- Efficient event processing

### 6.6 Error Handling
- Standard try-catch blocks for runtime errors
- Graceful degradation for performance issues
- Clear user feedback for error states
- Console logging for debugging
- Input validation and sanitization
- Error Display System:
  - Position: Configurable
  - Style: Customizable
  - Duration: Based on priority
  - Non-blocking display
  - Recovery options when available

### 6.7 Browser Compatibility
- Modern web browser support
- Responsive design
- Canvas-based rendering
- Local storage for settings

## 7. Future Considerations
- User account management
- Backend integration
- Save/Load System (v2):
  - Player state persistence
  - Planet positions and market data
  - Event history
  - Game settings
  - Local storage support
  - Export/Import functionality
  - Auto-save feature
  - Save file versioning
- Multiplayer capabilities
- Additional planets and commodities
- Enhanced graphics and effects
- Mobile support

## 8. Success Metrics
- Smooth gameplay experience
- Balanced economy
- Engaging trading mechanics
- Clear user feedback
- Intuitive controls
- Responsive UI
- Stable performance 