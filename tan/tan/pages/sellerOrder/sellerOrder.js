const app = getApp();

Page({
  data: {
    orderList: []
  },

  onShow() {
    let myStallId = wx.getStorageSync('nowStallId');
    let allOrders = app.globalData.orderList || [];
  
    // 修复：如果摊位ID为空，显示全部订单（避免看不见）
    let myOrders = allOrders.filter(item => {
      if (!myStallId) return true;
      return item.stallId == myStallId;
    });
  
    this.setData({
      orderList: myOrders
    });
  },

  receiveOrder(e) {
    let index = e.currentTarget.dataset.index;
    let list = this.data.orderList;
    list[index].status = "received";
    this.setData({ orderList: list });
    this.updateGlobalOrders();
    wx.showToast({ title: "已接单" });
  },

  mealOrder(e) {
    let that = this;
    wx.showModal({
      title: "确认出餐",
      content: "确定已经出餐了吗？",
      success(res) {
        if (res.confirm) {
          let index = e.currentTarget.dataset.index;
          let list = that.data.orderList;
          list[index].status = "meal";
          that.setData({ orderList: list });
          that.updateGlobalOrders();
          wx.showToast({ title: "已出餐" });
        }
      }
    })
  },

  updateGlobalOrders() {
    let allOrders = app.globalData.orderList || [];
    let myOrders = this.data.orderList;

    myOrders.forEach(myItem => {
      let idx = allOrders.findIndex(o => o.orderId === myItem.orderId);
      if (idx !== -1) {
        allOrders[idx] = myItem;
      }
    });

    app.globalData.orderList = allOrders;
  }
});