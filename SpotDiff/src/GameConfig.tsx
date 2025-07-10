import React, { useState, useCallback } from 'react';
import type { GameConfig } from './types/game';

const Input = React.memo(({
  label, field, type = 'text', placeholder, value, onChange, error
}: {label: string; field: 'gameTitle' | 'image1' | 'image2'; type?: string; placeholder?: string; value: string; onChange: (value: string) => void; error?: string;}) => (
  <div className="mb-6">
    <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 sm:px-5 py-2 sm:py-3 border rounded-xl focus:ring-4 focus:ring-purple-300 focus:border-transparent transition-all duration-300 ease-in-out text-base sm:text-lg ${error ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'}`}
      placeholder={placeholder}
    />
    {error && <p className="text-red-500 text-sm mt-2 animate-fade-in font-medium">{error}</p>}
  </div>
));

export default function GameConfigComponent({
  onSave, onCancel, initialConfig
}: {onSave: (config: GameConfig) => void; onCancel: () => void; initialConfig?: GameConfig;}) {
  const [form, setForm] = useState({
    gameTitle: initialConfig?.gameTitle || '',
    image1: initialConfig?.images.image1 || '',
    image2: initialConfig?.images.image2 || '',
    differences: initialConfig?.differences || []
  });
  const [editing, setEditing] = useState(false);
  const [drag, setDrag] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});

  const handleChange = useCallback((field: keyof Omit<typeof form, 'differences'>) => (value: string) => {
    setForm((p: any) => ({ ...p, [field]: value }));
    setErrors((p: any) => ({ ...p, [field]: '' }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};
    if (!form.gameTitle.trim()) newErrors.gameTitle = 'Required';
    if (!form.image1.trim()) newErrors.image1 = 'Required';
    if (!form.image2.trim()) newErrors.image2 = 'Required';
    if (!form.differences.length) newErrors.differences = 'At least one difference required';
    
    if (Object.keys(newErrors).length) return setErrors(newErrors);
    onSave({ gameTitle: form.gameTitle, images: { image1: form.image1, image2: form.image2 }, differences: form.differences });
  };

  const handleMouse = (e: React.MouseEvent<HTMLImageElement>, type: 'down' | 'move' | 'up') => {
    if (!editing) return;
    const img = e.currentTarget;
    const { left, top, width: imgW, height: imgH } = img.getBoundingClientRect();

    const x = (e.clientX - left) * (600 / imgW);
    const y = (e.clientY - top) * (400 / imgH);
    
    if (type === 'down') setDrag({ x, y, w: 0, h: 0 });
    else if (type === 'move' && drag) setDrag({ x: Math.min(x, drag.x), y: Math.min(y, drag.y), w: Math.abs(x - drag.x), h: Math.abs(y - drag.y) });
    else if (type === 'up' && drag) {
      if (drag.w > 20 && drag.h > 20) setForm(p => ({ ...p, differences: [...p.differences, { x: Math.round(drag.x), y: Math.round(drag.y), width: Math.round(drag.w), height: Math.round(drag.h) }] }));
      setErrors((p: any) => ({ ...p, differences: '' }));
      setDrag(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-200 py-8 px-4 sm:py-16 sm:px-8 font-sans transition-all duration-500 ease-in-out">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-6 sm:p-12 transform transition-transform duration-300 hover:scale-[1.005] border border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 sm:mb-12 pb-4 sm:pb-6 border-b border-gray-200">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 drop-shadow-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 mb-4 sm:mb-0">Game Configuration</h1>
          <button onClick={onCancel} className="px-6 sm:px-7 py-2 sm:py-3 bg-red-500 text-white font-semibold rounded-full shadow-md hover:bg-red-600 transition duration-200 transform hover:-translate-y-1 text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-red-300">Cancel</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <Input label="Game Title" field="gameTitle" value={form.gameTitle} onChange={handleChange('gameTitle')} error={errors.gameTitle} placeholder="Enter game title..." />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
            <Input label="Image 1 URL" field="image1" type="url" value={form.image1} onChange={handleChange('image1')} error={errors.image1} placeholder="https://example.com/image1.jpg" />
            <Input label="Image 2 URL" field="image2" type="url" value={form.image2} onChange={handleChange('image2')} error={errors.image2} placeholder="https://example.com/image2.jpg" />
          </div>

          {form.image1 && form.image2 && (
            <section className="p-6 sm:p-8 bg-gray-50 rounded-3xl shadow-inner border border-gray-100 mt-8 sm:mt-10">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-600 mb-4 sm:mb-0">Difference Areas ({form.differences.length})</h2>
                <button type="button" onClick={() => setEditing(!editing)} className={`px-5 sm:px-6 py-2 sm:py-3 rounded-full font-semibold shadow-md transition duration-200 transform hover:-translate-y-1 text-base sm:text-lg focus:outline-none focus:ring-4 ${editing ? 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300' : 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-300'}`}>
                  {editing ? 'Stop Editing' : 'Edit Differences'}
                </button>
              </div>
              
              {errors.differences && <p className="text-red-500 text-sm mb-4 sm:mb-6 animate-fade-in font-medium">{errors.differences}</p>}
              {editing && <p className="bg-blue-100 p-4 sm:p-5 rounded-xl mb-6 sm:mb-8 text-blue-800 font-medium text-center border border-blue-200 shadow-sm text-base sm:text-lg">📝 Click and drag on images to create difference areas. Click × to delete.</p>}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
                {[form.image1, form.image2].map((src, idx) => (
                  <div key={idx} className="relative bg-white rounded-2xl shadow-xl p-3 sm:p-4 border border-gray-100">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-3 sm:mb-4 text-center">Image {idx + 1}</h3>
                    <div className="relative w-full max-w-md mx-auto aspect-w-3 aspect-h-2 rounded-lg overflow-hidden border border-gray-200 shadow-md">
                      <img
                        src={src}
                        alt={`Image ${idx + 1}`}
                        className={`block w-full h-full object-cover select-none rounded-lg ${editing ? 'cursor-crosshair' : ''}`}
                        draggable={false}
                        onMouseDown={(e) => handleMouse(e, 'down')}
                        onMouseMove={(e) => handleMouse(e, 'move')}
                        onMouseUp={(e) => handleMouse(e, 'up')}
                        onMouseLeave={(e) => handleMouse(e, 'up')}
                        style={{ aspectRatio: '3/2', objectFit: 'cover' }}
                      />
                      <div className="absolute inset-0 pointer-events-none">
                        {(drag ? [...form.differences, drag] : form.differences).map((diff, i) => (
                          <div key={i} className={`absolute border-3 rounded-lg ${i === form.differences.length ? 'border-blue-500 bg-blue-200 bg-opacity-40' : 'border-green-500 bg-green-200 bg-opacity-40'}`}
                               style={{ left: `${(diff.x / 600) * 100}%`, top: `${(diff.y / 400) * 100}%`, width: `${((diff.w || diff.width) / 600) * 100}%`, height: `${((diff.h || diff.height) / 400) * 100}%` }}>
                            {i < form.differences.length && (
                              <button type="button" onClick={() => setForm(p => ({ ...p, differences: p.differences.filter((_, idx) => idx !== i) }))} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-base sm:text-lg cursor-pointer hover:bg-red-600 transition duration-200 transform hover:scale-110 shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300">×</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {form.differences.length > 0 && (
            <section className="p-6 sm:p-8 bg-gray-50 rounded-3xl shadow-inner border border-gray-100">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-600">Configured Differences</h3>
              <div className="space-y-3 sm:space-y-4">
                {form.differences.map((diff, i) => (
                  <div key={i} className="flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-gray-200 bg-white shadow-md transform transition-transform duration-200 hover:scale-[1.01]">
                    <span className="font-medium text-base sm:text-lg text-gray-700">Area {i + 1}: ({diff.x}, {diff.y}) - {diff.width}×{diff.height}</span>
                    <button type="button" onClick={() => setForm(p => ({ ...p, differences: p.differences.filter((_, idx) => idx !== i) }))} className="px-4 sm:px-5 py-2 sm:py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 transform hover:scale-105 shadow-md text-base sm:text-lg focus:outline-none focus:ring-4 focus:ring-red-300">Delete</button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-6 pt-6 sm:pt-8 border-t border-gray-200 mt-8 sm:mt-10">
            <button type="button" onClick={onCancel} className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gray-500 text-white font-bold rounded-full shadow-xl hover:bg-gray-600 transition duration-200 transform hover:-translate-y-1 text-base sm:text-xl uppercase focus:outline-none focus:ring-4 focus:ring-gray-300">Cancel</button>
            <button type="submit" className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-purple-600 text-white font-bold rounded-full shadow-xl hover:bg-purple-700 transition duration-200 transform hover:-translate-y-1 text-base sm:text-xl uppercase focus:outline-none focus:ring-4 focus:ring-purple-300">Save Configuration</button>
          </div>
        </form>
      </div>
    </div>
  );
}