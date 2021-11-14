'use strict';

/**
 * 考虑到灵活性，每个init命令都不相同，可能需要实现init命令动态化，根据远程返回的一个结果动态的去拿
 * @param {*} programName
 * @param {*} cmdObj
 */
const Command = require('@zhangli-cli-dev/command');
const log = require('@zhangli-cli-dev/log');
const fs = require('fs');
const fse = require('fs-extra');
const inquirer = require('inquirer');

const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

class InitCommand extends Command {
  init() {
    this.programName = this._argv[0] || '';
    this.force = this._cmdObj.force;
    log.verbose(this.programName, this.force);
  }
  /**
    1. 准备阶段
    2. 下载模板
    3. 安装模板
   */
  async exec() {
    try {
      const ret = await this.prepare();
      // console.log(ret, 'rt');
      if (ret) {
        // 拿到基本信息后，进行后续模板的下载安装
      }
    } catch (e) {
      log.verbose(e.message);
    }
  }
  /**
   * 1. 判断当前目录是否为空 -> 读取当前目录下的所有文件，通过 readdirSync 读取,判断是否为空
   * 2. 是否启动强制更新
   * 3. 选择创建模板还是组件
   * 4. 获取项目的基本信息
   *
   * __dirname 代表当前文件运行的文件夹 - 绝对路径
   * process.cwd() 当前工作目录下,是可以改变的 或者使用 require('.')
   */
  async prepare() {
    const localPath = process.cwd();
    const ret = this.isDirEmpty(localPath);
    if (!ret) {
      let ifContinue = false;
      // 询问是否继续创建
      if (!this.force) {
        ifContinue = (
          await inquirer.prompt({
            type: 'confirm',
            name: 'ifContinue',
            default: false,
            message: '当前文件夹不为空，是否继续创建项目？',
          })
        ).ifContinue;
        if (!ifContinue) return;
      }
      // 清空当前目录 empty remove
      if (ifContinue || this.force) {
        // 给用户做二次确认
        const { confirmDelete } = await inquirer.prompt({
          type: 'confirm',
          name: 'confirmDelete',
          default: false,
          message: '是否确认清空当前目录下的文件？',
        });
        if (confirmDelete) {
          fse.emptyDirSync(localPath);
        }
      }
    }
    return this.getProjectInfo();
  }

  /**
   * 获取项目基本信息
   * 1. 选择创建模板还是组件
   * 2. 获取项目的基本信息
   * @returns obj
   */
  async getProjectInfo() {
    let projectInfo = {};
    const { type } = await inquirer.prompt({
      type: 'list',
      // default: TYPE_PROJECT,
      message: '请选择初始化类型',
      name: 'type',
      choices: [
        {
          name: '项目',
          value: TYPE_PROJECT,
        },
        {
          name: '组件',
          value: TYPE_COMPONENT,
        },
      ],
    });
    log.verbose(type, 'type');
    if (type === TYPE_PROJECT) {
      let o = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: '请输入项目名称',
          default: '',
          validate: function (v) {
            return typeof v === 'string';
          },
          filter: function (v) {
            return v;
          },
        },
        {
          type: 'input',
          name: 'projectVersion',
          message: '请输入项目版本号',
          default: '',
          validate: function (v) {
            return typeof v === 'string';
          },
          filter: function (v) {
            return v;
          },
        },
      ]);
      console.log(o);
    } else if (type === TYPE_COMPONENT) {
    }
    // return projectInfo;
  }

  /**
   * 判断文件目录是否为空
   */
  isDirEmpty(localPath) {
    let fileList = fs.readdirSync(localPath);
    console.log(fileList);
    // 可以做一个文件的过滤，比如.git node_modules 并不会影响
    fileList = fileList.filter(
      (file) => !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
    );
    return !fileList || fileList.length <= 0;
  }
}
function init(argv) {
  // function init(programName, cmdObj) {
  // zhangli-cli-dev init xxx -f
  // zhangli-cli-dev init pro -tp /xxx
  // targetPath 算是一个全局属性 获取方式需要 parent 如果这个命令是多级 子命令 这个 parent 就不是顶级的了
  // 通过环境变量可以更优雅的解决这个 实现业务逻辑的解耦 parent 的问题，脱离当前运行环境 就不需要在这里再去拿 targetPath了
  // console.log('init1', programName, cmdObj.force, process.env.CLI_TARGET_PATH)

  return new InitCommand(argv);
}

module.exports = init;
module.exports.InitCommand = InitCommand;
