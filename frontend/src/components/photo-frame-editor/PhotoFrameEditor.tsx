'use client';

import React, { useState, useCallback } from 'react';
import { Photo, FrameConfig, TextCustomization, FrameColor, FrameSize } from '@/types/frame';
import PhotoGrid from './PhotoGrid';
import FramePreview from './FramePreview';
import FrameOptions from './FrameOptions';
import TextCustomizer from './TextCustomizer';
import Button from '@/components/ui/Button';
import { Save, ShoppingCart, Download, AlertCircle } from 'lucide-react';
import axios from 'axios';

const PhotoFrameEditor: React.FC = () => {
  // State for 9 photos
  const [photos, setPhotos] = useState<(Photo | null)[]>(Array(9).fill(null));

  // State for frame config
  const [frameConfig, setFrameConfig] = useState<FrameConfig>({
    color: 'black',
    size: '21x30cm',
  });

  // State for text customization
  const [textCustomization, setTextCustomization] = useState<TextCustomization>({
    firstName: '',
    secondName: '',
    date: '',
    giftNote: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoUpload = useCallback((index: number, file: File) => {
    const url = URL.createObjectURL(file);
    const newPhotos = [...photos];
    newPhotos[index] = {
      id: Math.random().toString(36).substr(2, 9),
      url,
      file,
      order: index,
    };
    setPhotos(newPhotos);
    setError(null);
  }, [photos]);

  const handlePhotoRemove = useCallback((index: number) => {
    const newPhotos = [...photos];
    if (newPhotos[index]?.url) {
      URL.revokeObjectURL(newPhotos[index]!.url);
    }
    newPhotos[index] = null;
    setPhotos(newPhotos);
  }, [photos]);

  const handleReorder = useCallback((dragIndex: number, hoverIndex: number) => {
    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[dragIndex];
    newPhotos[dragIndex] = newPhotos[hoverIndex];
    newPhotos[hoverIndex] = draggedPhoto;
    setPhotos(newPhotos);
  }, [photos]);

  const handleSaveDesign = async () => {
    const uploadedPhotosCount = photos.filter(p => p !== null).length;
    if (uploadedPhotosCount < 9) {
      setError(`Please upload all 9 photos before saving. Currently: ${uploadedPhotosCount}/9`);
      return;
    }

    setIsSaving(true);
    try {
      const designData = {
        photos: photos.filter(p => p !== null).map(p => ({
          id: p!.id,
          url: p!.url,
          order: p!.order
        })),
        frameConfig,
        textCustomization,
      };

      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

      if (!token) {
        setError('You must be logged in to save designs.');
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/designs`,
        designData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('Design saved successfully!');
    } catch (err) {
      setError('Failed to save design. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-16 items-start">

        {/* Left Column: Preview */}
        <div className="lg:w-1/2 w-full lg:sticky lg:top-32">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <FramePreview
              photos={photos}
              frameConfig={frameConfig}
              textCustomization={textCustomization}
            />

            <div className="mt-12 flex flex-wrap gap-4 justify-center">
               <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-primary transition-colors">
                 <Download size={16} /> DOWNLOAD PREVIEW
               </button>
               <span className="text-gray-200">|</span>
               <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-primary transition-colors">
                 <Save size={16} /> SAVE TO WISHLIST
               </button>
            </div>
          </div>
        </div>

        {/* Right Column: Controls */}
        <div className="lg:w-1/2 w-full space-y-12">

          {/* Header */}
          <section>
            <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">
              CUSTOM PERSONALIZED GIFT
            </span>
            <h1 className="font-playfair text-4xl font-bold text-dark mb-4">
              3x3 Grid Photo Frame
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed max-w-lg">
              Capture your most precious memories in this elegant 9-photo collage. Perfect for anniversaries, birthdays, or family portraits.
            </p>
          </section>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
              <p className="text-xs font-bold text-red-700 uppercase tracking-wider">{error}</p>
            </div>
          )}

          {/* Photo Grid Section */}
          <section>
            <div className="flex justify-between items-end mb-6">
               <h3 className="font-bold text-dark text-sm uppercase tracking-wider">Upload 9 Photos</h3>
               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                 {photos.filter(p => p !== null).length} / 9 SELECTED
               </span>
            </div>
            <PhotoGrid
              photos={photos}
              onPhotoUpload={handlePhotoUpload}
              onPhotoRemove={handlePhotoRemove}
              onReorder={handleReorder}
            />
            <p className="text-[10px] text-gray-400 mt-3 italic">
              * Recommended photo resolution: 1000x1000px or higher. Drag and drop to reorder.
            </p>
          </section>

          <hr className="border-gray-100" />

          {/* Customization Options */}
          <FrameOptions
            color={frameConfig.color}
            size={frameConfig.size}
            onColorChange={(color) => setFrameConfig({ ...frameConfig, color })}
            onSizeChange={(size) => setFrameConfig({ ...frameConfig, size })}
          />

          <hr className="border-gray-100" />

          {/* Text Personalization */}
          <TextCustomizer
            customization={textCustomization}
            onChange={setTextCustomization}
          />

          {/* Final Actions */}
          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleSaveDesign}
              variant="outline"
              className="flex-1 py-4"
              disabled={isSaving}
            >
              {isSaving ? 'SAVING...' : 'SAVE DESIGN'}
            </Button>
            <Button
              className="flex-1 py-4 flex items-center gap-2 group"
              disabled={isSaving}
            >
              <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
              ADD TO CART
            </Button>
          </div>

          <div className="bg-secondary p-6 rounded-lg">
            <h4 className="font-bold text-dark text-xs uppercase mb-3 tracking-widest">Total Price</h4>
            <div className="flex items-end gap-2">
               <span className="text-3xl font-bold text-primary">$45.00</span>
               <span className="text-xs text-gray-400 line-through mb-1">$59.00</span>
               <span className="ml-auto bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">25% OFF</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">
              * Price includes frame, high-quality photo prints, and personalization. Shipping calculated at checkout.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PhotoFrameEditor;
