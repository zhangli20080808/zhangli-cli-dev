#! /usr/bin/env node
/**
 * 如果我们本地也存在一个 zhangli-cli-dev 会优先走本地的cli(根目录，安装zhangli-cli-dev),从node_module里面去找
 * https://blog.csdn.net/qq_17175013/article/details/117449955
 * 1. __filename 代表当前执行文件 - 绝对路径
 * 2. __dirname 代表当前文件运行的文件夹 - 绝对路径
 * 3. process.cwd() 当前工作目录下,是可以改变的
 */
const importLocal = require('import-local');
// const utils = require('@zhangli-cli-dev/utils') 
// console.log(__filename,'__filename') // /Users/zhangli/learning_code/zhangli-cli-dev/core/cli/bin/index.js
if (importLocal(__filename)) {
  // /Users/zhangli/learning_code/zhangli-cli-dev/zhangli-cli-dev/cli/cli/bin/index.js
  require('npmlog').info('cli', '正在使用 zhangli-cli-dev 本地版本');
} else {
  require('../lib')(process.argv.slice(2));
} 
