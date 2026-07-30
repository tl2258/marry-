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

  // 9. 绑定 RSVP 赴约表单提交事件
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
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
}

// 实时弹幕墙
function initBulletWall() {
  const container = document.getElementById('bullet-container');
  if (!container) return;

  const guests = getStoredGuests();
  const defaultBullets = [
    "谭浪 & 龙红波 新婚快乐！百年好合！",
    "祝福二位白头偕老，甜甜蜜蜜！",
    "期待 8 月 30 日星铂丽宴会艺术中心相聚！",
    "永结同心，永远幸福幸福！"
  ];

  const allBullets = guests
    .filter(g => g.blessing)
    .map(g => `${g.name}: ${g.blessing}`)
    .concat(defaultBullets);

  allBullets.forEach((text, i) => {
    setTimeout(() => {
      addBullet(text);
    }, i * 2500);
  });
}

function addBullet(text) {
  const container = document.getElementById('bullet-container');
  if (!container) return;

  const bullet = document.createElement('div');
  bullet.className = 'bullet-item';
  bullet.innerText = text;
  bullet.style.top = `${Math.random() * 60 + 15}%`;
  
  container.appendChild(bullet);

  setTimeout(() => {
    bullet.remove();
  }, 12000);
}

// Canvas 背景金粉与心形上升粒子
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
  const particleCount = 28;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speedY: Math.random() * 0.4 + 0.1,
      speedX: (Math.random() - 0.5) * 0.2,
      opacity: Math.random() * 0.5 + 0.2,
      isHeart: Math.random() > 0.7
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y -= p.speedY;
      p.x += p.speedX;

      if (p.y < 0) {
        p.y = height;
        p.x = Math.random() * width;
      }

      ctx.save();
      ctx.globalAlpha = p.opacity;
      if (p.isHeart) {
        ctx.fillStyle = '#7C5454';
        ctx.font = `${p.size * 3 + 4}px sans-serif`;
        ctx.fillText('♥', p.x, p.y);
      } else {
        ctx.fillStyle = '#C5A059';
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
