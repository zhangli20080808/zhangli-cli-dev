'use strict';

const toString = Object.prototype.toString; // 不能校验自定义类型

function isPlainObject(val) {
  return toString.call(val) === '[object Object]';
}

function isType(val) {
  return toString.call(val).slice(8, -1).toLowerCase();
}

function spinnerStart(msg = 'loading', setSpinnerString = '|/-\\') {
  const Spinner = require('cli-spinner').Spinner;

  let spinner = new Spinner(`${msg}.. %s`);
  spinner.setSpinnerString(setSpinnerString);
  spinner.start();
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  return spinner;
}

// 当前进程延迟一秒
function sleep(timeout = 1000) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

module.exports = {
  isPlainObject,
  spinnerStart,
  sleep,
};
