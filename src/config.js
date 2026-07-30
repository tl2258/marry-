// 婚礼电子请帖 & 后台全局配置文件
export const weddingConfig = {
  // 1. 基本信息
  groomName: "谭浪", // 新郎姓名
  brideName: "龙红波", // 新娘姓名
  weddingDate: "2026-8-30 11:58:00", // 婚礼时间 (YYYY-MM-DD HH:mm:ss)
  weddingDateDisplay: "2026年8月30日 (农历7月十八) 星期日 11:58",
  
  // 2. 酒店与地图信息 (娄底市温德姆星铂丽宴会艺术中心)
  location: {
    hotelName: "娄底市温德姆星铂丽宴会艺术中心",
    address: "娄底市娄星区西贸街与氐星路交汇处温德姆酒店4层",
    latitude: 27.7356,
    longitude: 111.9945,
    // 高德地图直接跳转 URL
    amapUrl: "https://uri.amap.com/marker?position=111.9945,27.7356&name=%E5%A9%84%E5%BA%95%E5%B8%82%E6%B8%A9%E5%BE%B7%E5%A7%86%E6%98%9F%E9%95%B9%E4%B8%BD%E5%AE%B4%E4%BC%9A%E8%87%BA%E6%9C%AF%E4%B8%AD%E5%BF%83&src=wedding_h5&callnative=1",
    // 百度地图直接跳转 URL
    baiduMapUrl: "http://api.map.baidu.com/marker?location=27.7356,111.9945&title=%E5%A9%84%E5%BA%95%E5%B8%82%E6%B8%A9%E5%BE%B7%E5%A7%86%E6%98%9F%E9%95%B9%E4%B8%BD%E5%AE%B4%E4%BC%9A%E8%87%BA%E6%9C%AF%E4%B8%AD%E5%BF%83&content=%E5%A9%84%E5%BA%95%E5%B8%82%E5%A9%84%E6%98%9F%E5%8C%BA%E8%A5%BF%E8%B4%B8%E8%A1%97%E4%B8%8E%E6%B0%90%E6%98%9F%E8%B7%AF%E4%BA%A4%E6%B1%87%E5%A4%84%E6%B8%A9%E5%BE%B7%E5%A7%86%E9%85%92%E5%BA%974%E5%B1%82&output=html&src=webapp.baidu.wedding",
    // 腾讯 / 微信地图直接跳转 URL
    qqMapUrl: "https://apis.map.qq.com/uri/v1/marker?marker=coord:27.7356,111.9945;title:%E5%A9%84%E5%BA%95%E5%B8%82%E6%B8%A9%E5%BE%B7%E5%A7%86%E6%98%9F%E9%95%B9%E4%B8%BD%E5%AE%B4%E4%BC%9A%E8%87%BA%E6%9C%AF%E4%B8%AD%E5%BF%83;addr:%E5%A9%84%E5%BA%95%E5%B8%82%E5%A9%84%E6%98%9F%E5%8C%BA%E8%A5%BF%E8%B4%B8%E8%A1%97%E4%B8%8E%E6%B0%90%E6%98%9F%E8%B7%AF%E4%BA%A4%E6%B1%87%E5%A4%84%E6%B8%A9%E5%BE%B7%E5%A7%86%E9%85%92%E5%BA%974%E5%B1%82&referer=wedding_h5"
  },

  // 3. 微信推送配置 (0费用)
  // 推荐使用 Server酱 (https://sct.ftqq.com/) 免费微信推送服务
  // 注册后获取 SendKey 填入下方，即可在微信中接收宾客赴约实时通知！
  serverChanSendKey: "SCTxxxxxx", 

  // 4. 后台管理配置
  adminPassword: "admin", // 后台登录默认密码 (也可自设)

  // 5. 音乐配置
  // 背景音乐：Christina Perri - A Thousand Years
  bgmUrl: "./years.mp3"
};
