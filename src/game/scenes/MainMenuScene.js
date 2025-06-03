import { STAR_SCALE_MIN, STAR_SCALE_MAX, STAR_COUNT } from '../constants.js';

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        // Play background music if not already playing
        if (!this.sound.get('gameplay_music')) {
            const music = this.sound.add('gameplay_music', { loop: true, volume: 0.2 });
            music.play();
        }

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
            frameRate: 1,
            repeat: -1
        });

        // Create stars using the loaded images
        const totalStars = STAR_COUNT;
        const animatedStars = Math.floor(totalStars / 3);
        
        for (let i = 0; i < totalStars; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const scale = Phaser.Math.FloatBetween(STAR_SCALE_MIN, STAR_SCALE_MAX);
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

        // Add retro pixel title
        this.add.text(this.scale.width / 2, 120, 'SPACE MERCHANT', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '32px',
            color: '#00eaff',
            stroke: '#22223b',
            strokeThickness: 6,
            align: 'center',
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true }
        }).setOrigin(0.5);

        // Add subtitle
        this.add.text(this.scale.width / 2, 180, 'TRADE. TRAVEL. THRIVE.', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '16px',
            color: '#ffb300',
            stroke: '#22223b',
            strokeThickness: 4,
            align: 'center',
            shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 0, fill: true }
        }).setOrigin(0.5);

        // Retro pixel button style
        const buttonStyle = {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '18px',
            color: '#f7f7f7',
            backgroundColor: '#22223b',
            padding: { left: 32, right: 32, top: 12, bottom: 12 },
            stroke: '#00eaff',
            strokeThickness: 4,
            align: 'center',
            shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 0, fill: true }
        };

        // Start Game button
        const startButton = this.add.text(this.scale.width / 2, 300, 'START GAME', buttonStyle)
            .setOrigin(0.5)
            .setInteractive();

        // Settings button
        const settingsButton = this.add.text(this.scale.width / 2, 370, 'SETTINGS', buttonStyle)
            .setOrigin(0.5)
            .setInteractive();

        // Button sounds
        const hoverSound = this.sound.add('buttonover');
        const clickSound = this.sound.add('buttonclick');

        // Start button events
        startButton.on('pointerover', () => {
            startButton.setStyle({ color: '#ff3c38' });
            hoverSound.play();
        });
        startButton.on('pointerout', () => {
            startButton.setStyle({ color: '#f7f7f7' });
        });
        startButton.on('pointerdown', () => {
            clickSound.play();
            this.scene.start('GameScene');
        });

        // Settings button events
        settingsButton.on('pointerover', () => {
            settingsButton.setStyle({ color: '#00e676' });
            hoverSound.play();
        });
        settingsButton.on('pointerout', () => {
            settingsButton.setStyle({ color: '#f7f7f7' });
        });
        settingsButton.on('pointerdown', () => {
            clickSound.play();
            this.scene.start('SettingsScene');
        });

        // Version text
        this.add.text(this.scale.width / 2, this.scale.height - 40, 'v0.1.0', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '12px',
            color: '#666666',
            align: 'center'
        }).setOrigin(0.5);
    }
} 