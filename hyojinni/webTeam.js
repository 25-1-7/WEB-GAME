// 시나리오 텍스트 배열
const scenarioTexts = [
    "2100년, 지구에 쓰레기가 가득 차버려 우주에 쏘아올린지 38년째...",
    "가득 떠도는 우주 쓰레기로 인해 위성의 궤도가 뒤틀렸다...",
    "가득 찬 쓰레기를 치워 되돌려보자..."
];
let currentLine = 0;

$("#start").on("click", function () {
    // 초기 화면 숨기기 + 배경 어둡게
    $(".title, .menu").addClass("hidden");
    $(".background").css("filter", "brightness(0.3)");

    // 시나리오 전체 컨테이너
    const $scenario = $("<div>").addClass("scenario");

    // 시나리오 이미지
    const $img = $("<img>")
        .attr("src", "img05.jpeg")
        .addClass("scenario-img");

    // 텍스트
    const $text = $("<div>")
        .addClass("scenario-text")
        .text(scenarioTexts[currentLine]);

    // Next/Skip 텍스트 링크
    const $buttonBox = $("<div>").addClass("scenario-links");
    const $next = $("<span>").addClass("link-text next-link").text("Next");
    const $skip = $("<span>").addClass("link-text skip-link").text("Skip");
    $buttonBox.append($next, $skip);

    // 구성 붙이기
    $scenario.append($img, $text, $buttonBox);
    $(".content").append($scenario);
});

// 다음 텍스트
$(document).on("click", ".next-link", function () {
    currentLine++;
    if (currentLine < scenarioTexts.length) {
        $(".scenario-text").text(scenarioTexts[currentLine]);
    } else {
        endScenario();
    }
});

// 스킵 클릭 시 종료
$(document).on("click", ".skip-link", function () {
    endScenario();
});

function endScenario() {
    $(".scenario").remove();
    $(".background").css("filter", "brightness(1)");
    currentLine = 0;
}

const starPositions = [
    { top: "50px", left: "120px" },   // 왼쪽 위
    { top: "320px", left: "60px" }, // 왼쪽 중간
    { top: "120px", left: "600px" }, // 달 근처
    { top: "230px", left: "680px" }, // 산 위
    { top: "250px", left: "300px" }  // 아래
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
      const $credit = $(`
        <div class="credit-overlay">
          <div class="credit-popup">
            <span class="credit-close">&times;</span>
            <h2>Credits</h2>
            <p>👨‍🚀웹프로그래밍 팀프로젝트👨‍🚀</p>
            <p>이지환<br>이재서<br>문효진<br>박종혁<br>홍영근</p>
            <br>
          </div>
        </div>
      `);
      $("body").append($credit);
    }
  });
  
  $(document).on("click", ".credit-close", function () {
    $(".credit-overlay").addClass("hidden");
  });
  