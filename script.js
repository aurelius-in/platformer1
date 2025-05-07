const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
canvas.width = 800;
canvas.height = 400;

const gravity = 0.5;
const jumpForce = 12;
const playerSpeed = 5;

// Player
const player = {
    x: 50,
    y: canvas.height - 50, // Start on the "ground"
    width: 30,
    height: 50,
    color: 'red',
    dx: 0, // Change in x per frame
    dy: 0, // Change in y per frame
    onGround: false,
    jumpCount: 0,
    maxJumps: 2 // Double jump
};

// Platforms
const platforms = [
    { x: 0, y: canvas.height - 20, width: canvas.width, height: 20, color: 'green' }, // Ground
    { x: 150, y: canvas.height - 100, width: 150, height: 20, color: 'saddlebrown' },
    { x: 400, y: canvas.height - 180, width: 200, height: 20, color: 'saddlebrown' },
    { x: 650, y: canvas.height - 100, width: 100, height: 20, color: 'saddlebrown' }
];

// Input handling
const keys = {
    left: false,
    right: false,
    up: false
};

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
    if (e.key === 'ArrowUp') keys.up = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
    if (e.key === 'ArrowUp') keys.up = false;
});

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawPlatforms() {
    platforms.forEach(platform => {
        ctx.fillStyle = platform.color;
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

function updatePlayer() {
    // Horizontal movement
    if (keys.left) {
        player.dx = -playerSpeed;
    } else if (keys.right) {
        player.dx = playerSpeed;
    } else {
        player.dx = 0;
    }
    player.x += player.dx;

    // Apply gravity
    player.dy += gravity;
    player.y += player.dy;
    player.onGround = false; // Assume not on ground until collision check

    // Collision detection with platforms
    platforms.forEach(platform => {
        // Check for collision (Axis-Aligned Bounding Box)
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y
        ) {
            // Collision occurred
            // Check if landing on top of the platform
            // (player's bottom was above platform's top in the previous frame, and is now below or on it)
            // A simpler check: if player's bottom edge is just above or at platform's top edge
            // and horizontal overlap exists.
            if (player.dy > 0 && (player.y + player.height - player.dy) <= platform.y) {
                player.y = platform.y - player.height; // Place player on top of platform
                player.dy = 0;
                player.onGround = true;
                player.jumpCount = 0; // Reset jump count when landing
            }
            // TODO: Add side collision handling if desired
        }
    });

    // Jumping
    if (keys.up && (player.onGround || player.jumpCount < player.maxJumps)) {
        if (player.jumpCount === 0 && !player.onGround) { // Allow first jump mid-air if falling
             // this condition helps if player walks off a ledge
        }
        player.dy = -jumpForce;
        player.onGround = false; // Player is now in the air
        player.jumpCount++;
        keys.up = false; // Prevent continuous jumping if key is held
    }


    // Keep player within canvas bounds (horizontal)
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }

    // If player falls off the bottom (optional: game over or reset)
    if (player.y + player.height > canvas.height + 100) { // A bit below canvas
        // Reset player position (simple reset)
        player.x = 50;
        player.y = canvas.height - 50;
        player.dy = 0;
        player.onGround = false;
        player.jumpCount = 0;
    }
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function gameLoop() {
    clearCanvas();
    drawPlatforms();
    drawPlayer();
    updatePlayer();
    requestAnimationFrame(gameLoop); // Keeps the loop running
}

// Start the game
gameLoop();
