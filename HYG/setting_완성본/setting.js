$(document).ready(function () {
  let bgmAudio = new Audio();
  let sfxEnabled = true;
  let sfxVolume = 0.5;

  function applySettings() {
    window.userBallColor = $('#ballColor').val();
    const bgmFile = $('#bgmSelect').val();
    const bgmToggle = $('#bgmToggle').is(':checked');
    const bgmVolume = parseFloat($('#bgmVolume').val());

    bgmAudio.src = bgmFile;
    bgmAudio.loop = true;
    bgmAudio.volume = bgmVolume;
    if (bgmToggle) bgmAudio.play();
    else bgmAudio.pause();

    sfxEnabled = $('#sfxToggle').is(':checked');
    sfxVolume = parseFloat($('#sfxVolume').val());
  }

  function playSFX(soundFile) {
    if (!sfxEnabled) return;
    const sfx = new Audio(soundFile);
    sfx.volume = sfxVolume;
    sfx.play();
  }

  $('#setting').on('click', function () {
    $('#settings').toggle();
  });

  $('#closeSettingsBtn').on('click', function () {
    $('#settings').hide();
  });

  // applySettings 함수를 외부에서도 쓸 수 있게 만듦
  window.applySettings = applySettings;
});


$(document).ready(function () {
  $('.color-btn').on('click', function () {
      // 선택된 표시
    $('.color-btn').removeClass('selected');
    $(this).addClass('selected');

      // 색상 저장
    $('#selectedColor').val($(this).data('color'));
  });

window.applySettings = function () {
    const selectedSuitColor = $('#selectedColor').val();
    console.log("우주복 색상:", selectedSuitColor);
      // 이 색상을 적용하는 로직 추가
    };
  });

