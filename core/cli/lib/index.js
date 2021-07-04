'use strict'

module.exports = index
const pkg = require('../package.json')
const log = require('@zhangli-cli-dev/log')
const constants = require('../constants')
const semver = require('semver')
const colors = require('colors')

/**
 * require 支持加载的类型资源 .js/.json/.node
 * .js -> module.exports/exports
 * .json -> JSON.parse
 * any -> 会默认使用js引擎去解析，当成一个js文件 比如 require('a.txt')
 * .md是不行的，但是如果我们把内容改成一段js代码，就可以
 */
function index () {
  try {
    checkPkgVersion()
    checkNodeVersion()
  } catch (e) {
    log.error(e.message)
  }
}

/**
 * 检查node版本
 * 一些api在低版本是不支持的，设置最低node版本号
 * 1. 获取当前node版本号
 * 2. 对比最低版本号
 */

function checkNodeVersion () {
  const currentVersion = process.version
  const lowestVersion = constants.LOWEST_NODE_VERSION
  if (!semver.gte(currentVersion, lowestVersion)) {
    throw new Error(colors.red(`zhangli-cli-dev 需要安装 v${lowestVersion} 以上版本的Nodejs`))
  }
}

function checkPkgVersion () {
  log.notice('cli', pkg.version)
  // log.success('test','success...')
  // log.verbose('debug','debug...')
}
