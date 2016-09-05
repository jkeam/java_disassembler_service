const Disassembler = require('./lib/disassembler');

const winston      = require('winston');
const Busboy       = require('busboy');
const http         = require('http');
const port         = process.env.ENV_PORT || 3000;
const env          = process.env.NODE_ENV || 'dev';

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: `./logs/${env}.log` })
  ]
});

const handlePost = (req, res) => {
  const disassembler = new Disassembler(logger);
  const busboy = new Busboy({ headers: req.headers });
  let code = ""; 

  const writeOutput = (bytecode) => {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(bytecode));
  };

  busboy.on('field', (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) => {
    if (fieldname == 'code') {
      code = val;
    }
  });
  
  busboy.on('finish', () => {
    disassembler.run(code, writeOutput);
  });

  req.pipe(busboy);
};

const router = (req, res) => {
  if (req.method == 'POST') {
    handlePost(req, res);
  } else {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Please submit a post with a json payload.');
  }
};

http.createServer(router).listen(port, '0.0.0.0');
console.log(`Server running at http://0.0.0.0:${port}/`);
