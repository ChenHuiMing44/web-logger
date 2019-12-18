// eslint-disable-next-line @typescript-eslint/no-var-requires
const http = require('http');

http
  .createServer(function(request, response) {
    response.setHeader('Access-Control-Allow-Origin', '*');
    console.log('request come', request.url);
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Content-Type', 'application/x-www-form-urlencoded;charset=utf-8');
    if (request.url === '/logger/log') {
      let post = '';
      // 通过req的data事件监听函数，每当接受到请求体的数据，就累加到post变量中
      request.on('data', function(chunk) {
        post += chunk;
      });
      request.on('end', function() {
        console.log(JSON.parse(post));
        const timeStamp = new Date().valueOf();
        response.end(JSON.stringify({res: '请求成功', traceId: '' + timeStamp}));
      });
    } else {
      response.end(JSON.stringify({res: '请求路径有问题'}));
    }
  })
  .listen(7001);
