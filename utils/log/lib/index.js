'use strict'

const log = require('npmlog')

/**
 * 定制
 * 1.
 * 2. level定制 默认 info - 2000 小于2000的都不会打印出来
 * verbose 调试 下降 根据环境变量去控制 比如 传入 --debug 的时候 输出 verbose 日志
 * 3. heading 在log之前添加前缀
 */
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'
log.heading = 'zhangLi'
log.headingStyle = { fg: 'red', bg: 'black' } // 修改前缀
log.addLevel('success', 2000, { fg: 'green', bold: true })

module.exports = log
