'use strict';
/**
 * 1. 当前路径存在
 * 2. path.sep  分隔符 在macOs返回的是一个 / ,在 window 是 \, 都转换成/
 */
const path = require('path');

function formatPath(p) {
  if (p && typeof p === 'string') {
    const sep = path.sep;
    return sep === '/' ? p : p.replace(/\\g/, '/');
  }
  return p;
}

module.exports = formatPath;
