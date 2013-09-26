var http = require('http'),
  qs = require('querystring'),
  st = require('node-static'),
  fileserver = new st.Server('./public'),
  test = {};

var route = function (req, res) {
  var url = req.url,
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
      req.body = qs.parse(body);
      route(req, res);
    });
  } else {
    // Serve entities queries
    if (req.url.indexOf('/v1/') > -1) {
      route(req, res);
    } else {
      //Serve file queries
      fileserver.serve(req, res);
    }
  }
};

http.createServer(handleRequest).listen(8080, '127.0.0.1');

console.log('Test page available http://127.0.0.1:8080/test.html');
