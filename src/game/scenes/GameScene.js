class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.ship = null;
        this.cursors = null;
        this.boostAvailable = true;
        this.boostCooldown = 0;
    }

    create() {
        // Initialize physics world
        this.matter.world.setBounds(0, 0, 800, 600);
        
        // Create ship
        this.ship = this.matter.add.sprite(400, 300, 'ship', null, {
            frictionAir: 0.05,
            mass: 1,
            restitution: 0.8
        });
        this.ship.setFixedRotation();

        // Set up input
        this.cursors = this.input.keyboard.createCursorKeys();

        // Add UI elements
        this.createUI();

        // Add debug text
        this.debugText = this.add.text(10, 10, '', {
            font: '16px Arial',
            fill: '#ffffff'
        });
    }

    createUI() {
        // Money display
        this.moneyText = this.add.text(10, 40, 'Money: $1,000,000', {
            font: '16px Arial',
            fill: '#ffffff'
        });

        // Boost indicator
        this.boostText = this.add.text(10, 70, 'Boost: Ready', {
            font: '16px Arial',
            fill: '#00ff00'
        });
    }

    update() {
        if (!this.ship) return;

        // Handle ship movement
        this.handleShipMovement();

        // Update boost cooldown
        if (this.boostCooldown > 0) {
            this.boostCooldown -= this.game.loop.delta;
            if (this.boostCooldown <= 0) {
                this.boostAvailable = true;
                this.boostText.setText('Boost: Ready');
                this.boostText.setFill('#00ff00');
            }
        }

        // Update debug text
        this.updateDebugText();
    }

    handleShipMovement() {
        const force = 0.0005;
        const boostForce = 0.002;

        // Regular movement
        if (this.cursors.left.isDown) {
            this.ship.applyForce({ x: -force, y: 0 });
        }
        if (this.cursors.right.isDown) {
            this.ship.applyForce({ x: force, y: 0 });
        }
        if (this.cursors.up.isDown) {
            this.ship.applyForce({ x: 0, y: -force });
        }
        if (this.cursors.down.isDown) {
            this.ship.applyForce({ x: 0, y: force });
        }

        // Boost
        if (this.cursors.space.isDown && this.boostAvailable) {
            const angle = this.ship.rotation;
            const boostX = Math.cos(angle) * boostForce;
            const boostY = Math.sin(angle) * boostForce;
            
            this.ship.applyForce({ x: boostX, y: boostY });
            
            // Start boost cooldown
            this.boostAvailable = false;
            this.boostCooldown = 2000; // 2 seconds
            this.boostText.setText('Boost: Cooldown');
            this.boostText.setFill('#ff0000');
        }
    }

    updateDebugText() {
        const velocity = this.ship.body.velocity;
        this.debugText.setText([
            `Velocity X: ${velocity.x.toFixed(2)}`,
            `Velocity Y: ${velocity.y.toFixed(2)}`,
            `Position X: ${this.ship.x.toFixed(0)}`,
            `Position Y: ${this.ship.y.toFixed(0)}`
        ].join('\n'));
    }
} 