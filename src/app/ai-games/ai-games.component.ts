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

@Component({
  selector: 'app-ai-games',
  templateUrl: './ai-games.component.html',
  styleUrls: ['./ai-games.component.css']
})
export class AiGamesComponent implements OnInit {
  aiChoices: Array<GameAI>;
  players: Array<Player>;
  aiNames: Array<string>;
  game: SearchableGame;
  winner: number;
  automove: boolean = false;

  constructor() {
    this.game = new UltimateTicTacToe();
    this.aiChoices = [new Minimax(), new MCTS()];
    this.aiNames = ['minimax', 'mcts'];
    this.players = [
      new Player(true, this.aiChoices[0], 0),
      new Player(false, this.aiChoices[0], 1),
    ]
  }

  setAI(player: Player) {
    player.ai = this.aiChoices[player.aiIndex];
  }

  respond(state: SearchableGame) {
    if (!this.automove || state.getWinner() != 0)
      return;
    state.executeMove(this.aiChoices[0].getNextMove(state));
  }

  reset() {
    this.game = new UltimateTicTacToe();
    this.winner = 0;
  }

  isOver() {
    this.winner = this.game.getWinner();
    return this.winner != 0;
  }

  runAiMove() {
    if (this.isOver())
      return;
     this.game.executeMove(this.aiChoices[0].getNextMove(this.game));
  }

  runAiGame() {
    if (this.isOver())
      this.reset();
    let ais = [this.aiChoices[0], this.aiChoices[0]];
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

