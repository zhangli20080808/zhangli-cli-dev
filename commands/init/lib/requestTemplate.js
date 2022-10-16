const request = require('@zhangli-cli-dev/request');

module.exports = async function () {
  return [
    {
      name: 'vue3标准模版',
      npmName: 'zl-cli-template-vue3',
      version: '1.0.0',
    },
  ];
  // return request({
  //   url: '/project/template',
  // });
};
