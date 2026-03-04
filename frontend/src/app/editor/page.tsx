'use client';

import React, { useState } from 'react';
import { CanvasEditor } from '@/components/editor/ConvaCanvasEditor';
import { ImageUploadPanel } from '@/components/editor/ImageUploadPanel';
import { useEditorStore } from '@/store/editorStore';
import { ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';

interface CanvasSize {
  id: string;
  name: string;
  width: number;
  height: number;
  dpi: number;
  widthCm: number;
  heightCm: number;
}

const CANVAS_SIZES: CanvasSize[] = [
  { id: '8x10', name: 'Small (8x10")', width: 2400, height: 3000, dpi: 300, widthCm: 20, heightCm: 25 },
  { id: '12x16', name: 'Medium (12x16")', width: 3600, height: 4800, dpi: 300, widthCm: 30, heightCm: 40 },
  { id: '16x20', name: 'Large (16x20")', width: 4800, height: 6000, dpi: 300, widthCm: 40, heightCm: 50 },
  { id: '20x24', name: 'XL (20x24")', width: 6000, height: 7200, dpi: 300, widthCm: 50, heightCm: 60 },
];

export default function EditorPage() {
  const { canCheckout, missingSlots, layers } = useEditorStore();
  const [selectedSize, setSelectedSize] = useState<CanvasSize>(CANVAS_SIZES[1]);

  const checkout = canCheckout();
  const missing = missingSlots();
  const hasBlockedDpi = layers.some((l) => l.type === 'image' && (l as any).dpiStatus === 'blocked');

  const handleSizeChange = (size: CanvasSize) => {
    setSelectedSize(size);
  };

  const checkoutMessage = () => {
    if (hasBlockedDpi) return 'Qualité insuffisante sur certaines photos';
    if (missing.length > 0) return `Photos manquantes : ${missing.join(', ')}`;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Éditeur Lawha</h1>
            <p className="text-xs text-gray-500 mt-0.5">Personnalisez votre impression</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-full mx-auto p-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Size Selector */}
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-sm font-bold mb-3 text-gray-700">Format</h2>
              <div className="space-y-1.5">
                {CANVAS_SIZES.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => handleSizeChange(size)}
                    className={`w-full px-3 py-2 rounded text-left text-xs font-medium transition-colors ${selectedSize.id === size.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {size.name}
                    <span className="block opacity-75">{size.widthCm}×{size.heightCm} cm</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Upload Panel */}
            <div className="bg-white rounded-lg shadow p-4 flex-1">
              <h2 className="text-sm font-bold mb-3 text-gray-700">Photos</h2>
              <ImageUploadPanel
                printWidthCm={selectedSize.widthCm}
                printHeightCm={selectedSize.heightCm}
              />
            </div>
          </div>

          {/* Canvas */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow p-4 flex-1">
              <div className="flex justify-center overflow-auto max-h-[65vh]">
                <CanvasEditor
                  width={selectedSize.width}
                  height={selectedSize.height}
                  dpi={selectedSize.dpi}
                />
              </div>
            </div>

            {/* ── Checkout Bar ── */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {checkout ? (
                    <div className="flex items-center gap-2 text-green-700 text-sm">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      <span>Tout est prêt pour commander</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-gray-500 text-sm">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-400" />
                      <span className="truncate">
                        {checkoutMessage() ?? 'Complétez votre design pour commander'}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  disabled={!checkout}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${checkout
                      ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  onClick={() => checkout && alert('Redirection vers le panier…')}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Commander →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
