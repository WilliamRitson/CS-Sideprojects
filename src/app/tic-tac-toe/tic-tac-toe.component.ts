import { Component, OnInit, Input } from '@angular/core';
import { TicTacToe, TicTacToeMove, TicTacToeMark } from '../tic-tac-toe';
import { GameAI } from '../game-ai';



@Component({
  selector: 'app-tic-tac-toe',
  templateUrl: './tic-tac-toe.component.html',
  styleUrls: ['./tic-tac-toe.component.css']
})
export class TicTacToeComponent implements OnInit {
  game: TicTacToe;
  @Input() ai1: GameAI;
  @Input() ai2: GameAI;
  automove: boolean;
  winner: number;
  size: number;

  constructor() {
    this.size = 300;
    this.reset();
    this.automove = true;
  }
  reset() {
    this.game = new TicTacToe();
    this.winner = 0;
  }
  isOver() {
    this.winner = this.game.getWinner();
    return this.winner != 0;
  }

  getCord(index: number): number {
    return (index) * (1 / 3) * this.size;
  }
  makeMove(row: number, col: number) {
    if (this.isOver())
      return;
    this.game.executeMove(new TicTacToeMove(row, col));
    this.isOver();


    if (!this.automove || this.isOver())
      return;
    let aiMove = <TicTacToeMove>this.ai2.getNextMove(this.game);
    this.game.executeMove(aiMove);

  }
  runAiMove() {
    if (this.isOver())
      return;
    let aiMove = <TicTacToeMove>this.ai1.getNextMove(this.game);
    if (this.isOver())
      return;
    aiMove = <TicTacToeMove>this.ai2.getNextMove(this.game);
    this.game.executeMove(aiMove);
  }
  runAiGame() {
    if (this.isOver())
      this.reset();
    let ais = [this.ai1, this.ai2];
    let currentAi = 0;

    let runAiGameStep = () => {
      let t1 = performance.now();
      let netMove = <TicTacToeMove>ais[currentAi].getNextMove(this.game);
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

  getWinAngle() {
    return this.game.getWinningAngle();
  }

  winString() {
    switch (this.winner) {
      case -1:
        return 'The game is a tie.';
      case 0:
        return 'The game is in progress.';
      case 1:
        return 'Player 1 wins.';
      case 2:
        return 'Player 2 wins.';
    }
  }
  ngOnInit() { }

}
