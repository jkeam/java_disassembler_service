const fsExtra = require('fs-extra');
const chai    = require("chai");
const expect  = chai.expect;
const spies = require('chai-spies');
chai.use(spies);

// use null logger
const winston = require('winston');
const logger  = new (winston.Logger)({
  transports: []
});

const Disassembler = require("../app/lib/disassembler");

describe("Disassembler", function() {
  const disassembler = new Disassembler(logger);
 
  it("can create unique dir", function(done) {
    const code = 'public class Person { public String sayHi() {return "hi";} }';
    const success = (dir, code, disassemble) => {
      done();
    };

    disassembler.createUniqueDir(success, null, code, null, "/tmp/javabytes/test");
  });

  it("can extract java class", function() {
    const code = 'public class Person { public String sayHi() {return "hi";} }';
    expect(disassembler.extractClass(code)).to.equal("Person");
  });

  it("can compile java file", function(done) {
    const dir = "/tmp/javabytes/test/abcd";
    const code = 'public class Person { public String sayHi() {return "hi";} }';
    const success = function(dir, code, disassemble) {
      done();
    };
    const failure = function(error) {
      done(new Error(JSON.stringify(error)));
    };

    expect(disassembler.compileJavaFile(dir, code, success, failure));
  });

  it("can handle compile failures", function(done) {
    const dir = "/tmp/javabytes/test/abcd";
    const code = 'public class Person { public String sayHi() {return "hi"}; }';
    const success = function (dir, code, disassemble) {
    };
    const finish = function(obj) {
      expect(obj).to.deep.equal({
  "errors": "Person.java:1: error: ';' expected\npublic class Person { public String sayHi() {return \\\"hi\\\"}; }\n                                                        ^\n1 error\n"
});
      done();
    };
    expect(disassembler.compileJavaFile(dir, code, success, finish));
  });

  it("can can disassemble", function(done) {
    const dir = "/tmp/javabytes/test/abcd";
    const classname = "Person";
    const code = 'public class Person { public String sayHi() {return "hi");} }';
    const success = (disassembled) => {
      done();
    };
    expect(disassembler.disassemble(dir, classname, code, success));
  });

  it("can cleanse output", function() {
    const output = `{"errors": "/tmp/javabytes/1394ac497f074da5bc314fe2106dca50/Person.java:1: error: ';' expected\npublic class Person { public String sayHi() {return "hi");} }"}`;

    const expected = `{\\"errors\\": \\"Person.java:1: error: ';' expected\npublic class Person { public String sayHi() {return \\"hi\\");} }\\"}`;

    expect(disassembler.cleanseOutput(output, "/tmp/javabytes/1394ac497f074da5bc314fe2106dca50/")).to.equal(expected);
  });

  after(function() {
    // cleanup
    const dir = "/tmp/javabytes/test";
    fsExtra.removeSync(dir);
  });
});
