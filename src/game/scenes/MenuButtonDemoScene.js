class MenuButtonDemoScene extends Phaser.Scene {
    constructor() {
        super('MenuButtonDemoScene');
    }

    // Modular ASCII/Unicode icon creators
    createInfoIcon(x, y) {
        // Example: info icon using 'ⓘ' unicode
        return this.add.text(x, y, 'ⓘ', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '22px',
            color: '#00eaff',
            stroke: '#22223b',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
    }
    createSpeechBubbleIcon(x, y) {
        // Example: speech bubble using unicode
        return this.add.text(x, y, '💬', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '22px',
            color: '#ffb300',
            stroke: '#22223b',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
    }
    createQuestionIcon(x, y) {
        // Example: question mark in a box
        return this.add.text(x, y, '[?]', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '22px',
            color: '#ff3c38',
            stroke: '#22223b',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
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

        // Title with info icon
        this.createInfoIcon(leftPanelWidth / 2 - 60, 80);
        this.add.text(leftPanelWidth / 2, 80, 'UI Elements Demo', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '20px',
            color: '#00eaff',
            stroke: '#22223b',
            strokeThickness: 6,
            align: 'center',
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true }
        }).setOrigin(0.5);

        // Description
        this.add.text(leftPanelWidth / 2, 140, 'Demonstrates retro UI elements: button, slider, dropdown, toggles, dialog.', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '16px',
            color: '#f7f7f7',
            wordWrap: { width: leftPanelWidth - 32 }
        }).setOrigin(0.5);

        // CTA with question icon
        this.createQuestionIcon(leftPanelWidth / 2 - 60, 200);
        this.add.text(leftPanelWidth / 2, 200, 'Interact with the elements on the right.', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '16px',
            color: '#ffb300',
            wordWrap: { width: leftPanelWidth - 32 }
        }).setOrigin(0.5);

        // Exit button (top left of left panel)
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

        // Sounds
        const hoverSound = this.sound.add('buttonover');
        const clickSound = this.sound.add('buttonclick');
        const sliderSound = this.sound.add('click_low');

        exitButton.on('pointerover', () => { exitButton.setStyle({ color: '#00eaff' }); hoverSound.play(); });
        exitButton.on('pointerout', () => { exitButton.setStyle({ color: '#f7f7f7' }); });
        exitButton.on('pointerdown', () => { clickSound.play(); this.scene.start('SimulationsMenuScene'); });

        // --- Right panel UI elements ---
        const panelX = leftPanelWidth + rightPanelWidth / 2;
        let y = 140;

        // Demo button with speech bubble icon
        this.createSpeechBubbleIcon(panelX - 180, y);
        const demoButton = this.add.text(panelX, y, 'RETRO BUTTON', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '28px',
            color: '#f7f7f7',
            backgroundColor: '#22223b',
            padding: { left: 48, right: 48, top: 24, bottom: 24 },
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center',
            shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true }
        }).setOrigin(0.5).setInteractive();
        demoButton.on('pointerover', () => { demoButton.setStyle({ color: '#ff3c38' }); hoverSound.play(); });
        demoButton.on('pointerout', () => { demoButton.setStyle({ color: '#f7f7f7' }); });
        demoButton.on('pointerdown', () => { clickSound.play(); updateDialog('Button clicked!'); });

        y += 120;

        // Slider
        const sliderLabel = this.add.text(panelX - 180, y, 'SLIDER:', {
            fontFamily: 'Press Start 2P, monospace', fontSize: '18px', color: '#f7f7f7', align: 'right'
        }).setOrigin(1, 0.5);
        const sliderX = panelX - 120;
        const sliderY = y;
        const sliderWidth = 200;
        const sliderHeight = 16;
        const sliderBar = this.add.rectangle(sliderX, sliderY, sliderWidth, sliderHeight, 0x00eaff).setOrigin(0, 0.5);
        const sliderHandle = this.add.rectangle(sliderX, sliderY, 20, 36, 0xffb300).setOrigin(0.5).setInteractive({ draggable: true });
        let sliderValue = 0.5;
        let lastSliderStep = Math.round(sliderValue * 10);
        const sliderValueText = this.add.text(panelX + 100, y, '50%', {
            fontFamily: 'Press Start 2P, monospace', fontSize: '18px', color: '#f7f7f7', align: 'left'
        }).setOrigin(0, 0.5);
        sliderHandle.on('drag', (pointer, dragX) => {
            const minX = sliderX;
            const maxX = sliderX + sliderWidth;
            let newX = Phaser.Math.Clamp(dragX, minX, maxX);
            sliderHandle.x = newX;
            let percent = Math.round(((newX - minX) / sliderWidth) * 10) / 10;
            let newValue = Phaser.Math.Clamp(percent, 0, 1);
            sliderValue = newValue;
            sliderValueText.setText(`${Math.round(sliderValue * 100)}%`);
            if (Math.round(sliderValue * 10) !== lastSliderStep) {
                sliderSound.play();
                lastSliderStep = Math.round(sliderValue * 10);
                updateDialog(`Slider set to ${Math.round(sliderValue * 100)}%`);
            }
        });

        y += 100;

        // Dropdown
        const dropdownLabel = this.add.text(panelX - 180, y, 'DROPDOWN:', {
            fontFamily: 'Press Start 2P, monospace', fontSize: '18px', color: '#f7f7f7', align: 'right'
        }).setOrigin(1, 0.5);
        const dropdownOptions = ['Option 1', 'Option 2', 'Option 3'];
        let dropdownValue = dropdownOptions[0];
        const dropdownButton = this.add.text(panelX - 80, y, dropdownValue, {
            fontFamily: 'Press Start 2P, monospace', fontSize: '20px', color: '#f7f7f7', backgroundColor: '#22223b', padding: { left: 16, right: 16, top: 8, bottom: 8 }, stroke: '#000000', strokeThickness: 5, align: 'center'
        }).setOrigin(0, 0.5).setInteractive();
        let dropdownOpen = false;
        let dropdownItems = [];
        dropdownButton.on('pointerdown', () => {
            clickSound.play();
            if (!dropdownOpen) {
                dropdownItems = dropdownOptions.map((opt, i) => {
                    const item = this.add.text(panelX - 80, y + 40 + i * 40, opt, {
                        fontFamily: 'Press Start 2P, monospace', fontSize: '20px', color: '#f7f7f7', backgroundColor: '#22223b', padding: { left: 16, right: 16, top: 8, bottom: 8 }, stroke: '#000000', strokeThickness: 5, align: 'center'
                    }).setOrigin(0, 0.5).setInteractive();
                    item.on('pointerover', () => { item.setStyle({ color: '#ff3c38' }); hoverSound.play(); });
                    item.on('pointerout', () => { item.setStyle({ color: '#f7f7f7' }); });
                    item.on('pointerdown', () => {
                        clickSound.play();
                        dropdownValue = opt;
                        dropdownButton.setText(opt);
                        updateDialog(`Dropdown set to ${opt}`);
                        dropdownItems.forEach(d => d.destroy());
                        dropdownOpen = false;
                    });
                    return item;
                });
                dropdownOpen = true;
            } else {
                dropdownItems.forEach(d => d.destroy());
                dropdownOpen = false;
            }
        });

        y += 100;

        // Up/Down toggle buttons
        const toggleLabel = this.add.text(panelX - 180, y, 'VALUE:', {
            fontFamily: 'Press Start 2P, monospace', fontSize: '18px', color: '#f7f7f7', align: 'right'
        }).setOrigin(1, 0.5);
        let toggleValue = 0;
        const valueText = this.add.text(panelX - 60, y, `${toggleValue}`, {
            fontFamily: 'Press Start 2P, monospace', fontSize: '20px', color: '#f7f7f7', backgroundColor: '#22223b', padding: { left: 12, right: 12, top: 6, bottom: 6 }, stroke: '#000000', strokeThickness: 4, align: 'center'
        }).setOrigin(0, 0.5);
        const upButton = this.add.text(panelX + 20, y, '▲', {
            fontFamily: 'Press Start 2P, monospace', fontSize: '22px', color: '#00eaff', backgroundColor: '#22223b', padding: { left: 10, right: 10, top: 4, bottom: 4 }, stroke: '#000000', strokeThickness: 3, align: 'center'
        }).setOrigin(0, 0.5).setInteractive();
        const downButton = this.add.text(panelX + 60, y, '▼', {
            fontFamily: 'Press Start 2P, monospace', fontSize: '22px', color: '#ff3c38', backgroundColor: '#22223b', padding: { left: 10, right: 10, top: 4, bottom: 4 }, stroke: '#000000', strokeThickness: 3, align: 'center'
        }).setOrigin(0, 0.5).setInteractive();
        upButton.on('pointerover', () => { upButton.setStyle({ color: '#ffb300' }); hoverSound.play(); });
        upButton.on('pointerout', () => { upButton.setStyle({ color: '#00eaff' }); });
        upButton.on('pointerdown', () => { clickSound.play(); toggleValue++; valueText.setText(`${toggleValue}`); updateDialog(`Value increased to ${toggleValue}`); });
        downButton.on('pointerover', () => { downButton.setStyle({ color: '#00eaff' }); hoverSound.play(); });
        downButton.on('pointerout', () => { downButton.setStyle({ color: '#ff3c38' }); });
        downButton.on('pointerdown', () => { clickSound.play(); toggleValue--; valueText.setText(`${toggleValue}`); updateDialog(`Value decreased to ${toggleValue}`); });

        // Dialog window
        const dialogX = panelX;
        const dialogY = height - 120;
        const dialogWidth = 480;
        const dialogHeight = 100;
        const dialogBg = this.add.rectangle(dialogX, dialogY, dialogWidth, dialogHeight, 0x22223b, 0.98)
            .setStrokeStyle(6, 0x000000)
            .setOrigin(0.5);
        const dialogText = this.add.text(dialogX, dialogY, 'Interact with any element to see updates here.', {
            fontFamily: 'Press Start 2P, monospace', fontSize: '18px', color: '#f7f7f7', align: 'center', wordWrap: { width: dialogWidth - 32 }
        }).setOrigin(0.5);

        function updateDialog(msg) {
            dialogText.setText(msg);
        }
    }
} 