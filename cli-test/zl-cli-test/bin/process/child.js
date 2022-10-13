console.log('child process');
console.log('child pid:', process.pid);
// 监听message事件，拿到发送的信息
process.on('message', (msg) => {
  console.log(msg,'我是子进程，我接受到了父进程的message信息');
});
process.send('hello main process');
