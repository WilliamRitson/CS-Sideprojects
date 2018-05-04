export interface GameMove { }

export enum GameWinner {
    tie = -1,
    inProgress = 0,
    playerOne = 1,
    playerTwo = 2
}

export interface SearchableGame {
    clone(): SearchableGame;
    getMoves(): Array<GameMove>;
    executeMove(move: GameMove);
    getWinner(): GameWinner; 
    getCurrentPlayer(): number;
    getHeuristicValue(player:number): number;
}
