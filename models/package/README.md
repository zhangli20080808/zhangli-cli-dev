
# exec参数不固定，使用argument解析
```js
const clone = program.command('clone <source> [destination]');
clone
  .description('clone a repository')
  .option('-f, --force', '是否强制克隆')
  .action((source, destination, cmdObj) => {
    // zl-cli-test clone aaa xxx -f  -> aaa xxx true
    console.log(source, destination, cmdObj.force);
  });
```

# Node 多进程学习总结
## 什么是进程
进程（Process）是计算机中的程序关于某数据集合上的一次运行活动，是系统进行资源分配和调度的基本单位，是操作系统结构的基础。启动一个程序，必须要对应一个进程。

进程的概念主要有两点
1. 进程是一个实体。每一个进程都有它自己的地址空间。可以存储代码，数据，变量等等
2. 进程是一个“执行中的程序”，存在嵌套关系。

* UID - 当前用户获得权限的id
* PID - 进程的id  (processId)
* PPID - 当前进程的父进程id


比如启动node项目，就会创建node相关项目进程，可以再这个进程下再创建子进程
* 首先会启动一个桌面，在/sbin/launchd 比如双击桌面打开webstorm 进程编号为 1
* /Applications/Webstorm.app/Contents/MacOS/webstorm 可执行文件会打开webstorm程序，由 1进程打开
* 在webstorm中打开了node-> node core/cli/bin/index.js init test-project -> 一个进程实体，父进程是 25869
* 如果在当前node中再启动一个子进程，那他的 PID 就是 26309，依附在当前node进程下面，因为是node创还能得一个子进程。
* 所以其实在进行子进程开发的时候，通过在当前进程下创建若干子进程，通过这些子进程帮助我们获得更多的操作系统资源

## child_process 用法 
核心就是创建一个子进程，依附在当前进程下面
1. ps -ef  查询操作系统中所有的进程
2. ps -ef | grep node 筛选出右node启动的进程
3. ps -ef| grep PID 将当前进程筛选出来
同步
* exec - 执行shell脚本
```js
//  err - 执行脚本的异常信息 stdout - 输出结果 stderr - 错误的输出结果
child = cp.exec('ls -al|grep node_modules', function (err, stdout, stderr) {
  console.log('callback start-------------');
  console.log(err, 'err');
  console.log(stdout, 'stdout');
  console.log(stderr, 'stderr');
  console.log('callback end-------------');
});
```
* execFile  - 可以传入一些特有的参数，exec不支持

```js
// test.shell ->  如果shell文件没有执行权限 chmod +x bin/process/test.shell
ls -al|grep node_modules
echo $1
echo $2

// 主要用来执行一个文件
cp.execFile(
  path.resolve(__dirname, 'test.shell'),
  ['-al', '-bl'],
  function (err, stdout, stderr) {
    console.log(err);
    console.log(stdout);
    console.log(stderr);
  }
);
// null
// drwxr-xr-x  359 zhangli  staff   11488 10  1 17:04 node_modules
// -al
// -bl
```

异步 - 当前主线程拿不到结果
* spawn - 只能接受命令和option，并不能做出回调，要通过 返回的子进程去做.通过流式的方式不断地接受进程传递过来的结果。
* 与exec、execFile的使用场景的区别
前者适合做一些 耗时任务（比如：npm install），需要接收不断日志。后者更适合做一些开销小的任务
```js
const child2 = cp.spawn('npm', ['install'], {
  cwd: path.resolve(
    '/Users/zhangli/learning_code/zhangli-cli-dev/cli-test/zl-lib'
  ),
  // stdio: 'inherit',
});
child2.stdout.on('data', function (chunk) {
  console.log(chunk.toString());
});
child2.stderr.on('data', function(chunk) {
  console.log(chunk.toString());
});
```
* fork -  主要用来创建子进程，子进程当中使用node去执行命令。
1. 与require执行js的不同。  通常的文件都是在node主进程中去执行，不管通过require方法还是别的。
2. 在fork 中，会启动两个Node进程 ，1个main 1个 child,Node(main) -> Node(child),在子进程中会独立启动v8引擎去解析child.js,并执行代码。两个进程完全独立
3. 主进程通过send、on发送和监听消息。子进程只能通过process，因为子进程没法直接感知到主进程的存在
4. 使用场景 - 一些耗时操作，通过nodejs实现的。比如下载文件，在这个过程中可以不断地向主进程中传递消息
// 执行流程
1. 通过 fork(相当于require，先执行一遍) 加载到 child.js，子进程的消息先进行发送
2. 执行完毕，再在主进程发送消息，都通过on来监听
```js
// child.js  
console.log('child process');
console.log('child pid:', process.pid);
// 监听message事件，拿到发送的信息
process.on('message', (msg) => {
  console.log(msg,'我是子进程，我接受到了父进程的message信息');
});
process.send('hello main process');

// index.js
const child3 = cp.fork(path.resolve(__dirname, 'child.js')); // 通过fork命令执行了 child.js文件
// 在进程间通信，向子进程发送消息
child3.send('hello child process!', () => {
  // child3.disconnect(); // 发完消息直接将进程关闭，如果子进程向父进程发送消息，暂时是不能关闭的
});
child3.on('message', (msg) => {
  console.log(msg, '我接受到了子进程的message信息');
  child3.disconnect()
});
console.log('main pid:', process.pid);
// main pid: 64405
// child process
// child pid: 64406
// hello main process 我接受到了子进程的message信息
// hello child process! 我是子进程，我接受到了父进程的message信息
```
