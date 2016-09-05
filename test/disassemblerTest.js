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
 
  it("can make dir", function(done) {
    const code = 'public class Person { public String sayHi() {return "hi";} }';
    const dirName = '/tmp/javabytes/test/abcd';
    disassembler.makeDir({dirName, code}).then((obj) => {
      expect(obj.code).to.equal(code);
      expect(obj.dirName).to.equal(dirName);
      done();
    }).catch((e) => {
      done(e);
    })
  });

  it("can extract java class", function() {
    const code = 'public class Person { public String sayHi() {return "hi";} }';
    expect(disassembler.extractClass(code)).to.equal("Person");
  });

  it("can compile java file", function(done) {
    const dirName = "/tmp/javabytes/test/abcd";
    const code = 'public class Person { public String sayHi() {return "hi";} }';

    disassembler.compileJavaFile({dirName, code}).then((obj) => {
      expect(obj.classname).to.equal('Person');
      expect(obj.dirName).to.equal(dirName);
      done();
    }).catch((e) => {
      done(e);
    })
  });

  it("can handle compile failures", function(done) {
    const dirName = "/tmp/javabytes/test/abcd";
    const code = 'public class Person { public String sayHi() {return "hi"}; }';

    disassembler.compileJavaFile({dirName, code}).then((obj) => {
      done(new Error('Should not get here'));
    }).catch((e) => {
      done();
    })
  });

  it("can disassemble", function(done) {
    const dirName = "/tmp/javabytes/test/abcd";
    const classname = "Person";

    disassembler.disassemble({dirName, classname}).then((obj) => {
      expect(obj.result).to.not.be.null;
      done();
    }).catch((e) => {
      done(e);
    })
  });

  it("can cleanse output", function() {
    const output = `{"errors": "/tmp/javabytes/1394ac497f074da5bc314fe2106dca50/Person.java:1: error: ';' expected\npublic class Person { public String sayHi() {return "hi");} }"}`;
    const expected = `{\\"errors\\": \\"Person.java:1: error: ';' expected\npublic class Person { public String sayHi() {return \\"hi\\");} }\\"}`;
    expect(disassembler.cleanseOutput(output, "/tmp/javabytes/1394ac497f074da5bc314fe2106dca50/")).to.equal(expected);
  });

  it("can find unique directory", function(done) {
    disassembler.findUniqueDir().then((data) => {
      expect(data).to.not.be.null;
      done();
    }).catch((e) => {
      done(e);
    });
  });

  it("can run test", function(done) {
    const code = 'public class Person { public String sayHi() {return "hi";} }';
    return disassembler.run(code, function(obj) {
      done();
    }, "/tmp/javabytes/test");
  });

  it("can cleanup", function(done) {
    const dirName = "/tmp/javabytes/test";
    const result = 'disassembled_code_here';
    disassembler.cleanup({dirName, result}).then((obj) => {
      done();
    }).catch((e) => {
      done(e);
    });
  });

  after(function() {
    fsExtra.removeSync("/tmp/javabytes/test");
  });
});
