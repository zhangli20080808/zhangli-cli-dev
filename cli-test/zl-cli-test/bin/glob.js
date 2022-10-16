/**
https://blog.csdn.net/weixin_34413065/article/details/88906278
* 匹配0到多个字符
? 匹配一个字符
[...] 匹配一个字符列表，类似正则表达式的字符列表
!(pattern|pattern|pattern) 反向匹配括号内的模式
?(pattern|pattern|pattern) 匹配0或1个括号内的模式
+(pattern|pattern|pattern) 匹配至少1个括号内的模式
*(pattern|pattern|pattern) 匹配0到多个括号内的模式
@(pattern|pat*|pat?erN) 精确匹配括号内的模式
** 匹配0到多个子目录，递归匹配子目录
 */
// 处理文件的时候会方便很多，类似正则的表达式方式排序一些文件
const glob = require('glob');
glob('cli-test/**/*.js', {
    ignore:['cli-test/zl-cli-test/node_modules/**','cli-test/zl-cli-test/webpack.config.js']
}, function (err, files) {
  console.log(files);
});
