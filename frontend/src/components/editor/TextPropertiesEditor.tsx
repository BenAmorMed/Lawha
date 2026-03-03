'use client';

import React, { useState, useEffect } from 'react';
import { CanvasElement } from '@/store/editorStore';

interface TextPropertiesEditorProps {
  element: CanvasElement | null;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}

export const TextPropertiesEditor: React.FC<TextPropertiesEditorProps> = ({
  element,
  onUpdate,
}) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [fill, setFill] = useState('#000000');

  useEffect(() => {
    if (element && element.type === 'text') {
      setText(element.text || '');
      setFontSize(element.fontSize || 24);
      setFill(element.fill || '#000000');
    }
  }, [element]);

  if (!element || element.type !== 'text') {
    return null;
  }

  const handleTextChange = (newText: string) => {
    setText(newText);
    onUpdate(element.id, { text: newText });
  };

  const handleFontSizeChange = (newSize: number) => {
    setFontSize(newSize);
    onUpdate(element.id, { fontSize: newSize });
  };

  const handleColorChange = (newColor: string) => {
    setFill(newColor);
    onUpdate(element.id, { fill: newColor });
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg space-y-4">
      <h3 className="font-bold text-lg mb-3">Text Properties</h3>

      {/* Text Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Text Content
        </label>
        <textarea
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
          placeholder="Enter your text"
        />
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Font Size: {fontSize}px
        </label>
        <input
          type="range"
          min="8"
          max="120"
          value={fontSize}
          onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex gap-2 mt-2">
          {[12, 18, 24, 36, 48].map((size) => (
            <button
              key={size}
              onClick={() => handleFontSizeChange(size)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                fontSize === size
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Text Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={fill}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-12 h-12 rounded cursor-pointer border-2 border-gray-300"
          />
          <input
            type="text"
            value={fill}
            onChange={(e) => handleColorChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="#000000"
          />
        </div>
        <div className="flex gap-2 mt-2">
          {['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFA500'].map(
            (color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500"
                style={{ backgroundColor: color }}
                title={color}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};
