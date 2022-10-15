'use strict';
const path = require('path');
const cp = require('child_process');
const Package = require('@zhangli-cli-dev/package');
const log = require('@zhangli-cli-dev/log');

// 如果我们当前有不同的团队，可以把当前用户登录的信息和命令信息传递到服务端
// key 以及key对应的包名,拿到这个package
// 测试单独包的发布
const SETTINGS = {
  // init: '@imooc-cli/init',
  init: '@zhangli-cli-dev/init',
};

// 将所有的缓存目录放入 dependencies 下
const CACHE_DIR = 'dependencies';

/**
 * zhangli-cli-dev init test-project -tp /xxx --debug
 * 1. targetPath 不存在，创建缓存目录，拿到package，缓存到本地
 * 2. 如果存在，直接获取本地代码进行开发，尝试更新
 */
async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH;
  const homePath = process.env.CLI_HOME_PATH;
  let storeDir;
  let pkg;
  log.verbose('targetPath', targetPath); // /Users/zhangli/learning_code/zhangli-cli-dev/commands/init
  log.verbose('homePath', homePath); // /Users/zhangli/.zhangli-cli-dev
  // Package参数的获取，由于参数长度不确定
  // action -> exec的执行过程中传入的参数是可变参数，需要动态获取 arguments
  // exec默认会传入一些参数，比如 publish命令，所以不写在函数参数中
  // programName 写在前面后面都无所谓
  // /Users/zhangli/learning_code/zhangli-cli-de v/core/exec/lib
  // console.log(__dirname)
  const cmdObj = arguments[arguments.length - 1];
  // command name 也可以通过接口去获取 这里我们做映射表
  const cmdName = cmdObj.name();
  // cmdName -> init
  const packageName = SETTINGS[cmdName];
  // const packageVersion = '1.1.0';
  const packageVersion = 'latest';
  // targetPath没有传入，自动生成缓存目录 
  if (!targetPath) {
    //  zhangli-cli-dev init psor -d -f
    // 生成缓存路径 
    targetPath = path.resolve(homePath, CACHE_DIR);
    // storeDir
    storeDir = path.resolve(targetPath, 'node_modules');

    log.verbose('targetPath', targetPath);
    //  /Users/zhangli/.zhangli-cli-dev/dependencies
    log.verbose('storeDir', storeDir);
    // /Users/zhangli/.zhangli-cli-dev/dependencies/node_module

    pkg = new Package({
      targetPath,
      packageName,
      storeDir, 
      packageVersion,
    });
    if (await pkg.exists()) {
      //尝试更新 
      log.verbose('更新');
      await pkg.update();
    } else {
      // 安装
      log.verbose('安装');
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
  // console.log(await pkg.exists(), '111', pkg);
  const rootFile = pkg.getRootFile();
  // console.log(rootFile,'rootFile')
  // TODO 后续改为node子进程的形式 在当前进程中无法充分利用cpu资源
  // 在子进程中进行调用，额外获得更多资源，获得更高的执行性能
  // 1. fork 并不提供回调，通过子进程通信来解决，不推荐
  // 2. spawn 可以不断收到结果，接受数据
  if (rootFile) {
    try {
      // require(rootFile)(Array.from(arguments));
      const argv = Array.from(arguments);
      const cmd = argv[argv.length - 1];
      const o = Object.create(null);
      Object.keys(cmd).forEach((key) => {
        if (
          cmd.hasOwnProperty(key) &&
          !key.startsWith('_') &&
          key !== 'parent'
        ) {
          o[key] = cmd[key];
        }
      });
      argv[argv.length - 1] = o;
      const code = `require('${rootFile}').call(null,${JSON.stringify(argv)});`;
      // window中 cp.spawn('cmd',['/c','node','-e',code]) cmd 是用来执行的主参数或者执行文件，-c是静默执行
      const child = spawn('node', ['-e', code], {
        cwd: process.cwd(),
        // 默认是管道，意味着我们创建一个子进程之后，父子进程之间会建立起一个通道，需要使用 on 的方式进行监听
        // stdio:'pipe',
        stdio: 'inherit',
        // 将相应的stdio传给父进程，会把输入，输入，错误值直接和父进程进行绑定，无须监听结果,将所有的输出流
        // 都输入到当前的父进程当中
      });
      // child.stdout.on('data', (chunk) => {});
      // child.stderr.on('data', (chunk) => {});
      child.on('error', (e) => {
        log.verbose(e.message);
        process.exit(1);
      });
      child.on('exit', (e) => {
        log.verbose('命令执行成功', e);
        process.exit(e);
      });
    } catch (err) {
      log.error(err.message);
    }
  }
}

function spawn(command, args, options) {
  const win32 = process.platform === 'win32';
  const cmd = win32 ? 'cmd' : command;
  const cmdArgs = win32 ? ['/c'].concat(command, args) : args;
  return cp.spawn(cmd, cmdArgs, options || {});
}

module.exports = exec;
