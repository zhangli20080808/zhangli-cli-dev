const cp = require('child_process');
const path = require('path');
// const lib = require('zl-test-lib');
const argv = require('process').argv;

const command = argv[2];
const options = argv.slice(3);

// if (options.length > 1) {
//   let [option, param] = options;
//   option = option.replace('--', '');
//   console.log(option, param); // zl-cli-test init --name vue-test
//   if (command) {
//     if (lib[command]) {
//       lib[command]({ option, param });
//     } else {
//       console.log('请输入命令');
//     }
//   } else {
//     console.log('请输入命令');
//   }
// }

// 实现参数解析 --version和 init name
// if (command.startsWith('--') || command.startsWith('-')) {
//   const globalOption = command.replace(/--|-/, '');
//   console.log(globalOption);
//   if (globalOption === 'version' || globalOption === 'V') {
//     console.log('1.0.0');
//   }
// }

let child;
/**
exec - 执行shell脚本  ls -al|grep node_modules
  err - 执行脚本的异常信息
  stdout - 输出结果
  stderr - 错误的输出结果
 */
// child = cp.exec('ls -al|grep node_modules', function (err, stdout, stderr) {
//   console.log('callback start-------------');
//   console.log(err, 'err');
//   console.log(stdout, 'stdout');
//   console.log(stderr, 'stderr');
//   console.log('callback end-------------');
// });

// child.on('error', (err) => {
//   console.log('error!', err);
// });

// child.stdout.on('data', (chunk) => {
//   console.log('stdout data', chunk);
// });

// child.stderr.on('data', (chunk) => {
//   console.log('stderr data', chunk);
// });

// child.stdout.on('close', () => {
//   console.log('stdout close');
// });

// child.stderr.on('close', () => {
//   console.log('stderr close');
// });

// child.on('exit', (exitCode) => {
//   console.log('exit!', exitCode);
// });

// child.on('close', () => {
//   console.log('close!');
// });

// 主要用来执行一个文件
// cp.execFile(
//   path.resolve(__dirname, 'test.shell'),
//   ['-al', '-bl'],
//   function (err, stdout, stderr) {
//     console.log(err);
//     console.log(stdout);
//     console.log(stderr);
//   }
// );

// spawn - 只能接受命令和option，并不能做出回调，要通过 返回的子进程去做.通过流式的方式不断地接受进程传递过来的结果
// spawn: 更适合做一些 耗时任务（比如：npm install），需要接收不断日志
// exec/execFile 更适合做一些开销小的任务
// const childSpawn = cp.spawn(
//   path.resolve(__dirname, 'test.shell'),
//   ['-al', '-bl'],
//   {
//     cwd: path.resolve('..'),
//   }
// );
// console.log(childSpawn.pid, process.pid); // 59145 59142

// const child2 = cp.spawn('npm', ['install'], {
//   cwd: path.resolve(
//     '/Users/zhangli/learning_code/zhangli-cli-dev/cli-test/zl-lib'
//   ),
//   // stdio: 'inherit',
// });
// child2.stdout.on('data', function (chunk) {
//   console.log(chunk.toString());
// });
// child2.stderr.on('data', function (chunk) {
//   console.log(chunk.toString());
// });

// // exec/execFile: 开销比较小的任务
// cp.exec('npm install', {
//   cwd: path.resolve('/Users/zhangli/learning_code/zhangli-cli-dev/cli-test/zl-lib'),
// }, function(err, stdout, stderr) {
//   console.log(err);
//   console.log(stdout);
//   console.log(stderr);
// });

// fork：Node(main) -> Node(child) 主要用来创建子进程，子进程当中使用node去执行命令
// 与require执行js的不同。  通常的文件都是在node主进程中去执行，不管通过require方法还是别的
// 在fork 中，会启动两个Node进程 ，1个main 1个 child,Node(main) -> Node(child),在子进程中会独立启动v8引擎去解析child.js,并执行代码。两个进程完全独立
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

// const ret = cp.execSync('ls -al|grep node_modules');
// console.log(ret.toString());

// const ret2 = cp.execFileSync('ls', ['-al']);
// console.log(ret2.toString());

// const ret3 = cp.spawnSync('ls', ['-al']);
// console.log(ret3.stdout.toString());
