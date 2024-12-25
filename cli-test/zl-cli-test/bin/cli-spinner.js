(async function () {
  const Spinner = require('cli-spinner').Spinner;

  const spinner = new Spinner('loading.. %s');
  spinner.setSpinnerString('|/-\\');
  spinner.start();
  // 当前进程延迟一秒
  await new Promise((resolve) => setTimeout(resolve, 1000));
  spinner.stop(true); // 删除当前语句
})();
