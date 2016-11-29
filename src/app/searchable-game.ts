export interface GameMove { }

export interface SearchableGame {
    clone(): SearchableGame;
    getMoves(): Array<GameMove>;
    executeMove(move: GameMove);
    getWinner(): number; 
    getCurrentPlayer(): number;
    getHeuristicValue(player:number): number;
}

export enum TicTacToeMark {
    B = 0,
    X = 1,
    O = 2
}

export class TicTacToeMove implements GameMove {
    constructor(public row: number, public col: number) { }
}

export class TicTacToe implements SearchableGame {
    public state: Array<Array<TicTacToeMark>>;
    public scores: Array<number>; 
    
    private moveCount: number;
    private currPlayer: number;
    private static maxPlayers: number = 2;
    private static boardSize: number = 3;
    constructor(noInit:boolean = false) {
        // Small optomization for cloning
        if (noInit) 
            return;
        this.state = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ];
        //[row1, row2, row3, col1, col2, col3, diag1, diag2].
        this.scores =  [0, 0, 0, 0, 0, 0, 0, 0];

        this.moveCount = 0;
        this.currPlayer = 1;
    }
    getCurrentPlayer() {
        return this.currPlayer;
    }
    getHeuristicValue(player:number) {
        let sum = this.scores.reduce((a, b) => a + b);
        if (player == 1) {
            return sum;
        }
        return -sum;
        
    }
    getMoves() {
        let moves = [];
        for (let i = 0; i < this.state.length; i++) {
            for (let j = 0; j < this.state[i].length; j++) {
                if (this.state[i][j] == TicTacToeMark.B)
                    moves.push(new TicTacToeMove(i, j));
            }
        }
        return moves;
    }
    clone(): TicTacToe {
        let clone = new TicTacToe();
        clone.moveCount = this.moveCount;
        clone.currPlayer = this.currPlayer;
        for (let i = 0; i < this.state.length; i++) {
            for (let j = 0; j < this.state[i].length; j++) {
                clone.state[i][j] = this.state[i][j];
            }
        }
        for (let i = 0; i < this.scores.length; i++) {
            clone.scores[i] = this.scores[i];
        }
        return clone;
    }
    executeMove(move: TicTacToeMove) {
        let player = this.currPlayer;
        this.state[move.row][move.col] = player;
        
        this.moveCount++;
        let score = this.scores;
        let point = player == 1 ? 1 : -1;
         //[row1, row2, row3, col1, col2, col3, diag1, diag2].
         //[ 0      1    2     3      4    5      6      7]
        score[move.row] += point;
        score[TicTacToe.boardSize + move.col] += point;
        if (move.row == move.col)
             score[2*TicTacToe.boardSize] += point;
        if (TicTacToe.boardSize - 1 - move.col == move.row) 
            score[2*TicTacToe.boardSize + 1] += point;

        this.currPlayer = (TicTacToe.maxPlayers + 1) - player;
    }
    getWinner() {
        //console.log(this.scores);
        for (let i = 0; i < this.scores.length; i++) {
            if (this.scores[i] >= 3) {
                return 1;
            } else if (this.scores[i] <= -3) {
                return 2;
            }
        }
        if (this.moveCount >= TicTacToe.boardSize * TicTacToe.boardSize) {
            return -1;
        }
        return 0;
    }
    toString () {
        return this.state.map(row => row.map(cell =>{
                return TicTacToeMark[cell];
            }).join('|')
        ).join('\n-+-+-\n')
    }
}