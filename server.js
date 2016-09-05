const http = require('http');
const port = process.env.ENV_PORT;
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(port, '0.0.0.0');
console.log(`Server running at http://0.0.0.0:${port}/`);
