import { useState, useEffect } from 'react';
import type { GameConfig } from './types/game';

// Inner component for rendering an image and its difference markers
const GameImage = ({
  src,
  alt,
  differences,
  found,
  handleClick,
}: {
  src: string;
  alt: string;
  differences: GameConfig['differences'];
  found: Set<number>;
  handleClick: (event: React.MouseEvent<HTMLImageElement>) => void;
}) => (
  <div className="relative">
    <img
      src={src}
      alt={alt}
      className="border-2 border-gray-300 rounded-lg shadow-lg max-w-full h-auto"
      style={{ cursor: 'crosshair' }}
      onClick={handleClick}
    />
    {/* Found difference markers */}
    <div className="absolute inset-0 pointer-events-none">
      {differences.map((diff, i) =>
        found.has(i) && (
          <div
            key={i}
            className="absolute border-4 border-red-500 bg-red-300 bg-opacity-60 rounded-full animate-pulse flex items-center justify-center"
            style={{
              left: `${(diff.x / 600) * 100}%`,
              top: `${(diff.y / 400) * 100}%`,
              width: `${(diff.width / 600) * 100}%`,
              height: `${(diff.height / 400) * 100}%`,
            }}
          >
            <span className="text-white font-bold text-2xl">✓</span>
          </div>
        )
      )}
    </div>
  </div>
);

export default function SpotTheGame() {
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [found, setFound] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isComplete, setIsComplete] = useState(false);

  // Load game config
  useEffect(() => {
    if (!gameStarted) return;

    setLoading(true);
    fetch('/games/sample-game.json')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
        setStartTime(Date.now());
        setElapsedTime(0);
        setIsComplete(false);
      })
      .catch(error => {
        console.error("Error loading game:", error);
        setLoading(false);
      });
  }, [gameStarted]);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (startTime !== null && !isComplete) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    } else if (isComplete) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [startTime, isComplete]);

  // Sound effects
  const playClickSound = () => {
    const audio = new Audio('/sounds/click.mp3');
    audio.play().catch(e => console.error("Error playing click sound:", e));
  };

  const playSuccessSound = () => {
    const audio = new Audio('/sounds/success.mp3');
    audio.play().catch(e => console.error("Error playing success sound:", e));
  };

  // Handle image clicks
  const handleClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (!config || isComplete) return;

    const img = event.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (600 / rect.width);
    const y = (event.clientY - rect.top) * (400 / rect.height);

    let newFoundCount = found.size;

    // Check each difference area
    config.differences.forEach((diff, index) => {
      if (found.has(index)) return;
      
      const isHit = (
        x >= diff.x && 
        x <= diff.x + diff.width && 
        y >= diff.y && 
        y <= diff.y + diff.height
      );

      if (isHit) {
        setFound(prev => {
          const newSet = new Set([...prev, index]);
          newFoundCount = newSet.size;
          return newSet;
        });
        playClickSound();
      }
    });
    
    if (newFoundCount === config.differences.length && !isComplete) {
        setIsComplete(true);
        playSuccessSound();
    }
  };

  const startGame = () => setGameStarted(true);
  const resetGame = () => {
    setFound(new Set());
    setGameStarted(false);
    setElapsedTime(0);
    setStartTime(null);
    setIsComplete(false);
  };

  // Function to format time for display
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isCompleteGame = found.size === config?.differences.length;

  // Start screen
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Spot the Difference!</h1>
          <p className="text-gray-700 mb-8">Find all the differences between the two images.</p>
          <button
            onClick={startGame}
            className="px-8 py-4 bg-blue-600 text-white font-bold text-xl rounded-lg hover:bg-blue-700 transition"
          >
            Play Game
          </button>
        </div>
      </div>
    );
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-12 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!config) return <div className="p-8 text-center">Error loading game</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        
        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          {config.gameTitle}
        </h1>
        
        {/* Progress and Timer */}
        <div className="text-center mb-8 bg-gray-50 p-6 rounded-lg">
          <div className="text-3xl font-bold text-indigo-700 mb-3">
            Found: {found.size} / {config.differences.length}
          </div>
          <div className="w-full max-w-sm mx-auto bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(found.size / config.differences.length) * 100}%` }}
            />
          </div>
          <div className="text-xl font-medium text-gray-700">
            Time: {formatTime(elapsedTime)}
          </div>
        </div>

        {/* Images */}
        <div className="flex flex-col lg:flex-row gap-8 justify-center">
          <GameImage 
            src={config.images.image1} 
            alt="Image 1" 
            differences={config.differences} 
            found={found} 
            handleClick={handleClick} 
          />
          <GameImage 
            src={config.images.image2} 
            alt="Image 2" 
            differences={config.differences} 
            found={found} 
            handleClick={handleClick} 
          />
        </div>

        {/* Success Modal */}
        {isCompleteGame && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-3xl text-center max-w-md w-full animate-pop-in">
              <h2 className="text-3xl font-bold text-green-600 mb-4">🎉 Congratulations!</h2>
              <p className="text-gray-700 mb-6">You found all {config.differences.length} differences in {formatTime(elapsedTime)}!</p>
              <button 
                onClick={resetGame}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 