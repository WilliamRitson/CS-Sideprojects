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
  @Input() active: boolean = true;
  @Input() delegate: boolean = false;

  @Output() onMove: EventEmitter<TicTacToe> = new EventEmitter<TicTacToe>();
  @Output() onDelegatedMove: EventEmitter<TicTacToeMove> = new EventEmitter<TicTacToeMove>();
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
    if (!this.active || this.isOver())
      return;
    if (this.delegate) {
      this.onDelegatedMove.emit(new TicTacToeMove(row, col));
      return;
    }
    this.game.executeMove(new TicTacToeMove(row, col));
    this.onMove.emit(this.game);
  }

  getWinAngle() {
    return this.game.getWinningAngle();
  }

  ngOnInit() { }

}
