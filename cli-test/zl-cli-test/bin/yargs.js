const yargs = require('yargs/yargs');
const dedent = require('dedent');
const pkg = require('../package.json');
// dedent 去掉缩进
const cli = yargs();
const argv = process.argv.slice(2);

const context = {
  devVersion: pkg.version,
};

cli
  .usage('Usage: $0 [command] <options>') // 具体用法
  .demandCommand(
    // 最少要输入的命令个数
    1,
    'A command is required. Pass --help to see all available commands and options.'
  )
  .strict() // 严格模式
  .recommendCommands() // 命令输入错误的时候，返回近似的命令做提示
  .fail((err, msg) => { // 处理命令执行失败的情况展示
    console.log(err);
  })
  .alias('h', 'help') // 别名
  .alias('v', 'version')
  .wrap(cli.terminalWidth()) // 命令的宽度
  .epilogue(
    // 页脚的语句
    dedent`
      When a command fails, all logs are written to lerna-debug.log in the current working directory.
      For more information, find our manual at https://github.com/lerna/lerna
    `
  )
  .options({
    debug: {
      type: 'boolean',
      describe: 'Bootstrap debug mode',
      alias: 'd',
    },
  })
  .option('registry', {
    // 单个命令
    type: 'string',
    describe: 'Define global registry',
    alias: 'r',
  })
  .group(['debug'], 'Dev Options:') // 分组
  .group(['registry'], 'Extra Options:')
  // command 四个参数
  // 1. 当前脚手架后面输入的名称 zl-cli-test init/serve
  // 2. 描述
  // 3. builder函数，在执行这个command具体命令之前我们做的一些事情，定义一些只有init [name] 这个命令运行时候的一些option参数
  // 4. handler函数，具体执行command的一个行为
  .command(
    'init [name]', // serve [port]
    '初始化项目',
    (yargs) => {
      yargs.option('name', {
        type: 'string',
        describe: 'Name of a project',
        // 注意脚手架的别名不要重复
        alias: 'n', // zl-cli-test init -n aaa    zl-cli-test init -d -r npm -n vue-test 
      });
    },
    (argv) => {
      console.log(argv, 'init');
    }
  )
  .command({
    command: 'list',
    aliases: ['ls', 'la', 'll'],
    describe: 'List local packages',
    builder: (yargs) => {},
    handler: (argv) => {
      // const fs = require('fs'); // native module
      // const dedent = require('dedent'); // cached local module
      // const local = require('.'); // relative path
      // const utils = require('/Users/sam/Desktop/vue-test/zl-test/bin/utils'); // absolute path
      // const pkg = require('../../zl-test-lib/package.json'); // load json
      // const undefinedModule = require('./file'); // undefined module
      console.log(argv,'list');
    },
  })
  .option('verbose', {
    type: 'boolean',
    describe: 'Run with verbose logging',
    alias: 'e',
  })
  .command(
    'serve [port]',
    'start the serve',
    (yargs) => {
      yargs.positional('port', {
        describe: 'port to bind on',
        default: 50000,
      });
    },
    (argv) => {
      if (argv.verbose) console.info(`start serve on：${argv.port}`);
      console.log(argv, 'verbose');
    }
  )

  .parse(argv, context);
