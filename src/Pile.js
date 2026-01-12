/**
 * The Pile class represents a single pile of items in the Nim game.
 * It manages the count of items and provides methods to modify that count.
 * 
 * NOTE TO USER: This is a standalone component. If you want to change how 
 * "items" are counted or stored, this is the place to do it.
 */
export class Pile {
    /**
     * @param {number} initialCount - How many items start in this pile.
     * @param {number} id - A unique identifier for this pile (useful for UI).
     */
    constructor(initialCount, id) {
        this.count = initialCount;
        this.id = id;
    }

    /**
     * Removes a specific number of items from the pile.
     * 
     * @param {number} amount - The number of items to take away.
     * @returns {boolean} - Returns true if the removal was successful.
     * 
     * NOTE TO USER: Logic checks are important here to prevent 
     * taking more items than actually exist in the pile.
     */
    removeItems(amount) {
        if (amount > 0 && amount <= this.count) {
            this.count -= amount;
            return true;
        }
        console.error(`Invalid move: Trying to remove ${amount} from a pile of ${this.count}`);
        return false;
    }

    /**
     * Checks if the pile is completely empty.
     * @returns {boolean}
     */
    isEmpty() {
        return this.count === 0;
    }

    /**
     * Resets the pile to a new count.
     * @param {number} newCount 
     */
    reset(newCount) {
        this.count = newCount;
    }
}
