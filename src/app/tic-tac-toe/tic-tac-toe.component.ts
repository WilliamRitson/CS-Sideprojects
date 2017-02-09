import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TicTacToe, TicTacToeMove, TicTacToeMark } from '../tic-tac-toe';
import { GameAI } from '../game-ai';

@Component({
  selector: 'tic-tac-toe',
  templateUrl: './tic-tac-toe.component.html',
  styleUrls: ['./tic-tac-toe.component.css']
})
export class TicTacToeComponent implements OnInit {
  @Input() game: TicTacToe;
  @Input() size: number;

  @Output() onMove: EventEmitter<TicTacToe> = new EventEmitter<TicTacToe>();
  @Output() onEnd: EventEmitter<number> = new EventEmitter<number>();
  winner: number;

  constructor() {
    this.size = 300;
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
    this.onMove.emit(this.game);
  }

  getWinAngle() {
    return this.game.getWinningAngle();
  }

  ngOnInit() { }

}
