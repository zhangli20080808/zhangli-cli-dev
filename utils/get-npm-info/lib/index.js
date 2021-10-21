'use strict';
const urlJoin = require('url-join');
const axios = require('axios');
const semver = require('semver');

/**
 *
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
  const npmInfoUrl = urlJoin(registryUrl, npmName);
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

function getDefaultRegistry(isOriginal = false) {
  return isOriginal
    ? 'https://registry.npmjs.org/'
    : 'https://registry.npm.taobao.org';
}

async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry);
  if (data) {
    return Object.keys(data.versions);
  } else {
    return [];
  }
}

/**
 * satisfies 满足某种条件 
 * @param {*} baseVersion 
 * @param {*} versions 版本号集合
 * @returns 
 */
function getSemverVersions(baseVersion, versions) {
  return versions
    .filter((version) => semver.satisfies(version, `^${baseVersion}`)) // 大于
    .sort((a, b) => semver.gt(b, a));  // b大于a，b在前 
  // 排序逻辑 npm返回的api可能没有排序,兼容处理
  // [ '1.0.5', '1.0.4' ]
}

async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry);
  const newVersion = getSemverVersions(baseVersion, versions);
  if (newVersion && newVersion.length > 0) {
    return newVersion[0];
  }
}

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
