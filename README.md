# Spot the Difference Game

A simple, configurable "Spot the Difference" game built with React, TypeScript, and Tailwind CSS. Create and save your own custom games directly in the app.

## How to Run the Game

To get started:

1.  **Go to the project directory**:
    ```bash
    cd SpotDiff
    ```
2.  **Install dependencies**:
    ```bash
    pnpm install
    ```
3.  **Start the server**:
    ```bash
    pnpm dev
    ```

Open your browser to `http://localhost:5173`.

## Game Configuration

The game uses a `GameConfig` structure. This defines the game's title, image URLs, and the coordinates for each difference area.

By default, the game loads `sample-game.json`. You can also create and save your own game directly within the app, which will then be loaded instead of the sample.

### Creating Custom Games (In-App)

1.  **Start Screen**: When you open the game, you'll see a start screen.
2.  **"Create/Configure Game"**: Click this button.
3.  **Enter Details**:
    *   `Game Title`
    *   `Image 1 URL` and `Image 2 URL` (images should be similar with subtle differences).
    *   **Edit Differences**: Once images are loaded, click "Edit Differences" to activate drawing mode.
    *   **Draw Areas**: Click and drag on either image to define difference rectangles.
    *   **Delete Areas**: Click '×' on a highlighted area to remove it.
4.  **Save Config**: Click "Save Configuration" to store your game locally.
5.  **Play Custom Game**: Go back to the start screen and click "Start Custom Game".
