import { STAR_SCALE_MIN, STAR_SCALE_MAX, STAR_COUNT } from '../constants.js';

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
        for (let i = 0; i < STAR_COUNT; i++) {
            const x = Phaser.Math.Between(0, 800);
            const y = Phaser.Math.Between(0, 600);
            const starType = Phaser.Math.Between(1, 6);
            const star = this.add.image(x, y, `star_distant_${starType}`);
            star.setAlpha(Phaser.Math.FloatBetween(0.3, 1));
            // Use shared constants for scale
            const scale = Phaser.Math.FloatBetween(STAR_SCALE_MIN, STAR_SCALE_MAX);
            star.setScale(scale);
        }

        // Load other game assets
        this.loadAssets();
    }

    loadAssets() {
        // Load images

        // Load audio
        this.load.audio('gameplay_music', 'assets/sounds/gameplay_music.ogg');
    }

    create() {
        // Start the main menu scene
        this.scene.start('MainMenuScene');
    }
} 