import { SearchableGame, GameMove } from './searchable-game';
let turn = 2;
export class Minimax {
    private depthLimit: number;
    private originalPlayer: number;
    constructor(depthLimit: number = 10) {
        this.depthLimit = depthLimit;
    }
    getAlphaBetaMove(gameState: SearchableGame) {
        var choices = gameState.getMoves(),
            value,
            bestChoice = choices[0],
            bestChoiceValue = -Infinity;
        this.originalPlayer = gameState.getCurrentPlayer();
        turn += 2;
        console.log('running ai for', this.originalPlayer, 'state:', '\n' + gameState.toString());
        console.log('--------------------------------------------------------------');
        for (var i = 0; i < choices.length; i += 1) {
            value = this.alphaBeta(gameState, choices[i], 1, -Infinity, Infinity);
            console.log(choices[i], value);
            if (value > bestChoiceValue) {
                bestChoiceValue = value;
                bestChoice = choices[i];
            }
            console.log('--------------------------------------------------------------');
        }
        return bestChoice;
    }
    evaluate(gameState: SearchableGame, winner: number): number {
        // Tie Game
        let player = this.originalPlayer;
        if (winner == -1) {
            return 0;
        }
        // We won
        if (winner == player) {
            return Infinity;
        }
        // Somone else won
        if (winner > 0) {
            return -Infinity;
        }
        // The game isn't over. Use the hueristic
        console.log('shouldnt get here!');
        return gameState.getHeuristicValue(player);
    }

    alphaBeta(oldState: SearchableGame, move: GameMove, depth: number, alpha: number, beta: number) {
        let newState = oldState.clone();
        newState.executeMove(move);
        if (depth == 1 || turn >= 6) {
            console.log('t:', turn, 'd:', depth, 'res:', '\n' + newState.toString());
            let testWinner = newState.getWinner();
            console.log('winner:', testWinner, 'eval:', this.evaluate(newState, testWinner));
        }

        let winner = newState.getWinner();
        if (winner != 0 || depth >= this.depthLimit) {
            return this.evaluate(newState, winner);
        }


        let nextPlayer = newState.getCurrentPlayer(),
            choices    = newState.getMoves(),
            value;
        if (nextPlayer === this.originalPlayer) {
            // The next player will be the maximizer 
            if ( turn >= 6) {
                console.log('maximizer', 'depth:', depth);
            }
            value = -Infinity;
            for (let i = 0; i < choices.length; i += 1) {
                value = Math.max(value, this.alphaBeta(newState, choices[i], depth + 1, alpha, beta));
                // alpha = Math.max(alpha, value);
                // if (beta <= alpha) {
                //     break;
                // }
            }
        } else {
            // The next player will be the minimizer
            if ( turn >= 6) {
                console.log('minimizer', 'depth:', depth);
            }
            value = Infinity;
            for (let i = 0; i < choices.length; i += 1) {
                value = Math.min(value, this.alphaBeta(newState, choices[i], depth + 1, alpha, beta));
                //beta = Math.min(beta, value);
                // if (beta <= alpha) {
                //     break;
                // }
            }
        }

        if ( turn >= 6) {
            console.log('value:', value, 'depth:', depth);
        }

        return value;
    }
}
