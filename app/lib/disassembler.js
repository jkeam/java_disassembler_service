const Promise = require('bluebird');
const fsExtra = Promise.promisifyAll(require('fs-extra'));
const fs   = Promise.promisifyAll(require('fs'));
const uuid = require('uuid');
const exec = require('child_process').execFile;

class Disassembler {

  constructor(options={logger, guid}) {
    this.logger = options.logger;
    this.guid = options.guid;
  }

  run(code, done, tmpDir="/tmp/javabytes") {
    this.findUniqueDir(tmpDir)
    .then((args) => {
      return this.makeDir({dirName: args.dirName, code});
    })
    .then((args) => {
      return this.compileJavaFile(args);
    })
    .then((args) => {
      return this.disassemble(args);
    })
    .then((args) => {
      return this.cleanup(args);
    })
    .then((obj) => {
      done(obj);
    })
    .catch((obj) => {
      done(obj);
    });
  }

  // make a tmp dir where work can happen
  makeDir(obj) {
    const dirName = obj.dirName;
    const code = obj.code;
    return new Promise((resolve, reject) => {
      fsExtra.mkdirs(dirName, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({dirName, code});
        }
      });
    });
  }

  // creates and compiles the java source
  compileJavaFile(obj) {
    const dirName = obj.dirName;
    const code = obj.code;
    return new Promise((resolve, reject) => {
      const classname = this.extractClass(code);
      const fileLocation = `${dirName}/${classname}.java`;

      fsExtra.outputFile(fileLocation, code, (err) => {
        if (err) {
          this.logger.error(err);
          reject({
            errors: "Unable to create file"
          });
        }

        exec(`javac ${fileLocation}`, {shell: '/bin/bash'}, (error, stdout, stderr) => {
          if (stderr) {
            this.logger.error(`${this.guid}: Stderr-> ${stderr}`);
            reject({ errors: this.cleanseOutput(stderr, `${dirName}/`) });
          } else {
            this.logger.verbose(`${this.guid}: Disassembling successful`);
            resolve({dirName, classname});
          }
        });
      });
    });
  }

  // disassembles the given source class file
  disassemble(obj) {
    const dirName = obj.dirName;
    const classname = obj.classname;
    return new Promise( (resolve, reject) => {
      exec(`javap -c ${dirName}/${classname}.class`, {shell: '/bin/bash'}, (error, stdout, stderr) => {
        if (stderr) {
          this.logger.error(stderr);
          reject({
            errors: this.cleanseOutput(stderr, `${dirName}/`)
          });
        } else {
          resolve({
            result: stdout,
            dirName
          });
        }
      });
    });
  }

  // delete tmp files
  cleanup(obj) {
    const dirName = obj.dirName;
    const result = obj.result;
    return new Promise((resolve, reject) => {
      fsExtra.remove(dirName, function(){});
      resolve({result});
    });
  }

  // find a unique directory name
  findUniqueDir(tmpDir) {
    const guid = uuid.v4().replace(/-/g, '');
    const dirName = `${tmpDir}/${guid}`;
    return new Promise((resolve, reject) => {
      fs.stat(dirName, (err, stats) => {
        if (err) {
          resolve({dirName});
        } else {
          findUniqueDir().then((arg) => {
            resolve(arg)
          });
        }
      });
    });
  }

  // extract class name
  extractClass(code) {
    const pattern = /\s*(public|private)\s+class\s+(\w+)\s+((extends\s+\w+)|(implements\s+\w+( ,\w+)*))?\s*\{/;
    const matches = pattern.exec(code);
    if (matches) {
      return matches[2];
    } else {
      return uuid.v4();
    }
  }

  // remove the randomly generated dir names and make it into a valid json obj
  cleanseOutput(output, location) {
    const re = new RegExp(location, "g");
    return output.replace(re, '').replace(/"/g, '\\"');
  }
}

module.exports = Disassembler;
