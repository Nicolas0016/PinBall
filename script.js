const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const inputSensibilidad = document.getElementById("input-sensibilidad");
const inputVelocidad = document.getElementById("input-velocidad");
const showSettings = document.getElementById("show-settings");
const dontShow = document.getElementById("dont-show");

showSettings.addEventListener("click", () => {
    document.querySelector(".nav-settings").classList.add("show");
});

dontShow.addEventListener("click", () => {
    document.querySelector(".nav-settings").classList.remove("show");
});

canvas.height = 448;
canvas.width = 400;

let keyPressed = {
    keyLeft: false,
    keyRight: false
};

const sprite = document.getElementById("img");

let ballX = canvas.width / 2;
let ballY = canvas.height - 66;
let ballRadius = 5;
let ballDirectionY = 4;
let ballDirectionX = 4;
inputVelocidad.addEventListener("change", e => {
    ballDirectionX = parseInt(e.target.value);
    ballDirectionY = parseInt(e.target.value);
});

let height = 15;
let width = 90;
let paddleX = (canvas.width - width) / 2;
let paddleY = canvas.height - 60;
let paddleDirectionX = 7;
let paddleDirectionY = 7;
inputSensibilidad.addEventListener("change", e => {
    paddleDirectionX = parseInt(e.target.value);
    paddleDirectionY = parseInt(e.target.value);
});

let brickRows = 5;
let brickCols = 8;
let brickWidth = 41;
let brickHeight = 20;
let gap = 5;

function generateBricks(rows, cols, brickWidth, brickHeight, gap) {
    let bricks = [];
    // Calcular el ancho total de los ladrillos y el espacio entre ellos
    let totalBricksWidth = cols * (brickWidth + gap) - gap;
    let totalBricksHeight = rows * (brickHeight + gap) - gap;
    
    // Calcular el desplazamiento horizontal y vertical para centrar los ladrillos
    let left = (canvas.width - totalBricksWidth) / 2;
    let top = (210 - totalBricksHeight) / 2;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let brick = {
                x: left + j * (brickWidth + gap),
                y: top + i * (brickHeight + gap),
                width: brickWidth,
                height: brickHeight,
                color: Math.floor(Math.random() * 8),
                status: 1
            };
            bricks.push(brick);
        }
    }
    return bricks;
}


let bricks = generateBricks(brickRows, brickCols, brickWidth, brickHeight, gap);

function drawBall() {
    context.beginPath();
    context.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    context.fillStyle = "#fff";
    context.fill();
    context.closePath();
}

function moveBall() {
    ballX += ballDirectionX;
    ballY += ballDirectionY;
}

function drawPaddle() {
    context.drawImage(
        sprite,
        0,
        111,
        56,
        9,
        paddleX,
        paddleY,
        width,
        height
    );
}

function drawBrick() {
    for (const brick of bricks) {
        if (brick.status == 1) {
            const clipX = brick.color * 32;
            context.drawImage(
                sprite,
                clipX,
                0,
                16,
                8,
                brick.x,
                brick.y,
                brick.width,
                brick.height
            );
        }
    }
}

function movePaddle() {
    if (keyPressed.keyLeft) {
        paddleX -= paddleDirectionX;
    } else if (keyPressed.keyRight) {
        paddleX += paddleDirectionX;
    }
}

function colition() {
    if (ballX < 0 + ballRadius || ballX > (canvas.width - ballRadius)) {
        ballDirectionX = -ballDirectionX;
    }
    if (ballY < 0) {
        ballDirectionY = -ballDirectionY;
    } else if (ballY > (canvas.height - ballRadius)) {
        ballDirectionY = -ballDirectionY;
    } if(paddleX < 0){
        keyPressed.keyLeft = false
    }else if(paddleX > canvas.width - width){
        keyPressed.keyRight = false
    }
}

function collisionWithPaddle() {
    if (ballY + ballRadius >= paddleY && ballY - ballRadius <= paddleY + height &&
        ballX + ballRadius >= paddleX && ballX - ballRadius <= paddleX + width) {
        
        // Calcular la posición relativa de la pelota respecto al centro del paddle
        let paddleCenterX = paddleX + width / 2;
        let relativeIntersectX = (ballX - paddleCenterX) / (width / 2);
        
        // Calcular el ángulo de rebote basado en la posición relativa
        let bounceAngle = relativeIntersectX * Math.PI / 3;
        
        // Cambiar la dirección de la pelota basada en el ángulo de rebote
        ballDirectionX = ballDirectionY * Math.tan(bounceAngle);
        ballDirectionY = -ballDirectionY;
    }
}

function collisionWithBrick() {
    for (const brick of bricks) {
        if (brick.status === 1) {
            if (ballY - ballRadius <= brick.y + brick.height &&
                ballY + ballRadius >= brick.y &&
                ballX + ballRadius >= brick.x &&
                ballX - ballRadius <= brick.x + brick.width) {
                brick.status = 0;
                ballDirectionY = -ballDirectionY;
            }
        }
    }
}

function checkGameWin() {
    let totalBricks = brickRows * brickCols;
    let destroyedBricks = bricks.filter(brick => brick.status === 0).length;
    if (destroyedBricks === totalBricks) {
        alert("Congratulations! You've won!");
        document.location.reload();
    }
}

// Variable para detectar si se está arrastrando el paddle
let isDragging = false;

// Agregar eventos de arrastrar y soltar al paddle
canvas.addEventListener('mousedown', (e) => {
    // Verificar si el mouse está dentro del paddle
    if (e.clientX > paddleX && e.clientX < paddleX + width && e.clientY > paddleY && e.clientY < paddleY + height) {
        isDragging = true;
    }
});

canvas.addEventListener('mousemove', (e) => {
    // Si se está arrastrando el paddle, actualizar su posición
    if (isDragging) {
        paddleX = e.clientX - width / 2;
        // Limitar la posición del paddle dentro del canvas
        if (paddleX < 0) {
            paddleX = 0;
        }
        if (paddleX > canvas.width - width) {
            paddleX = canvas.width - width;
        }
    }
});

canvas.addEventListener('mouseup', () => {
    // Al soltar el mouse, detener el arrastre del paddle
    isDragging = false;
});

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    clearCanvas();
    drawBall();
    moveBall();
    colition();
    collisionWithPaddle();
    collisionWithBrick();
    checkGameWin();
    drawPaddle();
    drawBrick();
    movePaddle();
    getEventListeners();
    window.requestAnimationFrame(draw);
}

function getEventListeners() {
    window.addEventListener("keydown", (e) => {
        if (e.key == "ArrowRight") {
            keyPressed.keyRight = true;
        } else if (e.key == "ArrowLeft") {
            keyPressed.keyLeft = true;
        }
    });
    window.addEventListener("keyup", (e) => {
        if (e.key == "ArrowRight") {
            keyPressed.keyRight = false;
        } else if (e.key == "ArrowLeft") {
            keyPressed.keyLeft = false;
        }
    });
}

draw();
