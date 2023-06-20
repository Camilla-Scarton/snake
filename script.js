/**
 * INITIAL STATE & CONSTANTS
 */

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
  pause: false,
  record: 0,
};

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
const blueberryAudio = new Audio(
  "https://www.fesliyanstudios.com/play-mp3/5255"
);

const blueberry = {
  x: 0,
  y: 0,
};



/**
 * DOM
 */

// To display choices or numbers
const $scoreDisplay = document.getElementById("score");
const $speedDisplay = document.getElementById("speed");
const $appleDisplay = document.getElementById("apple-count");
const $blueberryDisplay = document.getElementById("blueberry-count");
const $modeDisplay = document.getElementById("mode");
const $blueberrySpan = document.querySelector("span.no-blueberry");
const $recordDisplay = document.getElementById("record");

// Buttons
const $modeBtns = document.querySelectorAll("button.mode"); // game mode buttons
const $speedBtn = document.getElementById("speed-plus");
const $startBtn = document.getElementById("start");
const $pauseBtn = document.getElementById("pause");
const $resetBtn = document.getElementById("reset");
const $favBtn = document.getElementById("fav");



/**
 * EVENT LISTENERS
 */

$modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.id === "edges-mode") {
      game.teleport = !game.teleport;
      btn.innerHTML = `${game.teleport ? "Tunnel edges" : "Dangerous edges"}`;
    }

    if (btn.id === "fruits-mode") {
      game.fruits = game.fruits === 1 ? 2 : 1;
      btn.innerHTML = `${
        game.fruits === 1 ? "Just apples" : "With blueberries"
      }`;
      $blueberrySpan.classList.toggle("no-blueberry");
    }

    $modeDisplay.innerHTML = `<span class="bold">${
      game.teleport ? "Pass through" : "Don't touch"
    }</span> the <span class="bold">edges</span> to eat ${
      game.fruits === 2
        ? `<span class="red bold">apples</span> and <span class="blue bold">blueberries</span>`
        : `all the <span class="red bold">apples</span>`
    }!`;
  })
});

$speedBtn.addEventListener("click", () => {
  if (game.snakeSpeed == 5) {
    game.snakeSpeed = 1;
  } else {
    game.snakeSpeed++;
  }
  $speedDisplay.innerHTML = game.snakeSpeed;
});

$startBtn.addEventListener("click", () => {
  $startBtn.classList.add("active");
  $pauseBtn.classList.remove("active");
  $resetBtn.classList.remove("active");

  $pauseBtn.removeAttribute("disabled");

  if (game.pause) {
    game.timerID = setInterval(update, 1000 / (game.snakeSpeed + 2));
    game.pause = false;
    return;
  }

  $startBtn.setAttribute("disabled", "");
  $speedBtn.setAttribute("disabled", "");
  $modeBtns.forEach((btn) => {
    btn.setAttribute("disabled", "");
  });
  snake.x = board.cellSize * 5;
  snake.y = board.cellSize * 5;
  placeFruit(apple);
  if (game.fruits === 1) {
    context.fillStyle = "black";
    context.fillRect(blueberry.x, blueberry.y, board.cellSize, board.cellSize);
  } else {
    placeFruit(blueberry);
  }
  game.timerID = setInterval(update, 1000 / (game.snakeSpeed + 2));
});

$pauseBtn.addEventListener("click", () => {
  $pauseBtn.classList.add("active")
  $startBtn.classList.remove("active");
  $resetBtn.classList.remove("active");
  if (game.timerID) {
    clearInterval(game.timerID);
    game.pause = true;
    $startBtn.removeAttribute("disabled");
  }
});

$resetBtn.addEventListener("click", () => {
  $resetBtn.classList.add("active");
  $pauseBtn.classList.remove("active")
  $startBtn.classList.remove("active");
  context.fillStyle = "black";
  context.fillRect(0, 0, $board.width, $board.height);
  reset();
});

$favBtn.addEventListener("click", () => {
  game.teleport = true;
  game.fruits = 2;

  $modeDisplay.innerHTML = `<span class="bold">${
    game.teleport ? "Pass through" : "Don't touch"
  }</span> the <span class="bold">edges</span> to eat ${
    game.fruits === 2
      ? `<span class="red bold">apples</span> and <span class="blue bold">blueberries</span>`
      : `all the <span class="red bold">apples</span>`
  }!`;

  $modeBtns.forEach((btn) => {
    if (btn.id === "edges-mode") {
      btn.innerHTML = "Tunnel edges";
    }

    if (btn.id === "fruits-mode") {
      btn.innerHTML = "With blueberries";
      if ($blueberrySpan.classList.contains("no-blueberry"))
        $blueberrySpan.classList.remove("no-blueberry");
    }
  });

  game.snakeSpeed = 3;
  $speedDisplay.innerHTML = 3;
})



/**
 * GAME FUNCTIONS
 */

// place fruit (avoiding snake head and snake body)
function placeFruit(fruit) {
  let newX = Math.floor(Math.random() * board.cols) * board.cellSize;
  let newY = Math.floor(Math.random() * board.rows) * board.cellSize;
  if (snake.x === newX && snake.y === newY) {
    placeFruit(fruit);
  } else if (snake.body.length > 1) {
    let green = false;
    snake.body.forEach((piece) => {
      if (piece[0] === newX && piece[1] === newY) green = true;
    });
    if (!green) {
      fruit.x = newX;
      fruit.y = newY;
      return;
    } else {
      placeFruit(fruit);
    }
  } else {
    fruit.x = newX;
    fruit.y = newY;
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

function reset() {
  clearInterval(game.timerID);

  snake.speedX = 0;
  snake.speedY = 0;
  snake.body = [];

  game.timerID = null;
  game.teleport = false;
  game.score = 0;
  game.apple = 0;
  game.blueberry = 0;
  game.snakeSpeed = 1;
  game.fruits = 1;
  game.pause = false;
  game.over = false;

  $scoreDisplay.innerHTML = 0;
  $appleDisplay.innerHTML = 0;
  $blueberryDisplay.innerHTML = 0;
  $speedDisplay.innerHTML = 1;

  $modeDisplay.innerHTML = `<span class="bold">${
    game.teleport ? "Pass through" : "Don't touch"
  }</span> the <span class="bold">edges</span> to eat ${
    game.fruits === 2
      ? `<span class="red bold">apples</span> and <span class="blue bold">blueberries</span>`
      : `all the <span class="red bold">apples</span>`
  }!`;

  $modeBtns.forEach((btn) => {
    if (btn.id === "edges-mode") {
      btn.innerHTML = "Dangerous edges";
    }

    if (btn.id === "fruits-mode") {
      btn.innerHTML = "Just apples";
      if (!$blueberrySpan.classList.contains("no-blueberry"))
        $blueberrySpan.classList.add("no-blueberry");
    }
  });

  $speedBtn.removeAttribute("disabled");
  $modeBtns.forEach((btn) => {
    btn.removeAttribute("disabled");
  });
  $startBtn.removeAttribute("disabled");

  $startBtn.classList.remove("active");
  $pauseBtn.classList.remove("active");
  $resetBtn.classList.remove("active");
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
    if (snake.y == 0 && snake.speedY == -1) {
      snake.y = board.rows * board.cellSize;
    } else if (snake.y == board.rows * board.cellSize && snake.speedY == 1) {
      snake.y = 0;
    } else if (snake.x == 0 && snake.speedX == -1) {
      snake.x = board.cols * board.cellSize;
    } else if (snake.x == board.cols * board.cellSize && snake.speedX == 1) {
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
    if (game.record < game.score) game.record = game.score;
    $recordDisplay.innerHTML = game.record;
    if (!alert(`Game over! Your score is ${game.score}!`)) {
      reset();
      start();
    }
    return;
  }

  // board creation
  context.fillStyle = "black";
  context.fillRect(0, 0, $board.width, $board.height);

  // apple creation
  context.fillStyle = "red";
  context.fillRect(apple.x, apple.y, board.cellSize, board.cellSize);

  // blueberry creation
  if (game.fruits === 2) {
    context.fillStyle = "blue";
    context.fillRect(blueberry.x, blueberry.y, board.cellSize, board.cellSize);
  }

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
    placeFruit(apple);
  }

  // snake eats blueberry
  if (game.fruits === 2) {
    if (snake.x == blueberry.x && snake.y == blueberry.y) {
      context.fillStyle = "black";
      context.fillRect(
        blueberry.x,
        blueberry.y,
        board.cellSize,
        board.cellSize
      );
      game.blueberry++;
      game.score -= game.score > 0 ? 1 : 0;
      snake.body.pop();
      blueberryAudio.load();
      blueberryAudio.play();
      $blueberryDisplay.innerHTML = game.blueberry;
      placeFruit(blueberry);
    }
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



/**
 * ON PAGE LOAD
 */

function start() {
  // board creation
  $board = document.getElementById("board");
  $board.height = board.rows * board.cellSize;
  $board.width = board.cols * board.cellSize;
  context = $board.getContext("2d");

  context.fillStyle = "black";
  context.fillRect(0, 0, $board.width, $board.height);

  document.addEventListener("keyup", changeDirection);
  $pauseBtn.setAttribute("disabled", "");
}

window.onload = start();