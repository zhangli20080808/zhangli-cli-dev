#! /usr/bin/env node
/**
 * 如果我们本地也存在一个 zhangli-cli-dev 会优化走本地的cli 从node_module里面去找
 * https://blog.csdn.net/qq_17175013/article/details/117449955
 */
const importLocal = require('import-local')
const utils = require('@zhangli-cli-dev/utils')

if (importLocal(__filename)) {
  // /Users/zhangli/learning_code/zhangli-cli-dev/zhangli-cli-dev/core/core/bin/index.js
  require('npmlog').info('cli', '正在使用 zhangli-cli-dev 本地版本')
} else {
  console.log(__filename)
  require('../lib')(process.argv.slice(2))
}
