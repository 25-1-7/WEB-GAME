let bgmAudio = new Audio();
let sfxEnabled = true;
let sfxVolume = 0.5;

function applySettings() {
  // 우주복 색상
  window.userBallColor = document.getElementById("ballColor").value;

  // 배경음 선택
  const bgmFile = document.getElementById("bgmSelect").value;
  const bgmToggle = document.getElementById("bgmToggle").checked;
  const bgmVolume = parseFloat(document.getElementById("bgmVolume").value);
  
  bgmAudio.src = bgmFile;
  bgmAudio.loop = true;
  bgmAudio.volume = bgmVolume;
  if (bgmToggle) {
    bgmAudio.play();
  } else {
    bgmAudio.pause();
  }

  // 효과음 설정
  sfxEnabled = document.getElementById("sfxToggle").checked;
  sfxVolume = parseFloat(document.getElementById("sfxVolume").value);


// 효과음 재생 예시
function playSFX(soundFile) {
  if (!sfxEnabled) return;
  const sfx = new Audio(soundFile);
  sfx.volume = sfxVolume;
  sfx.play();
}

// 기존 토글 버튼
document.getElementById("toggleSettingsBtn").addEventListener("click", function() {
  const settingsDiv = document.getElementById("settings");
  settingsDiv.style.display = (settingsDiv.style.display === "none") ? "block" : "none";
});

// 닫기 버튼
document.getElementById("closeSettingsBtn").addEventListener("click", function() {
  document.getElementById("settings").style.display = "none";
});
