'use client';

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
const CanvasEditor = dynamic(() => import('@/components/editor/CanvasEditor').then(mod => mod.CanvasEditor), { ssr: false });
const PhotoGridEditor = dynamic(() => import('@/components/editor/PhotoGridEditor').then(mod => mod.PhotoGridEditor), { ssr: false });
import { GridSlot } from '@/components/editor/PhotoGridEditor';

import { ImageUploadPanel } from '@/components/editor/ImageUploadPanel';
import { useEditorStore } from '@/store/editorStore';
import { ShoppingCart, AlertCircle, CheckCircle, Grid, Layout } from 'lucide-react';
import { useRouter } from 'next/navigation';

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

// Templates — in prod, fetched from API
const GRID_TEMPLATE_KEYS = ['photo-grid-9'];

// Reconstruct grid slots from the seeded template definition
const PHOTO_GRID_SLOTS: GridSlot[] = (() => {
  const GAP = 8;
  const PADDING = 20;
  const CELL_W = 400;
  const CELL_H = 400;
  const slots: GridSlot[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      slots.push({
        id: `photo-${idx + 1}`,
        label: `Photo ${idx + 1}`,
        x: PADDING + col * (CELL_W + GAP),
        y: PADDING + row * (CELL_H + GAP),
        w: CELL_W,
        h: CELL_H,
      });
    }
  }
  return slots;
})();

const PHOTO_GRID_CANVAS = { width: 1260, height: 1420 };

export default function EditorPage() {
  const { canCheckout, missingSlots, layers, selectedTemplate, setSize } = useEditorStore();
  const [selectedSize, setSelectedSize] = useState<CanvasSize>(CANVAS_SIZES[1]);
  const [gridPhotos, setGridPhotos] = useState<Record<string, boolean>>({});
  const canvasRef = useRef<any>(null); // Type stripped for dynamic import ref compatibility

  // Sync initial size
  React.useEffect(() => {
    setSize({
      id: selectedSize.id,
      label: selectedSize.name,
      widthCm: selectedSize.widthCm,
      heightCm: selectedSize.heightCm,
      priceDelta: 0
    });
  }, [selectedSize, setSize]);

  const router = useRouter();

  const isGridTemplate = selectedTemplate?.templateKey
    ? GRID_TEMPLATE_KEYS.includes(selectedTemplate.templateKey)
    : false;

  const checkout = canCheckout();
  const missing = missingSlots();
  const hasBlockedDpi = layers.some((l) => l.type === 'image' && (l as any).dpiStatus === 'blocked');

  // For grid template: all 9 slots must be filled
  const gridFilledCount = Object.keys(gridPhotos).length;
  const gridReady = isGridTemplate ? gridFilledCount === 9 : true;

  const checkoutMessage = () => {
    if (isGridTemplate) {
      if (gridFilledCount < 9) return `${9 - gridFilledCount} photo(s) manquante(s) dans la grille`;
      return null;
    }
    if (hasBlockedDpi) return 'Qualité insuffisante sur certaines photos';
    if (missing.length > 0) return `Photos manquantes : ${missing.join(', ')}`;
    return null;
  };

  const canOrder = isGridTemplate ? gridReady : checkout;

  const handleOrder = () => {
    if (!canOrder) return;
    router.push('/checkout');
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
          {selectedTemplate && (
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-1.5">
              {isGridTemplate ? <Grid className="w-3.5 h-3.5 text-blue-500" /> : <Layout className="w-3.5 h-3.5 text-purple-500" />}
              <span className="font-medium">{selectedTemplate.name}</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-full mx-auto p-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">

          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">

            {/* Size Selector — hidden for grid (has fixed size) */}
            {!isGridTemplate && (
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-sm font-bold mb-3 text-gray-700">Format</h2>
                <div className="space-y-1.5">
                  {CANVAS_SIZES.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
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
            )}

            {/* Grid size info */}
            {isGridTemplate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h2 className="text-sm font-bold mb-1 text-blue-800 flex items-center gap-1.5">
                  <Grid className="w-4 h-4" /> Grille 9 Photos
                </h2>
                <p className="text-xs text-blue-600">Format : 40×50 cm — 300 DPI</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${gridFilledCount === 9 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${(gridFilledCount / 9) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-blue-700">{gridFilledCount}/9</span>
                </div>
              </div>
            )}

            {/* Photo Upload Panel — standard editor only */}
            {!isGridTemplate && (
              <div className="bg-white rounded-lg shadow p-4 flex-1">
                <h2 className="text-sm font-bold mb-3 text-gray-700">Photos</h2>
                <ImageUploadPanel
                  printWidthCm={selectedSize.widthCm}
                  printHeightCm={selectedSize.heightCm}
                />
              </div>
            )}
          </div>

          {/* Canvas / Grid Area */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <div className="bg-white rounded-lg shadow p-4 flex-1">
              {isGridTemplate ? (
                /* ── 9-Photo Grid Editor ── */
                <div className="overflow-auto">
                  <PhotoGridEditor
                    slots={PHOTO_GRID_SLOTS}
                    canvasWidthPx={PHOTO_GRID_CANVAS.width}
                    canvasHeightPx={PHOTO_GRID_CANVAS.height}
                    printWidthCm={40}
                    printHeightCm={50}
                    onPhotosChange={(slotId, image) => {
                      setGridPhotos((prev) => {
                        const next = { ...prev };
                        if (image) next[slotId] = true;
                        else delete next[slotId];
                        return next;
                      });
                    }}
                  />
                </div>
              ) : (
                /* ── Standard Konva Canvas Editor ── */
                <div className="flex justify-center overflow-auto max-h-[65vh]">
                  <CanvasEditor
                    ref={canvasRef}
                    width={selectedSize.width}
                    height={selectedSize.height}
                    dpi={selectedSize.dpi}
                  />
                </div>
              )}
            </div>

            {/* ── Checkout Bar ── */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {canOrder ? (
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
                  disabled={!canOrder}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all ${canOrder
                    ? 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  onClick={handleOrder}
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
