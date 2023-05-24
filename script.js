// constants dimensions
const cellSize = 25;
const rows = 20;
const cols = 20;

let $board;

let context;

// snake head start position
let snakeX = cellSize * 5;
let snakeY = cellSize * 5;

// snake speed
let speedX = 0;
let speedY = 0;

// apple start position
let appleX;
let appleY;

let snakeBody = [];

let gameOver = false;

function placeApple() {
  appleX = Math.floor(Math.random() * cols) * cellSize;
  appleY = Math.floor(Math.random() * rows) * cellSize;
}

function changeDirection(evt) {
  if (evt.code == "ArrowUp" && speedY != 1) {
    speedX = 0;
    speedY = -1;
  } else if (evt.code == "ArrowDown" && speedY != -1) {
    speedX = 0;
    speedY = 1;
  } else if (evt.code == "ArrowLeft" && speedX != 1) {
    speedX = -1;
    speedY = 0;
  } else if (evt.code == "ArrowRight" && speedX != -1) {
    speedX = 1;
    speedY = 0;
  }
}

let timerID;

window.onload = function () {
  // board creation
  $board = document.getElementById("board");
  $board.height = rows * cellSize;
  $board.width = cols * cellSize;
  context = $board.getContext("2d");
  placeApple();
  document.addEventListener("keyup", changeDirection);
  timerID = setInterval(update, 1000 / 10);
};

function update() {
    if (gameOver) {
        clearInterval(timerID);
        return;
    }

  // board creation
  context.fillStyle = "black";
  context.fillRect(0, 0, $board.width, $board.height);

  // snake head creation
  context.fillStyle = "red";
  context.fillRect(appleX, appleY, cellSize, cellSize);

  if (snakeX == appleX && snakeY == appleY) {
    snakeBody.push([appleX, appleY]);
    placeApple();
  }

  for (let i = snakeBody.length - 1; i > 0; i--) {
    // last piece moves (based on previous piece position), second-last moves (based on previous piece position), ... , third piece moves (based on second piece position), second pieces moves (based on snake head position)
    snakeBody[i] = snakeBody[i - 1];
    // snake head is NOT updated yet
  }

  if (snakeBody.length) {
    // snake head updated
    snakeBody[0] = [snakeX, snakeY];
  }

  // snake head creation
  context.fillStyle = "lime";
  snakeX += speedX * cellSize;
  snakeY += speedY * cellSize;
  context.fillRect(snakeX, snakeY, cellSize, cellSize);

  for (let i = 0; i < snakeBody.length; i++) {
    context.fillRect(snakeBody[i][0], snakeBody[i][1], cellSize, cellSize);
  }


  // wall limit for game over
  if (snakeX < 0 || snakeX > cols*cellSize || snakeY < 0 || snakeY > rows*cellSize) {
    gameOver = true;
    context.fillStyle = "black";
    context.fillRect(0, 0, $board.width, $board.height);
    alert("Game over!");
  }

  for (let i = 0; i < snakeBody.length; i++) {
if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {
    gameOver = true;
context.fillStyle = "black";
  context.fillRect(0, 0, $board.width, $board.height);
    alert("Game over!");
}
  }
}
