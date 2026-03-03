'use client';

import React, { useState } from 'react';
import { CanvasEditor } from '@/components/editor/ConvaCanvasEditor';
import { useEditorStore } from '@/store/editorStore';

interface CanvasSize {
  id: string;
  name: string;
  width: number;
  height: number;
  dpi: number;
}

const CANVAS_SIZES: CanvasSize[] = [
  { id: '8x10', name: 'Small (8x10")', width: 2400, height: 3000, dpi: 300 },
  { id: '12x16', name: 'Medium (12x16")', width: 3600, height: 4800, dpi: 300 },
  { id: '16x20', name: 'Large (16x20")', width: 4800, height: 6000, dpi: 300 },
  { id: '20x24', name: 'XL (20x24")', width: 6000, height: 7200, dpi: 300 },
];

export default function EditorPage() {
  const { setCanvasSize, setDpi, undo, redo, clearHistory } = useEditorStore();
  const [selectedSize, setSelectedSize] = useState<CanvasSize>(CANVAS_SIZES[1]); // Default to medium
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleSizeChange = (size: CanvasSize) => {
    setSelectedSize(size);
    setCanvasSize(size.width, size.height);
    setDpi(size.dpi);
    clearHistory();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-full mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Canvas Designer</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create your custom canvas print design
          </p>
        </div>
      </header>

      <main className="max-w-full mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left Sidebar - Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Size Selector */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-bold mb-3">Select Size</h2>
              <div className="space-y-2">
                {CANVAS_SIZES.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => handleSizeChange(size)}
                    className={`w-full px-4 py-2 rounded text-left text-sm font-medium transition-colors ${
                      selectedSize.id === size.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-bold mb-3">Tools</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium"
                >
                  Upload Image
                </button>
                <button
                  onClick={undo}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
                >
                  ↶ Undo
                </button>
                <button
                  onClick={redo}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm font-medium"
                >
                  ↷ Redo
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-lg shadow p-4 text-sm">
              <h3 className="font-bold mb-2">Canvas Info</h3>
              <div className="space-y-1 text-gray-700">
                <p>
                  <span className="font-medium">Size:</span> {selectedSize.width}x
                  {selectedSize.height}px
                </p>
                <p>
                  <span className="font-medium">Resolution:</span> {selectedSize.dpi}
                  {' '}DPI
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  {selectedSize.name}
                </p>
              </div>
            </div>
          </div>

          {/* Right Content - Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-center overflow-auto max-h-[70vh]">
                <CanvasEditor
                  width={selectedSize.width}
                  height={selectedSize.height}
                  dpi={selectedSize.dpi}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Upload Modal (Placeholder) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-bold mb-4">Upload Image</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
              <p className="text-gray-600">Drag and drop your image here</p>
              <p className="text-sm text-gray-500 mt-2">or</p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
              >
                Choose File
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium">
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
