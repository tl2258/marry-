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
    longitude: 111.9945
  },

  // 3. 微信推送配置 (0费用)
  // 推荐使用 Server酱 (https://sct.ftqq.com/) 免费微信推送服务
  // 注册后获取 SendKey 填入下方，即可在微信中接收宾客赴约实时通知！
  serverChanSendKey: "SCT387488TLpmDom8jJACBnPCtuw041e7q", 

  // 4. 后台管理配置
  adminPassword: "admin", // 后台登录默认密码 (也可自设)

  // 5. 音乐配置
  // 背景音乐：Christina Perri - A Thousand Years
  bgmUrl: "./Years.mp3"
};
