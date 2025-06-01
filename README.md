# Space Merchants Game

A space economy simulation game where players manage trade routes between planets with dynamic economies. Navigate a solar system, trade commodities, and respond to economic events while managing your resources and ship capabilities.

## Features

- Real-time space trading simulation
- Dynamic economy system with supply and demand
- Gravitational physics and orbital mechanics
- Ship upgrade system with three levels
- Interactive minimap and trading interface
- Event system affecting planetary economies
- Save/Load system for game progress

## Tech Stack

- **Game Engine**: Phaser.js
- **Physics Engine**: Matter.js
- **Audio System**: Howler.js
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Modern web browser
- Git (for development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/game-space-merchants.git
```

2. Open `index.html` in your web browser

## Development

### Project Structure
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

### Controls

- **Movement**: Arrow keys for rotation, Space for boost
- **Trading**: T to open trade menu, Mouse for selection
- **Map**: M to toggle map view
- **Eject**: Escape to eject to nearest planet

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Phaser.js](https://phaser.io/)
- [Matter.js](https://brm.io/matter-js/)
- [Howler.js](https://howlerjs.com/)
- [Tailwind CSS](https://tailwindcss.com/)