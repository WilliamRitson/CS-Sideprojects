import { SearchableGame, GameMove ,GameWinner } from './searchable-game';
import { GameAI } from './game-ai';

export class Minimax implements GameAI {
    private depthLimit: number;
    private originalPlayer: number;
    constructor(depthLimit: number = 4) {
        this.depthLimit = depthLimit;
    }
    getNextMove(gameState: SearchableGame) {
        var choices = gameState.getMoves(),
            value,
            bestChoice = choices[0],
            bestChoiceValue = -Infinity;
        this.originalPlayer = gameState.getCurrentPlayer();
        for (var i = 0; i < choices.length; i += 1) {
            value = this.alphaBeta(gameState, choices[i], 1, -Infinity, Infinity);
            if (value > bestChoiceValue) {
                bestChoiceValue = value;
                bestChoice = choices[i];
            }
        }
        return bestChoice;
    }
    private evaluate(gameState: SearchableGame, winner: number): number {
        // Tie Game
        if (winner == GameWinner.tie) {
            return 0;
        }
        // We won
        if (winner ==  this.originalPlayer) {
            return Infinity;
        }
        // Somone else won
        if (winner != GameWinner.inProgress) {
            return -Infinity;
        }
        // The game isn't over. Use the hueristic
        return gameState.getHeuristicValue(this.originalPlayer);
    }

    private alphaBeta(oldState: SearchableGame, move: GameMove, depth: number, alpha: number, beta: number) {
        let newState = oldState.clone();
        newState.executeMove(move);
        let winner = newState.getWinner();
        if (winner != GameWinner.inProgress || depth >= this.depthLimit) {
            return this.evaluate(newState, winner);
        }

        let nextPlayer = newState.getCurrentPlayer(),
            choices = newState.getMoves(),
            value;
        if (nextPlayer === this.originalPlayer) {
            // The next player will be the maximizer 
            value = -Infinity;
            for (let i = 0; i < choices.length; i += 1) {
                value = Math.max(value, this.alphaBeta(newState, choices[i], depth + 1, alpha, beta));
                alpha = Math.max(alpha, value);
                if (beta <= alpha) {
                    break;
                }
            }
        } else {
            // The next player will be the minimizer
            value = Infinity;
            for (let i = 0; i < choices.length; i += 1) {
                value = Math.min(value, this.alphaBeta(newState, choices[i], depth + 1, alpha, beta));
                beta = Math.min(beta, value);
                if (beta <= alpha) {
                    break;
                }
            }
        }


        return value;
    }
}
