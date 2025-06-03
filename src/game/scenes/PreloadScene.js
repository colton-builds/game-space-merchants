class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Create stars
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const size = Phaser.Math.Between(1, 3);
            const star = this.add.circle(x, y, size, 0xffffff);
            star.alpha = Phaser.Math.FloatBetween(0.3, 1);
        }

        // Load game assets
        this.loadAssets();
    }

    loadAssets() {
        // Load images
        this.load.image('star', 'assets/images/star.png');
        this.load.image('planet', 'assets/images/planet.png');
        this.load.image('ship', 'assets/images/ship.png');

        // Load audio
        this.load.audio('engine', 'assets/sounds/engine.mp3');
        this.load.audio('trade', 'assets/sounds/trade.mp3');
    }

    create() {
        // Start the main menu scene
        this.scene.start('MainMenuScene');
    }
} 