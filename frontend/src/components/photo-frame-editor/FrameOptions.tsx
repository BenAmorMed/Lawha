import React from 'react';
import { FrameColor, FrameSize } from '@/types/frame';
import { Check } from 'lucide-react';

interface FrameOptionsProps {
  color: FrameColor;
  size: FrameSize;
  onColorChange: (color: FrameColor) => void;
  onSizeChange: (size: FrameSize) => void;
}

const FrameOptions: React.FC<FrameOptionsProps> = ({ color, size, onColorChange, onSizeChange }) => {
  const colors: { value: FrameColor; label: string; hex: string }[] = [
    { value: 'black', label: 'Black', hex: 'bg-black' },
    { value: 'white', label: 'White', hex: 'bg-white border-gray-200 shadow-sm' },
    { value: 'wood', label: 'Wood', hex: 'bg-[#8B4513]' },
    { value: 'gold', label: 'Gold', hex: 'bg-[#D4AF37]' },
  ];

  const sizes: { value: FrameSize; label: string }[] = [
    { value: '16x18cm', label: '16 x 18 cm' },
    { value: '21x30cm', label: '21 x 30 cm' },
    { value: '30x40cm', label: '30 x 40 cm' },
    { value: '50x70cm', label: '50 x 70 cm' },
  ];

  return (
    <div className="space-y-10">
      {/* Color Selection */}
      <section>
        <h3 className="font-bold text-dark mb-4 text-sm uppercase tracking-wider">Choose Frame Color</h3>
        <div className="flex flex-wrap gap-4">
          {colors.map((c) => (
            <button
              key={c.value}
              onClick={() => onColorChange(c.value)}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                  color === c.value ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'
                } ${c.hex}`}
              >
                {color === c.value && (
                  <Check size={20} className={c.value === 'white' ? 'text-dark' : 'text-white'} />
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase transition-colors ${
                color === c.value ? 'text-primary' : 'text-gray-400 group-hover:text-dark'
              }`}>
                {c.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Size Selection */}
      <section>
        <h3 className="font-bold text-dark mb-4 text-sm uppercase tracking-wider">Choose Frame Size</h3>
        <div className="grid grid-cols-2 gap-3">
          {sizes.map((s) => (
            <button
              key={s.value}
              onClick={() => onSizeChange(s.value)}
              className={`px-4 py-3 rounded-md border-2 text-sm font-bold transition-all text-center ${
                size === s.value
                  ? 'border-primary bg-primary/5 text-primary shadow-sm'
                  : 'border-gray-100 bg-white text-gray-500 hover:border-gray-300 hover:text-dark'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FrameOptions;
