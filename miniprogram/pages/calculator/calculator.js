Page({
  data: {
    todayDate: "", name: "",
    startDate: "", startTime: "", endDate: "", endTime: "",
    restDayList: [], // 休息日列表（多选）
    totalSalary: "",
    monthDays: 26, monthDaysInput: "26",
    showDayHour: "0天0小时",
    realShowDayHour: "0天0小时",
    daySalary: "0.00", hourSalary: "0.00",
    normalWage: "0.00", holidayWage: "0.00", finalSalary: "0.00",
    holidayTip: "",
    startBgColor: "",
    endBgColor: "",
    userHolidayList: [], historyList: []
  },
  getRandomColor() {
    const colors = [
      "#eef7ff", "#fff0f6", "#f0f9ff", "#f8fff0", "#fff7f0",
      "#f6f0ff", "#f0fff4", "#fff0f6", "#f5f0ff", "#f0fcff"
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },
  onLoad() {
    let now = new Date()
    let today = now.getFullYear() + "-" + String(now.getMonth()+1).padStart(2,0) + "-" + String(now.getDate()).padStart(2,0)
    let startColor = this.getRandomColor();
    let endColor = this.getRandomColor();
    while (endColor === startColor) {
      endColor = this.getRandomColor();
    }
    this.setData({ 
      todayDate: today,
      startBgColor: startColor,
      endBgColor: endColor
    })
    // userHolidayList no longer restored from storage
    let hist = wx.getStorageSync('wageHistory') || []
    this.setData({ historyList: hist })
  },
  inputName(e) { this.setData({ name: e.detail.value }) },
  bindStartDate(e) { this.setData({ startDate: e.detail.value }); this.calc() },
  bindStartTime(e) { this.setData({ startTime: e.detail.value }); this.calc() },
  bindEndDate(e) { this.setData({ endDate: e.detail.value }); this.calc() },
  bindEndTime(e) { this.setData({ endTime: e.detail.value }); this.calc() },

  // 新增：添加休息日
  pickAddRestDay(e) {
     if (!this.data.startDate || !this.data.endDate) {
       wx.showToast({ title: '请先设置起始和截止日期', icon: 'none' })
       return
     }
    let d = e.detail.value
     if (d < this.data.startDate || d > this.data.endDate) {
       wx.showToast({ title: '日期超出服务范围', icon: 'none' })
       return
     }
    let arr = this.data.restDayList
    if (arr.includes(d)) {
      wx.showToast({ title: "已添加", icon: "none" })
      return
    }
    arr.push(d)
    arr.sort()
    this.setData({ restDayList: arr })
    this.calc()
  },
  // 新增：删除休息日
  delRestDay(e) {
    let d = e.currentTarget.dataset.date
    let arr = this.data.restDayList.filter(i => i !== d)
    this.setData({ restDayList: arr })
    this.calc()
  },

  inputTotalSalary(e) {
    let val = e.detail.value
    this.setData({ totalSalary: val })
    this.calc()
  },
  inputMonthDays(e) { this.setData({ monthDaysInput: e.detail.value }) },
  blurMonthDays() {
    let v = this.data.monthDaysInput
    let num = parseInt(v)
    if (!v || isNaN(num) || num < 1) num = 26
    this.setData({ monthDays: num, monthDaysInput: String(num) })
    this.calc()
  },
  calc() {
    let { startDate, startTime, endDate, endTime, totalSalary, monthDays, restDayList } = this.data
    let salary = Number(totalSalary) || 0
    if (!startDate || !startTime || !endDate || !endTime) return

    let s = new Date(startDate + "T" + startTime + ":00").getTime()
    let e = new Date(endDate + "T" + endTime + ":00").getTime()
    let nowTime = new Date().getTime()

    if (e > nowTime) {
      wx.showToast({ title: "不能选未来", icon: "none" })
      return
    }
    if (e <= s) {
      wx.showToast({ title: "时间错误", icon: "none" })
      return
    }

    let allH = this.data.userHolidayList
    let totalH = (e - s) / 3600000
    let days = Math.floor(totalH / 24)
    let hours = Math.round(totalH % 24 * 10) / 10
    let show = days + "天" + hours + "小时"

    // 统计休息时长
    let restHours = restDayList.length * 24
    let realTotalHours = Math.max(0, totalH - restHours)
    let realDays = Math.floor(realTotalHours / 24)
    let realHours = Math.round(realTotalHours % 24 * 10) / 10
    let realShow = realDays + "天" + realHours + "小时"

    let normalH = 0, holidayH = 0
    let cur = new Date(startDate)
    let endObj = new Date(endDate)
    let hitDays = []

    while (cur <= endObj) {
      let d = cur.getFullYear() + '-' + String(cur.getMonth() + 1).padStart(2, '0') + '-' + String(cur.getDate()).padStart(2, '0')
      // 如果当天是休息日，直接跳过不算工时
      if (restDayList.includes(d)) {
        cur.setDate(cur.getDate() + 1)
        continue
      }
      let ds = new Date(d + "T00:00:00").getTime()
      let de = new Date(d + "T23:59:00").getTime()
      let os = Math.max(s, ds)
      let oe = Math.min(e, de)
      let h = (oe - os) / 3600000
      if (h > 0) {
        if (allH.includes(d)) {
          holidayH += h
          hitDays.push(d)
        } else {
          normalH += h
        }
      }
      cur.setDate(cur.getDate() + 1)
    }

    let daySal = salary / monthDays
    let hourSal = daySal / 24
    let normalW = normalH * hourSal
    let holiW = holidayH * hourSal * 2
    let total = normalW + holiW

    let tip = hitDays.length ? "节假日：" + hitDays.join(" ") : "无节假日"

    this.setData({
      showDayHour: show,
      realShowDayHour: realShow,
      daySalary: daySal.toFixed(2),
      hourSalary: hourSal.toFixed(2),
      normalWage: normalW.toFixed(2),
      holidayWage: holiW.toFixed(2),
      finalSalary: total.toFixed(2),
      holidayTip: tip
    })
  },
  resetAll() {
    let startColor = this.getRandomColor();
    let endColor = this.getRandomColor();
    while (endColor === startColor) {
      endColor = this.getRandomColor();
    }
    this.setData({
      name: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      restDayList: [], // 清空休息日
      totalSalary: "",
      monthDaysInput: "26",
      showDayHour: '',
      realShowDayHour: '',
      daySalary: '0.00',
      hourSalary: '0.00',
      normalWage: '0.00',
      holidayWage: '0.00',
      finalSalary: '0.00',
      holidayTip: '',
       userHolidayList: [],
       userHolidayList: [],
      startBgColor: startColor,
      endBgColor: endColor
    });
  },
  copyWageInfo() {
    let d = this.data;
    let holidayLine = "";
    if (d.holidayTip && d.holidayTip !== "无节假日") {
      holidayLine = `本次包含法定节假日双倍：${d.holidayTip.replace("节假日：", "")}`;
    } else {
      holidayLine = "本次服务无国家法定节假日双倍";
    }

    let restLine = d.restDayList.length
      ? `休息天数：${d.restDayList.length}天（${d.restDayList.join(" ")}）`
      : "无休息"

    let txt = `【阿姨工资核算】
阿姨姓名：${d.name || '未备注'}
起始时间：${d.startDate} ${d.startTime}
截止时间：${d.endDate} ${d.endTime}
${restLine}
总服务时长：${d.showDayHour}
实际服务时长：${d.realShowDayHour}
月薪：${d.totalSalary || 0} 元(按每月${d.monthDays}天)
日薪：${d.daySalary} 元
时薪：${d.hourSalary} 元

${holidayLine}
普通工时工资：${d.normalWage} 元
节假日双倍工资：${d.holidayWage} 元
合计应付工资：${d.finalSalary} 元`;

    wx.setClipboardData({
      data: txt,
      success: () => wx.showToast({ title: "已复制" })
    });
  },
  pickAddHoliday(e) {
     if (!this.data.startDate || !this.data.endDate) {
       wx.showToast({ title: '请先设置起始和截止日期', icon: 'none' })
       return
     }
    let d = e.detail.value
     if (d < this.data.startDate || d > this.data.endDate) {
       wx.showToast({ title: '日期超出服务范围', icon: 'none' })
       return
     }
    let arr = [...this.data.userHolidayList]
    if (arr.includes(d)) { wx.showToast({ title: "已存在", icon: "none" }); return }
    arr.push(d)
    this.setData({ userHolidayList: arr })
    // no longer persisted
    this.calc()
  },
  delHoliday(e) {
    let d = e.currentTarget.dataset.date
    let arr = this.data.userHolidayList.filter(i => i !== d)
    this.setData({ userHolidayList: arr })
    // no longer persisted
    this.calc()
  },
  saveRecord() {
    let d = this.data
    let item = {
      name: d.name,
      startDate: d.startDate,
      startTime: d.startTime,
      endDate: d.endDate,
      endTime: d.endTime,
      restDayList: d.restDayList,
      showDayHour: d.showDayHour,
      realShowDayHour: d.realShowDayHour,
      totalSalary: d.totalSalary || 0,
      monthDays: d.monthDays,
      daySalary: d.daySalary,
      hourSalary: d.hourSalary,
      normalWage: d.normalWage,
      holidayWage: d.holidayWage,
      finalSalary: d.finalSalary,
      holidayTip: d.holidayTip,
      createTime: new Date().toLocaleString()
    }
    let list = wx.getStorageSync('wageHistory') || []
    list = list.filter(i => i.name !== d.name)
    list.unshift(item)
    if (list.length > 50) list = list.slice(0, 50)
    wx.setStorageSync('wageHistory', list)
    this.setData({ historyList: list })
    wx.showToast({ title: "已保存" })
  },
  copyHistory(e) {
    let idx = e.currentTarget.dataset.idx;
    let i = this.data.historyList[idx];
    let holidayLine = "";
    if (i.holidayTip && i.holidayTip !== "无节假日") {
      holidayLine = `本次包含法定节假日双倍：${i.holidayTip.replace("节假日：", "")}`;
    } else {
      holidayLine = "本次服务无国家法定节假日双倍";
    }
    let restLine = i.restDayList?.length
      ? `休息天数：${i.restDayList.length}天（${i.restDayList.join(" ")}）`
      : "无休息"

    let txt = `【阿姨工资核算】
阿姨姓名：${i.name || '未备注'}
起始时间：${i.startDate} ${i.startTime}
截止时间：${i.endDate} ${i.endTime}
${restLine}
总服务时长：${i.showDayHour}
实际服务时长：${i.realShowDayHour}
月薪：${i.totalSalary} 元(按每月${i.monthDays}天)
日薪：${i.daySalary} 元
时薪：${i.hourSalary} 元

${holidayLine}
普通工时工资：${i.normalWage} 元
节假日双倍工资：${i.holidayWage} 元
合计应付工资：${i.finalSalary} 元`;

    wx.setClipboardData({
      data: txt,
      success: () => wx.showToast({ title: "已复制" })
    });
  },
  delOneHistory(e) {
    let idx = e.currentTarget.dataset.idx
    let list = this.data.historyList.filter((_, i) => i !== idx)
    wx.setStorageSync('wageHistory', list)
    this.setData({ historyList: list })
  },
  clearAllHistory() {
    wx.setStorageSync('wageHistory', [])
    this.setData({ historyList: [] })
  }
})
