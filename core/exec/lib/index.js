'use strict';

/**
 * 思考？
 * 普通情况 比如我们拿到CLI_TARGET_PATH，找到lib/index.js require下执行就好啦
 * 更高维度？
 * 如何设计呢？
 * 1. targetPath -> modulePath 比如 init
 * 2. modulePath -> Package(npm 模块) 再将 modulePath 生成一个 Package(npm 模块)
 * 比如 modulePath 指向init目录，他本身就是一个npm模块，我们可以将其抽象成一个 Package
 * 3. 利用 Package 帮我们提供一些方法 比如 Package.getRootFile(获取入口文件)
 * 这样就可以将我们所有获取入口文件中存在的隐含逻辑全部包含进去 各种逻辑通过 Package 完善
 * 不用将 getRootFile 的逻辑全部写在 exec 里面 -> 实现封装 更好的复用
 * 4. Package.update/Package.install
 // zhangli-cli-dev init -tp /Users/zhangli/learning_code/zhangli-cli-dev/commands/init -d
 // zhangli-cli-dev init xxx -d -f
 // zhangli-cli-dev init program -tp /Users/zhangli/learning_code/zhangli-cli-dev/commands/init -d -f
 */
const path = require('path');
const Package = require('@zhangli-cli-dev/package');
const log = require('@zhangli-cli-dev/log');
// 如果我们当前有不同的团队，可以把当前用户登录的信息和命令信息传递到服务端
const SETTINGS = {
  init: '@imooc-cli/init',
  // 'init': '@zhangli-cli-/init'
};
const CACHE_DIR = 'dependencies';

/**
 * zhangli-cli-dev init xxx -tp /xxx --debug
 * 1. targetPath 不存在，创建缓存目录，拿到package，缓存到本地 
 * 2. 如果存在，直接获取本地代码进行开发，尝试更新
 */
async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storeDir;
  let pkg;
  log.verbose('targetPath', targetPath);
  log.verbose('homePath', homePath);
  // Package参数的获取，由于参数长度不确定， action -> exec的执行过程中传入的采纳数 动态获取 arguments
  // programName 写在前面后面都无所谓
  // console.log(__dirname)
  const cmdObj = arguments[arguments.length - 1];
  // command name 也可以通过接口去获取 这里我们做映射表
  const cmdName = cmdObj.name();
  const packageName = SETTINGS[cmdName];
  const packageVersion = 'latest';
  // 
  if (!targetPath) {
    //  zhangli-cli-dev init psor -d -f
    targetPath = path.resolve(homePath, CACHE_DIR); // 生成缓存路径 .zhangli-cli-dev/dependencies
    storeDir = path.resolve(targetPath, 'node_modules');
    log.verbose('targetPath', targetPath);
    log.verbose('storeDir', storeDir);

    pkg = new Package({
      targetPath,
      packageName,
      storeDir,
      packageVersion,
    });
    if (await pkg.exists()) {
      //  更新
      console.log('更新');
      await pkg.update();
    } else {
      // 安装
      await pkg.install();
    }
  } else {
    pkg = new Package({
      targetPath,
      packageName,
      packageVersion,
    });
  }
  //  pkg.getRootFile() => /Users/zhangli/learning_code/zhangli-cli-dev/commands/init/lib/index.js
  console.log(await pkg.exists(), '111', pkg);
  const rootFile = pkg.getRootFile();
  // TODO 后续改为node子进程的形式
  if (rootFile) {
    require(rootFile).apply(null, arguments);
  }
}

module.exports = exec;
