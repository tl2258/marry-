const GALLERY_STORAGE_KEY = 'wedding_custom_gallery_v1';

export const DEFAULT_GALLERY = [
  { id: 'm1', src: './origin4.jpg', name: '定格瞬间 1' },
  { id: 'm2', src: './origin5.jpg', name: '定格瞬间 2' },
  { id: 'm3', src: './origin6.jpg', name: '定格瞬间 3' },
  { id: 'm4', src: './origin7.jpg', name: '定格瞬间 4' },
  { id: 'm5', src: './origin8.jpg', name: '定格瞬间 5' },
  { id: 'm6', src: './origin9.jpg', name: '定格瞬间 6' },
  { id: 'm7', src: './origin10.jpg', name: '定格瞬间 7' },
  { id: 'm8', src: './origin11.jpg', name: '定格瞬间 8' },
  { id: 'm9', src: './origin12.jpg', name: '定格瞬间 9' }
];

/**
 * 获取当前相册图片列表（优先读 LocalStorage）
 */
export function getCustomGallery() {
  try {
    const raw = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (!raw) return DEFAULT_GALLERY;
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_GALLERY;
  } catch (e) {
    console.error("读取自定义相册失败", e);
    return DEFAULT_GALLERY;
  }
}

/**
 * 保存自定义相册列表
 */
export function saveCustomGallery(list) {
  try {
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    alert("保存图片失败，存储空间可能超限，请尝试上传更小尺寸的图片。");
  }
}

/**
 * 更新单张照片
 */
export function updateGalleryItem(index, base64Src) {
  const list = getCustomGallery();
  if (list[index]) {
    list[index].src = base64Src;
    saveCustomGallery(list);
  }
}

/**
 * 恢复默认相册
 */
export function resetGallery() {
  localStorage.removeItem(GALLERY_STORAGE_KEY);
}

/**
 * 将用户上传的 File 自动使用 Canvas 高品质压缩为 Base64
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
