import { weddingConfig } from '../config.js';

/**
 * 最佳导航方案：直接调用腾讯地图 Marker H5
 * 在微信内打开时，腾讯地图 H5 自带“导航”按钮，点击会调用微信原生的地图选择器
 * 完美支持拉起高德、百度、苹果地图，彻底避免 URL 乱码和浏览器拦截问题。
 */
export function openMapSelector() {
  const { latitude, longitude, hotelName, address } = weddingConfig.location;
  
  // 腾讯地图统一跳转协议
  const qqMapUrl = `https://apis.map.qq.com/uri/v1/marker?marker=coord:${latitude},${longitude};title:${encodeURIComponent(hotelName)};addr:${encodeURIComponent(address)}&referer=wedding_h5`;
  
  // 直接跳转，享受微信原生支持
  window.location.href = qqMapUrl;
}
