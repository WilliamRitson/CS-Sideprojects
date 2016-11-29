import { Component, OnInit } from '@angular/core';
import { TicTacToe, TicTacToeMove, TicTacToeMark } from '../searchable-game';
import { Minimax } from '../minimax';

const ai = new Minimax();

@Component({
  selector: 'app-tic-tac-toe',
  templateUrl: './tic-tac-toe.component.html',
  styleUrls: ['./tic-tac-toe.component.css']
})
export class TicTacToeComponent implements OnInit {
  game: TicTacToe;
  winner: number;
  constructor() {
    this.reset();
  }

  reset() {
    this.game = new TicTacToe();
    this.winner = 0;
  }

  isOver() {
    this.winner = this.game.getWinner();
    return this.winner != 0;
  }

  makeMove(row: number, col: number) {
    if (this.isOver())
      return;
    this.game.executeMove(new TicTacToeMove(row, col));
    if (this.isOver())
      return;
    let aiMove = <TicTacToeMove>ai.getAlphaBetaMove(this.game);
    this.game.executeMove(aiMove);
  }

  winString() {
    switch (this.winner) {
      case -1:
        return 'The game is a tie.';
      case 0:
        return 'The game is in progress.';
      case 1:
        return 'You won.';
      case 2:
        return 'You lost.';
    }
  }

  ngOnInit() { }

}
