Page({
  data: {
    userInfo: null
  },

  onLoad() {
    // 打开页面先读本地有没有登录信息
    const user = wx.getStorageSync('userInfo');
    if (user) {
      this.setData({ userInfo: user });
    }
  },

  // 微信获取头像昵称授权
  getWxUserInfo() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: res => {
        const info = res.userInfo;
        this.setData({ userInfo: info });
        // 存本地缓存 类比iOS NSUserDefaults
        wx.setStorageSync('userInfo', info);
      }
    });
  },

  // 进入首页 + 获取定位
  goIndex() {
    wx.getLocation({
      type: 'gcj02',
      success: locRes => {
        // 把经纬度存本地
        wx.setStorageSync('latLng', {
          latitude: locRes.latitude,
          longitude: locRes.longitude
        });
        // 跳转到首页
        wx.switchTab({
          url: '/pages/index/index'
        });
      },
      fail: err => {
        wx.showToast({
          title: '请允许定位权限',
          icon: 'none'
        });
      }
    });
  }
});