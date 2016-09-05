const fsExtra = require('fs-extra');
const fs   = require('fs');
const uuid = require('uuid');
const exec = require('child_process').exec;

class Disassembler {

  constructor(newLogger) {
    this.logger = newLogger;
     // creates the java file
    this.compileJavaFile = (dir, code, disassemble, done) => {
      const classname = this.extractClass(code);
      const fileLocation = `${dir}/${classname}.java`;

      fsExtra.outputFile(fileLocation, code, (err) => {
        if (err) {
          this.logger.error(err);
        }

        const cmd = `javac ${fileLocation}`;
        exec(cmd, (error, stdout, stderr) => {
          if (stderr) {
            this.logger.error(stderr);
            done({
              errors: this.cleanseOutput(stderr, `${dir}/`)
            });
          } else {
            disassemble(dir, classname, code, done);
          }
        });
      });
    }

    this.disassemble = (dir, classname, rawCode, done) => {
      const cmd = `javap -c ${dir}/${classname}.class`;
      exec(cmd, (error, stdout, stderr) => {
        if (stderr) {
          this.logger.error(stderr);
          done({
            errors: this.cleanseOutput(stderr, `${dir}/`)
          });
        } else {
          fsExtra.remove(dir, function(){});
          done({
            result: stdout
          });
        }
      });
    }
  }
  
  run(code, done) {
    this.createUniqueDir(this.compileJavaFile, this.disassemble, code, done);
  } 

  // generates a uuid that will ensure a unique uuid for tmp dir creation
  createUniqueDir(compile, disassemble, code, done, tmpDir="/tmp/javabytes") {
    const guid = uuid.v4().replace(/-/g, '');
    const dirName = `${tmpDir}/${guid}`;
    fs.stat(dirName, (err, stats) => {
      if (err) {
        // error means no dir, we are good
        fsExtra.mkdirs(dirName, function (err) {
          compile(dirName, code, disassemble, done);
        });
      } else {
        // dir exists, keep going
        createUniqueDir(compile, disassemble, code, done, tmpDir);
      }
    });
  }

  // extract class name and lower the first letter
  extractClass(code) {
    const pattern = /\s*(public|private)\s+class\s+(\w+)\s+((extends\s+\w+)|(implements\s+\w+( ,\w+)*))?\s*\{/;
    const matches = pattern.exec(code);
    if (matches) {
      return matches[2]; 
    } else {
      return uuid.v4();
    }
  }

  cleanseOutput(output, location) {
    const re = new RegExp(location, "g");
    return output.replace(re, '').replace(/"/g, '\\"');
  }
}

module.exports = Disassembler;
