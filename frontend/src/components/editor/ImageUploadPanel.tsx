'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useEditorStore, UploadedImage } from '@/store/editorStore';
import { DpiBadge } from './DpiBadge';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ImageUploadPanelProps {
    printWidthCm?: number;
    printHeightCm?: number;
}

export const ImageUploadPanel: React.FC<ImageUploadPanelProps> = ({
    printWidthCm = 30,
    printHeightCm = 40,
}) => {
    const { uploadedImages, addUploadedImage, addImageToSlot, selectedTemplate, layers } =
        useEditorStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasBlockedImages = layers.some(
        (l) => l.type === 'image' && (l as any).dpiStatus === 'blocked',
    );

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setError(null);

        for (const file of Array.from(files)) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('printWidthCm', String(printWidthCm));
                formData.append('printHeightCm', String(printHeightCm));

                const token = localStorage.getItem('auth_token') || '';
                const res = await fetch(`${API_BASE}/api/v1/images/upload`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });

                if (!res.ok) throw new Error('Échec du téléchargement');

                const data = await res.json();

                const uploadedImage: UploadedImage = {
                    id: data.id,
                    originalUrl: data.originalUrl,
                    thumbUrl: data.thumbUrl,
                    widthPx: data.widthPx,
                    heightPx: data.heightPx,
                    dpiStatus: data.quality.status,
                    effectiveDpi: data.quality.effectiveDpi,
                };

                addUploadedImage(uploadedImage);
            } catch (err: any) {
                setError(err.message || 'Erreur lors du téléchargement');
            }
        }

        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleDropToSlot = (slotId: string, image: UploadedImage) => {
        addImageToSlot(slotId, image);
    };

    return (
        <div className="flex flex-col gap-3 h-full">
            {/* Warning banner if blocked images in canvas */}
            {hasBlockedImages && (
                <div className="flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-300 rounded text-red-700 text-xs">
                    <span className="text-base">⚠️</span>
                    <span>
                        Certaines photos ont une résolution insuffisante. Le checkout sera bloqué tant
                        qu&apos;elles sont utilisées.
                    </span>
                </div>
            )}

            {/* Upload zone */}
            <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    if (fileInputRef.current) {
                        const dt = new DataTransfer();
                        Array.from(e.dataTransfer.files).forEach((f) => dt.items.add(f));
                        fileInputRef.current.files = dt.files;
                        fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/tiff"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />
                <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                <p className="text-xs text-gray-500">
                    {uploading ? 'Téléchargement…' : 'Cliquer ou glisser vos photos ici'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, WebP, TIFF · Max 50 MB</p>
            </div>

            {error && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" /> {error}
                </p>
            )}

            {/* Image pool */}
            {uploadedImages.length > 0 && (
                <div className="flex-1 overflow-y-auto">
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                        Photos ({uploadedImages.length})
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        {uploadedImages.map((img) => (
                            <div key={img.id} className="flex flex-col gap-1">
                                {/* Thumbnail — draggable onto a slot */}
                                <div
                                    className="aspect-square bg-gray-100 rounded overflow-hidden cursor-grab border border-gray-200 hover:border-blue-400 transition-colors"
                                    draggable
                                    onDragStart={(e) => e.dataTransfer.setData('imageId', img.id)}
                                    onClick={() => {
                                        // If template has exactly one slot, auto-assign
                                        if (selectedTemplate?.definition.slots.length === 1) {
                                            handleDropToSlot(selectedTemplate.definition.slots[0].id, img);
                                        }
                                    }}
                                >
                                    {img.thumbUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={img.thumbUrl}
                                            alt="Aperçu"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                {/* DPI Badge */}
                                <DpiBadge
                                    status={img.dpiStatus}
                                    effectiveDpi={img.effectiveDpi}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {uploadedImages.length === 0 && !uploading && (
                <p className="text-xs text-gray-400 text-center mt-2">Aucune photo téléchargée</p>
            )}
        </div>
    );
};

export default ImageUploadPanel;
