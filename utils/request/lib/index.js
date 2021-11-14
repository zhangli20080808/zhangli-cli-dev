'use strict';

const axios = require('axios');

// 推荐，从环境变量中去拿
const BASE_URL = process.env.CLI_BASE_URL
  ? process.env.CLI_BASE_URL
  : 'http://zl.zhufeng.cn:7001';

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

module.exports = request;
