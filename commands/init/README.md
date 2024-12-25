# `@zhangli-cli-dev/init`

> TODO: description

## Usage

```
const init = require('@zhangli-cli-dev/init');

// TODO: DEMONSTRATE API
```

## 创建功能架构设计

![](../images/init.png)
![](../images/down.png)
![](../images/install.png)

1. 准备阶段 - 项目的基本信息应该预先确认，否则安装过程中中断会非常影响用户体验,此阶段需要借助命令行交互库 inquirer 来完成项目信息的收集

- 确保项目的安装环境
- 确认项目的基本信息

2. 下载模板

   - 下载模板是利用已经封装 Package 类快速实现相关功能
   - npm init egg -> npm init egg 相当于执行 npx create-egg，npx create-egg 命令会下载 create-egg 库，再执行里面的 bin(package.json 里的 bin 字段)。npx create-egg 会在当前目录/node_modules 目录下查找有没有 create-egg，没有就会下载到临时目录，最后删除
   - https://www.cnblogs.com/cool-fire/p/11007329.html

   ```js const { projectTemplate } = this.projectInfo;
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
   ```

   - cli-spinner 的优化使用

```js
function sleep(timeout = 1000) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}
let Spinner = require('cli-spinner').Spinner;
let spinner = new Spinner('加载中.. %s');
spinner.setSpinnerString('|/-\\');

(async function () {
  // 开启加载特效
  spinner.start();
  // 延时2s
  await sleep(2000);
  // 关闭加载特效;
  spinner.stop(true);
})();
```

3. 安装模板

- 标准模式下，将通过 ejs 实现模板渲染，并自动安装依赖并启动项目
- 自定义模式下，将允许用户主动去实现模板的安装过程和后续启动流程
