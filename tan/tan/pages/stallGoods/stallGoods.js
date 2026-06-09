const app = getApp()
Page({
  data: {
    goodsList: [],
    stallId: "",
    cartTotal: 0
  },

  // 页面显示时强制刷新商品 + 购物车数量
  onShow() {
    this.loadGoods()
    this.countCartTotal()
  },

  onLoad(options) {
    let stallId = options.stallId
    this.setData({ stallId: stallId })
  },

  // ======================
  // 核心修复：每次都从缓存读取商品
  // ======================
  loadGoods() {
    const { stallId } = this.data
    // 优先从本地缓存拿（永不丢失）
    let localGoods = wx.getStorageSync('stallGoods_' + stallId) || []
    // 同步全局数据
    app.globalData.goodsList = localGoods
    // 筛选当前摊位商品
    let myGoods = localGoods.filter(item => item.stallId == stallId)
    this.setData({ goodsList: myGoods })
  },

  // 统计购物车数量
  countCartTotal() {
    let cart = app.globalData.cartList || []
    let total = 0
    cart.forEach(item => {
      total += item.count
    })
    this.setData({ cartTotal: total })
  },

  // 去购物车
  goCartPage() {
    wx.navigateTo({
      url: '/pages/cart/cart'
    })
  },

  // 进入商品详情
  goGoodsDetail(e) {
    let item = e.currentTarget.dataset.item
    wx.navigateTo({
      url: '/pages/goodsDetail/goodsDetail?goods=' + JSON.stringify(item)
    })
  }
})