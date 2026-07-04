Page({
  data: {
    imgList: [],
    tempPublicImgList: [],
    scriptText: "",
    langOptions: ["普通话", "英语", "韩语", "阿拉伯语", "法语", "日语", "德语"],
    langIndex: 0,
    ratioOptions: ["16:9", "4:3", "1:1", "3:4", "9:16", "21:9"],
    ratioIndex: 4,
    timeOptions: ["3秒", "5秒", "8秒", "10秒", "15秒"],
    timeIndex: 4,
    isGenerating: false,
    volcTaskId: "",
    videoUrl: "",
    pollTimer: null
  },

  onLoad() {
    this.setData({
      isGenerating: false,
      videoUrl: "",
      volcTaskId: "",
      pollTimer: null,
      tempPublicImgList: []
    })
  },
  
  onUnload() {
    wx.hideLoading();
    if (this.data.pollTimer) clearInterval(this.data.pollTimer);
    this.setData({ isGenerating: false });
  },

  // 选择图片，纯微信原生处理，无beeimg
  chooseMedia() {
    const remain = 9 - this.data.imgList.length;
    if (remain <= 0) return wx.showToast({ title: "最多上传9张图片", icon: "none" });
    wx.chooseMedia({
      count: remain,
      mediaType: ["image"],
      sourceType: ["album"],
      success: async (res) => {
        if (!res.tempFiles?.length) return;
        wx.showLoading({ title: "处理图片", mask: true })
        const fileIdArr = [];
        try {
          // 1. 上传微信云存储
          for (const file of res.tempFiles) {
            const suffix = file.tempFilePath.split('.').pop()
            const cloudPath = `video_img/${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${suffix}`
            const uploadRes = await wx.cloud.uploadFile({ cloudPath, filePath: file.tempFilePath });
            fileIdArr.push(uploadRes.fileID)
          }
          // 2. 批量获取微信临时公网链接
          const tempUrlResult = await wx.cloud.getTempFileURL({ fileList: fileIdArr });
          const publicUrlList = tempUrlResult.fileList.map(item => item.tempFileURL);
          wx.hideLoading()
          this.setData({
            imgList: [...this.data.imgList, ...fileIdArr],
            tempPublicImgList: [...this.data.tempPublicImgList, ...publicUrlList]
          });
        } catch (err) {
          wx.hideLoading();
          wx.showToast({ title: "图片处理失败", icon: "none" });
          console.error("图片处理报错", err);
        }
      },
      fail: err => {
        wx.showToast({ title: "图片选择失败", icon: "none" });
      }
    })
  },

  // 删除图片同步清理两套数组
  delImg(e) {
    const idx = Number(e.currentTarget.dataset.index);
    const imgList = [...this.data.imgList];
    const tempPublicImgList = [...this.data.tempPublicImgList];
    imgList.splice(idx, 1);
    tempPublicImgList.splice(idx, 1);
    this.setData({ imgList, tempPublicImgList });
  },

  previewImg(e) {
    const idx = Number(e.currentTarget.dataset.index);
    wx.previewImage({ urls: this.data.imgList, current: this.data.imgList[idx] });
  },

  onScriptInput(e) {
    this.setData({ scriptText: e.detail.value.trim() });
  },
  onLangChange(e) { this.setData({ langIndex: e.detail.value }); },
  onRatioChange(e) { this.setData({ ratioIndex: e.detail.value }); },
  onTimeChange(e) { this.setData({ timeIndex: e.detail.value }); },

  // 一键生成 修复timeIndex重名、全套弹窗提示、debug日志打印
  async createVideoTask() {
    const { tempPublicImgList, scriptText, langIndex, ratioIndex, timeIndex: pageTimeIndex, langOptions, ratioOptions, timeOptions, isGenerating } = this.data;
    if (!tempPublicImgList.length) return wx.showToast({ title: "请上传商品图片", icon: "none" });
    if (!scriptText.trim()) return wx.showToast({ title: "请填写视频文案", icon: "none" });
    if (isGenerating) return;

    this.setData({ isGenerating: true, videoUrl: "", volcTaskId: "" });
    wx.showLoading({ title: "发起AI视频生成", mask: true });

    const durationStr = timeOptions[pageTimeIndex].replace(/秒/g, "");
    const params = {
      upload_imgs: tempPublicImgList,
      input: scriptText.trim(),
      yuyan: langOptions[langIndex],
      ratio: ratioOptions[ratioIndex],
      duration: durationStr
    };

    try {
      const cozeReq = await new Promise((resolve, reject) => {
        wx.request({
          url: "https://api.coze.cn/v1/workflow/run",
          method: "POST",
          timeout: 180000,
          header: {
            "Authorization": "Bearer pat_IfQe2A0Nbr2gd9xheTwkE1iJzDxF4SWH9gOzqWlIlsvwOg6JTSXPLPUf9ZFsOJ8I",
            "Content-Type": "application/json"
          },
          data: {
            workflow_id: "7657118382308229155",
            parameters: params
          },
          success: resolve,
          fail: reject
        })
      });
      wx.hideLoading();
      const cozeResult = cozeReq.data;
      console.log("【扣子完整返回数据】", cozeResult);
      const debugUrl = cozeResult.detail?.debug_url || "无";
      console.log("【扣子流程查看链接，浏览器打开】", debugUrl);

      if (cozeResult.code === 0 && cozeResult.data?.volcTaskId) {
        const taskId = cozeResult.data.volcTaskId;
        this.setData({ volcTaskId: taskId });
        wx.showModal({
          title: "已获取任务ID",
          content: `任务ID：${taskId}\nDebug链接：${debugUrl}`,
          showCancel: false
        })
        wx.showToast({ title: "后台生成中，每10秒查询进度", icon: "none" });
        this.startPollVolc();
      } else {
        this.setData({ isGenerating: false });
        wx.showModal({
          title: "任务提交失败",
          content: `错误信息：${cozeResult.msg || "未知"}\nDebug链接：${debugUrl}`,
          showCancel: false
        })
      }
    } catch (err) {
      wx.hideLoading();
      this.setData({ isGenerating: false });
      console.error("扣子请求超时/失败详情", err);
      wx.showModal({
        title: "请求异常",
        content: `报错：${JSON.stringify(err)}\n控制台复制Debug链接查看工作流`,
        showCancel: false
      })
    }
  },

  // 轮询云函数查询视频状态
  startPollVolc() {
    const that = this;
    const timer = setInterval(async () => {
      const { volcTaskId } = that.data;
      try {
        wx.showLoading({ title: "正在查询视频生成进度", mask: false });
        const cloudRes = await wx.cloud.callFunction({
          name: "callCozeFlow",
          data: { action: "queryVolc", volcTaskId }
        });
        wx.hideLoading();
        const res = cloudRes.result;
        if (res.finished === true && res.video_url) {
          clearInterval(timer);
          that.setData({ pollTimer: null, isGenerating: false, volcTaskId: "" });
          wx.showLoading({ title: "加载视频缓存", mask: true });
          wx.downloadFile({
            url: res.video_url,
            success: (downloadRes) => {
              wx.hideLoading();
              if (downloadRes.statusCode === 200) {
                that.setData({ videoUrl: downloadRes.tempFilePath });
                wx.showToast({ title: "视频生成成功" });
              } else {
                wx.showToast({ title: "视频加载失败", icon: "none" });
              }
            },
            fail: () => {
              wx.hideLoading();
              wx.showToast({ title: "视频加载失败", icon: "none" });
            }
          })
        }
      } catch (err) {
        console.log("单次轮询失败，10秒后重试", err);
      }
    }, 10000);
    this.setData({ pollTimer: timer });
  },

  // 保存视频到相册
  saveVideoToAlbum() {
    const url = this.data.videoUrl;
    if (!url) return wx.showToast({ title: "暂无视频可保存", icon: "none" });
    const that = this;
    wx.getSetting({
      success: setRes => {
        const scope = "scope.writePhotosAlbum";
        const auth = setRes.authSetting || {};
        if (auth[scope]) that.downloadSave(url);
        else if (auth[scope] === false) wx.openSetting();
        else wx.authorize({ scope, success: () => that.downloadSave(url) });
      }
    });
  },

  downloadSave(url) {
    wx.showLoading({ title: "下载视频" });
    wx.downloadFile({
      url,
      success: downRes => {
        wx.saveVideoToPhotosAlbum({
          filePath: downRes.tempFilePath,
          success: () => { wx.hideLoading(); wx.showToast({ title: "已保存相册" }); },
          fail: () => { wx.hideLoading(); wx.showToast({ title: "保存失败", icon: "none" }); }
        })
      },
      fail: () => { wx.hideLoading(); wx.showToast({ title: "下载失败", icon: "none" }); }
    })
  }
})