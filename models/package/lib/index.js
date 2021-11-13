'use strict'

/**
 * 1. 判断当前package是否存在
 * 2. 安装 package
 * 3. 更新 package
 * 4. 拿到入口文件的路径
 */
const path = require('path')
const pkgDir = require('pkg-dir').sync
const npminstall = require('npminstall')
const pathExist = require('path-exists').sync
const fse = require('fs-extra')
const { isPlainObject } = require('@zhangli-cli-dev/utils')
const { getDefaultRegistry, getNpmLatestVersion } = require('@zhangli-cli-dev/get-npm-info')
const formatPath = require('@zhangli-cli-dev/format-path')

class Package {
  constructor (options) {
    if (!options) {
      throw new Error('Package 类的参数类型不能为空')
    }
    if (!isPlainObject(options)) {
      throw new Error('Package 类的参数类型必须为object')
    }
    //  package 的目标路径
    this.targetPath = options.targetPath
    // 缓存package的路径
    this.storeDir = options.storeDir
    // package 的包名
    this.packageName = options.packageName
    // package 的版本
    this.packageVersion = options.packageVersion
    // 缓存目录前缀
    this.cacheFilePathPrefix = this.packageName.replace('/', '_')
  }

  async prepare () {
    if (this.storeDir && !pathExist(this.storeDir)) {
      // 一次性创建完所有目录
      fse.mkdirpSync(this.storeDir)
    }
    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName)
    }
    // console.log(this.packageVersion)
  }

  get cacheFilePath () {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
  }

  //最新版本路径
  getSpecificCacheFilePath (lastPackageVersion) {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${lastPackageVersion}@${this.packageName}`)
  }

  /**
   * 判断当前package是否存在
   * 1. 判断是缓存模式还是指定了 targetPath
   * _@imooc-cli_init@1.1.2@@imooc-cli  实际的包名 @imooc-cli/init 1.1.2
   * 2. 生成缓存的文件路径
   */
  async exists () {
    if (this.storeDir) {
      await this.prepare()
      // /Users/zhangli/.zhangli-cli-dev/dependencies/node_modules/_@imooc-cli_init@1.1.2@@imooc-cli/init
      console.log(this.cacheFilePath)
      return pathExist(this.cacheFilePath)
    } else {
      return pathExist(this.targetPath)
    }
  }

  /**
   *  安装 package - 通过 npminstall
   * https://www.npmjs.com/package/npminstall
   */
  async install () {
    await this.prepare()
    return npminstall({
      root: this.targetPath,
      pkgs: [
        { name: this.packageName, version: this.packageVersion },
      ],
      registry: getDefaultRegistry(),
      storeDir: this.storeDir,
    })
  }

//  更新 package
  async update () {
    await this.prepare()
    //  1.获取最新的npm版本号
    const latestPackageVersion = await getNpmLatestVersion(this.packageName)
    //  2.查询最新版本对应的路径是否存在
    const latestFilePath = await this.getSpecificCacheFilePath(latestPackageVersion)
    console.log(latestFilePath,'latestFilePath')
    //  3.如果不存在，则直接安装最新版本
    if (!pathExist(latestFilePath)) {
      await npminstall({
        root: this.targetPath,
        pkgs: [
          { name: this.packageName, version: latestPackageVersion },
        ],
        registry: getDefaultRegistry(),
        storeDir: this.storeDir,
      })
      this.packageVersion = latestPackageVersion
    }
  }

//  获取入口文件绝对路径 lib/index.js
  /**
   * 1. 获取package.json所在的主目录 - 用户传入的 targetPath 有可能是没有 package.json的 不是模块的主目录
   *    比如 我们从lib进入 也应该兼容掉 应该找到package.json所在的目录- 也就是模块的根路径 - pkg-dir
   * 2. 读取 package.json 直接require 就行
   * 3. 找到 package.json main或者lib 找到 输出成一个路径，对路径做兼容
   * 4. 路径兼容 mac和window路径差异
   * 是否存在可以返回出去由外部判断
   */
  getRootFile () {
    function _getRootFile(targetPath){
      const dir = pkgDir(targetPath)
      if (dir) {
        const pkgFile = require(path.resolve(dir, 'package.json'))
        if (pkgFile && pkgFile.main) {
          return formatPath(path.resolve(dir, pkgFile.main))
        }
      }
      return null
    }
    if(this.storeDir){
      return _getRootFile(this.cacheFilePath)
    }else {
      // 缓存不存在时
      return _getRootFile(this.targetPath)
    }

  }
}

module.exports = Package
