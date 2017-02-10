import { Component, OnInit } from '@angular/core';
import { Minimax } from '../minimax';
import { MCTS } from '../mcts';
import { SearchableGame } from '../searchable-game'
import { GameAI } from '../game-ai';
import { TicTacToe } from '../tic-tac-toe';
import { UltimateTicTacToe } from '../ultimate-tic-tac-toe';

class Player {
  constructor(public isHuman: boolean, public ai: GameAI, public aiIndex: number) { }
}

interface SearchableGameClass {
  new (): SearchableGame;
}

interface AiClass {
  new (): GameAI;
}

@Component({
  selector: 'app-ai-games',
  templateUrl: './ai-games.component.html',
  styleUrls: ['./ai-games.component.css']
})
export class AiGamesComponent implements OnInit {

  players: Array<Player>;

  game: SearchableGame;
  winner: number;
  automove: boolean = false;
  aiClass: Array<AiClass> = [Minimax, MCTS];
  aiNames: Array<string> = ['minimax', 'mcts'];
  games: Array<SearchableGameClass> = [TicTacToe, UltimateTicTacToe];
  gameNames: Array<string> = ["Tic Tac Toe", "Ultimate TTT"];
  gameIndex: number = 0;

  constructor() {
    this.reset();
    this.players = [
      new Player(true, new Minimax(), 0),
      new Player(false, new Minimax(), 1),
    ]
  }

  reset() {
    this.game = new this.games[this.gameIndex]();
    this.winner = 0;
  }

  setAI(player: Player) {
    player.ai = new this.aiClass[player.aiIndex]();
  }

  respond(state: SearchableGame) {
    if (!this.automove)
      return;
    this.runAiMove(state);
  }

  isOver() {
    this.winner = this.game.getWinner();
    return this.winner != 0;
  }

  currPlayer():Player {
    return this.players[this.game.getCurrentPlayer() - 1];
  }

  runAiMove(state = this.game) {
    if (this.isOver())
      return;
    state.executeMove(this.currPlayer().ai.getNextMove(state));
  }

  runAiGame() {
    if (this.isOver())
      this.reset();
    let ais = this.players.map(player => player.ai);
    let currentAi = 0;

    let runAiGameStep = () => {
      let t1 = performance.now();
      let netMove = ais[currentAi].getNextMove(this.game);
      let timeUsed = performance.now() - t1;
      this.game.executeMove(netMove);
      // Toggle ai
      currentAi = 1 - currentAi;
      if (!this.isOver()) {
        setTimeout(runAiGameStep, Math.max(0, 500 - timeUsed));
      }
    }
    runAiGameStep();
  }

  ngOnInit() { }

}

