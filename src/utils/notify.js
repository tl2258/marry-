import { weddingConfig } from '../config.js';

const STORAGE_KEY = 'wedding_guests_rsvp_v1';

/**
 * 获取所有宾客 RSVP 响应列表
 */
export function getStoredGuests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("读取宾客数据失败", e);
    return [];
  }
}

/**
 * 保存单个宾客 RSVP 数据
 */
export function saveGuestRSVP(guestData) {
  const list = getStoredGuests();
  const newGuest = {
    id: 'g_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    name: guestData.name || '热心宾客',
    phone: guestData.phone || '',
    count: parseInt(guestData.count || 1),
    transport: guestData.transport || '自驾/打车',
    blessing: guestData.blessing || '新婚快乐，百年好合！',
    dietary: guestData.dietary || '无特殊要求',
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false })
  };

  list.unshift(newGuest);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

  // 触发微信实时推送
  triggerWechatNotify(newGuest);

  return newGuest;
}

/**
 * 0 费用微信推送 (使用 Server酱 SCT 接口)
 */
export async function triggerWechatNotify(guest) {
  const sendKey = weddingConfig.serverChanSendKey;
  if (!sendKey || sendKey.includes("xxxxxx")) {
    console.warn("未设置有效的 Server酱 SendKey，跳过微信推送。数据已保存在本地后台中。");
    return { success: false, reason: "No key configured" };
  }

  const title = `💌 微信请帖新赴约：${guest.name} (${guest.count}人出席)`;
  const desp = `
### 💒 婚礼宾客赴约通知
- **宾客姓名**：${guest.name}
- **出席人数**：${guest.count} 人
- **联系电话**：${guest.phone || '未填写'}
- **出行方式**：${guest.transport}
- **饮食忌口**：${guest.dietary}
- **祝福留言**：${guest.blessing}
- **提交时间**：${guest.createdAt}

---
*提示：您可以打开 H5 后台查看完整导出表格。*
  `.trim();

  try {
    const response = await fetch(`https://sctapi.ftqq.com/${sendKey}.send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ title, desp })
    });
    const resData = await response.json();
    console.log("微信推送响应结果:", resData);
    return { success: true, resData };
  } catch (err) {
    console.error("微信推送异常:", err);
    return { success: false, error: err };
  }
}
