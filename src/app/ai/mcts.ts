import { GameAI } from './game-ai';
import { SearchableGame, GameMove, GameWinner } from './searchable-game'
import { sample, maxBy, minBy } from 'lodash';

let counts = { win: 0, loss: 0, tie: 0 }
const UCT_C = Math.sqrt(2);

export class MCTS implements GameAI {
    private root: Node;
    private rootState: SearchableGame;
    private currentState: SearchableGame;
    private controlledPlayer: number

    constructor(private iterationLimit: number = 100) {
    }

    public getNextMove(gameState: SearchableGame): GameMove {
        this.controlledPlayer = gameState.getCurrentPlayer();
        this.rootState = gameState;
        this.root = new Node(null, null);
        counts = { win: 0, loss: 0, tie: 0 };
        for (let i = 0; i < this.iterationLimit; i++) {
            //console.log(i, ' ----------------------');
            this.currentState = this.rootState.clone();
            // console.log('r', this.root);
            let node = this.select(this.root);
            this.expand(node);
        }
        return maxBy(this.root.children, this.UCT).action;
    }

    private UCT(node: Node) {
        if (node.vists === 0) {
            return Infinity;
        }
        return node.reward / node.vists + Math.sqrt(2 * Math.log(node.parent.vists) / node.vists);
    }

    private select(node: Node): Node {
        if (node.winner !== GameWinner.inProgress || node.children.length === 0) {
            return node;
        }

        let best;
        if (this.currentState.getCurrentPlayer() == this.controlledPlayer)
            best = maxBy(node.children, this.UCT);
        else
            best = minBy(node.children, this.UCT);
        let nextState = this.select(best);

        this.currentState.executeMove(nextState.action);
        return nextState;
    }

    private evalWinner(winner) {
        switch (winner) {
            case GameWinner.tie:
                counts.tie++;
                return 0;
            case this.controlledPlayer:
                counts.win++;
                return 1;
            default:
                counts.loss++;
                return -1;
        }
    }

    private expand(node: Node) {
        node.winner = this.currentState.getWinner()
        if (node.winner !== GameWinner.inProgress) {
            this.backpropagate(node, this.evalWinner(node.winner));
            return;
        }

        node.board = this.currentState.clone();
        node.children = this.currentState.getMoves().map(move => new Node(node, move));

        let child = sample(node.children);
        this.currentState.executeMove(child.action);

        this.backpropagate(child, this.simulate(this.currentState));
    }

    private simulate(gameState: SearchableGame): number {
        while (gameState.getWinner() == GameWinner.inProgress) {
            let move = sample(gameState.getMoves());
            gameState.executeMove(move);
        }
        return this.evalWinner(gameState.getWinner());
    }

    private backpropagate(node: Node, reward: number) {
        node.vists++;
        node.reward += reward;
        if (node.parent) {
            this.backpropagate(node.parent, reward);
        }
    }
}

class Node {
    action: GameMove;
    parent: Node;
    children: Array<Node>;
    reward: number;
    vists: number;
    winner: GameWinner;
    board: SearchableGame;

    constructor(parent: Node, action: GameMove) {
        this.parent = parent;
        this.action = action;
        this.children = [];
        this.reward = 0;
        this.vists = 0;
        this.winner = GameWinner.inProgress;
    }
}