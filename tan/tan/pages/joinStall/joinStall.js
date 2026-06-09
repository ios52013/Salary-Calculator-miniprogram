const app = getApp()
Page({
  data: {
    stallName: "",
    stallCate: "",
    stallAddr: "",
    stallPhone: "",
    stallTime: "",
    stallIntro: "",
    cateList: ["美食小吃","果蔬生鲜","服饰日用","饰品百货","其他品类"]
  },

  // 输入摊位名
  inputName(e){
    this.setData({stallName:e.detail.value})
  },
  // 选择品类
  selectCate(e){
    let idx = e.detail.value
    this.setData({
      stallCate:this.data.cateList[idx]
    })
  },
  // 地址
  inputAddr(e){
    this.setData({stallAddr:e.detail.value})
  },
  // 电话
  inputPhone(e){
    this.setData({stallPhone:e.detail.value})
  },
  // 营业时间
  inputTime(e){
    this.setData({stallTime:e.detail.value})
  },
  // 简介
  inputIntro(e){
    this.setData({stallIntro:e.detail.value})
  },

  // 提交入驻信息 存入本地缓存
  submitInfo(){
    let {stallName,stallCate,stallAddr,stallPhone} = this.data
    if(!stallName){
      wx.showToast({title:"请填写摊位名称",icon:"none"})
      return
    }
    if(!stallCate){
      wx.showToast({title:"请选择经营品类",icon:"none"})
      return
    }
    if(!stallAddr){
      wx.showToast({title:"请填写摆摊地址",icon:"none"})
      return
    }
    if(!stallPhone || stallPhone.length!=11){
      wx.showToast({title:"请填写正确手机号",icon:"none"})
      return
    }

    // ======================
    // 新增：一号一摊限制（核心）
    // ======================
    let uid = wx.getStorageSync('userUid');
    if (!uid) {
      wx.showToast({ title: "获取微信身份失败，请重试", icon: "none" });
      return;
    }

    // 判断当前微信是否已经入驻过
    let stallArr = wx.getStorageSync('stallList') || [];
    let hasStall = stallArr.some(item => item.uid === uid);

    if (hasStall) {
      wx.showToast({
        title: "一个微信只能开一个摊位哦",
        icon: "none"
      });
      return;
    }

    // 组装摊位数据（新增绑定微信UID）
    let stallInfo = {
      id:new Date().getTime(),
      uid: uid, // 绑定当前微信唯一标识
      name:stallName,
      cate:stallCate,
      addr:stallAddr,
      phone:stallPhone,
      time:this.data.stallTime,
      intro:this.data.stallIntro,
      status:1 // 1正常营业 0暂停出摊
    }

    // 存入全局+本地缓存
    stallArr.unshift(stallInfo)
    wx.setStorageSync('stallList',stallArr)
    app.globalData.stallList = stallArr

    // ======================
    // ✅ 新增：新摊位 = 无任何默认商品
    // ======================
    app.globalData.goodsList = [];

    wx.showModal({
      title:"提交成功",
      content:"你的摊位信息已录入平台，等待展示曝光",
      success:res=>{
        if(res.confirm){
          wx.navigateBack()
        }
      }
    })
  }
})