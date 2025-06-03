// Game configuration
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0 },
            debug: true // We'll disable this in production
        }
    },
    scene: [BootScene, PreloadScene, MainMenuScene, GameScene]
};

// Initialize the game
const game = new Phaser.Game(config);

// Responsive resizing
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
}); 