'use strict';
const urlJoin = require('url-join');
const axios = require('axios');
const semver = require('semver');
/**
 * 调用npm api 获取包的各种信息 包括版本发布信息
 * @param npmName 模块名 @zhangli-cli-dev/core
 * @param registry npm 源
 * https://registry.npm.taobao.org/@zhangli-cli-dev/core
 * https://registry.npmjs.org/@zhangli-cli-dev/core
 */
function getNpmInfo(npmName, registry) {
  if (!npmName) {
    return null;
  }
  const registryUrl = registry || getDefaultRegistry();
  const npmInfoUrl = urlJoin(registryUrl, npmName); // https://registry.npm.taobao.org/@zhangli-cli-dev/core
  return axios
    .get(npmInfoUrl)
    .then((res) => {
      if (res.status === 200) {
        return res.data;
      }
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

/**
 * 获取npm源 默认为 淘宝源
 * @param {*} isOriginal
 * @returns
 */
function getDefaultRegistry(isOriginal = false) {
  return isOriginal
    ? 'https://registry.npmjs.org/'
    : 'https://registry.npm.taobao.org';
}

/**
 * 获取 所有的npm包  发布的版本信息
 * @param {*} npmName
 * @param {*} registry
 * @returns
 */
async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}

/**
 * satisfies 获取所有满足条件的版本号，对比哪些版本号是大于当前版本号
 * @param {*} baseVersion 当前包的版本号
 * @param {*} versions 版本号集合
 * @returns
 */
function getSemverVersions(baseVersion, versions) {
  // versions - [ '1.0.4', '1.0.5', '1.0.9', '1.0.10', '1.0.11' ]
  return versions
    .filter((version) => semver.satisfies(version, `^${baseVersion}`)) // 大于
    .sort((a, b) => semver.gt(b, a)); // b大于a，b在前
  // 排序逻辑 npm返回的api可能没有排序,兼容处理
}

/**
 * 
 * @param {*} baseVersion 当前包的版本号
 * @param {*} npmName
 * @param {*} registry
 * @returns
 */
async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  const newVersion = getSemverVersions(baseVersion, versions);
  if (newVersion && newVersion.length > 0) {
    return newVersion[0];
  }
}

/**
 * 获取最新的版本号
 * @param {*} npmName
 * @param {*} registry
 * @returns
 */
async function getNpmLatestVersion(npmName, registry) {
  let versions = await getNpmVersions(npmName, registry);
  if (versions) {
    return versions.sort((a, b) => semver.gt(b, a))[0];
  }
  return null;
}

module.exports = {
  getNpmSemverVersion,
  getDefaultRegistry,
  getNpmLatestVersion,
};
