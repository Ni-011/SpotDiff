import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import GameConfigComponent from './GameConfig';
import type { GameConfig } from './types/game';

const STORAGE_KEY = 'spotTheDiffCustomConfig';

export default function SpotTheGame() {
  const [game, setGame] = useState<GameConfig | null>(null);
  const [foundDiffs, setFoundDiffs] = useState<number[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeTaken, setTimeTaken] = useState<number>(0);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [customConfig, setCustomConfig] = useState<GameConfig | null>(null);
  const clickDebounceRef = useRef<boolean>(false);

  const loadGame = useCallback(async (cfg: GameConfig) => {
    setGame(cfg);
    setFoundDiffs([]);
    setStartTime(Date.now());
    setTimeTaken(0);
    setMessage(null);
  }, []);

  const resetGame = useCallback(() => {
    setGame(null);
    setFoundDiffs([]);
    setStartTime(0);
    setTimeTaken(0);
    setMessage(null);
  }, []);

  useEffect(() => {
    try {
      const storedCfg = localStorage.getItem(STORAGE_KEY);
      if (storedCfg) setCustomConfig(JSON.parse(storedCfg));
    } catch (e) { console.error("Failed to load custom config from localStorage", e); }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    const allFound = foundDiffs.length === (game?.differences.length || 0);
    if (startTime && !allFound) {
      timer = setInterval(() => setTimeTaken(Math.floor((Date.now() - startTime) / 1000)), 1000);
    } else if (startTime && allFound) {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setMessage({ text: `🎉 All differences found in ${timeTaken} seconds!`, type: 'success' });
    }
    return () => { if (timer) clearInterval(timer); };
  }, [startTime, foundDiffs.length, game?.differences.length, timeTaken]);

  const checkDiff = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
    if (clickDebounceRef.current || !game || foundDiffs.length === game.differences.length) return;

    clickDebounceRef.current = true;
    setTimeout(() => { clickDebounceRef.current = false; }, 300);

    const { left: rL, top: rT, width: rW, height: rH } = e.currentTarget.getBoundingClientRect();
    const cX = (e.clientX - rL) * (600 / rW);
    const cY = (e.clientY - rT) * (400 / rH);

    let found = false;
    game.differences.forEach((d, i) => {
      if (!foundDiffs.includes(i) && cX >= d.x && cX <= d.x + d.width && cY >= d.y && cY <= d.y + d.height) {
        setFoundDiffs(p => [...p, i]);
        setMessage({ text: '💡 Difference found!', type: 'info' });
        found = true;
      }
    });
    if (!found) setMessage({ text: '❌ No difference there. Keep looking!', type: 'error' });
  }, [game, foundDiffs]);

  const handleSave = useCallback((cfg: GameConfig) => {
    setCustomConfig(cfg);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    setShowConfig(false);
    loadGame(cfg);
  }, [loadGame]);

  const handleCancel = useCallback(() => {
    setShowConfig(false);
  }, []);

  const GameDisplay = () => (
    <div className="flex flex-col items-center bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-4 sm:p-8 font-sans transition-all duration-500 ease-in-out">
      {message && (
        <div className={`py-3 px-6 rounded-lg shadow-xl mb-6 sm:mb-8 text-white text-base sm:text-lg font-semibold animate-fade-in ${message.type === 'success' ? 'bg-green-600' : message.type === 'error' ? 'bg-red-600' : message.type === 'info' ? 'bg-blue-600' : 'bg-yellow-600'}`}>
          {message.text}
        </div>
      )}
      <h1 className="text-6xl font-extrabold text-gray-800 mb-6 tracking-tight drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600">Spot The Difference</h1>
      <p className="text-lg sm:text-2xl text-gray-700 mb-6 sm:mb-8 font-light text-center px-2">Find all {game?.differences.length} differences</p>
      <div className="flex flex-col lg:flex-row gap-6 sm:gap-10 mb-8 sm:mb-10 w-full max-w-7xl justify-center items-center">
        {[game?.images.image1, game?.images.image2].map((src, idx) => (
          <div key={idx} className="relative flex-1 w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-300 hover:scale-[1.01] hover:shadow-3xl border-4 border-white-alpha-50">
            <img
              src={src}
              alt={`Spot the difference image ${idx + 1}`}
              className="w-full rounded-2xl select-none object-cover transition-all duration-300 ease-in-out"
              draggable={false}
              onClick={checkDiff}
              style={{ aspectRatio: '3/2' }}
            />
            {game?.differences.map((d, i) => (
              <div
                key={i}
                className={`absolute border-4 border-dashed rounded-lg pointer-events-none transition-all duration-300 ${foundDiffs.includes(i) ? 'border-green-400 bg-green-300 bg-opacity-40 animate-pulse-once' : 'border-blue-400 opacity-0'}`}
                style={{
                  left: `${(d.x / 600) * 100}%`,
                  top: `${(d.y / 400) * 100}%`,
                  width: `${(d.width / 600) * 100}%`,
                  height: `${(d.height / 400) * 100}%`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="text-xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
        Differences Found: <span className="text-purple-600">{foundDiffs.length}</span> / <span className="text-gray-600">{game?.differences.length}</span>
      </div>
      <div className="text-lg sm:text-2xl font-semibold text-gray-700 mb-8 sm:mb-10">
        Time: <span className="text-indigo-600 font-bold">{timeTaken}</span> seconds
      </div>
      <div className="flex space-x-4 sm:space-x-6">
        <button onClick={resetGame} className="px-6 py-3 sm:px-10 sm:py-4 bg-blue-600 text-white font-bold rounded-full shadow-xl hover:bg-blue-700 transition transform hover:-translate-y-1 text-base sm:text-xl tracking-wide uppercase focus:outline-none focus:ring-4 focus:ring-blue-300">
          New Game
        </button>
      </div>
    </div>
  );

  const StartScreen = () => (
    <div className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 min-h-screen p-4 sm:p-8 text-center font-sans">
      <h1 className="text-5xl sm:text-7xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-tight drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Welcome to SpotDiff!</h1>
      <p className="text-lg sm:text-2xl text-gray-700 mb-8 sm:mb-12 max-w-3xl leading-relaxed px-2">A fun game to test your observation skills. Find all the differences between two seemingly identical images.</p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-8 items-center justify-center w-full max-w-md sm:max-w-none px-4">
        {customConfig && (
          <button
            onClick={() => loadGame(customConfig!)}
            className="w-full sm:w-auto px-8 py-4 sm:px-12 sm:py-6 bg-green-600 text-white font-bold rounded-full shadow-xl hover:bg-green-700 transition transform hover:-translate-y-1 text-xl sm:text-2xl tracking-wide uppercase focus:outline-none focus:ring-4 focus:ring-green-300"
          >
            Start Custom Game
          </button>
        )}
        <button
          onClick={() => setShowConfig(true)}
          className={`w-full sm:w-auto px-8 py-4 sm:px-12 sm:py-6 bg-purple-600 text-white font-bold rounded-full shadow-xl hover:bg-purple-700 transition transform hover:-translate-y-1 text-xl sm:text-2xl tracking-wide uppercase focus:outline-none focus:ring-4 focus:ring-purple-300 ${!customConfig ? 'w-full max-w-sm' : ''}`}
        >
          {customConfig ? 'Configure Game' : 'Create/Configure Game'}
        </button>
      </div>
    </div>
  );

  if (showConfig) {
    return <GameConfigComponent onSave={handleSave} onCancel={handleCancel} initialConfig={customConfig || undefined} />;
  }

  return game ? GameDisplay() : StartScreen();
} 