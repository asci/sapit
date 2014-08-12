var http = require('http'),
  fs = require('fs'),
  qs = require('querystring'),
  test = {};

var route = function (req, res) {
  var url = req.url.split('?')[0],
    method = req.method.toLowerCase();

  if (url === '/v1/test' && method === 'post') {
    test.id = 1;
    test.title = req.body.title;
    return res.end(JSON.stringify(test));
  }

  if (url === '/v1/test/1' && method === 'get') {
    return res.end(JSON.stringify(test));
  }

  if (url === '/v1/test/1' && method === 'put') {
    test.title = req.body.title;
    return res.end(JSON.stringify(test));
  }

  if (url === '/v1/test/1' && method === 'delete') {
    res.statusCode = 401;
    return res.end('Method not allowed');
  }

  res.statusCode = 404;
  res.end('Incorrect resource!');
};

var handleRequest = function (req, res) {
  console.log(req.method + ' ' + req.url);

  // Check for partial data
  if (req.method !== 'GET') {
    var body = '';
    req.on('data', function (data) {
      body += data;
    });
    req.on('end', function () {
      if (req.headers['content-type'] !== 'application/json') {
        req.body = qs.parse(body);
      } else {
        req.body = JSON.parse(body);
      }
      route(req, res);
    });
  } else {
    // Serve entities queries
    if (req.url.indexOf('/v1/') > -1) {
      route(req, res);
    } else {
      //Serve file queries
      fs.readFile('./public/' + req.url, function (err, file) {
        if (err) {
          res.statusCode = 404;
          return res.end('Unhandled route');
        }
        res.end(file);
      })
    }
  }
};

http.createServer(handleRequest).listen(process.env.PORT, process.env.IP);

console.log('Server started');
console.log('Test page available http://' + process.env.IP + ':' + process.env.PORT + '/test.html');
