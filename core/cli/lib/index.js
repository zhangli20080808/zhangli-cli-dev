'use strict'
const path = require('path')
const pkg = require('../package.json')
const log = require('@zhangli-cli-dev/log')
const constants = require('../constants')
const semver = require('semver')
const colors = require('colors')
const rootCheck = require('root-check')
const userHome = require('user-home')
const pathExist = require('path-exists').sync

let args
module.exports = core

/**
 * require 支持加载的类型资源 .js/.json/.node
 * .js -> module.exports/exports
 * .json -> JSON.parse
 * any -> 会默认使用js引擎去解析，当成一个js文件 比如 require('a.txt')
 * .md是不行的，但是如果我们把内容改成一段js代码，就可以
 */
function core () {
  try {
    checkPkgVersion()
    checkNodeVersion()
    checkRoot()
    checkUseHome()
    checkInputArgs()
    checkEnv()
    checkGlobalUpdate()
    // log.verbose('debug', 'tests')
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
  log.info('cli', pkg.version)
  // log.success('test','success...')
  // log.verbose('debug','debug...')
}

/**
 * sudo 启动   process.getuid() -> 0  普通启动 -> 501
 * 通过 root 降级
 * sudo 启动后 任然是501
 * 核心是调用了  geteuid setegid
 */
function checkRoot () {
  rootCheck()
}

/**
 * 去判断环境，再拼装起来
 * /Users/zhangli
 */
function checkUseHome () {
  if (!userHome || !pathExist(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在！'))
  }
}

/**
 * 在这边检查入参主要是为了 是否是要进入调试模式
 * 比如要打印一些 debug 信息 --debug 继而在log模块设置 环境变量 LOG_LEVEL
 */

function checkInputArgs () {
  const minimist = require('minimist')
  args = minimist(process.argv.slice(2))
  // console.log(args) // { _: [], debug: true, scope: true }
  checkArgs()
}

function checkArgs () {
  process.env.LOG_LEVEL = args.debug ? 'verbose' : 'info'
  log.level = process.env.LOG_LEVEL
}

/**
 * 检查环境变量
 * 可以在操作系统中配置一些环境变量，将我们一些用户名，密码 敏感信息保存在我们用户的本地,而不用集成到代码当中
 * 需要的时候就可以实时进行读取，同时也可以做很多默认的配置信息
 * CLI_HOME=.zhangli-cli 缓存主目录
 */
function checkEnv () {
  // const dotenv = require('dotenv')
  // const dotenvPath = path.resolve(userHome,'.env')
  // if(pathExist(dotenvPath)){
  //   config = dotenv.config({
  //     path: dotenvPath
  //   })
  // }
  // log.verbose('环境变量',config,process.env.DB_USER) // { parsed: { CLI_HOME: '.zhangli-cli', DB_USER: 'root' } } root
  // 用户没有配置 CLI_HOME
  createDefaultConfig()
  log.verbose('环境变量', process.env.CLI_HOME_PATH) // { parsed: { CLI_HOME: '.zhangli-cli', DB_USER: 'root' } } root
}

function createDefaultConfig () {
  const cliConfig = {
    home: userHome
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(userHome, constants.DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome
}

/**
 * 是否需要全局更新
 * 1. 获取当前的版本号和模块包名
 * 2. 调用 npm API 获取所有版本号 https://registry.npmjs.org/@zhangli-cli-dev/core
 * 3. 获取所有版本号，比对哪些版本是大于当前版本的
 * 4. 获取最新版本号，提示用户更新到最新版本
 */
async function checkGlobalUpdate () {
  const currentVersion = pkg.version
  const npmName = pkg.name
  const { getNpmSemverVersion } = require('@zhangli-cli-dev/get-npm-info')
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
    // TODO
    log.warn(colors.yellow(`请手动更新${npmName},当前版本${currentVersion},最新版本${lastVersion}
     更新命令 npm install -g ${npmName}`
    ))
  }
}
