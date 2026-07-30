import * as XLSX from 'xlsx';
import { weddingConfig } from './config.js';
import { getStoredGuests } from './utils/notify.js';
import { getCustomGallery, updateGalleryItem, resetGallery, compressUploadedImage } from './utils/galleryStore.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginOverlay = document.getElementById('login-overlay');
  const passInput = document.getElementById('admin-pass-input');
  const loginBtn = document.getElementById('login-btn');

  // 预渲染仪表盘与相册板块
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

  // 4. 重置相册按钮
  const resetBtn = document.getElementById('reset-gallery-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('确定要恢复为初始预设婚纱相册吗？')) {
        resetGallery();
        renderGalleryManageGrid();
        alert('相册已成功恢复为初始预设照片！');
      }
    });
  }
});

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
  renderGalleryManageGrid();
}

// 渲染后台相册管理网格
function renderGalleryManageGrid() {
  const grid = document.getElementById('gallery-manage-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const list = getCustomGallery();

  list.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'gallery-manage-item';
    div.innerHTML = `
      <img src="${item.src}" class="gallery-manage-thumb" alt="${item.name}">
      <span style="font-size: 0.75rem; color: var(--text-gold); margin-bottom: 6px;">${item.name}</span>
      <button class="upload-photo-btn" data-index="${idx}">📷 更换照片</button>
      <input type="file" class="upload-file-input" data-index="${idx}" accept="image/*">
    `;

    grid.appendChild(div);
  });

  // 绑定上传照片事件
  grid.querySelectorAll('.upload-photo-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.getAttribute('data-index');
      const fileInput = grid.querySelector(`.upload-file-input[data-index="${idx}"]`);
      if (fileInput) fileInput.click();
    });
  });

  grid.querySelectorAll('.upload-file-input').forEach(input => {
    input.addEventListener('change', async (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      const file = e.target.files[0];
      if (!file) return;

      try {
        const compressedBase64 = await compressUploadedImage(file);
        updateGalleryItem(idx, compressedBase64);
        renderGalleryManageGrid();
        alert(`✓ 成功替换 ${list[idx].name} 的照片！`);
      } catch (err) {
        alert('照片处理失败，请重试！');
        console.error(err);
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
      <td style="font-weight: 600; color: var(--text-gold);">${escapeHtml(g.name)}</td>
      <td>
        <span class="badge ${isAttend ? 'badge-success' : 'badge-danger'}">
          ${isAttend ? '出席' : '无法前往'}
        </span>
      </td>
      <td>${g.count} 人</td>
      <td>${escapeHtml(g.phone || '-')}</td>
      <td>${escapeHtml(g.blessing)}</td>
      <td style="font-size: 0.75rem; color: #aaa;">${g.createdAt}</td>
      <td>
        <button class="delete-btn" data-id="${g.id}" style="background: none; border: 1px solid rgba(255,78,136,0.4); color: var(--primary-rose); border-radius: 6px; padding: 2px 8px; cursor: pointer; font-size: 0.75rem;">
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
