import { v4 as uuidv4 } from 'uuid';
import enquirer from 'enquirer';
import chalk from 'chalk';
import * as fs from 'fs';

const { Input, Select, AutoComplete } = enquirer;

function error(msg) {
  console.log(chalk.red(msg));
}

class GameController {
  static players = JSON.parse(fs.readFileSync('players.json', 'UTF8'));
  static games = JSON.parse(fs.readFileSync('games.json', 'UTF8'));

  static newElos(winner, loser) {
    let eloDiff = winner - loser;

    let k = Math.pow(10, eloDiff / 400) + 1;
    let v = 30;
    let delta = v / k;

    return [winner + delta, loser - delta].map((n) => Math.round(n));
  }

  static newPlayer(name) {
    if (this.getPlayer(name) != undefined) {
      error('Name is already taken.');
      return false;
    }
    this.players.push({
      name: name,
      corpElo: 1100,
      runElo: 1100,
    });
    return true;
  }

  static newGame(corp, runner) {
    let id = uuidv4();
    this.games.push({
      corp: corp.name,
      runner: runner.name,
      corpElo: corp.corpElo,
      runElo: runner.runElo,
      winner: null,
      date: new Date(),
      id: id,
    });
    return id;
  }

  static getPlayer(name) {
    return this.players.filter((player) => player.name.toLowerCase() == name.toLowerCase())[0];
  }

  static getGame(id) {
    return this.games.filter((game) => game.id == id)[0];
  }

  static finishGame(gameID, winner) {
    winner = winner.toLowerCase();
    if (winner != 'corp' && winner != 'runner') {
      error('Winner Arg is incorrect');
      return false;
    }

    let game = GameController.getGame(gameID);
    game.winner = winner;

    let corp = this.getPlayer(game.corp);
    let runner = this.getPlayer(game.runner);

    if (winner == 'corp') {
      let newElos = this.newElos(corp.corpElo, runner.runElo);
      console.log(newElos)
      corp.corpElo = newElos[0];
      runner.runElo = newElos[1];
    } else {
      let newElos = this.newElos(runner.runElo, corp.corpElo);
      corp.corpElo = newElos[1];
      runner.runElo = newElos[0];
    }
  }

  static saveData() {
    fs.writeFileSync('players.json', JSON.stringify(this.players, null, ' '));
    fs.writeFileSync('games.json', JSON.stringify(this.games, null, ' '));
  }
}

async function pickPlayer(msg = 'select a player') {
  const playerName = await new AutoComplete({
    message: msg,
    choices: GameController.players.map((player) => player.name),
  }).run();

  return GameController.getPlayer(playerName);
}

let action = await new Select({
  message: 'Select Action:',
  choices: ['Register Game', 'See Rankings', 'Register Player'],
}).run();

switch (action) {
  case 'Register Game':
    let corp = await pickPlayer('Who is Corp?');
    let runner = await pickPlayer('Who is Runner?');
    let winner = await new Select({
      message: 'Who won?',
      choices: ['Corp', 'Runner'],
    }).run();

    console.log(corp);
    let gameID = GameController.newGame(corp, runner);
    GameController.finishGame(gameID, winner);
    let game = GameController.getGame(gameID);

    let maxNameLen = Math.max(corp.name.length, runner.name.length) + 1;

    console.log(`${winner} wins!`);
    console.log(`Corp   ${corp.name.padEnd(maxNameLen)}| ${game.corpElo} => ${corp.corpElo}`);
    console.log(`Runner ${runner.name.padEnd(maxNameLen)}| ${game.runElo} => ${runner.runElo}`);
    break;
  case 'See Rankings':
    error('Not done yet, sorry.')
    break;
  case 'Register Player':
    let playerName = await new Input({
      message: "New Player's Name",
    }).run();
    GameController.newPlayer(playerName);
    break;
}

GameController.saveData();
