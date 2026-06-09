// app.js
App({
  // 小程序启动自动获取登录凭证
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // ======================
    // ✅ 修复：永久固定用户唯一ID（重启/清缓存不变）
    // ======================
    let userUid = wx.getStorageSync('userUid');
    if (userUid) {
      this.globalData.userUid = userUid;
    } else {
      // 生成唯一身份ID，永久不变
      userUid = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 10);
      wx.setStorageSync('userUid', userUid);
      this.globalData.userUid = userUid;
    }

    // 你原来的登录逻辑保留（不影响）
    wx.login({
      success: res => {
        // 这里不再用code当uid，避免重启变化
      }
    })
  },

  globalData: {
    // 全局统一商品数据（摊主 & 用户详情页共用）
    goodsList: [
      { name: "臭豆腐", price: "10.00", count: 0, stock: 50 },
      { name: "烤香肠", price: "5.00", count: 0, stock: 30 },
      { name: "冰镇酸梅汤", price: "6.00", count: 0, stock: 20 }
    ],
    
    userUid: "",       // 存储当前微信用户唯一标识
    userRole: "user",  // user普通用户  seller摊主
    orderList: [],     // 全局订单
    cartList: []       // ✅【新增】全局购物车（只加了这一行）
  }
})
