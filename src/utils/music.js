import { weddingConfig } from '../config.js';

let audioInstance = null;
let isPlaying = false;

export function initMusicPlayer() {
  if (document.getElementById('music-player-btn')) return;

  // 优先获取原生 DOM 音频节点
  audioInstance = document.getElementById('wedding-bgm') || new Audio(weddingConfig.bgmUrl || './Years.mp3');
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
    if (!audioInstance) return;
    audioInstance.muted = false;
    const playPromise = audioInstance.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        isPlaying = true;
        musicContainer.classList.add('playing');
        musicContainer.classList.remove('paused');
      }).catch(err => {
        console.log("浏览器拦截音频自动播放，等待用户手势激活:", err);
      });
    }
  };

  const pausePlay = () => {
    if (!audioInstance) return;
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
      audioInstance.load();
      startPlay();
    }
  };

  // 点击唱片图标强制开启/关闭播放
  musicContainer.addEventListener('click', togglePlay);

  // 1. 微信生态 JSBridge 自动唤醒
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

  // 2. 浏览器全屏手势唤醒（首次点击、长按、下滑、微触）
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
