### 命令执行流程

- 准备阶段

1. 检查版本号 - 后续版本升级需要，补充额外逻辑
2. 检查 node 版本 - 版本不合适，后续不能执行
3. 检查 root 启动 - 观察用户是否通过 sudo 这种方式启动,如果通过 root 这种方式启动，后续创建的这些文件可能很难维护，比如删除，可能删不了，因为通过 root 创建的文件，其他用户是不能进行访问的，如果是 root 用户，需要降级到普通用户。可以避免一系列的权限问题

   ```js
   const rootCheck = require('root-check');
   function checkRoot() {
     rootCheck();
   }
   ```

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

   ```js
   let args;
   function checkInputArgs() {
     const minimist = require('minimist');
     args = minimist(process.argv.slice(2));
     // console.log(args) // { _: [], d:true 或者  debug: true, scope: true }
     checkArgs();
   }
   function checkArgs() {
     process.env.LOG_LEVEL = args.debug || args.d ? 'verbose' : 'info';
     log.level = process.env.LOG_LEVEL;
   }
   ```

6. 环境变量检测 - 也是为了缓存

   ```js
   // console.log(process.cwd()); // 那个目录执行的命令，比如/Users/zhangli下，输出/Users/zhangli
   const dotenv = require('dotenv');
   const dotenvPath = path.resolve(userHome, '.env');
   if (pathExist(dotenvPath)) {
     dotenv.config({
       path: dotenvPath,
     });
   }
   log.verbose('环境变量', config, process.env.DB_USER);
   // { parsed: { CLI_HOME: '.zhangli-cli', DB_USER: 'root' } } root
   // 如果用户没有配置 CLI_HOME，读取不到，创建默认配置
   function createDefaultConfig() {
     const cliConfig = {
       home: userHome,
     };
     // 脚手架主目录
     if (process.env.CLI_HOME) {
       cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME);
     } else {
       cliConfig['cliHome'] = path.join(userHome, constants.DEFAULT_CLI_HOME);
     }
     // 对环境变量中的值处理之后生成新的变量 - 缓存路径
     process.env.CLI_HOME_PATH = cliConfig.cliHome;
     // console.log(process.env.CLI_HOME_PATH); // /Users/zhangli/.zhangli-cli-dev
   }
   ```

7. 检查是否为最新版本 - 提示更新

   ```js
   async function checkGlobalUpdate() {
     const currentVersion = pkg.version;
     const npmName = pkg.name;
     const { getNpmSemverVersion } = require('@zhangli-cli-dev/get-npm-infos');
     const lastVersion = await getNpmSemverVersion(currentVersion, npmName);
     if (lastVersion && semver.gt(lastVersion, currentVersion)) {
       // TODO
       log.warn(
         colors.yellow(`请手动更新${npmName},当前版本${currentVersion},最新版本${lastVersion}
     更新命令 npm install -g ${npmName}`)
       );
     }
   }
   ```

- 命令注册
  核心 - 基于 Commander 实现脚手架的命令注册和执行过程开发,具体看代码实现
  主要内容

  ```js
  // 注册命令
  program
    .command('init [programName]') // 单独封装成一个 package
    // 如果当前文件夹下面是有文件的时候 默认情况我们是不能初始化的 如果要强制 那先清空掉 通过action方法去执行
    .option('-f,--force', '是否强制初始化项目')
    .action(exec); 
    // 单独封装 exec 去做命令的注册和执行
  ```

  1. 封装通用的 Package 和 Command 类
  2. 基于缓存+node 多进程实现动态命令加载和执行
  3. 将业务逻辑和脚手架彻底进行解耦 - 业务多变，底层框架不变，可以作为目标

- 命令执行
  - 是否加载本地文件 - 是说 init 能够指向本地的代码文件，而不是缓存文件，需要参数去标识当前 init 文件的绝对路径
    如果本地代码没有，动态的去下载，并且加载进去，拿到缓存目录这条路径。如果缓存目录有这个模块，尝试做一次更新，没有直接安装，通过 require 方式进行加载，再去看有没有入口文件，动态生成执行代码的命令 node -e '',启动新进程去执行
  - 判断 targetPath 是否存在，如果存在，直接获取本地代码进行开发，不存在，创建缓存目录，拿到 package，缓存到本地
  - 实现 Package 类

## 架构优化 - 针对脚手架架构设计
![脚手架架构设计](../../images/%E8%AE%BE%E8%AE%A1%E7%BC%BA%E9%99%B7%E6%80%9D%E8%80%83.png)
1. 当commands命令很多的时候，安装速度会比较慢。比如有10个命令，且这10个命令又有很多外部依赖
2. 针对写死的 init 命令，实现init命令的动态化。主要是每个团队可能会需要不同的包去处理
3. 目标 - 动态加载 init 模块，根据远程返回的结果，动态拿到init包

![脚手架架构设计后](../../images/%E8%84%9A%E6%89%8B%E6%9E%B6%E8%AE%BE%E8%AE%A1%E4%BC%98%E5%8C%96.png)

 
