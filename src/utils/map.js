import { weddingConfig } from '../config.js';

/**
 * 获取高德地图导航/标记链接
 */
export function getAmapUrl() {
  if (weddingConfig.location.amapUrl) return weddingConfig.location.amapUrl;
  const { latitude, longitude, hotelName } = weddingConfig.location;
  // 高德URI API 格式
  return `https://uri.amap.com/marker?position=${longitude},${latitude}&name=${encodeURIComponent(hotelName)}&src=wedding_h5&callnative=1`;
}

/**
 * 获取百度地图导航/标记链接
 */
export function getBaiduMapUrl() {
  if (weddingConfig.location.baiduMapUrl) return weddingConfig.location.baiduMapUrl;
  const { latitude, longitude, hotelName, address } = weddingConfig.location;
  // 百度地图 URI API 格式
  return `http://api.map.baidu.com/marker?location=${latitude},${longitude}&title=${encodeURIComponent(hotelName)}&content=${encodeURIComponent(address)}&output=html&src=webapp.baidu.wedding`;
}

/**
 * 获取腾讯地图/微信内置地图链接
 */
export function getQqMapUrl() {
  if (weddingConfig.location.qqMapUrl) return weddingConfig.location.qqMapUrl;
  const { latitude, longitude, hotelName, address } = weddingConfig.location;
  return `https://apis.map.qq.com/uri/v1/marker?marker=coord:${latitude},${longitude};title:${encodeURIComponent(hotelName)};addr:${encodeURIComponent(address)}&referer=wedding_h5`;
}

/**
 * 唤起导航 modal 选择器
 */
export function openMapSelector() {
  const amap = getAmapUrl();
  const baidu = getBaiduMapUrl();
  const qq = getQqMapUrl();

  const modalHtml = `
    <div id="map-modal-overlay" class="map-modal-overlay">
      <div class="map-modal-card">
        <div class="map-modal-header">
          <h3>请选择导航地图</h3>
          <button id="close-map-modal" class="close-btn">&times;</button>
        </div>
        <div class="map-modal-body">
          <p class="map-location-title">📍 ${weddingConfig.location.hotelName}</p>
          <p class="map-location-sub">${weddingConfig.location.address}</p>
          <div class="map-options">
            <a href="${amap}" target="_blank" class="map-btn amap-btn">
              <span class="map-icon">🗺️</span>
              <span>高德地图 (推荐)</span>
            </a>
            <a href="${baidu}" target="_blank" class="map-btn baidu-btn">
              <span class="map-icon">📍</span>
              <span>百度地图</span>
            </a>
            <a href="${qq}" target="_blank" class="map-btn qq-btn">
              <span class="map-icon">🐧</span>
              <span>腾讯 / 微信地图</span>
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
