const commander = require('commander');
const pkg = require('../package.json');

// 获取commander的单例
// const { program } = commander;

// 实例化一个Command示例
const program = new commander.Command();

program
  .name(Object.keys(pkg.bin)[0])
  .usage('<command> [options]')
  .version(pkg.version)
  .option('-d, --debug', '是否开启调试模式', false)
  .option('-e, --envName <envName>', '获取环境变量名称');

// command 注册命令 注意  < >表示 必填 [] 选填
// 1. 调用command - 注意返回一个新的对象
// 2. 调用addCommand
const clone = program.command('clone <source> [destination]');
clone
  .description('clone a repository')
  .option('-f, --force', '是否强制克隆')
  .action((source, destination, cmdObj) => {
    // zl-cli-test clone aaa xxx -f  -> aaa xxx true
    console.log(source, destination, cmdObj.force);
  });

// addCommand 注册子命令
const service = new commander.Command('service'); // zl-cli-test service -h
service
  .command('start [port]')
  .description('start service at some port')
  .action((port) => { // zl-cli-test service start 8888
    console.log('do service start', port);
  });
service
  .command('stop')
  .description('stop service')
  .action(() => {
    console.log('stop service');
  });

program.addCommand(service);

// zl-test install init -> zhangli-cli init
// program
//   .command('install [name]', 'install package', {
//     executableFile: 'zhangli-cli',
//     // isDefault: true,
//     hidden: true,
//   })
//   .alias('i');

// 
// program
//   .arguments('<cmd> [options]')
//   .description('test command', {
//     cmd: 'command to run',
//     options: 'options for command',
//   })
//   .action(function(cmd, options) {
//     console.log(cmd, options);
//   });

// 高级定制1：自定义help信息
// program.helpInformation = function() {
//   return '';
// };
// program.on('--help', function() {
//   console.log('your help information');
// });

// 高级定制2：实现debug模式
// program.on('option:debug', function () {
//   if (program.debug) {
//     process.env.LOG_LEVEL = 'verbose';
//   }
//   console.log(process.env.LOG_LEVEL);
// });

// // 高级定制3：对未知命令监听
// program.on('command:*', function (obj) {
//   // console.log(obj);
//   console.error('未知的命令：' + obj[0]);
//   const availableCommands = program.commands.map((cmd) => cmd.name());
//   // console.log(availableCommands);
//   console.log('可用命令：' + availableCommands.join(','));
// });

program.parse(process.argv);

// console.log(program.envName); //   zl-cli-test -e 222 -> 222
program.outputHelp() // 帮助信息

// 打印当前接受的传入的options信息 debug,envName，version都是手动传入的
// console.log(program.opts());  zl-cli-test -e 222-> { version: '1.0.2', debug: false, envName: '222' }