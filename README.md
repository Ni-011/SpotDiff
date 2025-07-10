# Spot the Difference Game

A minimal, JSON-configurable "Spot the Difference" game built with React, TypeScript, and Tailwind CSS.

## Features

- **Simple & Minimal**: Single component with clear, readable code
- **JSON Configuration**: Easy game setup with JSON files
- **Click Detection**: Find differences by clicking on images
- **Progress Tracking**: Simple score display and progress bar
- **Responsive**: Works on desktop and mobile

## How to Play

1. Two images are displayed side-by-side
2. Click on differences between the images
3. Found differences are highlighted in green
4. Find all differences to complete the game

## File Structure

```
src/
├── SpotTheGame.tsx           # Main game component (all logic here)
├── types/game.ts             # Simple type definitions
└── App.tsx                   # App entry point

public/
├── games/sample-game.json    # Game configuration
└── images/                   # *No longer directly used for game images*
```

## Adding New Games

1. **Use Image URLs**: 
   - You can use URLs from image generators (e.g., `https://picsum.photos/`) directly in your JSON.
   - Ensure both images are the same dimensions for consistent scaling.

2. **Create JSON config** in `public/games/`:

```json
{
  "gameTitle": "Your Game Title",
  "images": {
    "image1": "https://picsum.photos/id/123/600/400",
    "image2": "https://picsum.photos/id/456/600/400"
  },
  "differences": [
    { "x": 100, "y": 150, "width": 50, "height": 50 }
  ]
}
```

3. **Important Note on Differences**: When using random images, the `differences` coordinates in the JSON will **not** visually correspond to actual differences between the images. You will need to manually adjust these coordinates if you want them to match true visual discrepancies (e.g., by creating two slightly different versions of an image and then getting the coordinates).

4. **Update the fetch URL** in `SpotTheGame.tsx` if needed

## Development

```bash
cd SpotDiff
pnpm install
pnpm dev
```

Game runs at `http://localhost:5173`

## Code Overview

The entire game logic is in `SpotTheGame.tsx`:

- **State**: `config`, `found`, `loading`
- **Load Config**: Simple fetch in useEffect
- **Click Handler**: Calculate click position and check against differences
- **Render**: Title, score, images, and success modal

That's it! Simple and readable code that anyone can understand and modify.
