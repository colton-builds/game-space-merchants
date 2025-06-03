// Modular ASCII/Unicode icon creators for retro UI (drawn with text as pixel art)

function createInfoIcon(scene, x, y) {
    // Draw a simple "i" in a box using ASCII characters
    const size = 16;
    const color = '#00eaff';
    const chars = [
        '█████',
        '█   █',
        '█ █ █',
        '█ █ █',
        '█ █ █',
        '█   █',
        '█ █ █',
        '█   █',
        '█████'
    ];
    return drawAsciiIcon(scene, x, y, chars, color);
}

function createSpeechBubbleIcon(scene, x, y) {
    // Draw a simple speech bubble using ASCII characters
    const color = '#ffb300';
    const chars = [
        ' █████ ',
        '█     █',
        '█     █',
        '█     █',
        ' █████ ',
        '   █   ',
        '  █    '
    ];
    return drawAsciiIcon(scene, x, y, chars, color);
}

function createQuestionIcon(scene, x, y) {
    // Draw a simple question mark in a box using ASCII characters
    const color = '#ff3c38';
    const chars = [
        '█████',
        '█   █',
        '  █ █',
        '  █ █',
        ' █  █',
        '   █ ',
        '  █  ',
        '     ',
        '  █  '
    ];
    return drawAsciiIcon(scene, x, y, chars, color);
}

function drawAsciiIcon(scene, x, y, chars, color) {
    const fontSize = 12;
    const pixelSize = fontSize * 0.7;
    const group = scene.add.container(x, y);
    for (let row = 0; row < chars.length; row++) {
        for (let col = 0; col < chars[row].length; col++) {
            if (chars[row][col] !== ' ') {
                group.add(scene.add.text(col * pixelSize, row * pixelSize, '█', {
                    fontFamily: 'Press Start 2P, monospace',
                    fontSize: `${fontSize}px`,
                    color: color,
                    stroke: '#22223b',
                    strokeThickness: 2,
                    align: 'center'
                }));
            }
        }
    }
    group.setSize(chars[0].length * pixelSize, chars.length * pixelSize);
    group.setPosition(x, y);
    group.setDepth(1);
    return group;
}

window.createInfoIcon = createInfoIcon;
window.createSpeechBubbleIcon = createSpeechBubbleIcon;
window.createQuestionIcon = createQuestionIcon; 