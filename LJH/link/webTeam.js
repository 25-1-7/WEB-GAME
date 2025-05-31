const scenarioImages = [
  ["scImg01.png"],
  ["scImg02.png", "scImg03.png"],
  ["scImg04.png", "scImg05.png"],
  ["scImg06.png"],
  ["scImg07.png"],
  ["scImg08.png"],
  ["scImg09.png"]
];

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
    function startCanvasGameUI() {
  $(".content").html(`
    <div class="game-ui">
      <select id="difficultySelect">
        <option value="1">난이도 1 (하단 제외 반사)</option>
        <option value="2">난이도 2 (상하 제외 반사)</option>
        <option value="3">난이도 3 (사방 게임오버)</option>
      </select>
      <button id="startBtn">게임 시작</button>
      <div id="scoreBoard">점수: 0</div>
      <div id="goalBoard">목표: 100</div>
      <div id="timerBoard">남은 시간: 60s</div>
      <canvas id="gameCanvas" width="800" height="600"></canvas>
    </div>
  `);
  initCanvasGame(); // 이 함수는 네가 별도로 구현해둔 게임 로직
    startCanvasGameUI(); // 이거 추가!
}


    //테스트용 엔딩ㅎㅎ
    // $(".scenario").remove();
    // showEnding();
  }
});

function startCanvasGameUI() {
  $(".content").html(`
    <div class="game-ui">
      <select id="difficultySelect">
        <option value="1">난이도 1 (하단 제외 반사)</option>
        <option value="2">난이도 2 (상하 제외 반사)</option>
        <option value="3">난이도 3 (사방 게임오버)</option>
      </select>
      <button id="startBtn">게임 시작</button>
      <div id="scoreBoard">점수: 0</div>
      <div id="goalBoard">목표: 100</div>
      <div id="timerBoard">남은 시간: 60s</div>
      <canvas id="gameCanvas" width="800" height="600"></canvas>
    </div>
  `);

  // 버튼 클릭 시 게임 로직 시작
  $("#startBtn").on("click", function () {
    $("#startBtn").hide();
    $("#difficultySelect").hide();
    initCanvasGame($("#difficultySelect").val());
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
  $(".title, .menu").removeClass("hidden");
  currentLine = 0;
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
