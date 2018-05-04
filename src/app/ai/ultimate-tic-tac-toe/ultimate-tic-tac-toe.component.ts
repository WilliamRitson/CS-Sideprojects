import { TicTacToe } from '../tic-tac-toe';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UltimateTicTacToe, UltimateTicTacToeMove } from '../ultimate-tic-tac-toe';
import { TicTacToeMove } from '../tic-tac-toe';
import { GameAI } from '../game-ai';


@Component({
  selector: 'ultimate-tic-tac-toe',
  templateUrl: './ultimate-tic-tac-toe.component.html',
  styleUrls: ['./ultimate-tic-tac-toe.component.css']
})
export class UltimateTicTacToeComponent implements OnInit {

  @Input() game: UltimateTicTacToe;
  @Input() size: number;
  @Input() active: boolean = true;

  @Output() onMove: EventEmitter<UltimateTicTacToe> = new EventEmitter<UltimateTicTacToe>();
  @Output() onEnd: EventEmitter<number> = new EventEmitter<number>();
  winner: number;

  padding: number = 20;

  constructor() {
    this.size = 600;
  }

  isOver() {
    this.winner = this.game.getWinner();
    return this.winner != 0;
  }

  getCord(index: number): number {
    return (index) * (1 / 3) * this.size;
  }

  currRow: number;
  currCol: number;
  makeMove(move: TicTacToeMove) {
    if (!this.active || this.isOver())
      return;
    let ultMove = new UltimateTicTacToeMove(this.currRow, this.currCol, move);
    this.game.executeMove(ultMove);
    this.onMove.emit(this.game);
  }

  inactive(r: number, c: number) {
    return !this.game.boardActive[r][c] ||
      this.game.state[r][c].getWinner() != 0;
  }

  setTarget(row: number, col: number) {
    this.currCol = col;
    this.currRow = row;
  }

  getWinAngle() {
    return this.game.getWinningAngle();
  }

  ngOnInit() { }
}
