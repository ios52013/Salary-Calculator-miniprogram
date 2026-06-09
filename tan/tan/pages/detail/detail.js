const app = getApp();

Page({
  data: {
    goodsList: [],
    totalNum: 0,
    totalPrice: 0.00,
    // ===== 只新增这2个支付字段 =====
    showPayModal: false,
    payAmount: "0.00"
  },

  onShow() {
    this.setData({
      goodsList: JSON.parse(JSON.stringify(app.globalData.goodsList))
    })
    this.computeTotal()
  },

  // 添加购物车 —— 你原来的代码，完全没动
  addCart(e) {
    let index = e.currentTarget.dataset.index
    let list = this.data.goodsList
    let stock = parseInt(list[index].stock)

    if (list[index].count >= stock) {
      wx.showToast({ title: '已达到库存上限', icon: 'none' })
      return
    }

    list[index].count = 1
    this.setData({ goodsList: list })
    this.computeTotal()
  },

  // 数量加减 —— 你原来的代码，完全没动
  changeCount(e) {
    let index = e.currentTarget.dataset.index
    let type = e.currentTarget.dataset.type
    let list = this.data.goodsList
    let stock = parseInt(list[index].stock)

    if (type === 'plus') {
      if (list[index].count >= stock) {
        wx.showToast({ title: '已达到库存上限', icon: 'none' })
        return
      }
      list[index].count++
    } else {
      list[index].count--
    }

    if (list[index].count < 0) list[index].count = 0

    this.setData({ goodsList: list })
    this.computeTotal()
  },

  // 计算总价 —— 你原来的代码，完全没动
  computeTotal() {
    let list = this.data.goodsList
    let num = 0
    let price = 0

    for (let item of list) {
      num += item.count
      price += item.count * parseFloat(item.price)
    }

    this.setData({
      totalNum: num,
      totalPrice: price.toFixed(2)
    })
  },

  // ===== 提交订单只改一点点：弹出支付框 =====
  createOrder() {
    let list = this.data.goodsList
    let hasGoods = list.some(item => item.count > 0)

    if (!hasGoods) {
      wx.showToast({ title: '请选择商品', icon: 'none' })
      return
    }

    // 弹出支付弹窗
    this.setData({
      showPayModal: true,
      payAmount: this.data.totalPrice
    })
  },

  // ===== 以下都是新增的支付相关方法 =====
  // 关闭支付弹窗
  closePayModal() {
    this.setData({ showPayModal: false })
  },

  // 确认支付（下单逻辑移到这里）
  confirmPay() {
    this.closePayModal();
    wx.showLoading({ title: '支付中...' })

    setTimeout(() => {
      wx.hideLoading()
      let list = this.data.goodsList

      // 生成订单
      let order = {
        orderNo: Date.now(),
        goods: list.filter(item => item.count > 0),
        totalPrice: this.data.totalPrice,
        createTime: new Date().toLocaleString(),
        status: 'paid'
      }

      if (!app.globalData.orderList) app.globalData.orderList = []
      app.globalData.orderList.unshift(order)

      // 扣减库存
      let newGoods = JSON.parse(JSON.stringify(app.globalData.goodsList))
      for (let i = 0; i < newGoods.length; i++) {
        newGoods[i].stock = parseInt(newGoods[i].stock) - list[i].count
        newGoods[i].count = 0
      }
      app.globalData.goodsList = newGoods

      this.onShow()
      wx.showToast({ title: '支付成功' })

      setTimeout(() => {
        wx.navigateTo({ url: '/pages/order/order' })
      }, 1000)

    }, 1200)
  }
})