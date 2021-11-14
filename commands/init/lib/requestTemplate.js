const request = require('@zhangli-cli-dev/request');

module.exports = function () {
  return request({
    url: '/project/template',
  });
};
