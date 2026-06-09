const app = getApp();
Page({
  data: {
    isOpen: false,
    shopName: "老王臭豆腐摊",
    shopDesc: "正宗长沙口味 · 现炸现卖",
    shopTime: "营业时段：17:00–22:00",
    saleNum: 328,
    isEditShop: false,
    goodsList: [],
    myStall: {}
  },

  onShow() {
    // 读取当前微信用户自己的摊位（唯一）
    let myUid = app.globalData.userUid;
    let stallList = wx.getStorageSync('stallList') || [];
    let myOwnStall = stallList.find(item => item.uid === myUid);

    if (myOwnStall) {
      this.setData({
        myStall: myOwnStall
      });
      wx.setStorageSync('nowStallId', myOwnStall.id);

      // ==========================
      // ✅ 从本地缓存读取商品（永不丢失）
      // ==========================
      let localGoods = wx.getStorageSync('stallGoods_' + myOwnStall.id) || [];
      app.globalData.goodsList = localGoods;
    } else {
      this.setData({
        myStall: {}
      });
      wx.removeStorageSync('nowStallId');
    }

    // 有效商品过滤
    let allGoods = app.globalData.goodsList || [];
    let validGoods = allGoods.filter(item => {
      return item.name && item.price && item.stallId;
    });

    this.setData({
      goodsList: JSON.parse(JSON.stringify(validGoods))
    })
  },

  // 未入驻 → 跳转入驻页面
  goJoinStall() {
    wx.navigateTo({
      url: '/pages/joinStall/joinStall'
    })
  },

  toggleEditShop() {
    if (this.data.isEditShop) {
      wx.showToast({ title: "摊位信息保存成功" })
    }
    this.setData({
      isEditShop: !this.data.isEditShop
    })
  },
  inputShopName(e) {
    this.setData({ shopName: e.detail.value })
  },
  inputShopDesc(e) {
    this.setData({ shopDesc: e.detail.value })
  },
  inputShopTime(e) {
    this.setData({ shopTime: e.detail.value })
  },

  toggleOpen(e) {
    this.setData({
      isOpen: e.detail.value
    })
  },

  editName(e) {
    let idx = e.currentTarget.dataset.index;
    let val = e.detail.value;
    let list = this.data.goodsList;
    list[idx].name = val;
    this.setData({ goodsList: list })
  },
  editPrice(e) {
    let idx = e.currentTarget.dataset.index;
    let val = e.detail.value;
    let list = this.data.goodsList;
    list[idx].price = val;
    this.setData({ goodsList: list })
  },
  editStock(e) {
    let idx = e.currentTarget.dataset.index;
    let val = e.detail.value;
    let list = this.data.goodsList;
    list[idx].stock = val;
    this.setData({ goodsList: list })
  },

  delGoods(e) {
    let idx = e.currentTarget.dataset.index;
    wx.showModal({
      title: "提示",
      content: "确定删除该商品吗？",
      success: res => {
        if (res.confirm) {
          let list = this.data.goodsList;
          wx.showToast({ title: `已删除${list[idx].name}` })
          list.splice(idx, 1);
          this.setData({ goodsList: list })
        }
      }
    })
  },

  addGoods() {
    // 未入驻禁止添加商品
    if (!this.data.myStall.id) {
      wx.showToast({ title: "请先入驻摊位", icon: "none" })
      return;
    }

    let validGoods = this.data.goodsList.filter(item => {
      return item.name && item.price;
    });

    let list = [...validGoods];
    list.push({
      id: new Date().getTime(),
      name: "",
      price: "",
      stock: "0",
      count: 0,
      img: "/images/stall_def.jpg",
      stallId: wx.getStorageSync('nowStallId') || 0
    });

    this.setData({ goodsList: list });
    app.globalData.goodsList = validGoods;
  },

  // 更换商品图片
  changeGoodsImg(e) {
    if (!this.data.myStall.id) {
      wx.showToast({ title: "请先入驻摊位", icon: "none" })
      return;
    }

    let index = e.currentTarget.dataset.index
    let list = this.data.goodsList

    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      success: (res) => {
        let path = res.tempFiles[0].tempFilePath
        list[index].img = path
        this.setData({ goodsList: [...list] })
      }
    })
  },

  saveGoods() {
    if (!this.data.myStall.id) {
      wx.showToast({ title: "请先入驻摊位", icon: "none" })
      return;
    }

    let list = this.data.goodsList;

    list = list.filter(item => {
      return item.name && item.price;
    });

    list = list.map(item => {
      if (!item.id) {
        item.id = new Date().getTime();
      }
      return item;
    });

    for (let item of list) {
      if (!item.name || !item.price) {
        wx.showToast({ title: '商品名和价格不能为空', icon: 'none' });
        return;
      }
    }

    let stallId = wx.getStorageSync('nowStallId') || 0
    list = list.map(item => {
      item.stallId = stallId
      return item
    })

    app.globalData.goodsList = list;

    // ==========================
    // ✅ 保存到本地缓存（重启不丢）
    // ==========================
    wx.setStorageSync('stallGoods_' + stallId, list);

    wx.showToast({ title: '保存成功' });
  },

  goSellerOrder() {
    wx.navigateTo({
      url: '/pages/sellerOrder/sellerOrder'
    })
  }
})