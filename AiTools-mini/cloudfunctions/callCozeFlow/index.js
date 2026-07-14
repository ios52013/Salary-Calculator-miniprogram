const cloud = require('wx-server-sdk')
const axios = require('axios')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const VOLC_BEARER_KEY = process.env.VOLC_BEARER_KEY
const VOLC_QUERY_URL = process.env.VOLC_QUERY_URL

async function queryVolcTask(taskId) {
  return await axios({
    method: "GET",
    url: `${VOLC_QUERY_URL}/${taskId}`,
    headers: {
      "Authorization": `Bearer ${VOLC_BEARER_KEY}`,
      "Content-Type": "application/json"
    }
  })
}

exports.main = async (event) => {
  try {
    if (event.action === "queryVolc") {
      const taskData = await queryVolcTask(event.volcTaskId)
      if (taskData.data?.data?.status === "succeeded" && taskData.data?.data?.video_url) {
        return { code: 200, finished: true, video_url: taskData.data.data.video_url }
      }
      return { code: 200, finished: false }
    }
    return { code: 400, msg: "非法action参数" }
  } catch (err) {
    console.error("云函数执行日志：", err)
    return { code: 500, msg: "云函数异常", detail: err.message }
  }
}