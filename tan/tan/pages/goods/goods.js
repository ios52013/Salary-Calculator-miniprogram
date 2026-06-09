Page({
  data: {
    goodsList: [
      { name: "臭豆腐", price: "10.00" },
      { name: "烤香肠", price: "5.00" },
      { name: "冰镇酸梅汤", price: "6.00" }
    ]
  },

  // 新增商品
  addGoods() {
    wx.showModal({
      title: "新增商品",
      editable: true,
      placeholderText: "输入商品名 空格 价格，例：烤肠 5",
      success: (res) => {
        if (res.confirm && res.content) {
          let arr = res.content.split(" ");
          let name = arr[0] || "未命名";
          let price = arr[1] || "0.00";

          let newList = this.data.goodsList;
          newList.unshift({ name, price });

          this.setData({ goodsList: newList });
          wx.showToast({ title: "添加成功" });
        }
      }
    });
  },

  // 删除商品 弹窗带上商品名
  delGoods(e) {
    let idx = e.currentTarget.dataset.index;
    // 获取当前要删除的商品名称
    let item = this.data.goodsList[idx];

    wx.showModal({
      title: '确认删除',
      content: `确定要删除【${item.name}】这个商品吗？`,
      confirmText: '删除',
      cancelText: '取消',
      confirmColor: '#f56c6c',
      success: (res) => {
        if (res.confirm) {
          let newList = this.data.goodsList;
          newList.splice(idx, 1);
          this.setData({ goodsList: newList });
          wx.showToast({ title: '删除成功' });
        }
      }
    });
  }
});