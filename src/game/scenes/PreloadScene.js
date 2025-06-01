class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Display loading text
        const loadingText = this.add.text(400, 300, 'Loading...', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Create loading bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        // Loading progress events
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });

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