Page({
  data: {
    userInfo: null
  },

  onLoad() {
    // 读取登录时保存的用户信息
    const user = wx.getStorageSync('userInfo');
    this.setData({
      userInfo: user
    })
  },

  // 去摊主中心（我要出摊）
  goSeller() {
    wx.navigateTo({
      url: '/pages/seller/seller',
    })
  },

  goOrder() {
    wx.navigateTo({
      url: '/pages/order/order'
    })
  }
  
})