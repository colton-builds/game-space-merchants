class MenuButtonDemoScene extends Phaser.Scene {
    constructor() {
        super('MenuButtonDemoScene');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        const leftPanelWidth = width * 0.2;
        const rightPanelWidth = width * 0.8;

        // Left panel background
        this.add.rectangle(leftPanelWidth / 2, height / 2, leftPanelWidth, height, 0x22223b, 0.98)
            .setStrokeStyle(4, 0x00eaff)
            .setOrigin(0.5);

        // Title
        this.add.text(leftPanelWidth / 2, 80, 'Menu Button Demo', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '16px',
            color: '#00eaff',
            stroke: '#22223b',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);

        // Description
        this.add.text(leftPanelWidth / 2, 140, 'Demonstrates retro menu button styling and sound.', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '12px',
            color: '#f7f7f7',
            wordWrap: { width: leftPanelWidth - 32 }
        }).setOrigin(0.5);

        // CTA
        this.add.text(leftPanelWidth / 2, 200, 'Hover and click the button on the right to test.', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '12px',
            color: '#ffb300',
            wordWrap: { width: leftPanelWidth - 32 }
        }).setOrigin(0.5);

        // Exit button
        const exitButton = this.add.text(leftPanelWidth / 2, height - 80, 'EXIT', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '14px',
            color: '#f7f7f7',
            backgroundColor: '#22223b',
            padding: { left: 24, right: 24, top: 10, bottom: 10 },
            stroke: '#00eaff',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        // Sounds
        const hoverSound = this.sound.add('buttonover');
        const clickSound = this.sound.add('buttonclick');

        exitButton.on('pointerover', () => { exitButton.setStyle({ color: '#00eaff' }); hoverSound.play(); });
        exitButton.on('pointerout', () => { exitButton.setStyle({ color: '#f7f7f7' }); });
        exitButton.on('pointerdown', () => { clickSound.play(); this.scene.start('SimulationsMenuScene'); });

        // Right panel: demo button
        const buttonX = leftPanelWidth + rightPanelWidth / 2;
        const buttonY = height / 2;
        const demoButton = this.add.text(buttonX, buttonY, 'RETRO BUTTON', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '24px',
            color: '#f7f7f7',
            backgroundColor: '#22223b',
            padding: { left: 48, right: 48, top: 24, bottom: 24 },
            stroke: '#00eaff',
            strokeThickness: 6,
            align: 'center',
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true }
        }).setOrigin(0.5).setInteractive();

        demoButton.on('pointerover', () => { demoButton.setStyle({ color: '#ff3c38' }); hoverSound.play(); });
        demoButton.on('pointerout', () => { demoButton.setStyle({ color: '#f7f7f7' }); });
        demoButton.on('pointerdown', () => { clickSound.play(); });
    }
} 