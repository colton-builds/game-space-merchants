class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        // Create stars (same as loading screen)
        for (let i = 0; i < 100; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const size = Phaser.Math.Between(1, 3);
            const star = this.add.circle(x, y, size, 0xffffff);
            star.alpha = Phaser.Math.FloatBetween(0.3, 1);
        }

        // Add title
        this.add.text(400, 200, 'Space Merchants', {
            font: '48px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Add subtitle
        this.add.text(400, 260, 'Trade. Travel. Thrive.', {
            font: '24px Arial',
            fill: '#ffffff'
        }).setOrigin(0.5);

        // Create start button
        const startButton = this.add.text(400, 400, 'Start Game', {
            font: '32px Arial',
            fill: '#ffffff',
            backgroundColor: '#1a65ac',
            padding: {
                left: 20,
                right: 20,
                top: 10,
                bottom: 10
            }
        })
        .setOrigin(0.5)
        .setInteractive();

        // Button hover effects
        startButton.on('pointerover', () => {
            startButton.setStyle({ fill: '#ff0' });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ fill: '#ffffff' });
        });

        // Start game on click
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        // Add version text
        this.add.text(400, 550, 'v0.1.0', {
            font: '16px Arial',
            fill: '#666666'
        }).setOrigin(0.5);
    }
} 