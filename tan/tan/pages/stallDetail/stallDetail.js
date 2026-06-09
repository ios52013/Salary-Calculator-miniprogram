const app = getApp()
Page({
  data: {
    stallInfo: {},
    // 预留字段
    stallId: ''
  },

  onLoad(options) {
    // 接收摊位id
    let stallId = options.id
    this.setData({ stallId: stallId })

    let allStall = wx.getStorageSync('stallList') || []
    let info = allStall.find(item => item.id == stallId)
    this.setData({ stallInfo: info })

    // ==============================
    // 统一商品数据源：全局 → 缓存
    // 未来接服务器只需要替换这里
    // ==============================
    this.loadGoodsData()
  },

  // ==============================
  // 统一商品入口（未来可直接接服务器）
  // ==============================
  loadGoodsData() {
    const { stallId } = this.data

    // 1. 先从全局内存取（实时性）
    let goods = app.globalData.goodsList || []

    // 2. 全局为空则从本地缓存取（持久化）
    if (goods.length === 0) {
      goods = wx.getStorageSync('stallGoods_' + stallId) || []
    }

    // 3. 只加载当前摊位的有效商品
    const finalGoods = goods.filter(item => {
      return item.stallId == stallId && item.name && item.price
    })

    // 4. 同步到页面（你后续展示商品列表直接用 {{goodsList}}）
    this.setData({
      goodsList: finalGoods
    })
  },

  // 一键拨打电话
  makeCall() {
    let phone = this.data.stallInfo.phone
    if (!phone) {
      wx.showToast({ title: "暂无联系电话", icon: "none" })
      return
    }
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },

  // 跳转到留言页
  goMessage() {
    let id = this.data.stallInfo.id
    wx.navigateTo({
      url: `/pages/message/message?stallId=${id}`
    })
  },

  // 跳转商品橱窗
  goGoodsPage() {
    let sid = this.data.stallInfo.id
    wx.navigateTo({
      url: `/pages/stallGoods/stallGoods?stallId=${sid}`
    })
  }

})