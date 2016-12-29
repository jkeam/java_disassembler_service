const Service = require('base_disassembler_service');
const Disassembler = require('./lib/disassembler');

const port          = process.env.ENV_PORT || 3000;
const env           = process.env.NODE_ENV || 'dev';
const logLevel      = 'verbose';
const codeFormatter = (code) => {
  return code;
};

const service = new Service({Disassembler, codeFormatter, port, env, logLevel});
service.run();
