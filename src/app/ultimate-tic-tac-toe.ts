import { GameMove, GameWinner, SearchableGame } from './searchable-game';
import { TicTacToe, TicTacToeMark, TicTacToeMove } from './tic-tac-toe';


export class UltimateTicTacToeMove implements GameMove {
    constructor(public row: number, public col: number, public submove: TicTacToeMove) { }
}

export class UltimateTicTacToe implements SearchableGame {
    public state: Array<Array<TicTacToe>>;
    public scores: Array<number>;
    public boardActive: Array<Array<boolean>>;
    private moveCount: number;
    private currPlayer: number;
    private static maxPlayers: number = 2;
    private static boardSize: number = 3;

    constructor() {
        this.state = [
            [new TicTacToe(), new TicTacToe, new TicTacToe],
            [new TicTacToe(), new TicTacToe, new TicTacToe],
            [new TicTacToe(), new TicTacToe, new TicTacToe]
        ];
        this.boardActive = [
            [true, true, true],
            [true, true, true],
            [true, true, true]
        ];

        //[row1, row2, row3, col1, col2, col3, diag1, diag2].
        this.scores = [0, 0, 0, 0, 0, 0, 0, 0];
        this.moveCount = 0;
        this.currPlayer = 1;
    }
    getCurrentPlayer() {
        return this.currPlayer;
    }
    getHeuristicValue(player: number) {
        let sum = this.scores.reduce((a, b) => a + b) * 27;

        for (let i = 0; i < this.state.length; i++) {
            for (let j = 0; j < this.state[i].length; j++) {
                sum += this.state[i][j].getHeuristicValue(player);
            }
        }

        if (player == 1) {
            return sum;
        }
        return -sum;
    }
    getMoves() {
        let moves = [];
        for (let i = 0; i < this.state.length; i++) {
            for (let j = 0; j < this.state[i].length; j++) {
                if (this.boardActive[i][j] && this.state[i][j].getWinner() == GameWinner.inProgress)
                    this.state[i][j].getMoves().forEach(move => {
                        moves.push(new UltimateTicTacToeMove(i, j, move));
                    })
            }
        }
        //console.log(moves);
        return moves;
    }
    clone(): UltimateTicTacToe {
        let clone = new UltimateTicTacToe();
        clone.moveCount = this.moveCount;
        clone.currPlayer = this.currPlayer;
        for (let i = 0; i < this.state.length; i++) {
            for (let j = 0; j < this.state[i].length; j++) {
                clone.state[i][j] = this.state[i][j].clone();
                clone.boardActive[i][j] = this.boardActive[i][j];
            }
        }
        for (let i = 0; i < this.scores.length; i++) {
            clone.scores[i] = this.scores[i];
        }
        //console.log(this, clone);
        
        return clone;
    }
    executeMove(move: UltimateTicTacToeMove) {

        let player = this.currPlayer;
        let subgame = this.state[move.row][move.col];
        subgame.executeMove(move.submove);

        this.moveCount++;
        console.log(subgame.getWinner(), GameWinner.inProgress)
        if (subgame.getWinner() > GameWinner.inProgress) {
            let score = this.scores;
            let point = player == 1 ? 1 : -1;

            score[move.row] += point;
            score[UltimateTicTacToe.boardSize + move.col] += point;
            if (move.row == move.col)
                score[2 * UltimateTicTacToe.boardSize] += point;
            if (UltimateTicTacToe.boardSize - 1 - move.col == move.row)
                score[2 * UltimateTicTacToe.boardSize + 1] += point;
        }
        this.currPlayer = (UltimateTicTacToe.maxPlayers + 1) - player;

        let nextGameDone = this.state[move.submove.row][move.submove.col].getWinner() != GameWinner.inProgress;
        for (let r = 0; r < UltimateTicTacToe.boardSize; r++) {
            for (let c = 0; c < UltimateTicTacToe.boardSize; c++) {
                this.state[r][c].setCurrentPlayer(this.currPlayer);
                this.boardActive[r][c] = nextGameDone || (r == move.submove.row && c == move.submove.col);
            }
        }
    }

    private static angles = [
        { from: { r: 0.5, c: 0 }, to: { r: 0.5, c: 3 } }, // row1
        { from: { r: 1.5, c: 0 }, to: { r: 1.5, c: 3 } }, // row2
        { from: { r: 2.5, c: 0 }, to: { r: 2.5, c: 3 } }, // row3

        { from: { r: 0, c: 0.5 }, to: { r: 3, c: 0.5 } }, // col1 
        { from: { r: 0, c: 1.5 }, to: { r: 3, c: 1.5 } }, // col2
        { from: { r: 0, c: 2.5 }, to: { r: 3, c: 2.5 } }, // col3

        { from: { r: 0, c: 0 }, to: { r: 3, c: 3 } }, // diag1
        { from: { r: 0, c: 3 }, to: { r: 3, c: 0 } }, // diag2
    ];
    getWinningAngle() {
        let winning = this.scores.findIndex(score => Math.abs(score) == UltimateTicTacToe.boardSize);
        return UltimateTicTacToe.angles[winning];
    }

    getWinner() {
        for (let i = 0; i < this.scores.length; i++) {
            if (this.scores[i] == UltimateTicTacToe.boardSize) {
                return 1;
            } else if (this.scores[i] == -UltimateTicTacToe.boardSize) {
                return 2;
            }
        }
        if (this.moveCount >= Math.pow(UltimateTicTacToe.boardSize, 4)) {
            return -1;
        }
        return 0;
    }
    toString() {
        return this.state.map(row => row.map(cell => {
            return cell.toString();
        }).join('|')
        ).join('\n-+-+-\n')
    }
}