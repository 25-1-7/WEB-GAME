
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

// 현재 진행 중인 게임 정리용
let activeGameCleanup = null;

function stopCurrentGame() {
  if (activeGameCleanup) {
    activeGameCleanup();
    activeGameCleanup = null;
  }
}

function isBgmEnabled() {
  const $toggle = $("#bgmToggle");
  return $toggle.length ? $toggle.is(":checked") : true;
}


// settings values
let sfxEnabled = true;
let sfxVolume = 0.5;
let selectedPlayerImage = "player/astro_basic.png";
const GAME_VERSION = "v0.1";
// 현재 진행 중인 스테이지 번호 (자동 진행을 위해 추가)
let currentStage = 1;

$(function() {
  $("#versionTxt").text(GAME_VERSION);
  const lastName = localStorage.getItem("sc_lastName") || "";
  $("#playerNameInput").val(lastName);
});

function getHighScores() {
  const data = localStorage.getItem("sc_highscores");
  return data ? JSON.parse(data) : {1: [], 2: [], 3: []};
}

function saveHighScores(obj) {
  localStorage.setItem("sc_highscores", JSON.stringify(obj));
}

function recordHighScore(stage, name, score) {
  const scores = getHighScores();
  const arr = scores[stage] || [];
  arr.push({ name, score });
  arr.sort((a, b) => b.score - a.score);
  scores[stage] = arr.slice(0, 3);
  saveHighScores(scores);
  localStorage.setItem("sc_lastName", name);
}

function getUnlockedStage() {
  return parseInt(localStorage.getItem("sc_unlockedStage") || "1", 10);
}

function setUnlockedStage(stage) {
  const current = getUnlockedStage();
  if (stage > current) localStorage.setItem("sc_unlockedStage", stage);
}

function showPopup(message) {
  const $popup = $(
    `<div class="credit-overlay" id="msgPopup">\n` +
      `<div class="credit-popup">` +
        `<span class="credit-close">&times;</span>` +
        `<p>${message}</p>` +
      `</div>` +
    `</div>`
  );
  $("body").append($popup);
}

$(document).on("click", "#msgPopup .credit-close", function () {
  $("#msgPopup").remove();
});

function populateHighScores() {
  const scores = getHighScores();
  [1, 2, 3].forEach(stage => {
    const arr = scores[stage] || [];
    const html = arr
      .map((s, i) => `${i + 1}. ${s.name}-${s.score}`)
      .join("<br>") || "No Record";
    $(`#scoreStage${stage}`).html(html);
  });
}

function playSFX(soundFile) {
  if (!sfxEnabled) return;
  const sfx = new Audio(soundFile);
  sfx.volume = sfxVolume;
  sfx.play();
}


const scenarioImages = [
  ["scImg/scImg01.png"],
  ["scImg/scImg02.png", "scImg/scImg03.png"],
  ["scImg/scImg04.png", "scImg/scImg05.png"],
  ["scImg/scImg06.png"],
  ["scImg/scImg07.png"],
  ["scImg/scImg08.png"],
  ["scImg/scImg09.png"]
];


const debrisImg = new Image();
debrisImg.src = "debris1.png";

// 정적 블럭 애니메이션을 위한 별 이미지 프레임 로드
const staticStarFrames = [];
for (let i = 1; i <= 8; i++) {
  const img = new Image();
  img.src = `star/star${i}.png`;
  staticStarFrames.push(img);
}
let staticStarFrame = 0;
let staticStarFrameCounter = 0;


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

    if (src === "scImg/scImg06.png") {
      $img.addClass("blinking");
    }

    $wrapper.append($img);
  });

  return $wrapper;
}

$(document).on("click", "#start", function () {
  stopCurrentGame();
  if (!titleBgmStarted && isBgmEnabled()) {
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
  }
});

function startCanvasGameUI() {

  restoreBg();                       
  $("body").css("background","black");


  $(".content").html(`

  <div id="game-wrapper">

    <div id="game-info-bar">
      <img src="infoBarImg.gif" class="info-light left-light" />
      <div id="scoreBoard">점수: 0</div>
      <div id="goalBoard">목표: 100</div>
      <div id="lifeBoard">HP: ■■■</div>
      <img src="infoBarImg.gif" class="info-light right-light" />
    </div>

    <canvas id="gameCanvas" width="800" height="600" style="background: url('scImg/scImg04.png'); background-size:cover;"></canvas>
    <div id="floating-text-container"></div>
    <div id="countdown" class="countdown-overlay" style="display:none;"></div>

  </div>
`);
  const lastName = localStorage.getItem("sc_lastName") || "";
  $("#playerNameInput").val(lastName);
  $("#endingBtn").removeClass("highlight").hide();

$("#startBtn").on("click", function () {
  $("#startBtn").hide();
  $("#difficultySelect").hide();
  runPaddleBrickGame($("#difficultySelect").val()); // 실제 게임 함수 호출!
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


//새 도움말 및 게임설명
function showStageExplanation() {
  stopCurrentGame();
  darkenBg();

  const explainImages = [
    "exImg/exImg01.png",
    "exImg/exImg02.png",
    "exImg/exImg03.png",
    "exImg/exImg04.png",
    "exImg/exImg05.png",
    "exImg/exImg06.png"
  ];

  const explainTexts = [
    "게임 설명 !!",
    "당신은 우주청소부의 보조 도우미입니다. 최첨단 패널을 마우스로 조종하여 우주청소부가 우주 밖으로 날아가지 않도록 도와주세요.",
    "우주청소부가 쓰레기에 가까이 다가가면 쓰레기를 회수할 수 있습니다.",
    "인공위성은 회수할 수 없습니다. 또한 인공위성과 부딪히면 안됩니다! 인공위성과의 충돌은 더 많은 우주쓰레기를 만듭니다...",
    "달의 궤도 안정화까지 제한된 기회가 있습니다...",
    "목표 점수를 달성하면 게임 클리어 !!"
  ];

  let currentIndex = 0;

  function renderExplainSlide(index) {
  const baseImg = explainImages[index];
  const text = explainTexts[index];

  const $scenario = $("<div>").addClass("scenario");
  const $imgWrapper = $("<div>").addClass("scenario-img-wrapper").css("position", "relative");

  if (baseImg === "exImg/exImg05.png") {
    // exImg05.png를 배경으로 설정
    const $background = $("<img>")
      .attr("src", baseImg)
      .addClass("scenario-img base-img");
    $imgWrapper.append($background);

    // 그 위에 exImg07.png(우주인)를 오버레이
    const $astronaut = $("<img>")
      .attr("src", "exImg/exImg07.png")
      .addClass("scenario-img overlay-img explain-overlay blinking")
      .css({
        width: "90px",   // 원하는 크기로 조정
        height: "auto",   // 비율 유지
        top: "90px",      // 필요시 위치 조정
        left: "calc(50% - 100px)", // 중앙 정렬
        position: "absolute"
      });
    $imgWrapper.append($astronaut);
  } else {
    // 그 외에는 white 배경 + 해당 이미지 >> 걍 우주 배경이 나은것같아서 우주배경으로 변경
    const $white = $("<img>")
      .attr("src", "exImg/exImg05.png")
      .addClass("scenario-img base-img");
    const $mainImg = $("<img>")
      .attr("src", baseImg)
      .addClass("scenario-img overlay-img explain-overlay");
      if (baseImg === "exImg/exImg01.png") {
        $mainImg.css({
          width: "120px",     // 원하는 크기로 조절
          height: "auto",     // 비율 유지
          top: "60px",        // 위치 조정 (필요 시)
          left: "80px", // 가운데 정렬
          position: "absolute"
        });
      }
    $imgWrapper.append($white, $mainImg);
  }

  // 텍스트
  const $text = $("<div>").addClass("scenario-text").text(text);

  // 버튼
  const $btnBox = $("<div>").addClass("scenario-links");
  const $next = $("<span>").addClass("link-text next-obj-slide").text("Next");
  const $skip = $("<span>").addClass("link-text skip-obj-slide").text("Skip");
  $btnBox.append($next, $skip);

  // 조합
  $scenario.append($imgWrapper, $text, $btnBox);
  $(".content").html($scenario);
}

  renderExplainSlide(currentIndex);

  $(document).off("click", ".next-obj-slide").on("click", ".next-obj-slide", function () {
    currentIndex++;
    if (currentIndex < explainTexts.length) {
      renderExplainSlide(currentIndex);
    } else {
      showStageObjective(); // 다음 단계로
    }
  });

  $(document).off("click", ".skip-obj-slide").on("click", ".skip-obj-slide", function () {
    showStageObjective(); // 즉시 다음 단계로
  });
}


//스테이지 설명
function showStageObjective() {
  darkenBg();
  $(".content").html(`
    <div class="scenario" id="gameExplainBox">
      <div class="scenario-text" id="gameExplain" style="font-size: 18px;">
        <p style="font-size:15px">🚀 Stage 설명 🚀</p>
        <p style="font-size:15px"><strong>Stage 1:</strong> 하단으로는 공이 빠져나가지만<br>나머지 벽에 닿으면 반사됩니다.</p>
        <p style="font-size:15px"><strong>Stage 2:</strong> 상하 벽을 제외하고 좌우 벽에 닿으면 반사됩니다.</p>
        <p style="font-size:15px"><strong>Stage 3:</strong> 사방 벽에 닿으면 게임오버!</p>
      </div>
      <div class="scenario-links">
        <span class="link-text next-to-objective">Next</span>
      </div>
    </div>
  `);

  $(document).off("click", ".next-to-objective").on("click", ".next-to-objective", function () {
    difficultySlection();
  });

}



let selectedDifficulty = 1; // 기본값


//난이도 선택 버튼들을 클릭했을 때 이벤트리스너
$(document).on("click", ".diff-menu", function () {
  const stage = $(this).data("value");
  if (stage > getUnlockedStage()) {
    showPopup("이전 스테이지를 먼저 클리어하세요!");
    return;
  }
  $(".diff-menu").removeClass("selected");
  $(this).addClass("selected");
  selectedDifficulty = stage;
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
          <div class="diff-menu" data-value="1">Stage 1<div class="top-scores" id="scoreStage1"></div></div>
          <div class="diff-menu" data-value="2">Stage 2<div class="top-scores" id="scoreStage2"></div></div>
          <div class="diff-menu" data-value="3">Stage 3<div class="top-scores" id="scoreStage3"></div></div>
        </div>
      </div>
    </div>
  `);
  populateHighScores();
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
        playSFX("SFX/coin.mp3");
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
      showEnding();   //우주인이 날아가는 이미지 사용..한 엔딩
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
  if (isBgmEnabled()) {
    bgmGame.play().catch(e => console.log("Game BGM Blocked:", e));
  }

  stopCurrentGame();

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

$(document).on("click", ".credit-close", function () {
  $(".credit-overlay").remove();
});

$(document).on("click", "#setting", function () {
  $("#settings-overlay").css("display", "flex");
});

$(document).on("click", "#closeSettingsBtn", function () {
  $("#settings-overlay").css("display", "none");
});

$(document).on("click", ".to-main", function () {
  stopCurrentGame();
  showMainMenu();
});

function showMainMenu () {
  stopCurrentGame();
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

  if (isBgmEnabled()) {
    bgmTitle.play().catch(e => console.warn("타이틀 BGM 재생 실패:", e));
  }

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
  // 현재 스테이지 기록
  currentStage = difficulty;
  const padding = 20;
  const brickWidth = 75;
  const brickHeight = 20;
  let goal = 100;
  const playerImg = new Image();
  playerImg.src = selectedPlayerImage;
  window.playerImg = playerImg;
// 패들 이미지를 하나의 Image 객체로 미리 로드
  const barrierImages = [];
  for (let i = 1; i <= 5; i++) {
    const img = new Image();
    img.src = `barrier/barrier_${i}.png`;
    barrierImages.push(img);
  }
  let barrierFrame = 0;
  let barrierCounter = 0;

  if (difficulty === 1) goal = 100;
  else if (difficulty === 2) goal = 125;
  else if (difficulty === 3) goal = 150;

  if (localStorage.getItem(`sc_cleared_stage_${difficulty}`)) {
    $("#goalBoard").text("1등 신기록");
  }

  let score = 0;
  let timeLeft = 45;
  let isGameRunning = true;
  let endingShown = false;
  let bonusMode = false;
  let greenHitCount = 0;
  let timer;
  activeGameCleanup = function() {
    isGameRunning = false;
    clearInterval(timer);
  };
 let lives = 3;
 const initialBallSpeed = { dx: 3, dy: -3 };
  const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 0,
    dy: 0,
    radius: 10,
    opacity: 1
  };
  let mousePos = { x: canvas.width / 2, y: canvas.height / 2 };

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

  function showFloatingText(text, x, y, extraClass) {
    const $container = $("#floating-text-container");
    const $t = $("<div>")
      .addClass("floating-text")
      .addClass(extraClass || "")
      .text(text)
      .css({ left: x + "px", top: y + "px" });
    $container.append($t);
    setTimeout(() => $t.remove(), 1000);
  }
  // -------------------------------------------------

  function showCountdown(callback) {
    const $c = $("#countdown");
    let num = 3;
    $c.text(num).show();
    const iv = setInterval(() => {
      num--;
      if (num > 0) {
        $c.text(num);
      } else {
        clearInterval(iv);
        $c.hide();
        if (callback) callback();
      }
    }, 1000);
  }



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

  const staticLayouts = {
    1: [
      { x: 200, y: 150 }, { x: 300, y: 150 }, { x: 400, y: 150 }, { x: 500, y: 150 },
      { x: 200, y: 350 }, { x: 300, y: 350 }, { x: 400, y: 350 }, { x: 500, y: 350 },
      { x: 200, y: 250 }, { x: 500, y: 250 }
    ],
    2: [
      { x: 250, y: 350 }, { x: 300, y: 250 }, { x: 350, y: 150 }, { x: 400, y: 250 }, { x: 450, y: 350 }
    ],
    3: [
      { x: 470, y: 250 }, { x: 350, y: 370 }, { x: 230, y: 250 }, { x: 350, y: 130 },
      { x: 434, y: 334 }, { x: 265, y: 334 }, { x: 265, y: 165 }, { x: 434, y: 165 }
    ]
  };

  if (staticLayouts[difficulty]) {
    staticLayouts[difficulty].forEach(p => {
      bricks.push({
        x: p.x,
        y: p.y,
        dx: 0,
        dy: 0,
        status: 1,
        type: "static",
        img: null,
        renderWidth: 45,
        renderHeight: 45,
        preserveAspect: true
      });
    });
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
  updateScore();
  $("#lifeBoard").text(`[HP: ${"■".repeat(lives)}]`);
}
function renderStatic() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBricks();
  drawBall();
  drawPaddles();
}

function loseLifeAndResetBall() {
  lives--;
  updateUI();
  flashBorder("glow-red");
  playSFX("SFX/start.mp3");
  if (lives <= 0) {
    endGame("하트 소진");
    return;
  }

  isGameRunning = false;
  let stepsOut = 20;
  const outDx = ball.dx;
  const outDy = ball.dy;

  function flyOut() {
    ball.x += outDx;
    ball.y += outDy;
    renderStatic();
    if (stepsOut-- > 0) {
      requestAnimationFrame(flyOut);
    } else {
      returnCenter();
    }
  }

  function returnCenter() {
    const startX = ball.x;
    const startY = ball.y;
    let t = 0;
    const frames = 20;
    function step() {
      t++;
      ball.x = startX + (canvas.width / 2 - startX) * (t / frames);
      ball.y = startY + (canvas.height / 2 - startY) * (t / frames);
      renderStatic();
      if (t < frames) {
        requestAnimationFrame(step);
      } else {
        fadeIn();
      }
    }
    step();
  }

  function fadeIn() {
    ball.opacity = 0.5;
    renderStatic();
    setTimeout(() => {
      ball.opacity = 1;
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
      ball.dx = initialBallSpeed.dx;
      ball.dy = initialBallSpeed.dy;
      isGameRunning = true;
      requestAnimationFrame(draw);
    }, 500);
  }

  flyOut();
}



  function updateScore() {
    $("#scoreBoard").text(`[score: ${score}]`);
    if (score >= goal) {
      const ranks = getHighScores()[difficulty] || [];
      if (!ranks[0] || score >= ranks[0].score) {
        $("#goalBoard").text("신기록!");
      } else if (!ranks[1] || score >= ranks[1].score) {
        $("#goalBoard").text(`[1위 목표: ${ranks[0].score}]`);
      } else if (!ranks[2] || score >= ranks[2].score) {
        $("#goalBoard").text(`[2위 목표: ${ranks[1].score}]`);
      } else {
        $("#goalBoard").text(`[3위 목표: ${ranks[2].score}]`);
      }
    } else {
      $("#goalBoard").text(`[goal: ${goal}]`);
    }
  }

  function updateTimer() {
    $("#timerBoard").text(`[time: ${timeLeft}s]`);
  }

  function updateGoal() {
    $("#goalBoard").text(`[goal: ${goal}]`);
  }

  function drawBall() {
    ctx.save();
    ctx.globalAlpha = ball.opacity || 1;
    if (playerImg.complete) {
      const size = ball.radius * 4; // 원래 공 지름만큼 크기
      const angle = Math.atan2(mousePos.y - ball.y, mousePos.x - ball.x);
      ctx.translate(ball.x, ball.y);
      ctx.rotate(angle);
      ctx.drawImage(playerImg, -size / 2, -size / 2, size, size);
    } else {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 4);
      ctx.fillStyle = "white";
      ctx.fill();
      ctx.closePath();
    }
    ctx.restore();
  }

function drawPaddles() {
  // 애니메이션 프레임 계산
  barrierCounter++;
  if (barrierCounter % 5 === 0) {
    barrierFrame = (barrierFrame + 1) % barrierImages.length;
  }
  const barrierImg = barrierImages[barrierFrame];

  for (const key in paddles) {
    const p = paddles[key];
    // 패들 중심점 계산
    const cx = p.x + p.width / 2;
    const cy = p.y + p.height / 2;

    ctx.save();
    if (key === "left" || key === "right") {
      // 왼쪽·오른쪽 패들은 90도 회전
      ctx.translate(cx, cy);
      ctx.rotate(Math.PI / 2);
      // 변환된 좌표계에 맞춰서 draw
      // 이때 drawImage(x, y, w, h)에서 w=패들 높이, h=패들 너비
      if (barrierImg.complete) {
        ctx.drawImage(
          barrierImg,
          -p.height / 2,
          -p.width / 2,
          p.height,
          p.width
        );
      } else {
        ctx.fillStyle = "white";
        ctx.fillRect(-p.height / 2, -p.width / 2, p.height, p.width);
      }
    } else {
      // top, bottom 패들은 가로 모양 그대로 그리기
      if (barrierImg.complete) {
        ctx.drawImage(barrierImg, p.x, p.y, p.width, p.height);
      } else {
        ctx.fillStyle = "white";
        ctx.fillRect(p.x, p.y, p.width, p.height);
      }
    }
    ctx.restore();
  }
}


  function drawBricks() {
    // 정적 블럭 애니메이션 프레임 업데이트(느리게)
    staticStarFrameCounter++;
    if (staticStarFrameCounter % 5 === 0) {
      staticStarFrame = (staticStarFrame + 1) % staticStarFrames.length;
    }
    bricks.forEach(b => {
      if (b.status === 1) {
        const bw = b.renderWidth || brickWidth;
        const bh = b.renderHeight || brickHeight;

        if (b.type === "static") {
          const frameImg = staticStarFrames[staticStarFrame];
          if (frameImg.complete) {
            ctx.drawImage(frameImg, b.x, b.y, bw, bh);
          } else {
            ctx.fillStyle = "gray";
            ctx.fillRect(b.x, b.y, bw, bh);
          }
        } else if (b.img && b.img.complete) {
          ctx.drawImage(b.img, b.x, b.y, bw, bh);
        } else {
          ctx.fillStyle = b.bad ? "red" : "gray";
          ctx.fillRect(b.x, b.y, bw, bh);
        }
        if (b.bad) {
          ctx.lineWidth = 2;
          ctx.strokeStyle = "red";
          ctx.strokeRect(b.x, b.y, bw, bh);
        }
      }
    });
  }

  function moveBricks() {
    bricks.forEach(b => {
      if (b.status === 1 && b.type !== "static") {
        const bw = b.renderWidth || brickWidth;
        const bh = b.renderHeight || brickHeight;
        b.x += b.dx;
        b.y += b.dy;
        if (b.x < 0 || b.x + bw > canvas.width) b.dx *= -1;
        if (b.y < 0 || b.y + bh > canvas.height) b.dy *= -1;

        bricks.forEach(s => {
          if (s.type === "static" && s.status === 1) {
            const sw = s.renderWidth || brickWidth;
            const sh = s.renderHeight || brickHeight;
            if (b.x < s.x + sw && b.x + bw > s.x &&
                b.y < s.y + sh && b.y + bh > s.y) {
              if (Math.abs((b.x + bw/2) - (s.x + sw/2)) >
                  Math.abs((b.y + bh/2) - (s.y + sh/2))) {
                b.dx *= -1;
              } else {
                b.dy *= -1;
              }
            }
          }
        });
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
  // 공과 static 블럭 충돌 체크 (수동)
bricks.forEach(b => {
  if (b.status !== 1 || b.type !== "static") return;

  const bw = b.renderWidth || brickWidth;
  const bh = b.renderHeight || brickHeight;

  const isColliding =
    ball.x + ball.radius > b.x &&
    ball.x - ball.radius < b.x + bw &&
    ball.y + ball.radius > b.y &&
    ball.y - ball.radius < b.y + bh;

  if (isColliding) {
    // 충돌 방향 계산
    const overlapX = Math.min(ball.x + ball.radius - b.x, b.x + bw - (ball.x - ball.radius));
    const overlapY = Math.min(ball.y + ball.radius - b.y, b.y + bh - (ball.y - ball.radius));

    if (overlapX < overlapY) {
      ball.dx *= -1;
    } else {
      ball.dy *= -1;
    }

    // 블럭 파괴 처리
    b.status = 0;

    // 효과
    const $wrapper = $("#game-wrapper");
    $wrapper.addClass("shake");
    setTimeout(() => $wrapper.removeClass("shake"), 300);
    flashBorder("glow-blue");
  }
});
  bricks.forEach(b => {
    const bw = b.renderWidth || brickWidth;
    const bh = b.renderHeight || brickHeight;
    if (
      b.status === 1 &&
      ball.x + ball.radius > b.x &&
      ball.x - ball.radius < b.x + bw &&
      ball.y + ball.radius > b.y &&
      ball.y - ball.radius < b.y + bh
    ) {
        b.status = 0;
      // 충돌 방향 계산
      const overlapX = Math.min(ball.x + ball.radius - b.x, b.x + bw - (ball.x - ball.radius));
      const overlapY = Math.min(ball.y + ball.radius - b.y, b.y + bh - (ball.y - ball.radius));
      if (overlapX < overlapY) {
        ball.dx *= -1;
      } else {
        ball.dy *= -1;
      }

      // 인공위성 부딪힘이면 강한 흔들림, 아니면 기본 흔들림
      const $wrapper = $("#game-wrapper")
      if (b.type === "satellite") {
        $wrapper.addClass("shake-strong")
        setTimeout(() => {
          $wrapper.removeClass("shake-strong")
        }, 400) // 애니메이션 길이와 맞춤
        // 이후 파편 생성 로직…
      } else if (b.type !== "static") {
        // trash/debris 충돌 시 기본 shake
        $wrapper.addClass("shake")
        setTimeout(() => {
          $wrapper.removeClass("shake")
        }, 300)
        score += 10
        showFloatingText('+10', b.x + bw / 2, b.y, 'score-text')
        playSFX("SFX/coin.mp3")
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
    else if (b.type !== "static") {
        // trash or debris
        // 공이 정적 블럭과 충돌했을 때 확실하게 튕기기
 // 공이 static 블럭에 부딪힘
  const prevX = ball.x - ball.dx;
  const prevY = ball.y - ball.dy;

  const fromLeft = prevX + ball.radius <= b.x;
  const fromRight = prevX - ball.radius >= b.x + bw;
  const fromTop = prevY + ball.radius <= b.y;
  const fromBottom = prevY - ball.radius >= b.y + bh;

  // 우선순위: 좌우 → 상하
  if (fromLeft || fromRight) {
    ball.dx *= -1;
  } else if (fromTop || fromBottom) {
    ball.dy *= -1;
  } else {
    // 예외적으로 대각선 or 중심박힘 → 둘 다 반전
    ball.dx *= -1;
    ball.dy *= -1;
  }

  b.status = 0;
         flashBorder("glow-blue");
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
    activeGameCleanup = null;
    $("#endingBtn").removeClass("highlight").hide();
    recordHighScore(difficulty, $("#playerNameInput").val() || "Anon", score);
    if (endingShown) {
      setUnlockedStage(difficulty + 1);
      localStorage.setItem(`sc_cleared_stage_${difficulty}`, "1");
      showEnding(score);
    } else {
      // 게임 오버 시점에 점수 기반 엔딩 화면 출력
      showSpecialEnding(score);
    }
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
     collisionDetection();
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

    //목표 달성 시 엔딩 버튼 활성화
    if (!endingShown && score >= goal) {
      endingShown = true;
      updateScore();
      $("#endingBtn").addClass("highlight").show();
    }

    ball.x += ball.dx;
    ball.y += ball.dy;
    // 모든 쓰레기/위성 제거되면 자동 재생성
if (bricks.filter(b => b.status === 1).length === 0) {
  ball.dx += ball.dx >= 0 ? 1 : -1;
  ball.dy += ball.dy >= 0 ? 1 : -1;
  showFloatingText('Speed Up!', canvas.width/2, canvas.height/2, 'speed-text');
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

    mousePos.x = x;
    mousePos.y = y;

    paddles.top.x = Math.min(Math.max(padding, x - paddles.top.width / 2), canvas.width - paddles.top.width - padding);
    paddles.bottom.x = Math.min(Math.max(padding, x - paddles.bottom.width / 2), canvas.width - paddles.bottom.width - padding);
    paddles.left.y = Math.min(Math.max(padding, y - paddles.left.height / 2), canvas.height - paddles.left.height - padding);
    paddles.right.y = Math.min(Math.max(padding, y - paddles.right.height / 2), canvas.height - paddles.right.height - padding);
  });

  updateScore();
  updateTimer();
  updateGoal();

  draw();

  showCountdown(() => {
    ball.dx = initialBallSpeed.dx;
    ball.dy = initialBallSpeed.dy;
    timer = setInterval(() => {
      if (!isGameRunning) return;
      timeLeft--;
      updateTimer();
    }, 1000);
  });

  $("#endingBtn").off("click").on("click", function () {
    isGameRunning = false;
    clearInterval(timer);
    recordHighScore(difficulty, $("#playerNameInput").val() || "Anon", score);
    setUnlockedStage(difficulty + 1);
    localStorage.setItem(`sc_cleared_stage_${difficulty}`, "1");
    $(this).removeClass("highlight").hide();
    showEnding(score);
  });
}


//게임오버 함수
function showCustomEnding(score, imagePath, messageLines) {
  darkenBg();

  const messageHtml = messageLines.map(line => `<p>${line}</p>`).join("");

  $(".content").html(`
    <div class="scenario" id="gameOverBox">
      <div class="scenario-img-wrapper" style="position: relative;">
        <img src="scImg/scImg02.png" class="scenario-img base-img" />
        <img src="${imagePath}" class="moon-fly" />
      </div>
      <div class="scenario-text" style="margin-top: 30px;">
        ${messageHtml}
        <p>당신의 점수는 <span style="color: red; font-weight:bold;">${score}점</span>입니다...</p>
      </div>
      <div class="scenario-links">
        <span class="link-text to-main">Main</span>
        <span class="link-text restart-game">Restart</span>
      </div>
    </div>
  `);

  setTimeout(() => {
    $(".moon-fly").addClass("moon-animate");
  }, 100);
}

//달이 날아가는 엔딩
function showGameOver(score) {
  showCustomEnding(score, "moon2.png", ["앗! 달이 날아갔습니다!!"]);
}
//우주인 날아가는 엔딩
function showSpecialEnding(score) {
  showCustomEnding(score, "exImg/exImg01.png", [
    "우주청소부는 돌아오지 못했습니다.",
    "그의 마지막 임무는 실패로 끝났습니다..."
  ]);
}

const endingTexts = [
  "달의 궤도는 다시 안정되었고...",
  "우주의 쓰레기는 정리되었다...",
  "Game Clear!!"
];

const endingImage = "ending.png";
let endingLine = 0;

function showEnding(score) {
  darkenBg();
  endingLine = -1; // 첫 문장은 별도 처리 > -1부터 시작

  $(".content").empty();

  const $scenario = $("<div>").addClass("scenario");
  const $imgWrapper = $("<div>").addClass("scenario-img-wrapper").append(
    $("<img>").attr("src", endingImage).addClass("scenario-img")
  );

  // 점수 안내
  const $text = $("<div>").addClass("scenario-text").text(`축하합니다 !! 당신의 점수는 ${score}점입니다 !!`);

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
    if (currentStage < 3) {
      // 다음 스테이지 자동 시작
      startCanvasGameUI();
      runPaddleBrickGame(currentStage + 1);
    } else {
      showMainMenu(); // 마지막 스테이지 이후엔 메인으로
    }
  }
});



$(document).on("click", ".to-main", function () {
  stopCurrentGame();
  showMainMenu(); // 메인으로 이동
});

$(document).on("click", ".restart-game", function () {
  stopCurrentGame();
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

function applySettings() {
  const volume = parseFloat($("#bgmVolume").val());
  const bgmToggle = $("#bgmToggle").is(":checked");
  const sfxToggle = $("#sfxToggle").is(":checked");
  const sVolume = parseFloat($("#sfxVolume").val());
  const selectedBgm = $("#bgmSelect").val();
  selectedPlayerImage = $("#playerSelect").val();

  bgmTitle.volume = volume;
  bgmGame.volume = volume;
  if (bgmToggle) {
    if (!bgmTitle.paused) bgmTitle.play().catch(()=>{});
    if (!bgmGame.paused) bgmGame.play().catch(()=>{});
  } else {
    bgmTitle.pause();
    bgmGame.pause();
  }

  if (bgmGame.src.indexOf(selectedBgm) === -1) {
    const wasPlaying = !bgmGame.paused;
    bgmGame.src = `BGM/${selectedBgm}`;
    bgmGame.load();
    if (bgmToggle && wasPlaying) {
      bgmGame.play().catch(()=>{});
    }
  }

  sfxEnabled = sfxToggle;
  sfxVolume = sVolume;

  if (window.playerImg) {
    window.playerImg.src = selectedPlayerImage;
  }

  $("#settings-overlay").css("display", "none");
}

window.applySettings = applySettings;
