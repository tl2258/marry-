import { weddingConfig } from '../config.js';

/**
 * 唤起导航 modal 选择器 (支持腾讯地图与高德地图)
 */
export function openMapSelector() {
  const { latitude, longitude, hotelName, address } = weddingConfig.location;
  
  // 动态生成 URL，利用原生的 encodeURIComponent 确保编码正确，彻底避免之前硬编码带来的乱码问题
  const amapUrl = `https://uri.amap.com/marker?position=${longitude},${latitude}&name=${encodeURIComponent(hotelName)}&src=wedding_h5&callnative=1`;
  const qqMapUrl = `https://apis.map.qq.com/uri/v1/marker?marker=coord:${latitude},${longitude};title:${encodeURIComponent(hotelName)};addr:${encodeURIComponent(address)}&referer=wedding_h5`;

  const modalHtml = `
    <div id="map-modal-overlay" class="map-modal-overlay">
      <div class="map-modal-card">
        <div class="map-modal-header">
          <h3>请选择导航地图</h3>
          <button id="close-map-modal" class="close-btn">&times;</button>
        </div>
        <div class="map-modal-body">
          <p class="map-location-title">📍 ${hotelName}</p>
          <p class="map-location-sub">${address}</p>
          <div class="map-options">
            <a href="${qqMapUrl}" target="_blank" class="map-btn qq-btn">
              <span class="map-icon">🐧</span>
              <span>腾讯 / 微信地图 (推荐)</span>
            </a>
            <a href="${amapUrl}" target="_blank" class="map-btn amap-btn">
              <span class="map-icon">🗺️</span>
              <span>高德地图</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  let existing = document.getElementById('map-modal-overlay');
  if (existing) existing.remove();

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  document.getElementById('close-map-modal').addEventListener('click', () => {
    document.getElementById('map-modal-overlay').remove();
  });

  document.getElementById('map-modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'map-modal-overlay') {
      document.getElementById('map-modal-overlay').remove();
    }
  });
}
