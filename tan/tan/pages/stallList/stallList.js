const app = getApp()
Page({
  data: {
    allList: [],
    filterList: [],
    type: 0, //0全部 1美食 2果蔬 3服饰
    city: ""
  },

  onShow() {
    // 读取本地所有摊位
    let list = wx.getStorageSync('stallList') || []
    this.setData({ allList: list })
    this.filterData()
    // 获取用户定位
    this.getLocation()
  },

  // 获取定位
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        wx.request({
          url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${res.latitude},${res.longitude}&key=7ONBZ-K24W3-R6V4J-4S3Q2`,
          success: ret => {
            if(ret.data.status === 0){
              this.setData({
                city: ret.data.result.ad_info.city
              })
            }
          }
        })
      }
    })
  },

  // 切换分类
  switchType(e) {
    let t = e.currentTarget.dataset.type
    this.setData({ type: t })
    this.filterData()
  },

  // 筛选数据
  filterData() {
    let t = this.data.type
    let arr = this.data.allList
    let newArr = []
    if(t == 0){
      newArr = arr
    }else if(t == 1){
      newArr = arr.filter(item=>item.cate=="美食小吃")
    }else if(t == 2){
      newArr = arr.filter(item=>item.cate=="果蔬生鲜")
    }else if(t == 3){
      newArr = arr.filter(item=>item.cate=="服饰日用")
    }
    // 模拟距离
    newArr.forEach(item=>{
      item.distance = (Math.random()*3+0.3).toFixed(1)+"km"
    })
    this.setData({ filterList: newArr })
  },

  // 跳转摊位详情
  goDetail(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/stallDetail/stallDetail?id=${id}`
    })
  }
})