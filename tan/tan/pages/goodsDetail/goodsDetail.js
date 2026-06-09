const app = getApp()
Page({
  data:{
    goodsInfo:{},
    buyNum:1,
    cartTotal: 0
  },

  onShow() {
    this.countCartTotal()
  },

  onLoad(options){
    let goods = JSON.parse(options.goods)
    this.setData({
      goodsInfo:goods
    })
    this.countCartTotal()
  },

  cutNum(){
    let num = this.data.buyNum
    if(num <= 1) return
    this.setData({
      buyNum:num - 1
    })
  },

  addNum(){
    let num = this.data.buyNum
    let stock = Number(this.data.goodsInfo.stock)
    if(num >= stock){
      wx.showToast({title:'已达最大库存',icon:'none'})
      return
    }
    this.setData({
      buyNum:num + 1
    })
  },

  inputNum(e){
    let val = Number(e.detail.value)
    let stock = Number(this.data.goodsInfo.stock)
    if(val < 1) val = 1
    if(val > stock) val = stock
    this.setData({buyNum:val})
  },

  addCart(){
    let { goodsInfo, buyNum } = this.data;
    if (buyNum <= 0) {
      wx.showToast({ title: '请选择购买数量', icon: 'none' });
      return;
    }

    let cartList = app.globalData.cartList || [];

    let existIndex = cartList.findIndex(item => {
      return item.goodsId == goodsInfo.id && item.stallId == goodsInfo.stallId;
    });

    if (existIndex > -1) {
      cartList[existIndex].count += buyNum;
    } else {
      cartList.push({
        goodsId: goodsInfo.id,
        goodsName: goodsInfo.name,
        goodsImg: goodsInfo.img,
        price: goodsInfo.price,
        stock: goodsInfo.stock,
        stallId: goodsInfo.stallId,
        count: buyNum,
        isCheck: true
      });
    }

    app.globalData.cartList = cartList;
    wx.showToast({ title: '加入购物车成功' });
    this.countCartTotal();
  },

  countCartTotal() {
    let cart = app.globalData.cartList || []
    let total = 0
    cart.forEach(item => {
      total += item.count
    })
    this.setData({ cartTotal: total })
  },

  goCartPage(){
    wx.navigateTo({ url: '/pages/cart/cart' })
  },

  submitOrder(){
    let {goodsInfo, buyNum} = this.data;
    let buyNum = this.data.buyNum;

    // -------- 新增：库存判断 --------
    if (buyNum > goodsInfo.stock) {
      wx.showToast({
        title: '库存不足',
        icon: 'none'
      })
      return;
    }
  
    // 只修复缺失的订单号
    let orderNum = new Date().getTime();
  
    let orderData = {
      orderId: orderNum,
      orderNo: orderNum,
      goodsName: goodsInfo.name,
      count: buyNum,
      price: goodsInfo.price,
      totalPrice: Number(goodsInfo.price || 0) * buyNum,
      stallId: goodsInfo.stallId,
      createTime: new Date().toLocaleString(),
      status: 'paid',
      goods: [{ name: goodsInfo.name, count: buyNum }]
    };
  
    let orderList = app.globalData.orderList || [];
    orderList.unshift(orderData);
    app.globalData.orderList = orderList;
  
    // -------- 新增：下单后扣减库存 --------
    goodsInfo.stock = goodsInfo.stock - buyNum;
    this.setData({ goodsInfo });
    
    wx.showToast({ title: '下单成功' });
    setTimeout(()=>{
      wx.navigateBack();
    },1000);
  }
})
