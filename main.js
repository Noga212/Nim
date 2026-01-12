import { NimGame } from './src/NimGame.js';
import { UIManager } from './src/UIManager.js';

/**
 * Entry point of the application.
 * Initializes the game core and the UI manager.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initial configuration for the first load (not shown since menu starts first)
    const initialConfig = [3, 4, 5];

    // We create the game engine
    const game = new NimGame(initialConfig);

    // We create the UI Manager which will control the flow
    const ui = new UIManager(game);

    // Explicitly show the menu at the start
    ui.showMenu();
});
