## 命令基础

- /usr/bin/env
  node 的环境变量指向的就是 bin 这个文件夹，bin 下面的目录是用来存放可执行文件的，如果存在才会执行该命令。
  可以通过 <code>/usr/bin/env</code> 命令查看一下 node 的环境变量 - 针对 mac 环境

- echo $PATH - 找到所有环境变量

## 什么是脚手架

脚手架本质上是一个操作系统的客户端，他通过命令行执行，比如

```js
vue create vue-test-app
// 上面的命令由三部分组成
* 主命令: vue
* command: create
* command的param: vue-test-app
// 表示创建一个vue的项目，项目名称为vue-test-app，简单创建场景
// 有一些复杂场景，例如 当前目录下已经有文件了，我们需要覆盖当前目录下 的文件，强制进行安装vue项目
vue create vue-test-app --force
// --force 在此处称为 option，用来辅助脚手架确认在特定场景下用户的选择
// 补充场景 比如 vue create创建项目，会自动执行npm install帮助用户安装依赖，如果需要使用淘宝源
vue create vue-test-app --force -r https://registry.npm.taobao.org
// -r 也称为option 与--force不同的是，--force使用- -》其实此处是简写，--registry
vue create --help
// -r后面的 https://registry.npm.taobao.org 称为option的param参数
// 另外 --force 可以理解为 --force true 简写为 --force或-f


1. 在环境变量中去寻找vue命令，将后面的内容作为参数传入到vue.js中  -> which vue
/usr/local/bin/vue
// 直接 使用vue命令 执行的是/usr/local/bin/vue 的vue文件
lrwxr-xr-x   1 zhangli  admin    64B  9 15 21:55 vue -> ../../../Users/zhangli/.config/yarn/global/node_modules/.bin/vue
lrwxr  - l表示是一个软连接，实际指向node安装目录下面的vue.js文件


```

通过 npm -g 安装的一些命令都会放到 /usr/local/lib/node_modules 目录下面

- 在终端输入 vue create vue-test-app
- 终端解析出 vue 命令
- 终端在环境碧变量中找到 vue
- 终端根据 vue 命令链接到实际文件 vue.js
- 终端利用 node 执行 vue.js
- vue.js 解析 command/options
- vue.js 执行 command
- 执行完毕，退出执行

## 两种写法需要注意一下

```js
#!/usr/bin/env node
#!/usr/bin/node
```

- 第一种是在环境变量中查找 node
- 第二种是执行 <code>/usr/bin</code> 目录下的 node

## 脚手架开发流程

### 开发流程

- 创建 npm 项目
- 创建脚手架入口文件，在最上方添加 <code>#!/usr/bin/env node</code>
- 配置 package.json，添加 bin 属性
- 编写脚手架代码
- 将脚手架发布到 npm

### 开发难点

- 分包: 将复杂的模块拆分成若干个模块
- 命令注册
- 比如 vue create / vue add /vue invoke
- 参数解析
  1. options 的全称： --version --help
  2. options 的简写： -V -h
  3. 带 params 的 options：--path /usr/zl/Desktop/xxx
- 代码块 <code>vue command [options] <params></code>
- 帮助文档 - global help

### 参数解析
```
注册命名 zhangli-cli-dev init
实现参数解析 --version init --name


```