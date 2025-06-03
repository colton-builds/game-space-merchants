class IconographyDemoScene extends Phaser.Scene {
    constructor() {
        super('IconographyDemoScene');
    }

    create() {
        const width = this.scale.width;
        const height = this.scale.height;
        const leftPanelWidth = width * 0.25;
        const rightPanelWidth = width * 0.75;

        // Left panel background
        this.add.rectangle(leftPanelWidth / 2, height / 2, leftPanelWidth, height, 0x22223b, 0.98)
            .setStrokeStyle(6, 0x000000)
            .setOrigin(0.5)
            .setDepth(0);

        // Exit button (top left)
        const exitButton = this.add.text(32, 32, 'EXIT', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '18px',
            color: '#f7f7f7',
            backgroundColor: '#22223b',
            padding: { left: 24, right: 24, top: 10, bottom: 10 },
            stroke: '#000000',
            strokeThickness: 6,
            align: 'center',
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true }
        }).setOrigin(0, 0).setInteractive();
        const hoverSound = this.sound.add('buttonover');
        const clickSound = this.sound.add('buttonclick');
        exitButton.on('pointerover', () => { exitButton.setStyle({ color: '#00eaff' }); hoverSound.play(); });
        exitButton.on('pointerout', () => { exitButton.setStyle({ color: '#f7f7f7' }); });
        exitButton.on('pointerdown', () => { clickSound.play(); this.scene.start('SimulationsMenuScene'); });

        // Title
        this.add.text(leftPanelWidth / 2, 80, 'Iconography Demo', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '20px',
            color: '#00eaff',
            stroke: '#22223b',
            strokeThickness: 6,
            align: 'center',
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true }
        }).setOrigin(0.5);
        this.add.text(leftPanelWidth / 2, 140, 'A collage of dialog windows featuring our ASCII/unicode icons.', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '16px',
            color: '#f7f7f7',
            wordWrap: { width: leftPanelWidth - 32 }
        }).setOrigin(0.5);

        // --- Right panel: collage of dialog windows ---
        const panelX = leftPanelWidth;
        const dialogData = [
            {
                icon: (scene, x, y) => window.createInfoIcon(scene, x, y),
                text: 'Information: This is a helpful tip!'
            },
            {
                icon: (scene, x, y) => window.createSpeechBubbleIcon(scene, x, y),
                text: 'Message: Welcome to the retro UI demo.'
            },
            {
                icon: (scene, x, y) => window.createQuestionIcon(scene, x, y),
                text: 'Help: Need assistance? Click here!'
            },
            {
                icon: (scene, x, y) => window.createInfoIcon(scene, x, y),
                text: 'Notice: Settings have been updated.'
            },
            {
                icon: (scene, x, y) => window.createSpeechBubbleIcon(scene, x, y),
                text: 'Chat: You have a new message.'
            }
        ];
        const dialogWidth = 420;
        const dialogHeight = 90;
        const startX = panelX + rightPanelWidth / 2 - dialogWidth / 2;
        let y = 120;
        dialogData.forEach((entry, i) => {
            const boxY = y + i * (dialogHeight + 24);
            // Dialog window
            this.add.rectangle(startX + dialogWidth / 2, boxY, dialogWidth, dialogHeight, 0x22223b, 0.98)
                .setStrokeStyle(6, 0x000000)
                .setOrigin(0.5);
            // Icon
            entry.icon(this, startX + 48, boxY);
            // Text
            this.add.text(startX + 90, boxY, entry.text, {
                fontFamily: 'Press Start 2P, monospace',
                fontSize: '16px',
                color: '#f7f7f7',
                wordWrap: { width: dialogWidth - 120 }
            }).setOrigin(0, 0.5);
        });
    }
} 