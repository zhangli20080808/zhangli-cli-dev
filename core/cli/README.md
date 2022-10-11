### 命令执行流程

- 准备阶段
  1. 检查版本号 - 后续版本升级需要，补充额外逻辑
  2. 检查 node 版本 - 版本不合适，后续不能执行
  3. 检查 root 启动 - 观察用户是否通过 sudo 这种方式启动,如果通过 root 这种方式启动，后续创建的这些文件可能很难维护，比如删除，可能删不了，因为通过 root 创建的文件，其他用户是不能进行访问的，如果是 root 用户，需要降级到普通用户。可以避免一系列的权限问题
  4. 检查用户主目录 - 确保能够拿到用户主目录，因为我们需要向主目录写入缓存，拿不到，执行停止。
```js
const userHome = require('user-home');
/**
 * 去判断环境，再拼装起来
 * userHome-> /Users/zhangli
 */
function checkUseHome() {
  if (!userHome || !pathExist(userHome)) {
    throw new Error(colors.red('当前登录用户主目录不存在！'));
  }
}
```    
  5. 检查入参
  6. 环境变量检测 - 也是为了缓存
  7. 检查是否为最新版本 - 提示更新
```js
async function prepare() {
  checkPkgVersion();
  checkRoot();
  checkUseHome();
  checkEnv();
  await checkGlobalUpdate();
}
async function core() {
  try {
    await prepare();
    registerCommand();
    // log.verbose('debug', 'tests')
  } catch (e) {
    log.error(e.message);
    if (program.debug) {
      console.error(e);
    }
  }
}
module.exports = core;
```  
- 命令注册
- 命令执行
  - 是否加载本地文件 - 是说 init 能够指向本地的代码文件，而不是缓存文件，需要参数去标识当前 init 文件的绝对路径
    如果本地代码没有，动态的去下载，并且加载进去，拿到缓存目录这条路径。如果缓存目录有这个模块，尝试做一次更新，没有直接安装，通过 require 方式进行加载，再去看有没有入口文件，动态生成执行代码的命令 node -e '',启动新进程去执行
  - 判断 targetPath 是否存在，如果存在，直接获取本地代码进行开发，不存在，创建缓存目录，拿到 package，缓存到本地
  - 实现 Package 类
