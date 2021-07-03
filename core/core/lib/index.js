'use strict';

module.exports = index;
const pkg = require('../package.json')
const log = require('@zhangli-cli-dev/log')
/**
 * require 支持加载的类型资源 .js/.json/.node
 * .js -> module.exports/exports
 * .json -> JSON.parse
 * any -> 会默认使用js引擎去解析，当成一个js文件 比如 require('a.txt')
 * .md是不行的，但是如果我们把内容改成一段js代码，就可以
 */
function index() {
  checkPkgVersion()
}

function checkPkgVersion () {
  log.notice('cli',pkg.version)
  // log.success('test','success...')
  // log.verbose('debug','debug...')
}
