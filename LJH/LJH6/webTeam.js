
//쓰레기 이미지
const trashImages = [
  "trash/1.png", "trash/2.png", "trash/3.png", "trash/4.png",
  "trash/5.png", "trash/7.png", "trash/8.png"
];
const satelliteImages = [
  "satellite/satelite.png", "satellite/debris1.png", "satellite/debris2.png",
  "satellite/debris3.png", "satellite/debris4.png"
];

// satelliteImages 배열 순서 기준으로 파편을 매핑
const satelliteMapping = {
  "satellite/satelite.png": ["satellite/debris1.png"],
  "satellite/debris1.png": ["satellite/debris2.png"],
  "satellite/debris2.png": ["satellite/debris3.png"],
  "satellite/debris3.png": ["satellite/debris4.png"],
  "satellite/debris4.png": ["satellite/debris1.png", "satellite/debris2.png"]
};



// 전역에 추가
const bgmTitle = new Audio("BGM/title.mp3");
const bgmGame = new Audio("BGM/Occam.mp3");

// 무한 반복
bgmTitle.loop = true;
bgmGame.loop = true;

// ----- Setting controls from HYG -----
let bgmAudio = new Audio();
let sfxEnabled = true;
let sfxVolume = 0.5;


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

$(document).on("click", "#start", function () {
    if (!titleBgmStarted) {
    bgmTitle.play().catch(e => console.warn("타이틀 BGM 재생 실패:", e));
    titleBgmStarted = true;
  }
  $(".title, .menu").addClass("hidden");
  $(".background").css("filter", "brightness(0.3)");

  const $scenario = $("<div>").addClass("scenario");
  $scenario.append(
    renderScenarioImage(scenarioImages[currentLine]),
    $("<div>").addClass("scenario-text").text(scenarioTexts[currentLine]),
    $('<div class="scenario-links">')
      .append('<span class="link-text next-link">Next</span>')
      .append('<span class="link-text skip-link">Skip</span>')
  );
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

  restoreBg();                       
  $("body").css("background","black");


$(".content").html(`

  <div id="game-wrapper">

    <div id="game-info-bar">
      <div id="scoreBoard">점수: 0</div>
      <div id="goalBoard">목표: 100</div>
      <div id="lifeBoard">HP: ❤️❤️❤️</div>
    </div>
    
    <canvas id="gameCanvas" width="800" height="600" style="background: url('scImg04.png'); background-size:cover;"></canvas>
   
  </div>
`);

$("#startBtn").on("click", function () {
  $("#startBtn").hide();
  $("#difficultySelect").hide();
  runPaddleBrickGame($("#difficultySelect").val()); // ✅ 실제 게임 함수 호출!
});
}

/*
$(".content").html('
    <div class="game-ui">
    <div class="top-bar">
      <select id="difficultySelect">
        <option value="1">난이도 1 (하단 제외 반사)</option>
        <option value="2">난이도 2 (상하 제외 반사)</option>
        <option value="3">난이도 3 (사방 게임오버)</option>
      </select>
      <button id="startBtn">게임 시작</button>
    </div>'

  );
  */



let selectedDifficulty = 1; // 기본값


function showStageExplanation() {
  darkenBg();
  $(".content").html(`
    <div class="scenario" id="gameExplainBox">
      <div class="scenario-text" id="gameExplain" style="font-size: 18px;">
        <p style="font-size:25px">🚀 게임 설명 🚀</p>
        <p><strong>Stage 1:</strong> 하단으로는 공이 빠져나가지만<br>나머지 벽에 닿으면 반사됩니다.</p>
        <p><strong>Stage 2:</strong> 상하 벽을 제외하고 좌우 벽에 닿으면 반사됩니다.</p>
        <p><strong>Stage 3:</strong> 사방 벽에 닿으면 게임오버!</p>
      </div>
      <div class="scenario-links">
        <span class="link-text next-to-objective">Next</span>
      </div>
    </div>
  `);
}

function showStageObjective() {
  $(".content").html(`
    <div class="scenario" id="gameExplainBox">
      <div class="scenario-text" id="gameExplain" style="font-size: 18px;">
        <p style="font-size:25px">🎯 목표 & 주의사항</p>
        <p><strong>목표:</strong> 모든 <span style="color:yellow">우주 쓰레기</span>를 제거하세요!</p>
        <p style="color:red;"><strong>주의:</strong> 우주 쓰레기를 제외한 다른 물건에<br>공이 닿으면 즉시 게임 오버입니다!</p>

        <div style="display: flex; justify-content: center; align-items: center; gap: 80px; margin-top: 20px;">
          <div style="text-align: center;">
            <img src="debris1.png" alt="debris" style="height: 60px;"><br>
            <span style="color: white; font-size: 15px;">우주 쓰레기</span>
          </div>
          <div style="text-align: center;">
            <img src="moon.png" alt="moon" style="height: 60px;"><br>
            <span style="color: white; font-size: 15px;">닿으면 안되는 것</span>
          </div>
        </div>
      </div>
      <div class="scenario-links">
        <span class="link-text next-to-diff">Next</span>
      </div>
    </div>
  `);
}


$(document).on("click", ".next-to-objective", function () {
  showStageObjective();
});

$(document).on("click", ".next-to-diff", function () {
  difficultySlection();
});



//난이도 선택 버튼들을 클릭했을 때 이벤트리스너
$(document).on("click", ".diff-menu", function () {
  $(".diff-menu").removeClass("selected");
  $(this).addClass("selected");
  selectedDifficulty = $(this).data("value");
});

let titleBgmStarted = false;
//startBtn 버튼 타입 사용 안 하고 리스너 생성 
$(document).on("click", "#startBtn", function () {
  startCanvasGameUI();//게임 UI 시작
  runPaddleBrickGame(selectedDifficulty);
});

//난이도를 선택하는 함수
function difficultySlection() {
  restoreBg();
  $(".content").html(`
    <div class="game-ui">
      <div class="diffselect-bar">
        <div id="startBtn">Game Start</div>
        <div id="difficultySelect">
          <div class="diff-menu" data-value="1">Stage 1</div>
          <div class="diff-menu" data-value="2">Stage 2</div>
          <div class="diff-menu" data-value="3">Stage 3</div>
        </div>
      </div>
    </div>
  `);
}


function initCanvasGame(difficulty) {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  let score = 0;
  let timeLeft = 45;

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
    // BGM 전환
  bgmTitle.pause();
  bgmTitle.currentTime = 0;
  bgmGame.play().catch(e => console.log("Game BGM Blocked:", e));

  showStageExplanation();
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

$(document).on("click", "#credit", function () {
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

$(document).on("click", "#setting", function () {
  $("#settings-overlay").show();
});

$(document).on("click", "#closeSettingsBtn", function () {
  $("#settings-overlay").hide();
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
  darkenBg();
  endingLine = 0;

  $(".content").empty();

  const $scenario = $("<div>").addClass("scenario");
  const $imgWrapper = $("<div>").addClass("scenario-img-wrapper").append(
    $("<img>").attr("src", endingImage).addClass("scenario-img")
  );

  const $text = $("<div>").addClass("scenario-text").text(endingTexts[endingLine]);

  const $buttonBox = $("<div>").addClass("scenario-links");
  const $next = $("<span>").addClass("link-text ending-next").text("Next");
  const $main = $("<span>").addClass("link-text to-main").text("Main");
  const $restart = $("<span>").addClass("link-text restart-game").text("Restart");

  $buttonBox.append($next, $main, $restart);

  $scenario.append($imgWrapper, $text, $buttonBox);
  $(".content").append($scenario);
}

$(document).on("click", ".ending-next", function () {
  endingLine++;
  if (endingLine < endingTexts.length) {
    $(".scenario-text").text(endingTexts[endingLine]);
  } else {
    showMainMenu();          // 모든 문장 끝나면 메인으로
  }
});

$(document).on("click", ".to-main", function () {
  showMainMenu();
});

function showMainMenu () {
  // 1) 기존 내용 싹 비우기
  $(".content").empty();

  // 2) 메인 타이틀 + 메뉴 다시 삽입
  $(".content").append(`
    <div class="title">Space Cleaner!!</div>
    <div class="menu">
      <div class="menu-item" id="start">Start</div>
      <div class="menu-item" id="credit">Credit</div>
      <div class="menu-item" id="setting">Setting</div>
    </div>
  `);

  // 3) 백그라운드 다시 보이기
  $(".background").show().css("filter","brightness(1)");


  //3-1) BGM
  
  // BGM 전환
  bgmGame.pause();
  bgmGame.currentTime = 0;

  bgmTitle.play().catch(e => console.warn("타이틀 BGM 재생 실패:", e));

  // 4) 상태 리셋
  currentLine = 0;
  endingLine  = 0;
  restoreBg();
}




/**인 게임 코드 */
function runPaddleBrickGame(difficultyValue) {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  const difficulty = parseInt(difficultyValue || "1");
  const padding = 20;
  const brickWidth = 75;
  const brickHeight = 20;
  let goal = 100;
  const playerImg = new Image()
  playerImg.src = "player/astro_basic.png"  // 실제 경로에 맞게 수정
// 패들 이미지를 하나의 Image 객체로 미리 로드
  const barrierImg = new Image();
  barrierImg.src = "barrier.gif"; 

  if (difficulty === 1) goal = 100;
  else if (difficulty === 2) goal = 125;
  else if (difficulty === 3) goal = 150;

  let score = 0;
  let timeLeft = 45;
  let isGameRunning = true;
  let bonusMode = false;
  let greenHitCount = 0;
  let timer;
 let lives = 3; 
  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 4,
    dy: -4,
    radius: 10,
  };

  // -------------------------------------------------
  // ★ 불빛 효과를 위해 helper 함수 정의
  function flashBorder(colorClass) {
    // colorClass는 "glow-red" 또는 "glow-yellow"
    $("#game-wrapper").addClass(colorClass);
    // 200ms 뒤에 자동으로 클래스 제거
    setTimeout(() => {
      $("#game-wrapper").removeClass(colorClass);
    }, 200);
  }
  // -------------------------------------------------


  const paddles = {
    top: { x: (canvas.width - 100) / 2, y: padding, width: 100, height: 10 },
    bottom: { x: (canvas.width - 100) / 2, y: canvas.height - padding - 10, width: 100, height: 10 },
    left: { x: padding, y: (canvas.height - 100) / 2, width: 10, height: 100 },
    right: { x: canvas.width - padding - 10, y: (canvas.height - 100) / 2, width: 10, height: 100 }
  };

  let bricks = [];
for (let i = 0; i < 10; i++) {
  const isBad = Math.random() < 0.3;
let src, img, type;

let renderWidth = 60;
let renderHeight = 60;
let preserveAspect = false;

if (isBad) {
  src = satelliteImages[Math.floor(Math.random() * satelliteImages.length)];
  type = "satellite";
  renderWidth = 100;
  renderHeight = 100;
  preserveAspect = false; // satellite는 비율 고정 없이 정사각형
} else {
  src = trashImages[Math.floor(Math.random() * trashImages.length)];
  type = "trash";
  renderWidth = 60;
  renderHeight = 60;
  preserveAspect = true; // trash는 비율 유지
}

img = new Image();
img.src = src;

bricks.push({
  x: Math.random() * (canvas.width - renderWidth),
  y: Math.random() * (canvas.height - renderHeight),
  dx: (Math.random() - 0.5) * 0.5,
  dy: (Math.random() - 0.5) * 0.5,
  status: 1,
  type,
  img,
  src,
  renderWidth,
  renderHeight,
  preserveAspect
});

}
 function updateUI() {
  $("#scoreBoard").text(`[score: ${score}]`);
  $("#goalBoard").text(`[goal: ${goal}]`);
  $("#lifeBoard").text("❤️".repeat(lives));
}
function loseLifeAndResetBall() {
  lives--;
  updateUI();
 flashBorder("glow-red");
  if (lives <= 0) {
    endGame("하트 소진");
    return;
  }

  // 공 중앙으로 재배치
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = 4;
  ball.dy = -4;
}



  function updateScore() {
    $("#scoreBoard").text(`[score: ${score}]`);
  }

  function updateTimer() {
    $("#timerBoard").text(`[time: ${timeLeft}s]`);
  }

  function updateGoal() {
    $("#goalBoard").text(`[goal: ${goal}]`);
  }

  function drawBall() {
if (playerImg.complete) {
    const size = ball.radius * 4  // 원래 공 지름만큼 크기
    ctx.drawImage(playerImg, ball.x - ball.radius, ball.y - ball.radius, size, size)
  } else {
    // 아직 로드 안 됐으면 기본 원으로 그려도 되고 빈 칸 둬도 됨
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 4)
    ctx.fillStyle = "white"
    ctx.fill()
    ctx.closePath()
  }
  }

function drawPaddles() {
  for (const key in paddles) {
    const p = paddles[key]
    // 패들 중심점 계산
    const cx = p.x + p.width / 2
    const cy = p.y + p.height / 2

    ctx.save()
    if (key === "left" || key === "right") {
      // 왼쪽·오른쪽 패들은 90도 회전
      // 회전 축을 패들 중심(cx, cy)로 옮기고, Math.PI/2 만큼 회전
      ctx.translate(cx, cy)
      ctx.rotate(Math.PI / 2)
      // barrierImg 원본이 가로 모양이므로, 회전 후에는 크기를 바꿔야 세로로 보임
      // 변환된 좌표계에 맞춰서 draw
      // 이때 drawImage(x, y, w, h)에서 w=패들 높이, h=패들 너비
      if (barrierImg.complete) {
        ctx.drawImage(barrierImg,
          -p.height / 2,   // 회전 후 x 위치: 중심에서 위로(절반 높이) 
          -p.width / 2,    // 회전 후 y 위치: 중심에서 왼쪽(절반 너비)
          p.height,        // 회전된 이미지 폭 -> 원래 패들 높이
          p.width)         // 회전된 이미지 높이 -> 원래 패들 너비
      } else {
        // 만약 이미지 로드가 완료 안 됐으면 fallback
        // 원래 패들이 10x100인데 회전했으니 drawRect도 같은 식으로
        ctx.fillStyle = "white"
        ctx.fillRect(-p.height / 2, -p.width / 2, p.height, p.width)
      }
    } else {
      // top, bottom 패들은 가로 모양 그대로 그리기
      if (barrierImg.complete) {
        ctx.drawImage(barrierImg, p.x, p.y, p.width, p.height)
      } else {
        ctx.fillStyle = "white"
        ctx.fillRect(p.x, p.y, p.width, p.height)
      }
    }
    ctx.restore()
  }
}


  function drawBricks() {
  bricks.forEach(b => {
    if (b.status === 1) {
      if (b.img.complete) {
        ctx.drawImage(b.img, b.x, b.y, brickWidth, brickHeight);
      } else {
        ctx.fillStyle = b.bad ? "red" : "gray"; // 로딩 안 됐을 때 대비
        ctx.fillRect(b.x, b.y, brickWidth, brickHeight);
      }
      if (b.bad) {
        ctx.lineWidth = 2;
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

      // 인공위성 부딪힘이면 강한 흔들림, 아니면 기본 흔들림
      const $wrapper = $("#game-wrapper")
      if (b.type === "satellite") {
        $wrapper.addClass("shake-strong")
        setTimeout(() => {
          $wrapper.removeClass("shake-strong")
        }, 400) // 애니메이션 길이와 맞춤
        // 이후 파편 생성 로직…
      } else {
        // trash/debris 충돌 시 기본 shake
        $wrapper.addClass("shake")
        setTimeout(() => {
          $wrapper.removeClass("shake")
        }, 300)
        score += 10
        flashBorder("glow-yellow")
        updateScore()
      }

      if (b.type === "satellite") {
  const debrisList = [
    "satellite/debris1.png",
    "satellite/debris2.png",
    "satellite/debris3.png",
    "satellite/debris4.png"
  ];
  // 점수 차감
  score = Math.max(0, score - 20); // 최소 0점 유지
  updateScore(); // UI 갱신
  setTimeout(() => {
    debrisList.forEach(debrisSrc => {
      const debrisImg = new Image();
      debrisImg.src = debrisSrc;

      bricks.push({
        x: b.x + Math.random() * 30 - 15,
        y: b.y + Math.random() * 30 - 15,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        status: 1,
        type: "debris",
        img: debrisImg,
        src: debrisSrc
      });
    });
  }, 1000);
}


    else {
        // trash or debris
        score += 10;
         flashBorder("glow-yellow");
        updateScore();
      }
    }
  });
}


  function checkPaddleCollision() {
    const { top, bottom, left, right } = paddles;

    if (ball.y - ball.radius <= top.y + top.height &&
        ball.y - ball.radius >= top.y &&
        ball.x >= top.x && ball.x <= top.x + top.width) {
      ball.dy = Math.abs(ball.dy);
      const $wrapper = $("#game-wrapper")
      $wrapper.addClass("shake")
        setTimeout(() => {
          $wrapper.removeClass("shake")
        }, 300)
      flashBorder("glow-blue");
      return true;
    }

    if (ball.y + ball.radius >= bottom.y &&
        ball.y + ball.radius <= bottom.y + bottom.height &&
        ball.x >= bottom.x && ball.x <= bottom.x + bottom.width) {
      ball.dy = -Math.abs(ball.dy);
            const $wrapper = $("#game-wrapper")
      $wrapper.addClass("shake")
        setTimeout(() => {
          $wrapper.removeClass("shake")
        }, 300)
      flashBorder("glow-blue");
      return true;
    }

    if (ball.x - ball.radius <= left.x + left.width &&
        ball.x - ball.radius >= left.x &&
        ball.y >= left.y && ball.y <= left.y + left.height) {
      ball.dx = Math.abs(ball.dx);
            const $wrapper = $("#game-wrapper")
      $wrapper.addClass("shake")
        setTimeout(() => {
          $wrapper.removeClass("shake")
        }, 300)
      flashBorder("glow-blue");
      return true;
    }

    if (ball.x + ball.radius >= right.x &&
        ball.x + ball.radius <= right.x + right.width &&
        ball.y >= right.y && ball.y <= right.y + right.height) {
      ball.dx = -Math.abs(ball.dx);
            const $wrapper = $("#game-wrapper")
      $wrapper.addClass("shake")
        setTimeout(() => {
          $wrapper.removeClass("shake")
        }, 300)
      flashBorder("glow-blue");
      return true;
    }

    return false;
  }

  function endGame(where) {
    isGameRunning = false;
    clearInterval(timer);
  
    // 게임 오버 시점에 점수 기반 엔딩 화면 출력
    showGameOver(score);
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

     if (!reflected) {
    if (ball.x - ball.radius <= 0) {
      if (difficulty <= 2) {
        ball.dx = Math.abs(ball.dx);
      } else {
        loseLifeAndResetBall();
        requestAnimationFrame(draw);  // ★ 충돌 후에도 다음 프레임 요청
        return;                     // ★ 여기서 return 해야 아래 코드가 실행되지 않음
      }
    }
    if (ball.x + ball.radius >= canvas.width) {
      if (difficulty <= 2) {
        ball.dx = -Math.abs(ball.dx);
      } else {
        loseLifeAndResetBall();
        requestAnimationFrame(draw);
        return;
      }
    }
    if (ball.y - ball.radius <= 0) {
      if (difficulty <= 1) {
        ball.dy = Math.abs(ball.dy);
      } else {
        loseLifeAndResetBall();
        requestAnimationFrame(draw);
        return;
      }
    }
    if (ball.y + ball.radius >= canvas.height) {
      if (difficulty <= 0) {
        ball.dy = -Math.abs(ball.dy);
      } else {
        loseLifeAndResetBall();
        requestAnimationFrame(draw);
        return;
      }
    }
  }

    //목표 달성 시 게임 종료 
     if (score >= goal) {
    isGameRunning = false;
    clearInterval(timer);
    showEnding(); // 또는 다른 처리
    return;
  }

    ball.x += ball.dx;
    ball.y += ball.dy;
    // 모든 쓰레기/위성 제거되면 자동 재생성
if (bricks.filter(b => b.status === 1).length === 0) {
  for (let i = 0; i < 10; i++) {
    const isBad = Math.random() < 0.3;

    let src, img, type;
    let renderWidth = 60;
    let renderHeight = 60;
    let preserveAspect = false;

    if (isBad) {
      src = satelliteImages[Math.floor(Math.random() * satelliteImages.length)];
      type = "satellite";
      renderWidth = 100;
      renderHeight = 100;
    } else {
      src = trashImages[Math.floor(Math.random() * trashImages.length)];
      type = "trash";
      renderWidth = 60;
      renderHeight = 60;
      preserveAspect = true;
    }

    img = new Image();
    img.src = src;

    bricks.push({
      x: Math.random() * (canvas.width - renderWidth),
      y: Math.random() * (canvas.height - renderHeight),
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      status: 1,
      type,
      img,
      src,
      renderWidth,
      renderHeight,
      preserveAspect
    });
  }
}
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
    /*
    if (timeLeft <= 0) {
      clearInterval(timer);
      if (score >= goal) {
        bonusMode = true;
        alert("목표 달성! 보너스 모드 시작!");
      } else {
        endGame("시간 초과");
      }
    }*/
  }, 1000);
}



function showGameOver(score) {
  darkenBg();
  $(".content").html(`
    <div class="scenario" id="gameOverBox">
      <div class="scenario-img-wrapper" style="position: relative;">
        <img src="scImg02.png" class="scenario-img base-img" />
        <img src="moon2.png" class="moon-fly" />
      </div>
      <div class="scenario-text" style="margin-top: 30px;">
        <p>앗! 달이 날아갔습니다!!</p>
        <p>당신의 점수는 <span style="color: red; font-weight:bold;">${score}점</span>입니다...</p>
      </div>
      <div class="scenario-links">
        <span class="link-text to-main">Main</span>
        <span class="link-text restart-game">Restart</span>
      </div>
    </div>
  `);

  // 애니메이션 트리거 (지연 삽입용)
  setTimeout(() => {
    $(".moon-fly").addClass("moon-animate");
  }, 100);
}

$(document).on("click", ".to-main", function () {
  showMainMenu(); // 메인으로 이동
});

$(document).on("click", ".restart-game", function () {
  $(".background").show();
  $(".background").css("filter", "brightness(0.3)");
  currentLine = 0;
  endingLine = 0;
  showStageExplanation(); // 설명부터 다시 시작
});


//페이드인,아웃 관련 함수
function darkenBg(){
  $(".background").show().css("filter","brightness(0.3)");
}
function restoreBg(){
  $(".background").css("filter","brightness(1)");
}

// -------------------
// Setting functions
// -------------------
function applySettings() {
  window.userBallColor = $("#ballColor").val();
  const bgmFile = $("#bgmSelect").val();
  const bgmToggle = $("#bgmToggle").is(":checked");
  const bgmVolume = parseFloat($("#bgmVolume").val());

  bgmAudio.src = bgmFile;
  bgmAudio.loop = true;
  bgmAudio.volume = bgmVolume;
  if (bgmToggle) bgmAudio.play();
  else bgmAudio.pause();

  sfxEnabled = $("#sfxToggle").is(":checked");
  sfxVolume = parseFloat($("#sfxVolume").val());
}

function playSFX(soundFile) {
  if (!sfxEnabled) return;
  const sfx = new Audio(soundFile);
  sfx.volume = sfxVolume;
  sfx.play();
}

window.applySettings = applySettings;

