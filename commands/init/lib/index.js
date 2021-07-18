'use strict'

function init (programName, cmdObj) {
  // zhangli-cli-dev init xxx -f
  // zhangli-cli-dev init pro -tp /xxx
  // targetPath 算是一个全局属性 获取方式需要 parent 如果这个命令是多级 子命令 这个 parent 就不是顶级的了
  // 通过环境变量可以更优雅的解决这个 实现业务逻辑的解耦 parent 的问题，脱离当前运行环境 就不需要在这里再去拿 targetPath了
  console.log('init', programName, cmdObj.force, process.env.CLI_TARGET_PATH)
}

module.exports = init
