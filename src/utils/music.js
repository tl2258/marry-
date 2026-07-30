import { weddingConfig } from '../config.js';

let audioInstance = null;
let isPlaying = false;

export function initMusicPlayer() {
  // 避免重复初始化
  if (document.getElementById('music-player-btn')) return;

  audioInstance = new Audio(weddingConfig.bgmUrl);
  audioInstance.loop = true;
  audioInstance.preload = 'auto';

  const musicContainer = document.createElement('div');
  musicContainer.id = 'music-player-btn';
  musicContainer.className = 'music-player-btn paused';
  musicContainer.setAttribute('title', '背景音乐控制');
  musicContainer.innerHTML = `
    <div class="cd-disc">
      <div class="cd-center"></div>
      <div class="cd-notes">🎵</div>
    </div>
  `;

  document.body.appendChild(musicContainer);

  const startPlay = () => {
    if (isPlaying) return;
    audioInstance.play().then(() => {
      isPlaying = true;
      musicContainer.classList.add('playing');
      musicContainer.classList.remove('paused');
    }).catch(err => {
      console.log("音频播放需要用户手势激活:", err);
    });
  };

  const pausePlay = () => {
    audioInstance.pause();
    isPlaying = false;
    musicContainer.classList.remove('playing');
    musicContainer.classList.add('paused');
  };

  const togglePlay = (e) => {
    if (e) e.stopPropagation();
    if (isPlaying) {
      pausePlay();
    } else {
      startPlay();
    }
  };

  musicContainer.addEventListener('click', togglePlay);

  // 1. 微信 JSBridge 官方接口自动唤醒
  const autoPlayWechat = () => {
    if (window.WeixinJSBridge) {
      window.WeixinJSBridge.invoke('getNetworkType', {}, () => {
        audioInstance.load();
        startPlay();
      }, false);
    }
  };

  if (typeof window.WeixinJSBridge === 'object' && typeof window.WeixinJSBridge.invoke === 'function') {
    autoPlayWechat();
  } else {
    document.addEventListener('WeixinJSBridgeReady', autoPlayWechat, false);
  }

  // 2. 页面任意首个用户手势（滑动/触摸/点击）全能兼容激活
  const handleUserGesture = () => {
    startPlay();
    ['touchstart', 'touchend', 'click', 'scroll'].forEach(evt => {
      document.removeEventListener(evt, handleUserGesture, true);
    });
  };

  ['touchstart', 'touchend', 'click', 'scroll'].forEach(evt => {
    document.addEventListener(evt, handleUserGesture, true);
  });
}
