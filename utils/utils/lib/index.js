'use strict'

const toString = Object.prototype.toString  // 不能校验自定义类型

function isPlainObject (val) {
  return toString.call(val) === '[object Object]'
}

function isType (val) {
  return toString.call(val).slice(8,-1).toLowerCase()
}


module.exports = {
  isPlainObject
}
