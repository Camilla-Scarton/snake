const board = {
  cellSize: 25,
  rows: 20,
  cols: 20,
};

let $board;
let context;

const game = {
  timerID: null,
  snakeSpeed: 1, 
  teleport: false,
  fruits: 1, // 1 for apples | 2 for apples + blueberries
  over: false,
  score: 0,
  apple: 0,
  blueberry: 0,
};

const $scoreDisplay = document.getElementById("score");
const $speedDisplay = document.getElementById("speed");
const $appleDisplay = document.getElementById("apple-count");
const $blueberryDisplay = document.getElementById("blueberry-count");

const $blueberrySpan = document.querySelector("span.no-blueberry");

const $modeDisplay = document.getElementById("mode");

// game mode setting by buttons
const $btnMode = document.querySelectorAll("button.mode");
// audio for mode click
const modeAudio = new Audio("https://www.fesliyanstudios.com/play-mp3/387");
$btnMode.forEach((btn) =>
  btn.addEventListener("click", () => {
    modeAudio.load();
    modeAudio.play();

    if (btn.id === "edges-mode") {
      game.teleport = !game.teleport;
      btn.innerHTML = `${game.teleport ? "Tunnel edges" : "Dangerous edges"}`;
    }

    if (btn.id === "fruits-mode") {
      game.fruits = game.fruits === 1 ? 2 : 1;
      btn.innerHTML = `${game.fruits === 1 ? "Just apples" : "With blueberries"}`;
      $blueberrySpan.classList.toggle("no-blueberry");
    }

    $modeDisplay.innerHTML = `<span class="bold">${
      game.teleport ? "Pass through" : "Don't touch"
    }</span> the edges to eat ${game.fruits === 2 ? `<span class="red bold">apples</span> and <span class="blue bold">blueberries</span>` : `all the <span class="red bold">apples</span>`}!`;
  })
);

const $btnSpeed = document.getElementById("speed-plus");
$btnSpeed.addEventListener("click", () => {
  if (game.snakeSpeed == 5) {
    game.snakeSpeed = 1;
  } else {
    game.snakeSpeed++;
  }
  $speedDisplay.innerHTML = game.snakeSpeed;
})

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

// audio for blueberry eaten
const blueberryAudio = new Audio("https://www.fesliyanstudios.com/play-mp3/5255");

const blueberry = {
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

// update blueberry position (avoiding snake body)
function placeBlueberry() {
  let newX = Math.floor(Math.random() * board.cols) * board.cellSize;
  let newY = Math.floor(Math.random() * board.rows) * board.cellSize;
  if (snake.body.length > 1) {
    let green = false;
    snake.body.forEach((piece) => {
      if (piece[0] == newX && piece[1] == newY) green = true;
    });
    if (!green) {
      blueberry.x = newX;
      blueberry.y = newY;
    } else {
      placeBlueberry();
    }
  } else {
    blueberry.x = newX;
    blueberry.y = newY;
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

const $startBtn = document.getElementById("start");

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
  placeBlueberry();
  document.addEventListener("keyup", changeDirection);
  $startBtn.addEventListener("click", () => {
    game.timerID = setInterval(update, 1000 / (game.snakeSpeed + 2));
  })
}

function update() {
  console.log("eeeehiiii")
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
    if (!alert(`Game over! Your score is ${game.score}!`)) {
      game.over = false;
      snake.speedX = 0;
      snake.speedY = 0;
      snake.body = [];
      game.score = 0;
      game.apple = 0;
      game.blueberry = 0;
      game.snakeSpeed = 1;
      $scoreDisplay.innerHTML = 0;
      $appleDisplay.innerHTML = 0;
      $blueberryDisplay.innerHTML = 0;
      $speedDisplay.innerHTML = 1;
      start();
    }
  }

  // board creation
  context.fillStyle = "black";
  context.fillRect(0, 0, $board.width, $board.height);

  // apple creation
  context.fillStyle = "red";
  context.fillRect(apple.x, apple.y, board.cellSize, board.cellSize);

  // blueberry creation
  context.fillStyle = "blue";
  context.fillRect(blueberry.x, blueberry.y, board.cellSize, board.cellSize);

  // snake eats apple
  if (snake.x == apple.x && snake.y == apple.y) {
    context.fillStyle = "black";
    context.fillRect(apple.x, apple.y, board.cellSize, board.cellSize);
    snake.body.push([apple.x, apple.y]);
    game.apple++;
    game.score += 5;
    appleAudio.load();
    appleAudio.play();
    $appleDisplay.innerHTML = game.apple;
    placeApple();
  }

  // snake eats blueberry
  if (snake.x == blueberry.x && snake.y == blueberry.y) {
    context.fillStyle = "black";
    context.fillRect(blueberry.x, blueberry.y, board.cellSize, board.cellSize);
    game.blueberry++;
    game.score -= game.score > 0 ? 1 : 0;
    snake.body.pop();
    blueberryAudio.load();
    blueberryAudio.play();
    $blueberryDisplay.innerHTML = game.blueberry;
    placeBlueberry();
  }

  $scoreDisplay.innerHTML = game.score;

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
