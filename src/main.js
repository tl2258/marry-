import confetti from 'canvas-confetti';
import { weddingConfig } from './config.js';
import { openMapSelector } from './utils/map.js';
import { initMusicPlayer } from './utils/music.js';
import { saveGuestRSVP, getStoredGuests } from './utils/notify.js';
import { getSitePhotos } from './utils/galleryStore.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. 初始化悬浮音乐播放器
  initMusicPlayer();

  // 2. 动态渲染配置文件与全站自定义图片
  renderConfigData();

  // 3. 开启精确到秒的倒计时
  startCountdown();

  // 4. 动态渲染【定格瞬间】相册 (支持后台增删排版与实时修改)
  renderMomentsGallery();

  // 5. 绑定地图选择导航按钮
  const mapBtn = document.getElementById('open-map-btn');
  if (mapBtn) {
    mapBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openMapSelector();
    });
  }

  // 6. 初始化 Lightbox 相册大图放大
  initLightbox();

  // 7. 初始化 IntersectionObserver 元素滚动显现动效
  initScrollReveal();

  // 8. 初始化弹幕墙历史留言
  initBulletWall();

  // 9. 智能自动下滑体验 (8秒后自动下滑至下一屏)
  initAutoScrollDown();

  // 10. 绑定 RSVP 赴约表单提交事件
  const rsvpForm = document.getElementById('rsvp-form');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('guest-name').value.trim();
      const phone = document.getElementById('guest-phone').value.trim();
      const count = document.getElementById('guest-count').value;
      const blessing = document.getElementById('guest-blessing').value.trim() || '祝新人新婚快乐，百年好合，永结同心！';

      if (!name) return alert('请输入您的姓名');

      const guestData = { name, phone, count, blessing };
      
      // 保存数据并触发微信 Server酱 推送
      saveGuestRSVP(guestData);

      // 实时追加到弹幕墙
      addBullet(`${name}: ${blessing}`);

      // 触发 Confetti 浪漫彩带与心形花瓣
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.65 },
        colors: ['#7C5454', '#C5A059', '#D4A3A3', '#FAF9F7']
      });

      alert(`💌 感谢 ${name} 的回复！赴约信息已提交，新人已收到您的真挚祝福！`);
      rsvpForm.reset();
    });
  }

  // 10. 暗号进入后台 (连续点击页脚 5 次)
  let clickCount = 0;
  const footerBtn = document.getElementById('footer-secret-btn');
  if (footerBtn) {
    footerBtn.addEventListener('click', () => {
      clickCount++;
      if (clickCount >= 5) {
        window.location.href = './admin.html?v=' + Date.now();
      }
    });
  }

  // 11. 初始化 Canvas 浪漫香槟金粒子与心形特效
  initParticleCanvas();
});

// 渲染配置文件与全站自定义图片
function renderConfigData() {
  const sitePhotos = getSitePhotos();

  // 1. 核心形象照动态绑定
  const heroCover = document.getElementById('hero-cover-img');
  if (heroCover && sitePhotos.heroCover) heroCover.src = sitePhotos.heroCover;

  const groomImg = document.getElementById('groom-photo-img');
  if (groomImg && sitePhotos.groomPhoto) groomImg.src = sitePhotos.groomPhoto;

  const brideImg = document.getElementById('bride-photo-img');
  if (brideImg && sitePhotos.bridePhoto) brideImg.src = sitePhotos.bridePhoto;

  const venueImg = document.getElementById('venue-photo-img');
  if (venueImg && sitePhotos.venuePhoto) venueImg.src = sitePhotos.venuePhoto;

  // 2. 文本信息绑定
  const coupleTitle = document.getElementById('couple-name-title');
  if (coupleTitle) coupleTitle.innerText = `${weddingConfig.groomName} & ${weddingConfig.brideName}`;

  const groomText = document.getElementById('groom-name-text');
  if (groomText) groomText.innerText = weddingConfig.groomName;

  const brideText = document.getElementById('bride-name-text');
  if (brideText) brideText.innerText = weddingConfig.brideName;

  const dateStr = document.getElementById('display-date-str');
  if (dateStr) dateStr.innerText = `${weddingConfig.weddingDateDisplay.split(' ')[0]} · ${weddingConfig.location.hotelName}`;

  const mapDate = document.getElementById('map-date-text');
  if (mapDate) mapDate.innerText = weddingConfig.weddingDateDisplay;

  const mapHotel = document.getElementById('map-hotel-text');
  if (mapHotel) mapHotel.innerText = weddingConfig.location.hotelName;

  const mapAddr = document.getElementById('map-address-text');
  if (mapAddr) mapAddr.innerText = weddingConfig.location.address;
}

// 倒计时逻辑 (支持天/时/分/秒)
function startCountdown() {
  const target = new Date(weddingConfig.weddingDate).getTime();

  function update() {
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
      if (document.getElementById('cd-days')) document.getElementById('cd-days').innerText = '00';
      if (document.getElementById('cd-hours')) document.getElementById('cd-hours').innerText = '00';
      if (document.getElementById('cd-mins')) document.getElementById('cd-mins').innerText = '00';
      if (document.getElementById('cd-secs')) document.getElementById('cd-secs').innerText = '00';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    if (document.getElementById('cd-days')) document.getElementById('cd-days').innerText = String(d).padStart(2, '0');
    if (document.getElementById('cd-hours')) document.getElementById('cd-hours').innerText = String(h).padStart(2, '0');
    if (document.getElementById('cd-mins')) document.getElementById('cd-mins').innerText = String(m).padStart(2, '0');
    if (document.getElementById('cd-secs')) document.getElementById('cd-secs').innerText = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// 动态渲染【定格瞬间】相册 (支持增删与自由排版)
function renderMomentsGallery() {
  const grid = document.querySelector('.gallery-grid');
  if (!grid) return;

  const sitePhotos = getSitePhotos();
  const gallery = sitePhotos.gallery || [];
  grid.innerHTML = '';

  gallery.forEach(item => {
    const div = document.createElement('div');
    div.className = 'gallery-item reveal-on-scroll visible';
    div.setAttribute('data-img', item.src);
    div.innerHTML = `
      <img src="${item.src}" alt="${item.title || '婚纱照'}" loading="lazy">
      <div class="gallery-overlay"><div class="gallery-zoom-icon">🔍</div></div>
    `;
    grid.appendChild(div);
  });

  // 绑定 Lightbox
  initLightbox();
}

// Lightbox 相册大图放大 Modal 逻辑
function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  if (!modal || !modalImg) return;

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.onclick = () => {
      const imgSrc = item.getAttribute('data-img');
      modalImg.src = imgSrc;
      modal.classList.add('active');
    };
  });

  if (closeBtn) {
    closeBtn.onclick = () => modal.classList.remove('active');
  }

  modal.onclick = (e) => {
    if (e.target === modal) modal.classList.remove('active');
  };
}

// IntersectionObserver 页面元素滚动淡入与浮现
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // 可选：触发后取消监听，只动画一次
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
}

// 升级版高奢全屏多轨道横向弹幕系统
function initBulletWall() {
  const container = document.getElementById('bullet-container');
  if (!container) return;
  container.innerHTML = '';

  const guests = getStoredGuests();
  const defaultBlessings = [
    { name: '新婚大喜', text: '祝谭浪 & 龙红波 白头偕老，幸福美满！' },
    { name: '好友送福', text: '愿你们执子之手，与子偕老，新婚快乐！' },
    { name: '喜结良缘', text: '期待 8 月 30 日在温德姆星铂丽宴会艺术中心相聚！' },
    { name: '永结同心', text: '祝新郎官谭浪和新娘子龙红波早生贵子！' },
    { name: '百年好合', text: '佳偶天成，琴瑟和鸣，祝永远幸福甜蜜！' },
    { name: '甜蜜长久', text: '祝你们的爱情如满天星辰般闪耀永恒！' }
  ];

  const userBlessings = guests
    .filter(g => g.blessing)
    .map(g => ({ name: g.name, text: g.blessing }));

  const pool = [...userBlessings, ...defaultBlessings];

  let index = 0;
  function launchNext() {
    if (pool.length === 0) return;
    const item = pool[index % pool.length];
    addBullet(item.name, item.text);
    index++;
    const nextDelay = Math.random() * 1500 + 1200; // 1.2s ~ 2.7s 平滑连续派发
    setTimeout(launchNext, nextDelay);
  }

  // 刚进页面立刻连续派发 5 条高低错落的华丽弹幕
  for (let i = 0; i < Math.min(5, pool.length); i++) {
    setTimeout(() => {
      addBullet(pool[i].name, pool[i].text);
    }, i * 400);
  }

  setTimeout(launchNext, 2200);
}

function addBullet(author, blessingText) {
  const container = document.getElementById('bullet-container');
  if (!container) return;

  const textStr = blessingText ? `${author}: ${blessingText}` : author;
  const parts = textStr.split(':');
  const name = parts[0] || '好友';
  const text = parts.slice(1).join(':') || '新婚快乐，百年好合！';

  const el = document.createElement('div');
  el.className = 'danmaku-item';
  el.innerHTML = `<span class="danmaku-avatar">💌</span><span class="danmaku-author">${escapeHtml(name)}:</span><span class="danmaku-text">${escapeHtml(text)}</span>`;

  // 随机分布在屏幕 8% ~ 48% 多条平行轨道
  const topPercent = Math.floor(Math.random() * 40) + 8;
  el.style.top = `${topPercent}%`;

  // 10s ~ 14s 标准平滑全屏飞行时间
  const duration = Math.random() * 4 + 10;
  el.style.animationDuration = `${duration}s`;

  container.appendChild(el);

  setTimeout(() => {
    el.remove();
  }, duration * 1000 + 300);
}

// Canvas 背景金粉与心形上升粒子 (浪漫升级版：加入呼吸与摇曳效果)
function initParticleCanvas() {
  const canvas = document.getElementById('bg-particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = 35; // 增加粒子数量

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3.5 + 1.5,
      speedY: Math.random() * 0.3 + 0.15,
      speedX: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.2,
      isHeart: Math.random() > 0.65,
      angle: Math.random() * Math.PI * 2,
      spinSpeed: Math.random() * 0.02 - 0.01 // 摇摆角速度
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y -= p.speedY;
      // 增加正弦波摇曳效果，模拟微风
      p.x += p.speedX + Math.sin(p.angle) * 0.4;
      p.angle += p.spinSpeed;

      if (p.y < -20) {
        p.y = height + 20;
        p.x = Math.random() * width;
      }
      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;

      ctx.save();
      // 让透明度随正弦波有轻微的呼吸闪烁
      ctx.globalAlpha = p.opacity + (Math.sin(p.angle * 2) * 0.15);
      if (ctx.globalAlpha < 0) ctx.globalAlpha = 0;
      if (ctx.globalAlpha > 1) ctx.globalAlpha = 1;

      if (p.isHeart) {
        ctx.fillStyle = '#7C5454';
        ctx.font = `${p.size * 3.5 + 4}px sans-serif`;
        ctx.fillText('♥', p.x, p.y);
      } else {
        // 珍珠金微光发散点
        ctx.fillStyle = '#D4AF37';
        ctx.shadowBlur = p.size * 2;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.6)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }

  draw();
}

// 转义 HTML 字符防 XSS
function escapeHtml(str) {
  return String(str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// 智能自动慢速下滑：若用户未手动滚动，则一点点缓慢匀速下滑 (类似电影字幕)
function initAutoScrollDown() {
  let hasInteracted = false;
  let animationFrameId;
  let isAutoScrolling = false;
  
  // 监听用户的真实物理交互
  const handleInteraction = () => {
    hasInteracted = true;
    if (isAutoScrolling) {
      cancelAnimationFrame(animationFrameId);
      isAutoScrolling = false;
    }
    ['touchstart', 'wheel', 'mousedown', 'touchmove'].forEach(evt => {
      window.removeEventListener(evt, handleInteraction);
    });
  };
  
  ['touchstart', 'wheel', 'mousedown', 'touchmove'].forEach(evt => {
    window.addEventListener(evt, handleInteraction, { passive: true });
  });

  // 延迟 4 秒后开始一点点缓慢下滑
  setTimeout(() => {
    if (!hasInteracted) {
      isAutoScrolling = true;
      let lastTime = 0;
      // 设定下滑速度 (像素/毫秒)，控制得很慢，每秒滑动约 25px
      const pixelsPerMs = 25 / 1000; 

      const autoScroll = (time) => {
        if (hasInteracted) return; // 用户干预，随时打断
        if (lastTime !== 0) {
          const delta = time - lastTime;
          window.scrollBy(0, delta * pixelsPerMs);
        }
        lastTime = time;
        
        // 如果滑到底部了则自动停止
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
          return;
        }
        animationFrameId = requestAnimationFrame(autoScroll);
      };
      
      animationFrameId = requestAnimationFrame(autoScroll);
    }
  }, 4000);
}
