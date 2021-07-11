'use strict'

const toString = Object.prototype.toString  // 不能校验自定义类型

function isPlainObject (val) {
  return toString.call(val) === '[object Object]'
}

module.exports = {
  isPlainObject
}
