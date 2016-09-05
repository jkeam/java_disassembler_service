const Disassembler = require('./lib/disassembler');
const http = require('http');
const port = process.env.ENV_PORT || 3000;

const disassemble = (req, res) => {
  const bytecode = Disassembler.disassemble('input');
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(bytecode);
};

http.createServer(disassemble).listen(port, '0.0.0.0');
console.log(`Server running at http://0.0.0.0:${port}/`);
