const app = getApp()
Page({
  data: {
    cartList: [],
    isAllCheck: false,
    totalPrice: "0.00"
  },

  onShow() {
    // 每次进入刷新购物车数据
    this.setData({
      cartList: app.globalData.cartList || []
    })
    this.checkAllStatus()
    this.calcTotal()
  },

  // 单选切换
  toggleCheck(e) {
    const index = e.currentTarget.dataset.index
    const cartList = this.data.cartList
    cartList[index].isCheck = e.detail.value
    this.setData({ cartList })
    this.checkAllStatus()
    this.calcTotal()
    app.globalData.cartList = cartList
  },

  // 全选切换
  toggleAllCheck(e) {
    const status = e.detail.value
    const cartList = this.data.cartList.map(item => {
      item.isCheck = status
      return item
    })
    this.setData({
      cartList,
      isAllCheck: status
    })
    this.calcTotal()
    app.globalData.cartList = cartList
  },

  // 减少数量
  reduceNum(e) {
    const index = e.currentTarget.dataset.index
    const cartList = this.data.cartList
    if (cartList[index].count <= 1) return
    cartList[index].count--
    this.setData({ cartList })
    this.calcTotal()
    app.globalData.cartList = cartList
  },

  // 增加数量
  addNum(e) {
    const index = e.currentTarget.dataset.index
    const cartList = this.data.cartList
    if (cartList[index].count >= cartList[index].stock) {
      wx.showToast({ title: '超出库存', icon: 'none' })
      return
    }
    cartList[index].count++
    this.setData({ cartList })
    this.calcTotal()
    app.globalData.cartList = cartList
  },

  // 删除商品
  delGoods(e) {
    const index = e.currentTarget.dataset.index
    const cartList = this.data.cartList
    cartList.splice(index, 1)
    this.setData({ cartList })
    this.checkAllStatus()
    this.calcTotal()
    app.globalData.cartList = cartList
  },

  // 校验是否全选
  checkAllStatus() {
    const allCheck = this.data.cartList.every(item => item.isCheck)
    this.setData({ isAllCheck: allCheck })
  },

  // 计算选中总价
  calcTotal() {
    let total = 0
    this.data.cartList.forEach(item => {
      if (item.isCheck) {
        total += Number(item.price) * item.count
      }
    })
    this.setData({ totalPrice: total.toFixed(2) })
  },

  // 去结算 批量下单
  goSettle() {
    const selectGoods = this.data.cartList.filter(item => item.isCheck)
    if (selectGoods.length === 0) {
      wx.showToast({ title: '请选择要下单的商品', icon: 'none' })
      return
    }

    // 按摊位分组，不同摊位生成不同订单
    const stallGroup = {}
    selectGoods.forEach(item => {
      if (!stallGroup[item.stallId]) {
        stallGroup[item.stallId] = []
      }
      stallGroup[item.stallId].push(item)
    })

    // 批量生成订单
    const allOrder = app.globalData.orderList || []
    for (let sid in stallGroup) {
      const goodsArr = stallGroup[sid]
      let sumPrice = 0
      goodsArr.forEach(g => {
        sumPrice += Number(g.price) * g.count
      })
      const newOrder = {
        orderId: new Date().getTime() + Math.floor(Math.random() * 100),
        goods: goodsArr,
        totalPrice: sumPrice.toFixed(2),
        stallId: sid,
        status: 'paid',
        createTime: new Date().toLocaleString()
      }
      allOrder.unshift(newOrder)
    }
    app.globalData.orderList = allOrder

    // 清除已下单商品，保留未选中
    const remainCart = this.data.cartList.filter(item => !item.isCheck)
    app.globalData.cartList = remainCart
    wx.showModal({
      title: '下单成功',
      content: '订单已提交，等待摊主接单~',
      success: res => {
        if (res.confirm) wx.navigateBack()
      }
    })
  }
})