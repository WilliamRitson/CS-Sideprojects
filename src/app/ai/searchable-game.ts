export interface GameMove { }

export enum GameWinner {
    tie = -1,
    inProgress = 0,
    playerOne = 1,
    playerTwo = 2
}


/**
 * Defines a game that can be played with a search algorithm such as Minimax
 * 
 * @export
 * @interface SearchableGame
 */
export interface SearchableGame {
    /**
     * Creates a deep copy of the current game.
     * 
     * @returns {SearchableGame} A clone of the current game
     * @memberof SearchableGame
     */
    clone(): SearchableGame;

    /**
     * Returns the legal moves avalible to the current player at the current state.
     * 
     * @returns {Array<GameMove>} A list of legal moves
     * @memberof SearchableGame
     */
    getMoves(): Array<GameMove>;

    /**
     * Executes a move, modifying the current state
     * 
     * @param move The move to execute
     * @memberof SearchableGame
     */
    executeMove(move: GameMove);

    /**
     * Returns which player has won. Will return GameWinner.inProgress if no one has won yet.
     * In the case of a tie returns GameWinner.tie
     * 
     * @returns {GameWinner} The number of the player that has one, or a signal for ties/unfinshed games
     * @memberof SearchableGame
     */
    getWinner(): GameWinner;

    /**
     * Returns the number of the player who will move next
     * 
     * @returns {number} the number of the player who will move next
     * @memberof SearchableGame
     */
    getCurrentPlayer(): number;


    /**
     * Returns a heuristic that estimates how close a player is to winning
     * 
     * @param {number} player The player from whose perspective the game should be evaluated
     * @returns {number} An estimate of how close the player is to winning (higher is better for that player)
     * @memberof SearchableGame
     */
    getHeuristicValue(player: number): number;
}
