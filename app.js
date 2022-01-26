const { v4: uuidv4 } = require('uuid');

function eloDiff(elo1, elo2, winner) {
  let ratingDiff = elo1 - elo2;
  let expectedProb =
    1 / (Math.pow(10, ratingDiff / (winner == 0 ? 400 : -400)) + 1);
  let volatility = 30;
  return volatility * expectedProb;
}

class Player {
  constructor(name) {
    this.name = name;
    this.elo = 1100;
    this.id = uuidv4();
  }
}

class Game {
  static create(corp, runner) {
    return {
      id: uuidv4(),
      ids: [corp.id, runner.id],
      elos: [corp.elo, runner.elo],
      names: [corp.name, runner.name],
      winner: null,
    };
  }

  static end(game, winner) {
    game.winner = winner;
    if (winner == 'draw') return;

    let cElo = game.elos[0];
    let rElo = game.elos[1];

    let winnerIndex = winner == 'runner' ? 1 : 0;
    let deltaElo = eloDiff(cElo, rElo, winnerIndex);

    if (winner == 'corp') return [cElo + deltaElo, rElo - deltaElo];
    return [cElo - deltaElo, rElo + deltaElo];
  }
}

class GameController {
  static players = [];
  static games = [];
  // TODO: Read players and games arrays from files

  static registerPlayer(name) {
    this.players.push(new Player(name));
  }

  static getPlayersByName(name0, name1) {
    let players = [];
    this.players.forEach((p) => {
      if (p.name == name0) gamePlayers[0] = p;
      if (p.name == name1) gamePlayers[1] = p;
    });
    return players;
  }

  static getPlayersById(id0, id1) {
    let players = [];
    this.players.forEach((p) => {
      if (p.id == id0) gamePlayers[0] = p;
      if (p.id == id1) gamePlayers[1] = p;
    });
    return players;
  }

  static newGame(corpName, runnerName) {
    let gamePlayers = this.getPlayersByName(corpName, runnerName);

    let game = Game.create(...gamePlayers);
    this.games.push(game);
    return game.id;
  }

  static endGame(gameId, winner) {
    let game = this.games.filter((g) => g.id == gameId)[0];
    let newElos = Game.end(game, winner);
    
    let gamePlayers = this.getPlayersById(...game.ids);
    gamePlayers.map((player, i) => player.elo = newElos[i]);
  }

  static saveData() {
    // TODO: Save players and games array to file
  }
}

