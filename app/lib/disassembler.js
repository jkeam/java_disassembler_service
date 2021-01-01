const { stat } = require('fs');
const {
  mkdirs,
  outputFile,
  remove
} = require('fs-extra');

const { execFile } = require('child_process');
const { v4: uuidv4 } = require('uuid');

class Disassembler {
  constructor(options={logger, guid}) {
    this.logger = options.logger;
    this.guid = options.guid;
  }

  run(code, done, tmpDir="/tmp/javabytes") {
    this.findUniqueDir(tmpDir)
      .then(args => this.makeDir({dirName: args.dirName, code}))
      .then(args => this.compileJavaFile(args))
      .then(args => this.disassemble(args))
      .then(args => this.cleanup(args))
      .then(obj => done(obj))
      .catch(obj => {
        this.logger.error(obj);
        done(obj)
      });
  }

  // make a tmp dir where work can happen
  makeDir({ dirName, code }) {
    return new Promise((resolve, reject) => (
      mkdirs(dirName, (err) => {
        if (err) {
          return reject({ error: err });
        }
        resolve({dirName, code});
      })
    ));
  }

  // creates and compiles the java source
  compileJavaFile({ dirName, code }) {
    return new Promise((resolve, reject) => {
      const classname = this.extractClass(code);
      const fileLocation = `${dirName}/${classname}.java`;

      outputFile(fileLocation, code, (err) => {
        if (err) {
          this.logger.error(err);
          return reject({ error: "Unable to create file" });
        }

        execFile('javac', [fileLocation], { shell: true }, (error, stdout, stderr) => {
          if (stderr) {
            this.logger.error(`${this.guid}: Stderr-> ${stderr}`);
            return reject({ error: this.cleanseOutput(stderr, `${dirName}/`) });
          }
          resolve({dirName, classname});
        });
      });
    });
  }

  // disassembles the given source class file
  disassemble({ dirName, classname }) {
    return new Promise( (resolve, reject) => (
      execFile('javap', ['-c', `${dirName}/${classname}.class`], { shell: true }, (error, stdout, stderr) => {
        if (stderr) {
          this.logger.error(stderr);
          return reject({ error: this.cleanseOutput(stderr, `${dirName}/`) });
        }
        resolve({ result: stdout, dirName });
      })
    ));
  }

  // delete tmp files
  cleanup({ result, dirName }) {
    return new Promise((resolve, reject) => {
      remove(dirName, function(){});
      resolve({ result });
    });
  }

  // find a unique directory name
  findUniqueDir(tmpDir) {
    const guid = uuidv4().replace(/-/g, '');
    const dirName = `${tmpDir}/${guid}`;
    return new Promise((resolve, reject) => (
      stat(dirName, (err, stats) => {
        if (err) {
          return resolve({dirName});
        }
        findUniqueDir(tmpDir).then(resolve);
      })
    ));
  }

  // extract class name
  extractClass(code) {
    const pattern = /\s*(public|private)\s+class\s+(\w+)\s+((extends\s+\w+)|(implements\s+\w+( ,\w+)*))?\s*\{/;
    const matches = pattern.exec(code);
    if (matches) {
      return matches[2];
    }
    return uuidv4();
  }

  // remove the randomly generated dir names and make it into a valid json obj
  cleanseOutput(output, location) {
    const re = new RegExp(location, "g");
    return output.replace(re, '').replace(/"/g, '\\"');
  }
}

module.exports = Disassembler;
