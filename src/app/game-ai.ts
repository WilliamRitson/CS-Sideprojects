import {SearchableGame, GameMove} from './searchable-game'

export interface GameAI {
    getNextMove(SearchableGame):GameMove;
}