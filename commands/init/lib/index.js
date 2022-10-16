'use strict';

/**
 * 考虑到灵活性，每个init命令都不相同，可能需要实现init命令动态化，根据远程返回的一个结果动态的去拿
 * @param {*} programName
 * @param {*} cmdObj
 */
const Command = require('@zhangli-cli-dev/command');
const log = require('@zhangli-cli-dev/log');
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const useHome = require('user-home');
const semver = require('semver');
const inquirer = require('inquirer');
const Package = require('@zhangli-cli-dev/package');
const getProjectTemplate = require('./requestTemplate');
const TYPE_PROJECT = 'project';
const TYPE_COMPONENT = 'component';

class InitCommand extends Command {
  init() {
    this.programName = this._argv[0] || '';
    this.force = this._cmdObj.force;
    log.verbose('Command 基类开始执行init逻辑', this.programName, this.force);
  }
  /**
    1. 准备阶段
    2. 下载模板
    3. 安装模板
   */
  async exec() {
    try {
      log.verbose('Command 基类开始执行 exec逻辑');
      const projectInfo = await this.prepare();
      if (projectInfo) {
        // 拿到基本信息后，进行后续模板的下载安装
        // log.verbose(projectInfo, 'projectInfo');
        this.projectInfo = projectInfo;
        await this.downTemplate();
      }
    } catch (e) {
      log.verbose(e.message);
    }
  }

  /**
   * 1. 通过项目模板Api获取项目模板信息
   * 1.1 通过egg.js搭建一套后端系统
   * 1.2 通过 npm 存储项目模板
   * 1.3 将项目模板信息存储到mongodb数据库中
   * 1.4 通过egg.js获取mongodb中的数据并且返回
   */
  async downTemplate() {
    console.log(this.projectInfo, this.template);
    const { projectTemplate } = this.projectInfo;
    const templateInfo = this.template.find(
      (item) => item.npmName === projectTemplate
    );
    const targetPath = path.resolve(useHome, '.zhangli-cli-dev', 'template');
    const storeDir = path.resolve(
      useHome,
      '.zhangli-cli-dev',
      'template',
      'node_modules'
    );
    // log.verbose(targetPath);
    // log.verbose(storeDir);
    const { version, npmName } = templateInfo;
    const templateNpm = new Package({
      targetPath,
      storeDir,
      packageName: npmName,
      packageVersion: version,
    });
    console.log(targetPath, storeDir, npmName, version, templateNpm);
    if (!(await templateNpm.exists())) {
      await templateNpm.install();
    } else {
      await templateNpm.update();
    }
    // /Users/zhangli/.zhangli-cli-dev/template/node_modules
    // drwxr-xr-x  4 zhangli  staff   128B 10 16 18:12 _zl-cli-template-vue3@1.0.0@zl-cli-template-vue3
    // lrwxr-xr-x  1 zhangli  staff    48B 10 16 18:12 zl-cli-template-vue3 -> _zl-cli-template-vue3@1.0.0@zl-cli-template-vue3
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
    // 项目模板是否存在
    const template = await getProjectTemplate();
    if (!template || template.length === 0) {
      throw new Error('项目模板不存在');
    }
    this.template = template;
    const localPath = process.cwd();
    const ret = this.isDirEmpty(localPath);
    log.verbose('当前文件夹项目为空', ret);
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
      let project = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: '请输入项目名称',
          default: '',
          // 1. 首字符必须为英文字符
          // 2. 尾字符必须为英文或者数字，不能为字符
          // 3. 字符只能允许 '-_'
          // 注意 \w 代表 a-zA-Z0-9_  * 可有可无
          // 合法：
          validate: function (v) {
            const done = this.async();
            let reg =
              /^[a-zA-Z]+([-][a-zA-Z][a-zA-Z0-9]*|[_][a-zA-Z][a-zA-Z0-9]*|[a-zA-Z0-9])*$/.test(
                v
              );
            setTimeout(() => {
              if (!reg) {
                done('请输入合法的项目名...');
                return;
              }
              done(null, true);
            }, 0);
          },
          filter: function (v) {
            return v;
          },
        },
        {
          type: 'input',
          name: 'projectVersion',
          message: '请输入项目版本号',
          default: '1.0.0',
          validate: function (v) {
            const done = this.async();
            setTimeout(() => {
              if (!!!semver.valid(v)) {
                done('请输入合法的版本号...');
                return;
              }
              done(null, true);
            }, 0);
          },
          filter: function (v) {
            if (!!semver.valid(v)) {
              return semver.valid(v);
            } else {
              return v;
            }
          },
        },
        {
          type: 'list',
          name: 'projectTemplate',
          message: '请选择项目模板',
          choices: this.createTemplateChoice(),
        },
      ]);
      projectInfo = {
        type,
        ...project,
      };
    } else if (type === TYPE_COMPONENT) {
    }
    return projectInfo;
  }

  /**
   * 判断文件目录是否为空
   */
  isDirEmpty(localPath) {
    let fileList = fs.readdirSync(localPath);
    // console.log(fileList);
    // 可以做一个文件的过滤，比如.git node_modules 并不会影响
    fileList = fileList.filter(
      (file) => !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
    );
    return !fileList || fileList.length <= 0;
  }

  createTemplateChoice() {
    return this.template.map((item) => ({
      value: item.npmName,
      name: item.name,
    }));
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
