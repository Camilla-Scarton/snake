const board = {
  cellSize: 25,
  rows: 20,
  cols: 20,
};

let $board;
let context;

const game = {
  timerID: null,
  teleport: false,
  over: false,
  score: 0,
};

const $scoreDisplay = document.getElementById("score");

const $modeDisplay = document.getElementById("mode");

// game mode setting by buttons
const $btnMode = document.querySelectorAll("button");
// audio for mode click
const modeAudio = new Audio("https://www.fesliyanstudios.com/play-mp3/387");
$btnMode.forEach((btn) =>
  btn.addEventListener("click", () => {
    modeAudio.load();
    modeAudio.play();
    $btnMode[0].classList.toggle("active");
    $btnMode[1].classList.toggle("active");
    $btnMode[0].toggleAttribute("disabled");
    $btnMode[1].toggleAttribute("disabled");
    game.teleport = btn.id == "edges-teleport";
    $modeDisplay.innerHTML = `${
      game.teleport ? "Pass through" : "Don't touch"
    } the edges!`;
  })
);

const snake = {
  x: 0,
  y: 0,
  speedX: 0,
  speedY: 0,
  body: [],
};

// audio for apple eaten
const appleAudio = new Audio("https://www.fesliyanstudios.com/play-mp3/5259");

const apple = {
  x: 0,
  y: 0,
};

// update apple position (avoiding snake body)
function placeApple() {
  let newX = Math.floor(Math.random() * board.cols) * board.cellSize;
  let newY = Math.floor(Math.random() * board.rows) * board.cellSize;
  if (snake.body.length > 1) {
    let green = false;
    snake.body.forEach((piece) => {
      if (piece[0] == newX && piece[1] == newY) green = true;
    });
    if (!green) {
      apple.x = newX;
      apple.y = newY;
    } else {
      placeApple();
    }
  } else {
    apple.x = newX;
    apple.y = newY;
  }
}

// change snake direction (avoiding turning back)
function changeDirection(evt) {
  if (evt.code == "ArrowUp" && snake.speedY != 1) {
    snake.speedX = 0;
    snake.speedY = -1;
  } else if (evt.code == "ArrowDown" && snake.speedY != -1) {
    snake.speedX = 0;
    snake.speedY = 1;
  } else if (evt.code == "ArrowLeft" && snake.speedX != 1) {
    snake.speedX = -1;
    snake.speedY = 0;
  } else if (evt.code == "ArrowRight" && snake.speedX != -1) {
    snake.speedX = 1;
    snake.speedY = 0;
  }
}

window.onload = start();

function start() {
  // board creation
  $board = document.getElementById("board");
  $board.height = board.rows * board.cellSize;
  $board.width = board.cols * board.cellSize;
  context = $board.getContext("2d");
  snake.x = board.cellSize * 5;
  snake.y = board.cellSize * 5;
  placeApple();
  document.addEventListener("keyup", changeDirection);
  game.timerID = setInterval(update, 1000 / 4);
}

function update() {
  if (!game.teleport) {
    // without teleport, edge limit for game over
    if (
      snake.x < 0 ||
      snake.x > board.cols * board.cellSize ||
      snake.y < 0 ||
      snake.y > board.rows * board.cellSize
    ) {
      game.over = true;
    }
  } else {
    if (snake.y < 0 && snake.speedY == -1) {
      snake.y = board.rows * board.cellSize;
    } else if (snake.y > board.rows * board.cellSize && snake.speedY == 1) {
      snake.y = 0;
    } else if (snake.x < 0 && snake.speedX == -1) {
      snake.x = board.cols * board.cellSize;
    } else if (snake.x > board.cols * board.cellSize && snake.speedX == 1) {
      snake.x = 0;
    }
  }

  // snake can't pass over itself
  for (let i = 0; i < snake.body.length; i++) {
    if (snake.x == snake.body[i][0] && snake.y == snake.body[i][1]) {
      game.over = true;
    }
  }

  if (game.over) {
    context.fillStyle = "black";
    context.fillRect(0, 0, $board.width, $board.height);
    clearInterval(game.timerID);
    if (!alert("Game over!")) {
      game.over = false;
      snake.speedX = 0;
      snake.speedY = 0;
      snake.body = [];
      game.score = 0;
      $scoreDisplay.innerHTML = 0;
      start();
    }
  }

  // board creation
  context.fillStyle = "black";
  context.fillRect(0, 0, $board.width, $board.height);

  // apple creation
  context.fillStyle = "red";
  context.fillRect(apple.x, apple.y, board.cellSize, board.cellSize);

  // snake eats apple
  if (snake.x == apple.x && snake.y == apple.y) {
    snake.body.push([apple.x, apple.y]);
    game.score++;
    appleAudio.load();
    appleAudio.play();
    $scoreDisplay.innerHTML = game.score;
    placeApple();
  }

  // body movement
  for (let i = snake.body.length - 1; i > 0; i--) {
    // last piece moves (based on previous piece position), second-last moves (based on previous piece position)...
    snake.body[i] = snake.body[i - 1];
    // snake head is NOT updated yet
  }

  // snake head updated
  if (snake.body.length) {
    snake.body[0] = [snake.x, snake.y];
  }

  // snake head colored
  context.fillStyle = "lime";
  snake.x += snake.speedX * board.cellSize;
  snake.y += snake.speedY * board.cellSize;
  context.fillRect(snake.x, snake.y, board.cellSize, board.cellSize);

  // snake body colored
  for (let i = 0; i < snake.body.length; i++) {
    context.fillRect(
      snake.body[i][0],
      snake.body[i][1],
      board.cellSize,
      board.cellSize
    );
  }
}
