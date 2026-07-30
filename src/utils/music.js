import { weddingConfig } from '../config.js';

let audioInstance = null;
let isPlaying = false;

export function initMusicPlayer() {
  if (document.getElementById('music-player-btn')) return;

  // 优先获取原生 DOM 音频节点
  audioInstance = document.getElementById('wedding-bgm') || new Audio(weddingConfig.bgmUrl);
  audioInstance.loop = true;

  const musicContainer = document.createElement('div');
  musicContainer.id = 'music-player-btn';
  musicContainer.className = 'music-player-btn paused';
  musicContainer.setAttribute('title', '点击播放/暂停背景音乐');
  musicContainer.innerHTML = `
    <div class="cd-disc">
      <div class="cd-center"></div>
      <div class="cd-notes">🎵</div>
    </div>
  `;

  document.body.appendChild(musicContainer);

  const startPlay = () => {
    if (isPlaying) return;
    const playPromise = audioInstance.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isPlaying = true;
        musicContainer.classList.add('playing');
        musicContainer.classList.remove('paused');
      }).catch(err => {
        console.log("等待用户交互唤醒音频播放:", err);
      });
    }
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

  // 微信生态内部自动播放核心逻辑
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

  // 页面手势唤醒（滑动、轻触）
  const handleUserGesture = () => {
    startPlay();
    ['touchstart', 'touchend', 'click', 'scroll', 'pointerdown'].forEach(evt => {
      document.removeEventListener(evt, handleUserGesture, true);
    });
  };

  ['touchstart', 'touchend', 'click', 'scroll', 'pointerdown'].forEach(evt => {
    document.addEventListener(evt, handleUserGesture, true);
  });
}
