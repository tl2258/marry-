import * as XLSX from 'xlsx';
import { weddingConfig } from './config.js';
import { getStoredGuests } from './utils/notify.js';
import {
  getSitePhotos,
  updateSingleSitePhoto,
  addGalleryPhoto,
  updateGalleryPhoto,
  deleteGalleryPhoto,
  moveGalleryPhoto,
  resetSitePhotos,
  compressUploadedImage
} from './utils/galleryStore.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginOverlay = document.getElementById('login-overlay');
  const passInput = document.getElementById('admin-pass-input');
  const loginBtn = document.getElementById('login-btn');

  // 预先渲染 Dashboard 与图片面板
  renderDashboard();

  // 1. 登录逻辑
  const doLogin = () => {
    const val = passInput.value.trim();
    if (val === weddingConfig.adminPassword || val === 'admin') {
      loginOverlay.style.display = 'none';
      renderDashboard();
    } else {
      alert('密码错误，请重试！');
    }
  };

  loginBtn.addEventListener('click', doLogin);
  passInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') doLogin();
  });

  // 2. 导出 Excel
  document.getElementById('export-excel-btn').addEventListener('click', () => {
    exportToExcel();
  });

  // 3. 搜索框监听
  document.getElementById('search-input').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    renderTable(query);
  });

  // 4. 重置相册与全站图片
  const resetBtn = document.getElementById('reset-gallery-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('确定要恢复为初始预设的照片与相册配置吗？')) {
        resetSitePhotos();
        renderDashboard();
        alert('已成功恢复为初始预设照片！');
      }
    });
  }

  // 5. 绑定新增【定格瞬间】照片按钮
  const addBtn = document.getElementById('add-gallery-photo-btn');
  const addFileInput = document.getElementById('add-gallery-file-input');
  if (addBtn && addFileInput) {
    addBtn.addEventListener('click', () => addFileInput.click());
    addFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const base64 = await compressUploadedImage(file);
        addGalleryPhoto(base64);
        renderDashboard();
        alert('✓ 成功在【定格瞬间】相册中新增一张照片！');
        addFileInput.value = '';
      } catch (err) {
        alert('照片新增失败，请重试！');
        console.error(err);
      }
    });
  }

  // 6. 绑定 4 大核心形象照上传事件
  bindCorePhotoUpload('heroCover', 'Hero 封面大图');
  bindCorePhotoUpload('groomPhoto', '新郎 谭浪 风采照');
  bindCorePhotoUpload('bridePhoto', '新娘 龙红波 风采照');
  bindCorePhotoUpload('venuePhoto', '宴会艺术中心地点图');
});

function bindCorePhotoUpload(key, name) {
  const input = document.getElementById(`input-${key}`);
  if (!input) return;
  input.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await compressUploadedImage(file);
      updateSingleSitePhoto(key, base64);
      renderDashboard();
      alert(`✓ 成功替换 ${name}！`);
      input.value = '';
    } catch (err) {
      alert(`${name} 替换失败，请重试！`);
      console.error(err);
    }
  });
}

function renderDashboard() {
  const list = getStoredGuests();

  let totalPeople = 0;
  let totalRecords = list.length;
  let absentCount = 0;

  list.forEach(item => {
    if (item.count > 0) {
      totalPeople += item.count;
    } else {
      absentCount++;
    }
  });

  const tablesEst = Math.ceil(totalPeople / 10);

  document.getElementById('stat-total-people').innerText = totalPeople;
  document.getElementById('stat-tables-est').innerText = tablesEst;
  document.getElementById('stat-total-records').innerText = totalRecords;
  document.getElementById('stat-absent-count').innerText = absentCount;

  renderTable('');
  renderCorePhotoThumbs();
  renderGalleryManageGrid();
}

// 渲染 4 大核心形象照缩略图
function renderCorePhotoThumbs() {
  const photos = getSitePhotos();
  ['heroCover', 'groomPhoto', 'bridePhoto', 'venuePhoto'].forEach(key => {
    const img = document.getElementById(`thumb-${key}`);
    if (img) img.src = photos[key];
  });
}

// 渲染【定格瞬间】相册排版网格
function renderGalleryManageGrid() {
  const grid = document.getElementById('gallery-manage-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const photos = getSitePhotos();
  const gallery = photos.gallery;

  if (gallery.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #888; padding: 20px;">暂无照片，请点击“新增一张婚纱照”上传！</div>`;
    return;
  }

  gallery.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'gallery-manage-item';
    div.innerHTML = `
      <img src="${item.src}" class="photo-thumb" alt="${item.title || '婚纱照'}">
      <span style="font-size: 0.78rem; font-weight: 600; color: var(--text-ink); margin-bottom: 6px;">第 ${idx + 1} 张</span>
      
      <div class="btn-action-group">
        <button class="btn-action btn-move-left" data-index="${idx}" ${idx === 0 ? 'disabled style="opacity: 0.4;"' : ''}>⬅️ 前移</button>
        <button class="btn-action btn-move-right" data-index="${idx}" ${idx === gallery.length - 1 ? 'disabled style="opacity: 0.4;"' : ''}>➡️ 后移</button>
      </div>

      <div class="btn-action-group">
        <button class="btn-action btn-replace" data-index="${idx}">📷 替换</button>
        <button class="btn-action btn-danger-action btn-delete" data-index="${idx}">🗑️ 删除</button>
      </div>
      <input type="file" class="upload-file-input replace-file-input" data-index="${idx}" accept="image/*">
    `;

    grid.appendChild(div);
  });

  // 绑定前移/后移排序按钮
  grid.querySelectorAll('.btn-move-left').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      moveGalleryPhoto(idx, -1);
      renderDashboard();
    });
  });

  grid.querySelectorAll('.btn-move-right').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      moveGalleryPhoto(idx, 1);
      renderDashboard();
    });
  });

  // 绑定替换按钮
  grid.querySelectorAll('.btn-replace').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.getAttribute('data-index');
      const input = grid.querySelector(`.replace-file-input[data-index="${idx}"]`);
      if (input) input.click();
    });
  });

  grid.querySelectorAll('.replace-file-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      const file = e.target.files[0];
      if (!file) return;
      try {
        const base64 = await compressUploadedImage(file);
        updateGalleryPhoto(idx, base64);
        renderDashboard();
        alert(`✓ 成功替换第 ${idx + 1} 张婚纱照！`);
      } catch (err) {
        alert('照片替换失败！');
        console.error(err);
      }
    });
  });

  // 绑定删除按钮
  grid.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      if (confirm(`确定要删除第 ${idx + 1} 张照片吗？`)) {
        deleteGalleryPhoto(idx);
        renderDashboard();
      }
    });
  });
}

function renderTable(query = '') {
  const tbody = document.getElementById('guest-table-body');
  tbody.innerHTML = '';

  let list = getStoredGuests();

  if (query) {
    list = list.filter(g => 
      (g.name && g.name.toLowerCase().includes(query)) ||
      (g.phone && g.phone.includes(query)) ||
      (g.blessing && g.blessing.toLowerCase().includes(query))
    );
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #888;">暂无宾客赴约记录</td></tr>`;
    return;
  }

  list.forEach(g => {
    const isAttend = g.count > 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600; color: var(--text-ink);">${escapeHtml(g.name)}</td>
      <td>
        <span class="badge ${isAttend ? 'badge-success' : 'badge-danger'}">
          ${isAttend ? '出席' : '无法前往'}
        </span>
      </td>
      <td>${g.count} 人</td>
      <td>${escapeHtml(g.phone || '-')}</td>
      <td>${escapeHtml(g.blessing)}</td>
      <td style="font-size: 0.75rem; color: #888;">${g.createdAt}</td>
      <td>
        <button class="delete-btn" data-id="${g.id}" style="background: none; border: 1px solid rgba(220,38,38,0.3); color: #DC2626; border-radius: 6px; padding: 2px 8px; cursor: pointer; font-size: 0.75rem;">
          删除
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // 绑定删除按钮
  tbody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      if (confirm('确定删除该条记录吗？')) {
        deleteRecord(id);
      }
    });
  });
}

function deleteRecord(id) {
  let list = getStoredGuests();
  list = list.filter(g => g.id !== id);
  localStorage.setItem('wedding_guests_rsvp_v1', JSON.stringify(list));
  renderDashboard();
}

function exportToExcel() {
  const list = getStoredGuests();
  if (list.length === 0) return alert('当前没有数据可导出！');

  const exportData = list.map(g => ({
    '宾客姓名': g.name,
    '是否出席': g.count > 0 ? '出席' : '无法前往',
    '出席人数': g.count,
    '联系电话': g.phone || '',
    '祝福留言': g.blessing || '',
    '提交时间': g.createdAt
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "宾客赴约明细");

  XLSX.writeFile(workbook, `婚礼宾客赴约名单_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
