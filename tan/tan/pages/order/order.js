const app = getApp();

Page({
  data: {
    orderList: []
  },

  onShow() {
    this.setData({
      orderList: app.globalData.orderList || []
    })
  },

  finishOrder(e) {
    let that = this;
    wx.showModal({
      title: "确认取餐",
      content: "确定已经收到餐品了吗？",
      success(res) {
        if (res.confirm) {
          let index = e.currentTarget.dataset.index;
          let list = that.data.orderList;
          list[index].status = "finished";
          that.setData({ orderList: list });
          app.globalData.orderList = list;
          wx.showToast({ title: "交易完成" });
        }
      }
    })
  }
})