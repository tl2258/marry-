const SITE_PHOTOS_KEY = 'wedding_full_site_photos_v2';

// 全站默认图片配置
export const DEFAULT_SITE_PHOTOS = {
  heroCover: './photos/origin14.jpg',
  groomPhoto: './photos/xinlang.jpg',
  bridePhoto: './photos/xinniang.jpg',
  venuePhoto: './photos/origin13.jpg',
  rsvpPhoto: './photos/origin1.jpg',
  gallery: [
    { id: 'm1', src: './photos/origin4.jpg', title: '定格瞬间 1' },
    { id: 'm2', src: './photos/origin5.jpg', title: '定格瞬间 2' },
    { id: 'm3', src: './photos/origin6.jpg', title: '定格瞬间 3' },
    { id: 'm4', src: './photos/origin7.jpg', title: '定格瞬间 4' },
    { id: 'm5', src: './photos/origin8.jpg', title: '定格瞬间 5' },
    { id: 'm6', src: './photos/origin9.jpg', title: '定格瞬间 6' },
    { id: 'm7', src: './photos/origin10.jpg', title: '定格瞬间 7' },
    { id: 'm8', src: './photos/origin11.jpg', title: '定格瞬间 8' },
    { id: 'm9', src: './photos/origin12.jpg', title: '定格瞬间 9' }
  ]
};

/**
 * 获取全站当前图片配置
 */
export function getSitePhotos() {
  try {
    const raw = localStorage.getItem(SITE_PHOTOS_KEY);
    if (!raw) return DEFAULT_SITE_PHOTOS;
    const data = JSON.parse(raw);
    return {
      heroCover: data.heroCover || DEFAULT_SITE_PHOTOS.heroCover,
      groomPhoto: data.groomPhoto || DEFAULT_SITE_PHOTOS.groomPhoto,
      bridePhoto: data.bridePhoto || DEFAULT_SITE_PHOTOS.bridePhoto,
      venuePhoto: data.venuePhoto || DEFAULT_SITE_PHOTOS.venuePhoto,
      rsvpPhoto: data.rsvpPhoto || DEFAULT_SITE_PHOTOS.rsvpPhoto,
      gallery: Array.isArray(data.gallery) && data.gallery.length > 0 ? data.gallery : DEFAULT_SITE_PHOTOS.gallery
    };
  } catch (e) {
    console.error("读取全站图片配置失败:", e);
    return DEFAULT_SITE_PHOTOS;
  }
}

/**
 * 全量保存图片配置
 */
export function saveSitePhotos(config) {
  try {
    localStorage.setItem(SITE_PHOTOS_KEY, JSON.stringify(config));
  } catch (e) {
    alert("保存图片失败，存储空间超限。请上传更小尺寸的图片！");
  }
}

/**
 * 替换单个固定展示图（如 heroCover, groomPhoto, bridePhoto, venuePhoto, rsvpPhoto）
 */
export function updateSingleSitePhoto(key, base64Src) {
  const config = getSitePhotos();
  config[key] = base64Src;
  saveSitePhotos(config);
}

/**
 * 【定格瞬间】相册：新增照片
 */
export function addGalleryPhoto(base64Src) {
  const config = getSitePhotos();
  const newId = 'm_' + Date.now();
  config.gallery.push({
    id: newId,
    src: base64Src,
    title: `定格瞬间 ${config.gallery.length + 1}`
  });
  saveSitePhotos(config);
}

/**
 * 【定格瞬间】相册：替换指定照片
 */
export function updateGalleryPhoto(index, base64Src) {
  const config = getSitePhotos();
  if (config.gallery[index]) {
    config.gallery[index].src = base64Src;
    saveSitePhotos(config);
  }
}

/**
 * 【定格瞬间】相册：删除指定照片
 */
export function deleteGalleryPhoto(index) {
  const config = getSitePhotos();
  if (config.gallery[index]) {
    config.gallery.splice(index, 1);
    saveSitePhotos(config);
  }
}

/**
 * 【定格瞬间】相册：排版移动照片（direction: -1 向上, 1 向下）
 */
export function moveGalleryPhoto(index, direction) {
  const config = getSitePhotos();
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= config.gallery.length) return;

  const temp = config.gallery[index];
  config.gallery[index] = config.gallery[targetIndex];
  config.gallery[targetIndex] = temp;

  saveSitePhotos(config);
}

/**
 * 重置回初始预设图片
 */
export function resetSitePhotos() {
  localStorage.removeItem(SITE_PHOTOS_KEY);
}

/**
 * Canvas 高品质压缩上传文件为 Base64
 */
export function compressUploadedImage(file, maxWidth = 1200, quality = 0.78) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}
