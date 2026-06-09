const app = getApp()
Page({
  data: {
    // 模拟热门摊位数据
    hotStallList:[
      {
        id:1,
        name:"老长沙臭豆腐",
        type:"特色小吃",
        img:"/images/stall1.jpg",
        distance:"0.8km"
      },
      {
        id:2,
        name:"新鲜时令果蔬摊",
        type:"生鲜果蔬",
        img:"/images/stall2.jpg",
        distance:"1.2km"
      },
      {
        id:3,
        name:"潮流平价服饰",
        type:"日用服饰",
        img:"/images/stall3.jpg",
        distance:"1.5km"
      }
    ]
  },

  // 通用页面跳转
  goPage(e){
    let url = e.currentTarget.dataset.url
    wx.navigateTo({url})
  },

  // 进入摊位详情
  goStallDetail(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url:`/pages/stallDetail/stallDetail?id=${id}`
    })
  }
})