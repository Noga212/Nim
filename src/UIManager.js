/**
 * The UIManager class handles all the visual interactions, animations,
 * and DOM manipulation for the Nim game.
 */
export class UIManager {
    /**
     * @param {NimGame} game - The game engine instance.
     */
    constructor(game) {
        this.game = game;

        // Screens
        this.menuScreen = document.getElementById('menu-screen');
        this.gameScreen = document.getElementById('game-screen');

        // Game UI Elements
        this.boardElement = document.getElementById('board');
        this.statusElement = document.getElementById('status');
        this.actionButton = document.getElementById('end-turn');
        this.overlay = document.getElementById('overlay');
        this.winnerText = document.getElementById('winner-text');

        // Interaction Trackers
        this.selectedPileIndex = -1;
        this.selectedCount = 0;

        this.initEventListeners();
    }

    /**
     * Sets up global button listeners.
     */
    initEventListeners() {
        // Menu Listeners
        document.getElementById('start-btn').addEventListener('click', () => this.handleStartGame());

        // Game Listeners
        this.actionButton.addEventListener('click', () => this.handlePick());
        document.getElementById('restart-btn').addEventListener('click', () => this.handleRestart());
        document.getElementById('new-game-btn').addEventListener('click', () => this.showMenu());
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.overlay.classList.remove('show');
            this.handleRestart();
        });
    }

    /**
     * Shows the start menu.
     */
    showMenu() {
        this.gameScreen.classList.add('hidden');
        this.menuScreen.classList.remove('hidden');
        this.overlay.classList.remove('show');
    }

    /**
     * Shows the game board.
     */
    showGame() {
        this.menuScreen.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        this.render();
    }

    /**
     * Reads menu settings and starts a new game session.
     */
    handleStartGame() {
        const configInput = document.getElementById('pile-config-input').value;
        const startPlayer = document.querySelector('input[name="start-player"]:checked').value;

        const counts = configInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);

        if (counts.length === 0) {
            alert("Please enter valid pile sizes (e.g. 3, 4, 5)");
            return;
        }

        this.game.reset(counts, startPlayer);
        this.resetSelection();
        this.showGame();

        // If computer starts, trigger its turn
        if (startPlayer === 'computer') {
            this.handleAITurn();
        }
    }

    /**
     * Restarts the game with the same initial settings of the current session.
     */
    handleRestart() {
        this.game.reset();
        this.resetSelection();
        this.render();

        if (this.game.currentPlayer === 'computer') {
            this.handleAITurn();
        }
    }

    /**
     * Resets the UI selection state.
     */
    resetSelection() {
        this.selectedPileIndex = -1;
        this.selectedCount = 0;
        this.actionButton.disabled = true;
    }

    /**
     * Renders the game board based on the game engine state.
     */
    render() {
        this.boardElement.innerHTML = '';

        this.game.piles.forEach((pile, index) => {
            const pileDiv = document.createElement('div');
            pileDiv.className = `pile ${this.selectedPileIndex === index ? 'active' : ''}`;

            pileDiv.addEventListener('click', (e) => {
                if (this.game.currentPlayer !== 'user' || this.game.gameOver) return;

                const rect = pileDiv.getBoundingClientRect();
                const clickY = e.clientY - rect.top;
                const totalHeight = rect.height;
                const itemHeightWithGap = totalHeight / pile.count;

                let itemIndexFromBottom = Math.floor((totalHeight - clickY) / itemHeightWithGap);
                if (itemIndexFromBottom < 0) itemIndexFromBottom = 0;
                if (itemIndexFromBottom >= pile.count) itemIndexFromBottom = pile.count - 1;

                const countToSelect = pile.count - itemIndexFromBottom;

                this.selectedPileIndex = index;
                this.selectedCount = countToSelect;
                this.actionButton.disabled = false;
                this.render();
            });

            for (let i = 0; i < pile.count; i++) {
                const item = document.createElement('div');
                item.className = 'item';
                if (this.selectedPileIndex === index && i >= pile.count - this.selectedCount) {
                    item.classList.add('selected');
                }
                pileDiv.appendChild(item);
            }

            this.boardElement.appendChild(pileDiv);
        });

        this.updateStatus();
    }

    async handlePick() {
        if (this.selectedCount > 0) {
            this.game.userMove(this.selectedPileIndex, this.selectedCount);
            this.resetSelection();
            this.render();

            if (this.game.gameOver) {
                this.showGameOver();
                return;
            }

            await this.handleAITurn();
        }
    }

    async handleAITurn() {
        this.statusElement.innerText = "Computer is thinking...";
        await new Promise(resolve => setTimeout(resolve, 1000));

        const move = this.game.makeAIMove();
        if (this.game.gameOver) {
            this.showGameOver();
        } else {
            this.render();
        }
    }

    updateStatus() {
        if (this.game.gameOver) return;

        if (this.game.currentPlayer === 'user') {
            this.statusElement.style.color = 'var(--secondary)';
            this.statusElement.innerText = "YOUR TURN";
        } else {
            this.statusElement.style.color = 'var(--primary)';
            this.statusElement.innerText = "COMPUTER'S TURN";
        }
    }

    showGameOver() {
        this.overlay.classList.add('show');
        if (this.game.winner === 'user') {
            this.winnerText.innerText = "VICTORY!";
            document.getElementById('winner-subtext').innerText = "You defeated the Nim-sum!";
        } else {
            this.winnerText.innerText = "DEFEAT";
            this.winnerText.style.color = 'var(--danger)';
            document.getElementById('winner-subtext').innerText = "The computer played perfectly.";
        }
    }
}
