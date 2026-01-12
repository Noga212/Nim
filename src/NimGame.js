import { Pile } from './Pile.js';

/**
 * The NimGame class manages the overall game state, piles, and the AI opponent.
 * It coordinates the rules of Nim and determines the "optimal" move for the computer.
 * 
 * NOTE TO USER: If you want to change the AI strategy or how many piles there are,
 * focus on this class.
 */
export class NimGame {
    /**
     * @param {number[]} pileCounts - An array representing the initial sizes of the stacks.
     * @param {string} startingPlayer - 'user' or 'computer'
     */
    constructor(pileCounts = [3, 4, 5], startingPlayer = 'user') {
        this.piles = pileCounts.map((count, index) => new Pile(count, index));
        this.currentPlayer = startingPlayer;
        this.gameOver = false;
        this.winner = null;
        this.initialConfig = { pileCounts, startingPlayer };
    }

    /**
     * The core turn-taking logic for the user.
     * 
     * @param {number} pileIndex - Which stack to take from.
     * @param {number} amount - How many items to take.
     * @returns {boolean} - Success of the move.
     */
    userMove(pileIndex, amount) {
        if (this.currentPlayer !== 'user' || this.gameOver) return false;

        const success = this.piles[pileIndex].removeItems(amount);
        if (success) {
            this.checkGameOver();
            if (!this.gameOver) {
                this.currentPlayer = 'computer';
            }
        }
        return success;
    }

    /**
     * Optimal strategy for Nim using the "Nim-Sum" (XOR sum).
     * If the Nim-sum is 0, the current player is in a losing position (assuming perfect play).
     * If not, there is always a move to make the Nim-sum 0 for the next player.
     * 
     * @returns {Object|null} - The move chosen: { pileIndex, amount }.
     */
    calculateBestMove() {
        // Calculate the XOR sum of all pile counts
        const nimSum = this.piles.reduce((acc, pile) => acc ^ pile.count, 0);

        if (nimSum === 0) {
            // If Nim-sum is 0, any legal move is okay (we are in a weak position),
            // so we just take 1 from the first non-empty pile.
            const firstPile = this.piles.find(p => p.count > 0);
            return { pileIndex: firstPile.id, amount: 1 };
        } else {
            // Find a pile where pile.count XOR nimSum < pile.count
            // This is guaranteed to exist when nimSum != 0.
            for (let i = 0; i < this.piles.length; i++) {
                const targetCount = this.piles[i].count ^ nimSum;
                if (targetCount < this.piles[i].count) {
                    const amountToRemove = this.piles[i].count - targetCount;
                    return { pileIndex: i, amount: amountToRemove };
                }
            }
        }
        return null;
    }

    /**
     * Executes the computer's turn.
     * @returns {Object} - Metadata about the move made.
     */
    makeAIMove() {
        if (this.currentPlayer !== 'computer' || this.gameOver) return null;

        const move = this.calculateBestMove();
        if (move) {
            this.piles[move.pileIndex].removeItems(move.amount);
            this.checkGameOver();
            if (!this.gameOver) {
                this.currentPlayer = 'user';
            }
        }
        return move;
    }

    /**
     * Checks if all piles are empty and sets the winner.
     */
    checkGameOver() {
        const totalItems = this.piles.reduce((acc, pile) => acc + pile.count, 0);
        if (totalItems === 0) {
            this.gameOver = true;
            // The player who takes the last object wins (Normal Play Convention).
            // Since the currentPlayer just finished their move, they are the winner.
            this.winner = this.currentPlayer;
        }
    }

    /**
     * Restarts the game with optional new pile counts.
     */
    reset(pileCounts = this.initialConfig.pileCounts, startingPlayer = this.initialConfig.startingPlayer) {
        // Save these settings as the "initial" state for future restarts in this session
        this.initialConfig = { pileCounts, startingPlayer };

        this.piles = pileCounts.map((count, index) => new Pile(count, index));
        this.currentPlayer = startingPlayer;
        this.gameOver = false;
        this.winner = null;
    }
}
