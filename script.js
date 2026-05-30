// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddle = {
    width: 10,
    height: 80,
    x: 20,
    y: canvas.height / 2 - 40,
    dy: 0,
    speed: 6,
    mouseY: 0
};

const computerPaddle = {
    width: 10,
    height: 80,
    x: canvas.width - 30,
    y: canvas.height / 2 - 40,
    speed: 4.5
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 5,
    dy: 5,
    speed: 5
};

let playerScore = 0;
let computerScore = 0;
let gameActive = false;

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        gameActive = !gameActive;
        if (gameActive) {
            resetBall();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    paddle.mouseY = e.clientY - rect.top;
});

// Game functions
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed * 2;
}

function updatePaddle() {
    // Mouse control
    if (paddle.mouseY > 0 && paddle.mouseY < canvas.height) {
        paddle.y = paddle.mouseY - paddle.height / 2;
    }
    
    // Arrow key control
    if (keys['arrowup'] && paddle.y > 0) {
        paddle.y -= paddle.speed;
    }
    if (keys['arrowdown'] && paddle.y < canvas.height - paddle.height) {
        paddle.y += paddle.speed;
    }
    
    // Keep paddle in bounds
    if (paddle.y < 0) paddle.y = 0;
    if (paddle.y > canvas.height - paddle.height) {
        paddle.y = canvas.height - paddle.height;
    }
}

function updateComputerPaddle() {
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const distance = ball.y - computerCenter;
    const deadzone = 35;
    
    if (distance > deadzone) {
        computerPaddle.y += computerPaddle.speed;
    } else if (distance < -deadzone) {
        computerPaddle.y -= computerPaddle.speed;
    }
    
    // Keep paddle in bounds
    if (computerPaddle.y < 0) computerPaddle.y = 0;
    if (computerPaddle.y > canvas.height - computerPaddle.height) {
        computerPaddle.y = canvas.height - computerPaddle.height;
    }
}

function updateBall() {
    if (!gameActive) return;
    
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        // Clamp position to prevent getting stuck
        if (ball.y - ball.radius < 0) ball.y = ball.radius;
        if (ball.y + ball.radius > canvas.height) ball.y = canvas.height - ball.radius;
    }
    
    // Collision with paddles
    if (
        ball.x - ball.radius < paddle.x + paddle.width &&
        ball.y > paddle.y &&
        ball.y < paddle.y + paddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = paddle.x + paddle.width + ball.radius;
        
        // Add angle based on where ball hits paddle
        const hitPos = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
        ball.dy = hitPos * ball.speed * 1.5;
    }
    
    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computerPaddle.x - ball.radius;
        
        // Add angle based on where ball hits paddle
        const hitPos = (ball.y - (computerPaddle.y + computerPaddle.height / 2)) / (computerPaddle.height / 2);
        ball.dy = hitPos * ball.speed * 1.5;
    }
    
    // Scoring
    if (ball.x - ball.radius < 0) {
        computerScore++;
        updateScoreboard();
        resetBall();
    }
    
    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        updateScoreboard();
        resetBall();
    }
}

function updateScoreboard() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

function drawPaddle(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGameStatus() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    
    if (!gameActive) {
        ctx.font = 'bold 28px Arial';
        ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2);
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw elements
    drawCenterLine();
    drawPaddle(paddle.x, paddle.y, paddle.width, paddle.height, '#00ff88');
    drawPaddle(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height, '#ff006e');
    drawBall();
    drawGameStatus();
}

function update() {
    updatePaddle();
    updateComputerPaddle();
    updateBall();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();