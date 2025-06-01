const scenarioImages = [
  ["scImg01.png"],
  ["scImg02.png", "scImg03.png"],
  ["scImg04.png", "scImg05.png"],
  ["scImg06.png"],
  ["scImg07.png"],
  ["scImg08.png"],
  ["scImg09.png"]
];


const debrisImg = new Image();
debrisImg.src = "debris1.png";


const scenarioTexts = [
  "2100년, 지구는 더 이상 푸르지 않았다.",
  "세계 각국에서는 쓰레기들을 우주로 쏘아올리기 시작했다...",
  "결국 서로 뭉쳐버린 쓰레기들은 달과 충돌하였고...",
  "warning... 달의 궤도 이상 감지...",
  "전문가들은 달의 궤도 이탈 현상을 경고하였다...",
  "달의 궤도를 되돌리기 위해 우주 쓰레기를 수거해보자!",
];

let currentLine = 0;

function renderScenarioImage(imageList) {
  const $wrapper = $("<div>").addClass("scenario-img-wrapper");

  imageList.forEach((src, i) => {
    const $img = $("<img>")
      .attr("src", src)
      .addClass("scenario-img");

    if (imageList.length > 1 && i === 1) {
      $img.addClass("overlay-img small-overlay");
    } else {
      $img.addClass("base-img");
    }

    if (src === "scImg06.png") {
      $img.addClass("blinking");
    }

    $wrapper.append($img);
  });

  return $wrapper;
}

$("#start").on("click", function () {
  $(".title, .menu").addClass("hidden");
  $(".background").css("filter", "brightness(0.3)");

  const $scenario = $("<div>").addClass("scenario");
  const $imgWrapper = renderScenarioImage(scenarioImages[currentLine]);
  const $text = $("<div>").addClass("scenario-text").text(scenarioTexts[currentLine]);

  const $buttonBox = $("<div>").addClass("scenario-links");
  const $next = $("<span>").addClass("link-text next-link").text("Next");
  const $skip = $("<span>").addClass("link-text skip-link").text("Skip");
  $buttonBox.append($next, $skip);

  $scenario.append($imgWrapper, $text, $buttonBox);
  $(".content").append($scenario);
});

$(document).on("click", ".next-link", function () {
  currentLine++;
  if (currentLine < scenarioTexts.length) {
    $(".scenario-text").text(scenarioTexts[currentLine]);

    const $newWrapper = renderScenarioImage(scenarioImages[currentLine]);
    $(".scenario-img-wrapper").replaceWith($newWrapper);
  } else {
    endScenario();


    //테스트용 엔딩ㅎㅎ
    // $(".scenario").remove();
    // showEnding();
  }
});

function startCanvasGameUI() {

  // 🎯 타이틀 배경 완전히 제거
  $(".background").remove(); // 배경 제거
  $("body").css("background", "black"); // 혹시라도 남은 배경 제거

   // 🎯 게임 UI 삽입
  $(".content").html(`
    <div class="game-ui">
    <div class="top-bar">
      <select id="difficultySelect">
        <option value="1">난이도 1 (하단 제외 반사)</option>
        <option value="2">난이도 2 (상하 제외 반사)</option>
        <option value="3">난이도 3 (사방 게임오버)</option>
      </select>
      <button id="startBtn">게임 시작</button>
    </div>

      <div id="game-info-bar">
      <div id="scoreBoard">점수: 0</div>
      <div id="goalBoard">목표: 100</div>
      <div id="timerBoard">남은 시간: 60s</div>
      </div>
      <canvas id="gameCanvas" width="800" height="600" style="background: url('scImg04.png'); background-size:cover;" ></canvas>
    </div>
  `);

$("#startBtn").on("click", function () {
  $("#startBtn").hide();
  $("#difficultySelect").hide();
  runPaddleBrickGame($("#difficultySelect").val()); // ✅ 실제 게임 함수 호출!
});
}


function initCanvasGame(difficulty) {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  let score = 0;
  let timeLeft = 60;

  const player = { x: 370, y: 560, width: 60, height: 20, speed: 5 };
  const debris = [];

  for (let i = 0; i < 5; i++) {
    debris.push({
      x: Math.random() * 740,
      y: Math.random() * -500,
      size: 20,
      speed: 1 + Math.random() * 3
    });
  }

  function drawPlayer() {
    ctx.fillStyle = "#00f";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  }

  function drawDebris() {
    ctx.fillStyle = "#aaa";
    debris.forEach(d => ctx.fillRect(d.x, d.y, d.size, d.size));
  }

  function updateDebris() {
    debris.forEach(d => {
      d.y += d.speed;
      if (d.y > 600) {
        d.y = -20;
        d.x = Math.random() * 740;
      }
      if (
        d.x < player.x + player.width &&
        d.x + d.size > player.x &&
        d.y < player.y + player.height &&
        d.y + d.size > player.y
      ) {
        score += 10;
        d.y = -20;
        d.x = Math.random() * 740;
      }
    });
  }

  function updateUI() {
    $("#scoreBoard").text(`점수: ${score}`);
    $("#timerBoard").text(`남은 시간: ${timeLeft}s`);
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    drawDebris();
    updateDebris();
    updateUI();
    requestAnimationFrame(gameLoop);
  }

  document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft" && player.x > 0) {
      player.x -= player.speed;
    } else if (e.key === "ArrowRight" && player.x < 800 - player.width) {
      player.x += player.speed;
    }
  });

  gameLoop();

  const timer = setInterval(() => {
    timeLeft--;
    updateUI();
    if (timeLeft <= 0) {
      clearInterval(timer);
      alert("게임 종료! 총 점수: " + score);
      showEnding();
    }
  }, 1000);
}


$(document).on("click", ".skip-link", function () {
  endScenario();
});

function endScenario() {
  $(".scenario").remove();
  $(".background").css("filter", "brightness(1)");
  $(".title, .menu").addClass("hidden"); // 메뉴는 숨기고
  currentLine = 0;

  // 게임 UI 시작
  startCanvasGameUI();
}


const starPositions = [
  { top: "50px", left: "120px" },
  { top: "320px", left: "60px" },
  { top: "120px", left: "600px" },
  { top: "230px", left: "680px" },
  { top: "250px", left: "300px" }
];

const $starContainer = $("<div>").addClass("star-container");

starPositions.forEach((pos, i) => {
  const delay = Math.random().toFixed(2);
  const $star = $("<img>")
    .attr("src", "star.png")
    .addClass("star")
    .css({
      top: pos.top,
      left: pos.left,
      animationDelay: `${delay}s`
    });
  $starContainer.append($star);
});

$(".background").append($starContainer);

$("#credit").on("click", function () {
  const $overlay = $(".credit-overlay");
  if ($overlay.length) {
    $overlay.removeClass("hidden");
  } else {
    const $credit = $(
      `<div class="credit-overlay">
        <div class="credit-popup">
          <span class="credit-close">&times;</span>
          <h2>Credits</h2>
          <p>👨‍🚀웹프로그래밍 팀프로젝트👨‍🚀</p>
          <p>이지환<br>이재서<br>문효진<br>박종혁<br>홍영근</p>
        </div>
      </div>`
    );
    $("body").append($credit);
  }
});

$(document).on("click", ".credit-close", function () {
  $(".credit-overlay").remove();
});

const endingTexts = [
  "달의 궤도는 다시 안정되었고...",
  "우주의 쓰레기는 정리되었다...",
  "Game Clear!!"
];

const endingImage = "ending.png";
let endingLine = 0;

function showEnding() {
  $(".content").empty();

  const $scenario = $("<div>").addClass("scenario");
  const $imgWrapper = $("<div>").addClass("scenario-img-wrapper").append(
    $("<img>").attr("src", endingImage).addClass("scenario-img")
  );

  const $text = $("<div>").addClass("scenario-text").text(endingTexts[endingLine]);

  const $buttonBox = $("<div>").addClass("scenario-links");
  const $next = $("<span>").addClass("link-text ending-next").text("Next");
  const $main = $("<span>").addClass("link-text to-main").text("Main");
  $buttonBox.append($next, $main);

  $scenario.append($imgWrapper, $text, $buttonBox);
  $(".content").append($scenario);
}

$(document).on("click", ".ending-next", function () {
  endingLine++;
  if (endingLine < endingTexts.length) {
    $(".scenario-text").text(endingTexts[endingLine]);
  } else {
    showMainMenu();
  }
});

$(document).on("click", ".to-main", function () {
  showMainMenu();
});

function showMainMenu() {
  $(".scenario").remove();
  $(".title, .menu").removeClass("hidden");
  currentLine = 0;
  endingLine = 0;
}


/**인 게임 코드 */
function runPaddleBrickGame(difficultyValue) {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const difficulty = parseInt(difficultyValue || "1");
  const padding = 20;
  const brickWidth = 75;
  const brickHeight = 20;
  const goal = 100;

  let score = 0;
  let timeLeft = 60;
  let isGameRunning = true;
  let bonusMode = false;
  let greenHitCount = 0;
  let timer;

  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 4,
    dy: -4,
    radius: 10,
  };

  const paddles = {
    top: { x: (canvas.width - 100) / 2, y: padding, width: 100, height: 10 },
    bottom: { x: (canvas.width - 100) / 2, y: canvas.height - padding - 10, width: 100, height: 10 },
    left: { x: padding, y: (canvas.height - 100) / 2, width: 10, height: 100 },
    right: { x: canvas.width - padding - 10, y: (canvas.height - 100) / 2, width: 10, height: 100 }
  };

  let bricks = [];
  for (let i = 0; i < 10; i++) {
    const isBad = Math.random() < 0.2;
    bricks.push({
      x: Math.random() * (canvas.width - brickWidth),
      y: Math.random() * (canvas.height - brickHeight),
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2,
      status: 1,
      bad: isBad
    });
  }

  function updateScore() {
    $("#scoreBoard").text(`점수: ${score}`);
  }

  function updateTimer() {
    $("#timerBoard").text(`남은 시간: ${timeLeft}s`);
  }

  function updateGoal() {
    $("#goalBoard").text(`목표: ${goal}`);
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddles() {
    ctx.fillStyle = "white";
    for (const key in paddles) {
      const p = paddles[key];
      ctx.fillRect(p.x, p.y, p.width, p.height);
    }
  }

  function drawBricks() {
  bricks.forEach(b => {
    if (b.status === 1) {
      if (debrisImg.complete) {
        // 잔해 이미지로 벽돌 그리기
        ctx.drawImage(debrisImg, b.x, b.y, brickWidth, brickHeight);
      } 
      // 일단은 bad 벽돌이면 테두리 표시 빨간색으로!
      if (b.bad) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = "red";
        ctx.strokeRect(b.x, b.y, brickWidth, brickHeight);
      }
    }
  });
}

  function moveBricks() {
    bricks.forEach(b => {
      if (b.status === 1) {
        b.x += b.dx;
        b.y += b.dy;
        if (b.x < 0 || b.x + brickWidth > canvas.width) b.dx *= -1;
        if (b.y < 0 || b.y + brickHeight > canvas.height) b.dy *= -1;
      }
    });
  }

  function scatterDebris(x, y) {
    for (let i = 0; i < greenHitCount; i++) {
      ctx.beginPath();
      ctx.arc(x + Math.random() * 40 - 20, y + Math.random() * 40 - 20, 5, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.closePath();
    }
  }

  function spawnBricks(base) {
    const count = Math.floor(Math.random() * 4) + 3;
    for (let i = 0; i < count; i++) {
      bricks.push({
        x: base.x + Math.random() * 60 - 30,
        y: base.y + Math.random() * 60 - 30,
        dx: (Math.random() - 0.5) * 3,
        dy: (Math.random() - 0.5) * 3,
        status: 1,
        bad: false
      });
    }
  }

  function collisionDetection() {
    bricks.forEach(b => {
      if (
        b.status === 1 &&
        ball.x > b.x &&
        ball.x < b.x + brickWidth &&
        ball.y > b.y &&
        ball.y < b.y + brickHeight
      ) {
        b.status = 0;
        ball.dy = -ball.dy;
        if (b.bad) {
          score -= 10;
          greenHitCount++;
          scatterDebris(b.x + brickWidth / 2, b.y + brickHeight / 2);
          spawnBricks(b);
        } else {
          score += 10;
        }
        updateScore();
      }
    });
  }

  function checkPaddleCollision() {
    const { top, bottom, left, right } = paddles;

    if (ball.y - ball.radius <= top.y + top.height &&
        ball.y - ball.radius >= top.y &&
        ball.x >= top.x && ball.x <= top.x + top.width) {
      ball.dy = Math.abs(ball.dy);
      return true;
    }

    if (ball.y + ball.radius >= bottom.y &&
        ball.y + ball.radius <= bottom.y + bottom.height &&
        ball.x >= bottom.x && ball.x <= bottom.x + bottom.width) {
      ball.dy = -Math.abs(ball.dy);
      return true;
    }

    if (ball.x - ball.radius <= left.x + left.width &&
        ball.x - ball.radius >= left.x &&
        ball.y >= left.y && ball.y <= left.y + left.height) {
      ball.dx = Math.abs(ball.dx);
      return true;
    }

    if (ball.x + ball.radius >= right.x &&
        ball.x + ball.radius <= right.x + right.width &&
        ball.y >= right.y && ball.y <= right.y + right.height) {
      ball.dx = -Math.abs(ball.dx);
      return true;
    }

    return false;
  }

  function endGame(where) {
    isGameRunning = false;
    clearInterval(timer);
    alert(`${where}에 닿았습니다. 게임 오버`);
  }

  function draw() {
    if (!isGameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    moveBricks();
    drawBall();
    drawPaddles();
    collisionDetection();

    const reflected = checkPaddleCollision();

    if (!reflected && !bonusMode) {
      if (ball.x - ball.radius <= 0) {
        if (difficulty <= 2) ball.dx = Math.abs(ball.dx);
        else return endGame("왼쪽 벽");
      }
      if (ball.x + ball.radius >= canvas.width) {
        if (difficulty <= 2) ball.dx = -Math.abs(ball.dx);
        else return endGame("오른쪽 벽");
      }
      if (ball.y - ball.radius <= 0) {
        if (difficulty <= 1) ball.dy = Math.abs(ball.dy);
        else return endGame("위쪽 벽");
      }
      if (ball.y + ball.radius >= canvas.height) {
        if (difficulty <= 0) ball.dy = -Math.abs(ball.dy);
        else return endGame("아래쪽 벽");
      }
    }

    ball.x += ball.dx;
    ball.y += ball.dy;

    requestAnimationFrame(draw);
  }

  // 마우스 따라 패들 이동
  document.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    paddles.top.x = Math.min(Math.max(padding, x - paddles.top.width / 2), canvas.width - paddles.top.width - padding);
    paddles.bottom.x = Math.min(Math.max(padding, x - paddles.bottom.width / 2), canvas.width - paddles.bottom.width - padding);
    paddles.left.y = Math.min(Math.max(padding, y - paddles.left.height / 2), canvas.height - paddles.left.height - padding);
    paddles.right.y = Math.min(Math.max(padding, y - paddles.right.height / 2), canvas.height - paddles.right.height - padding);
  });

  updateScore();
  updateTimer();
  updateGoal();

  draw();

  timer = setInterval(() => {
    if (!isGameRunning) return;
    timeLeft--;
    updateTimer();
    if (timeLeft <= 0) {
      clearInterval(timer);
      if (score >= goal) {
        bonusMode = true;
        alert("목표 달성! 보너스 모드 시작!");
      } else {
        endGame("시간 초과");
      }
    }
  }, 1000);
}
