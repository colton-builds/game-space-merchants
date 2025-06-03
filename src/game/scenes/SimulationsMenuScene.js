class SimulationsMenuScene extends Phaser.Scene {
    constructor() {
        super('SimulationsMenuScene');
    }

    create() {
        // Title
        this.add.text(this.scale.width / 2, 100, 'SIMULATIONS', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '28px',
            color: '#00eaff',
            stroke: '#22223b',
            strokeThickness: 6,
            align: 'center',
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true }
        }).setOrigin(0.5);

        // Simulation list (for now, just one)
        const simButton = this.add.text(this.scale.width / 2, 220, 'Menu Button Demo', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '18px',
            color: '#f7f7f7',
            backgroundColor: '#22223b',
            padding: { left: 32, right: 32, top: 12, bottom: 12 },
            stroke: '#00eaff',
            strokeThickness: 4,
            align: 'center',
            shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 0, fill: true }
        }).setOrigin(0.5).setInteractive();

        // Sounds
        const hoverSound = this.sound.add('buttonover');
        const clickSound = this.sound.add('buttonclick');

        simButton.on('pointerover', () => { simButton.setStyle({ color: '#ff3c38' }); hoverSound.play(); });
        simButton.on('pointerout', () => { simButton.setStyle({ color: '#f7f7f7' }); });
        simButton.on('pointerdown', () => { clickSound.play(); this.scene.start('MenuButtonDemoScene'); });

        // Exit button
        const exitButton = this.add.text(this.scale.width / 2, this.scale.height - 100, 'EXIT', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '16px',
            color: '#f7f7f7',
            backgroundColor: '#22223b',
            padding: { left: 32, right: 32, top: 12, bottom: 12 },
            stroke: '#00eaff',
            strokeThickness: 4,
            align: 'center',
            shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 0, fill: true }
        }).setOrigin(0.5).setInteractive();
        exitButton.on('pointerover', () => { exitButton.setStyle({ color: '#00eaff' }); hoverSound.play(); });
        exitButton.on('pointerout', () => { exitButton.setStyle({ color: '#f7f7f7' }); });
        exitButton.on('pointerdown', () => { clickSound.play(); this.scene.start('MainMenuScene'); });
    }
} 