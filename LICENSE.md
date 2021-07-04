## lerna核心操作
[lerna官网简介](https://lerna.js.org/)
## 脚手架拆包策略 - 拆包结果
![](./images/脚手架架构设计图.png)
* 核心流程：index
* 命令： commands
    1. 初始化
    2. 发布
    3. 清除缓存
* 模型层： models
    1. Command命令
    2. Project项目
    3. Component组件
    4. Npm模块
    5. Git仓库
* 支撑模块： utils
    1. git操作
    2. 云构建
    3. 工具方法
    4. Api请求
    5. Git Api
## 拆分原则
根据模块的功能拆分：
1. 核心模块：index
2. 命令模块：commands
3. 模型模块：models
4. 工具模块：utils
## index 模块技术方案

![](./images/命令执行流程.png)
### 命令执行流程
* 准备阶段
  1. 检查版本号 - 后续版本升级需要，补充额外逻辑
  2. 检查node版本 - 版本不合适，后续不能执行
  3. 检查root启动 - 观察用户是否通过sudo这种方式启动,如果通过root这种方式启动，后续创建的这些文件可能很难维护，比如删除，可能删不了，因为通过root创建的文件，其他用户是不能进行访问的，如果是root用户，需要降级到普通用户。可以避免一系列的权限问题  
  4. 检查用户主目录 - 确保能够拿到用户主目录，因为我们需要向主目录写入缓存，拿不到，执行停止。  
  5. 检查入参
  6. 环境变量检测 - 也是为了缓存
  7. 检查是否为最新版本 - 提示更新  
* 命令注册
* 命令执行
### 涉及技术点
1. 核心库
 * import-local - 用于优先执行本地的命令
 * commander - 通过 commander 做命令注册
2. 工具
 * npmlog  - 打印日志
 * fs-extra - 基于fs封装的很多有价值的文件操作
   * path-exists
 * semver - 版本比对，比如是否是最新版本
 * colors - 在终端中打印不同颜色的文本
 * user-home - 帮我们快速拿到用户的主目录
 * dotenv - 获取环境变量
 * root-check - root账户的一个检查，自动降级

