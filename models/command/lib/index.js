'use strict';
const LOWEST_NODE_VERSION = '12.0.0';
const semver = require('semver');
const colors = require('colors');
const log = require('@zhangli-cli-dev/log');
const { isPlainObject } = require('@zhangli-cli-dev/utils');
class Command {
  constructor(argv) {
    // console.log('cons123', argv);
    if (!argv) {
      throw new Error('参数不能为空');
    }
    if (!Array.isArray(argv)) {
      throw new Error('参数必须为数组');
    }
    if (argv.length < 1) {
      // []
      throw new Error('参数列表为空');
    }
    this._argv = argv;
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve();
      chain = chain.then(() => this.checkNodeVersion());
      chain = chain.then(() => this.initArgs());
      chain = chain
        .then(() => this.init())
        // chain = chain.then(() => this.())
        .catch((err) => {
          log.error(err.message);
        });
    });
  }
  // 将初始化逻辑下沉到 initCommand里面去做，如果没有，抛出异常
  initArgs() {
    this._cmdObj = this._argv[this._argv.length - 1];
    this._argv = this._argv.slice(0, this._argv.length - 1);
  }
  init() {
    throw new Error('init 必须实现');
  }
  exec() {}
  /**
   * 检查node版本
   * 一些api在低版本是不支持的，设置最低node版本号
   * 1. 获取当前node版本号
   * 2. 对比最低版本号 -> 版本号比对semver
   * eq相等 ne、neq不相等， gt大于， lt小于
   * gte、ge大于等于 lte、le 小于等于 not非 mod求模 等
   */

  checkNodeVersion() {
    const currentVersion = process.version;
    const lowestVersion = LOWEST_NODE_VERSION;
    if (!semver.gte(currentVersion, lowestVersion)) {
      throw new Error(
        colors.red(
          `zhangli-cli-dev 需要安装 v${lowestVersion} 以上版本的Nodejs`
        )
      );
    }
  }
}
module.exports = Command;
