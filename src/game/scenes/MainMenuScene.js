class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        // Create star animation
        this.anims.create({
            key: 'star_twinkle',
            frames: [
                { key: 'star_distant_1' },
                { key: 'star_distant_2' },
                { key: 'star_distant_3' },
                { key: 'star_distant_4' },
                { key: 'star_distant_5' },
                { key: 'star_distant_6' }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Create stars using the loaded images
        const totalStars = 50;
        const animatedStars = Math.floor(totalStars / 3);
        
        for (let i = 0; i < totalStars; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const scale = Phaser.Math.FloatBetween(0.5, 1.5);
            const alpha = Phaser.Math.FloatBetween(0.3, 1);

            if (i < animatedStars) {
                // Create animated stars (1/3 of total)
                const star = this.add.sprite(x, y, 'star_distant_1');
                star.play('star_twinkle');
                star.setAlpha(alpha);
                star.setScale(scale);
            } else {
                // Create static stars (2/3 of total)
                const starType = Phaser.Math.Between(1, 6);
                const star = this.add.image(x, y, `star_distant_${starType}`);
                star.setAlpha(alpha);
                star.setScale(scale);
            }
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