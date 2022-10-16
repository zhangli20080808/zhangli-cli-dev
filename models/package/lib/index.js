'use strict';

/**
 * 1. 判断当前package是否存在
 * 2. 安装 package
 * 3. 更新 package
 * 4. 拿到入口文件的路径
 */
const path = require('path');
const pkgDir = require('pkg-dir').sync;
const npmInstall = require('npminstall');
const pathExist = require('path-exists').sync;
const fse = require('fs-extra');
const { isPlainObject } = require('@zhangli-cli-dev/utils');
const {
  getDefaultRegistry,
  getNpmLatestVersion,
} = require('@zhangli-cli-dev/get-npm-infos');
const formatPath = require('@zhangli-cli-dev/format-path');

/**
 * 通过 Package 去实例化 Package对象
 * 1. exists - package是否存在
 * 2. install
 * 3. update
 * 4. getRootFile - 获取入口文件的路径
 */
class Package {
  constructor(options) {
    if (!options) {
      throw new Error('Package 类的参数类型不能为空');
    }
    if (!isPlainObject(options)) {
      throw new Error('Package 类的参数类型必须为object');
    }
    // package 的目标路径, 也是整个依赖的路径
    this.targetPath = options.targetPath;
    // package 缓存在本地的路径，在缓存路径上 + node_modules
    this.storeDir = options.storeDir;
    // package 的包名
    this.packageName = options.packageName;
    // package 的版本
    this.packageVersion = options.packageVersion;
    // 缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_');
  }

  /**
  prepare - 将 传入的latest转化成具体的 version, 安装之后的包-_zhangli-cli-dev@1.0.2@zhangli-cli-dev
   * 字符串存在，路径也要存在
   * 将 packageVersion，latest转换成具体的版本，因为具体查的时候，还是要看版本号的
   */
  async prepare() {
    // 缓存模式 storeDir本身存在，实例路径不存在，解决目录不存在的问题
    if (this.storeDir && !pathExist(this.storeDir)) {
      // 一次性创建完所有目录 
      fse.mkdirpSync(this.storeDir);
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName);
    }
    // console.log(this.packageVersion)
  } 

  // 拼出一个文件夹路径看文件是否存在,缓存中安装的实际路径如下，需要获取这个目录做判断
  // /Users/zhangli/.zhangli-cli-dev/dependencies/node_modules/_@zhangli-cli-dev_init@1.0.9@@zhangli-cli-dev
  // 目标 _@zhangli-cli-dev_init@1.0.9@@zhangli-cli-dev
  // 实际 @zhangli-cli-dev/init 1.0.9

  get cacheFilePath() {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`
    );
  }

  //最新版本路径
  async getSpecificCacheFilePath(lastPackageVersion) {
    return path.resolve(
      this.storeDir,
      `_${this.cacheFilePathPrefix}@${lastPackageVersion}@${this.packageName}`
    );
  }

  /**
   * 判断当前package是否存在
   * 1. 判断是缓存模式还是指定了 targetPath
   * _zhangli-cli-dev@1.0.2@zhangli-cli-dev  实际的包名 @zhangli-cli-dev/init 1.0.2
   * 2. 生成缓存的文件路径
   * 3. 拼出这样的一个路径去判断 这个路径是否存在
   */
  async exists() {
    if (this.storeDir) {
      await this.prepare();
      // /Users/zhangli/.zhangli-cli-dev/dependencies/node_modules/_@imooc-cli_init@1.1.2@@imooc-cli/init
      // console.log(this.cacheFilePath, 'exist');
      return pathExist(this.cacheFilePath);
    } else {
      return pathExist(this.targetPath);
    }
  }

  /**
   *  安装 package 依赖 - 通过 npminstall
   * https://www.npmjs.com/package/npminstall
   * https://class.imooc.com/course/qadetail/283328
   */
  async install() {
    await this.prepare();
    return npmInstall({
      root: this.targetPath,
      pkgs: [{ name: this.packageName, version: this.packageVersion }],
      registry: getDefaultRegistry(), // 安装源
      storeDir: this.storeDir, // root + node_modules
    });
  }

  //  更新 package，最新版本存在，就不安装了
  async update() {
    await this.prepare();
    //  1.获取最新的npm版本号
    const latestPackageVersion = await getNpmLatestVersion(this.packageName);
    //  2.查询最新版本对应的路径是否存在
    const latestFilePath = await this.getSpecificCacheFilePath(
      latestPackageVersion
    );
    // console.log(latestFilePath, 'latestFilePath-update');
    //  3.如果不存在，则直接安装最新版本
    if (!pathExist(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        pkgs: [{ name: this.packageName, version: latestPackageVersion }],
        registry: getDefaultRegistry(),
        storeDir: this.storeDir,
      });
      // 注意 安装结束之后更新版本号
      this.packageVersion = latestPackageVersion;
    }
  }

  //  获取入口文件绝对路径 lib/index.js
  /**
   * 1. 获取package.json所在的主目录 - 用户传入的 targetPath 有可能是没有 package.json的 不是模块的主目录
   *    比如 我们从lib目录进入，也应该兼容掉 应该找到package.json所在的目录 - 也就是模块的根路径 - pkg-dir
   * 2. 读取 package.json -  直接通过require读取 就行
   * 3. 找到 package.json中的 main或者lib，找到，输出成一个路径，对路径做兼容
   * 4. 路径兼容 mac和window路径差异
   * 是否存在可以返回出去由外部判断
   */
  getRootFile() {
    function _getRootFile(targetPath) {
      const dir = pkgDir(targetPath);
      // /Users/zhangli/learning_code/zhangli-cli-dev/commands/init dir
      if (dir) {
        const pkgFile = require(path.resolve(dir, 'package.json'));
        if (pkgFile && pkgFile.main) {
          return formatPath(path.resolve(dir, pkgFile.main));
        }
      }
      return null;
    }
    // 考虑缓存
    if (this.storeDir) {
      return _getRootFile(this.cacheFilePath);
    } else {
      // 缓存不存在时
      return _getRootFile(this.targetPath);
    }
  }
}

module.exports = Package;
