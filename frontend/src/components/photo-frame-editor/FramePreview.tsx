import React from 'react';
import { Photo, FrameConfig, TextCustomization } from '@/types/frame';
import Image from 'next/image';

interface FramePreviewProps {
  photos: (Photo | null)[];
  frameConfig: FrameConfig;
  textCustomization: TextCustomization;
}

const FramePreview: React.FC<FramePreviewProps> = ({ photos, frameConfig, textCustomization }) => {
  const getFrameColor = (color: string) => {
    switch (color) {
      case 'black': return 'border-black bg-black';
      case 'white': return 'border-gray-200 bg-white shadow-sm';
      case 'wood': return 'border-[#8B4513] bg-[#A0522D]';
      case 'gold': return 'border-[#D4AF37] bg-[#FFD700]';
      default: return 'border-gray-200';
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto">
      {/* Frame Border */}
      <div className={`p-6 sm:p-8 rounded-sm shadow-xl transition-colors duration-300 ${getFrameColor(frameConfig.color)} border-[12px] md:border-[20px]`}>
        {/* Photo Grid (3x3) */}
        <div className="bg-white p-4">
          <div className="grid grid-cols-3 gap-2 bg-gray-100 aspect-square w-full max-w-[400px]">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="relative aspect-square bg-white border border-gray-100 flex items-center justify-center overflow-hidden">
                {photos[i] ? (
                  <Image
                    src={photos[i]!.url}
                    alt={`Photo ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-gray-300">Slot {i + 1}</span>
                )}
              </div>
            ))}
          </div>

          {/* Text Area Below Grid */}
          <div className="mt-6 text-center">
            <h3 className="font-playfair text-xl md:text-2xl font-bold text-dark">
              {textCustomization.firstName} {textCustomization.secondName ? `& ${textCustomization.secondName}` : ''}
            </h3>
            {textCustomization.date && (
              <p className="font-poppins text-xs text-gray-500 mt-1 uppercase tracking-widest">
                {textCustomization.date}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Size Badge */}
      <div className="mt-4 bg-secondary px-3 py-1 rounded-full text-[10px] font-bold text-gray-500 uppercase">
        {frameConfig.size}
      </div>
    </div>
  );
};

export default FramePreview;
