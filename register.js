const GC = require('./gameController.js');

function error(str) {
  console.error(str);
  process.exit(1);
};


let args = process.argv.slice(2);


if (args.length != 1) error("Incorrect Number of Arguments");

GC.init()
GC.registerPlayer(args[0])
GC.saveData()

