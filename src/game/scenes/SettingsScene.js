class SettingsScene extends Phaser.Scene {
    constructor() {
        super('SettingsScene');
    }

    create() {
        // Panel background
        const panel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 480, 340, 0x22223b, 0.95)
            .setStrokeStyle(4, 0x00eaff)
            .setOrigin(0.5);

        // Scanline overlay (optional, for retro effect)
        // ... (could be implemented with a tileSprite or image overlay)

        // Title
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 130, 'SETTINGS', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '20px',
            color: '#ffb300',
            stroke: '#000',
            strokeThickness: 4,
            align: 'center',
            shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 0, fill: true }
        }).setOrigin(0.5);

        // Volume label
        this.add.text(this.scale.width / 2 - 140, this.scale.height / 2 - 40, 'VOLUME', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '14px',
            color: '#f7f7f7',
            align: 'left'
        }).setOrigin(0, 0.5);

        // Volume slider (pixel bar style)
        const sliderX = this.scale.width / 2 - 40;
        const sliderY = this.scale.height / 2 - 40;
        const sliderWidth = 180;
        const sliderHeight = 12;
        const sliderBar = this.add.rectangle(sliderX, sliderY, sliderWidth, sliderHeight, 0x00eaff).setOrigin(0, 0.5);
        const sliderHandle = this.add.rectangle(sliderX, sliderY, 16, 28, 0xffb300).setOrigin(0.5);
        let volume = this.sound.volume; // Phaser global volume (0-1)
        let isDragging = false;

        // Volume value text
        const volumeText = this.add.text(this.scale.width / 2 + 110, sliderY, `VOL: ${Math.round(volume * 100)}%`, {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '14px',
            color: '#f7f7f7',
            align: 'left'
        }).setOrigin(0, 0.5);

        // Mute/unmute button (pixel art icon placeholder)
        const muteButton = this.add.text(this.scale.width / 2 + 70, sliderY + 40, '[MUTE]', {
            fontFamily: 'Press Start 2P, monospace',
            fontSize: '14px',
            color: '#ff3c38',
            backgroundColor: '#22223b',
            padding: { left: 8, right: 8, top: 4, bottom: 4 },
            stroke: '#00eaff',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5).setInteractive();

        // Back button
        const backButton = this.add.text(this.scale.width / 2, this.scale.height / 2 + 110, 'BACK', {
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

        // Sounds
        const sliderSound = this.sound.add('click_low');
        const hoverSound = this.sound.add('buttonover');
        const clickSound = this.sound.add('buttonclick');

        // Slider drag logic
        sliderHandle.setInteractive({ draggable: true });
        sliderHandle.on('dragstart', () => { isDragging = true; });
        sliderHandle.on('drag', (pointer, dragX) => {
            // Clamp handle within slider bar
            const minX = sliderX;
            const maxX = sliderX + sliderWidth;
            let newX = Phaser.Math.Clamp(dragX, minX, maxX);
            sliderHandle.x = newX;
            // Snap to 10% increments (pixel style)
            let percent = Math.round(((newX - minX) / sliderWidth) * 10) / 10;
            let newVolume = Phaser.Math.Clamp(percent, 0, 1);
            if (Math.abs(newVolume - volume) >= 0.1) {
                sliderSound.play();
            }
            volume = newVolume;
            this.sound.volume = volume;
            volumeText.setText(`VOL: ${Math.round(volume * 100)}%`);
        });
        sliderHandle.on('dragend', () => { isDragging = false; });

        // Mute/unmute logic
        muteButton.on('pointerover', () => { muteButton.setStyle({ color: '#00eaff' }); hoverSound.play(); });
        muteButton.on('pointerout', () => { muteButton.setStyle({ color: '#ff3c38' }); });
        muteButton.on('pointerdown', () => {
            clickSound.play();
            if (this.sound.mute) {
                this.sound.mute = false;
                muteButton.setText('[MUTE]');
            } else {
                this.sound.mute = true;
                muteButton.setText('[UNMUTE]');
            }
        });

        // Back button logic
        backButton.on('pointerover', () => { backButton.setStyle({ color: '#00eaff' }); hoverSound.play(); });
        backButton.on('pointerout', () => { backButton.setStyle({ color: '#f7f7f7' }); });
        backButton.on('pointerdown', () => { clickSound.play(); this.scene.start('MainMenuScene'); });
    }
} 