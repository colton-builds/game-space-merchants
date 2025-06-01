class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load any assets needed for the loading screen
        this.load.image('loading-background', 'assets/images/loading-background.png');
    }

    create() {
        // Set up any game settings
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        
        // Start the preload scene
        this.scene.start('PreloadScene');
    }
} 