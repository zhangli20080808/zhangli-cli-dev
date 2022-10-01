const cp = require('child_process');
const path = require('path');
const lib = require('zl-test-lib');
const argv = require('process').argv;

const command = argv[2];
const options = argv.slice(3);

if (options.length > 1) {
  let [option, param] = options;
  option = option.replace('--', '');
  console.log(option, param); // zl-cli-test init --name vue-test
  if (command) {
    if (lib[command]) {
      lib[command]({ option, param });
    } else {
      console.log('请输入命令');
    }
  } else {
    console.log('请输入命令');
  }
}

// 实现参数解析 --version和 init name
if (command.startsWith('--') || command.startsWith('-')) {
  const globalOption = command.replace(/--|-/, '');
  console.log(globalOption);
  if (globalOption === 'version' || globalOption === 'V') {
    console.log('1.0.0');
  }
}

let child;
// stdout 输出结果， 错误的输出结果
// child = cp.exec('ls -al', function (err, stdout, stderr) {
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

// // spawn: 耗时任务（比如：npm install），需要接收不断日志
// const child2 = cp.spawn('npm', ['install'], {
//   cwd: path.resolve('/Users/sam/Desktop/vue-test/zl-test-lib'),
//   stdio: 'inherit',
// });

// child2.stdout.on('data', function(chunk) {
//   console.log(chunk.toString());
// });

// child2.stderr.on('data', function(chunk) {
//   console.log(chunk.toString());
// });

// // exec/execFile: 开销比较小的任务
// cp.exec('npm install', {
//   cwd: path.resolve('/Users/sam/Desktop/vue-test/zl-test-lib'),
// }, function(err, stdout, stderr) {
//   console.log(err);
//   console.log(stdout);
//   console.log(stderr);
// });

// // fork：Node(main) -> Node(child)
// const child3 = cp.fork(path.resolve(__dirname, 'child.js'));
// child3.send('hello child process!', () => {
//   child.disconnect();
// });
// child3.on('message', (msg) => {
//   console.log(msg);
// });

// console.log('main pid:', process.pid);

// const ret = cp.execSync('ls -al|grep node_modules');
// console.log(ret.toString());

// const ret2 = cp.execFileSync('ls', ['-al']);
// console.log(ret2.toString());

// const ret3 = cp.spawnSync('ls', ['-al']);
// console.log(ret3.stdout.toString());
