import { weddingConfig } from '../config.js';

let audioInstance = null;
let isPlaying = false;

export function initMusicPlayer() {
  audioInstance = new Audio(weddingConfig.bgmUrl);
  audioInstance.loop = true;

  const musicContainer = document.createElement('div');
  musicContainer.id = 'music-player-btn';
  musicContainer.className = 'music-player-btn paused';
  musicContainer.innerHTML = `
    <div class="cd-disc">
      <div class="cd-center"></div>
      <div class="cd-notes">🎵</div>
    </div>
  `;

  document.body.appendChild(musicContainer);

  const togglePlay = () => {
    if (isPlaying) {
      audioInstance.pause();
      musicContainer.classList.remove('playing');
      musicContainer.classList.add('paused');
      isPlaying = false;
    } else {
      audioInstance.play().then(() => {
        musicContainer.classList.add('playing');
        musicContainer.classList.remove('paused');
        isPlaying = true;
      }).catch(err => {
        console.log("音频自动播放被拦截:", err);
      });
    }
  };

  musicContainer.addEventListener('click', togglePlay);

  // 微信环境自动播放适配
  if (typeof window.WeixinJSBridge !== 'undefined') {
    window.WeixinJSBridge.invoke('getNetworkType', {}, () => {
      togglePlay();
    });
  } else {
    document.addEventListener('WeixinJSBridgeReady', () => {
      togglePlay();
    }, false);
  }

  // 首次触摸页面自动播放
  const handleFirstTouch = () => {
    if (!isPlaying) {
      togglePlay();
    }
    document.removeEventListener('touchstart', handleFirstTouch);
    document.removeEventListener('click', handleFirstTouch);
  };

  document.addEventListener('touchstart', handleFirstTouch);
  document.addEventListener('click', handleFirstTouch);
}
