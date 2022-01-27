const GC = require('./gameController.js')

function error(str) {
  console.error(str);
  process.exit(1);
};

let args = process.argv.slice(2);

if (args.length != 3) error('Incorrect Number of Arguments');
if (['runner', 'draw', 'corp'].indexOf(args[2]) == -1) error('Incorrect Winner Values');

GC.init()
let gameID = GC.newGame(args[0], args[1]);
GC.endGame(gameID, args[2]);

let game  = GC.getGameById(gameID);
let gamePlayers = GC.getPlayersByName(args[0], args[1]);

if (args[2] == 'corp') console.log(`${game.names[0]} wins!`) 
if (args[2] == 'runner') console.log(`${game.names[1]} wins!`) 

console.log(`Corp:   ${game.names[0]}; ${Math.round(game.elos[0])} => ${Math.round(gamePlayers[0].elo)}`)
console.log(`Runner: ${game.names[1]}; ${Math.round(game.elos[1])} => ${Math.round(gamePlayers[1].elo)}`)

GC.saveData();
