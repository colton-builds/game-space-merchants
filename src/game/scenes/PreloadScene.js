class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Load star images first
        for (let i = 1; i <= 6; i++) {
            this.load.image(`star_distant_${i}`, `assets/images/star_distant_${i}.png`);
        }

        // Create stars using the loaded images
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const starType = Phaser.Math.Between(1, 6);
            const star = this.add.image(x, y, `star_distant_${starType}`);
            star.setAlpha(Phaser.Math.FloatBetween(0.3, 1));
            // Randomly scale the stars between 0.5 and 1.5
            const scale = Phaser.Math.FloatBetween(0.5, 1.5);
            star.setScale(scale);
        }

        // Load other game assets
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
        this.load.audio('gameplay_music', 'assets/sounds/gameplay_music.ogg');
    }

    create() {
        // Start the main menu scene
        this.scene.start('MainMenuScene');
    }
} 