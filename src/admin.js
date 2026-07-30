import * as XLSX from 'xlsx';
import { weddingConfig } from './config.js';
import { getStoredGuests } from './utils/notify.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginOverlay = document.getElementById('login-overlay');
  const passInput = document.getElementById('admin-pass-input');
  const loginBtn = document.getElementById('login-btn');

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
