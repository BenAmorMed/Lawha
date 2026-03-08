import React, { useRef, useState } from 'react';
import { Photo } from '@/types/frame';
import { Upload, X, Trash2, GripVertical, Plus } from 'lucide-react';
import Image from 'next/image';

interface PhotoGridProps {
  photos: (Photo | null)[];
  onPhotoUpload: (index: number, file: File) => void;
  onPhotoRemove: (index: number) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onPhotoUpload, onPhotoRemove, onReorder }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeIndexRef = useRef<number | null>(null);

  const handleUploadClick = (index: number) => {
    activeIndexRef.current = index;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeIndexRef.current !== null) {
      onPhotoUpload(activeIndexRef.current, file);
      e.target.value = '';
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    onReorder(draggedIndex, index);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, index) => (
          <div
            key={index}
            draggable={!!photo}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative aspect-square rounded-lg border-2 border-dashed border-gray-200 overflow-hidden group transition-all duration-300 ${
              photo ? 'border-solid border-primary/20' : 'hover:border-primary/50 bg-gray-50'
            }`}
          >
            {photo ? (
              <>
                <Image
                  src={photo.url}
                  alt={`Slot ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleUploadClick(index)}
                    className="p-1.5 bg-white rounded-full text-dark hover:text-primary transition-colors"
                    title="Change Photo"
                  >
                    <Upload size={14} />
                  </button>
                  <button
                    onClick={() => onPhotoRemove(index)}
                    className="p-1.5 bg-white rounded-full text-dark hover:text-red-500 transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="p-1.5 bg-white rounded-full text-dark cursor-grab active:cursor-grabbing">
                    <GripVertical size={14} />
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={() => handleUploadClick(index)}
                className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:text-primary gap-1"
              >
                <Plus size={20} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Upload</span>
              </button>
            )}

            <span className="absolute bottom-1 left-1 bg-black/30 text-white text-[8px] font-bold px-1.5 rounded-sm">
              {index + 1}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoGrid;
