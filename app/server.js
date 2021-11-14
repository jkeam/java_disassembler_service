const { v4: uuidv4 } = require('uuid');
const http = require('http');
const Disassembler = require('./lib/disassembler');

const host = process.env.HOST || '0.0.0.0';
const port = process.env.ENV_PORT || 3000;
const env  = process.env.NODE_ENV || 'dev';
const logLevel = 'verbose';
const diss = new Disassembler({ logger: console, guid: uuidv4() });

const success = (res, result = '')=> {
  res.writeHead(200);
  res.end(result);
  return res;
};

const requestListener = function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
  res.setHeader('Access-Control-Max-Age', 2592000); // 30 days
  res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type');

  if (req.method === 'OPTIONS') {
    return success(res);
  }

  if (req.method !== 'POST' && req.url !== '/') {
    return success(res);
  }

  let data = '';
  req.on('data', chunk => {
    data += chunk;
  });
  req.on('end', () => {
    try {
      const parsed = JSON.parse(data) || {};
      const done = (result) => {
        if (result.result) {
          return success(res, result.result);
        }
        console.error(result.error);
        return success(res, result.error);
      };
      diss.run(parsed.code, done);
    } catch (e) {
      console.error(e);
      return success(res, e.message);
    }
  });
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
