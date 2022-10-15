# 脚手架动态命令加载

![脚手架命令动态加载功能架构设计](/images/脚手架命令动态加载功能架构设计%20.png)

## 是否执行本地代码

1.  在本地开发的时候，我们希望能指向本地的 commands init 代码文件，而不是缓存文件，需要标识当前 init 入口文件的<code>绝对路径</code>，给到绝对路径后，通过 require 来加载 require('xxxx/aaa/index.js')

- targetPath 属性的设置

```js
zhangli-cli-dev init -tp /Users/zhangli/learning_code/zhangli-cli-dev/commands/init -d
// targetPath 默认参数不传是 boolean 此处我们接受一个string 调试属性 每一个命令基本都可以指到本地去
program.option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '');
// 指定全局的 targetPath, 这里属性监听有一个比较好的地方就是，他可以在我们执行业务逻辑之前去执行
// 通过环境变量去做业务逻辑的解耦，可以这样搞
program.on('option:targetPath', function () {
if (program.targetPath) {
process.env.CLI_TARGET_PATH = program.targetPath;
}
});

// zhangli-cli-dev init -tp /Users/zhangli/learning_code/zhangli-cli-dev/commands/init -d
// zhangli-cli-dev init xxx -d -f
// zhangli-cli-dev init program -tp /Users/zhangli/learning_code/zhangli-cli-dev/commands/init -d -f

```

- 执行绝对路径，尝试通过加载 require 文件的思考
  普通情况，比如我们拿到 CLI_TARGET_PATH，通过 package.json 的 main 属性，找到 lib/index.js，require 下执行就好啦。如果从更高的维度去思考呢？

a. 根据 targetPath，拿到实际的模块路径，modulePath，比如 init
b. 在根据 modulePath 生成一个 Package，再将 modulePath 生成一个 Package(npm 模块)

比如 modulePath 指向 init 目录，他本身就是一个 npm 模块，我们可以将其抽象成一个 Package，和普通模块没什么区别
c. 利用 Package 帮我们提供一些方法,比如 Package.getRootFile(获取入口文件),这样就可以将我们所有获取入口文件中存在的隐含逻辑全部包含进去，各种逻辑通过 Package 完善

比如 package.json 我们是通过 main 去找入口，如果没有，去找 lib，通过 api 的方式，不用将 getRootFile 的逻辑全部写在 exec 里面 -> 实现封装，更好的复用(比如获取到缓存目录之后，也是需要安装的，init有可能不在本地)
d. 实现 Package.update/Package.install，更新、安装方法等 - 整体类的概念

2.  如果本地没有，需要通过动态的将代码下载下来，且加载进去。

- 获取缓存目录(放在用户的主目录下面，eg:/Users/zhangli/.zhangli-cli-dev)
- 在上面的目录下，初始化 package 对象这个 package 对应一个 npm module
- 比如我们执行的是 zhangli-cli-dev init 这个 package，就对应 init 的包名，有了 package 对象我们就可以进行判断，比如 package 就可以提供一个是否存在模块的功能，如果缓存目录里面已经存在了 package 模块 ，尝试更新，没有，下载安装最新版本)

3.  安装完成之后，继续通过 require 的方式进行加载，获取本地代码入口文件,找到本地代码模块对应的一个地址，寻找有没有入口文件 main，没有 直接报错。如果有,动态生成执行代码的命令。

```js
// 通过node 执行字符串
// 比如 普通执行 node core/cli/bin/index.js 还有一种方式,通过字符串的方式进行执行
<code>node -e require('core/cli/bin/index.js')</code
```

4. 我们动态下载的模块其实只有一个路径，如果把这个路径中的代码执行起来 就是依靠 node -e 就可以动态生成执行代码的字符串或者一条命令，接着启动一个新的进程去执行这条命令，提升性能 - 主要依靠 node 多进程

对于开启多进程的场景 - 当需要下载大文件时，可以同时启动多个进程进行下载，下载完毕后进行文件合并，这个场景比较典型

好处 - 可以完全不依赖当前脚手架去执行新的命令，只是通过命令的一个地址就可以将其执行起来，和之前实现的脚手架还是有区别的


