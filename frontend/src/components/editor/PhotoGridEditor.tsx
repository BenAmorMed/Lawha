'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Plus, X, ImageIcon } from 'lucide-react';
import { UploadedImage } from '@/store/editorStore';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface GridSlot {
    id: string;
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

interface PhotoGridEditorProps {
    slots: GridSlot[];
    canvasWidthPx: number;
    canvasHeightPx: number;
    printWidthCm?: number;
    printHeightCm?: number;
    onPhotosChange?: (slotId: string, image: UploadedImage | null) => void;
}

interface SlotState {
    image: UploadedImage | null;
    uploading: boolean;
    error: string | null;
}

export const PhotoGridEditor: React.FC<PhotoGridEditorProps> = ({
    slots,
    canvasWidthPx,
    canvasHeightPx,
    printWidthCm = 40,
    printHeightCm = 50,
    onPhotosChange,
}) => {
    const [slotStates, setSlotStates] = useState<Record<string, SlotState>>(
        Object.fromEntries(slots.map((s) => [s.id, { image: null, uploading: false, error: null }]))
    );

    // Refs for hidden file inputs per slot
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const { token, logout } = useAuthStore();

    const uploadToSlot = useCallback(async (slotId: string, file: File) => {
        setSlotStates((prev) => ({
            ...prev,
            [slotId]: { ...prev[slotId], uploading: true, error: null },
        }));

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('printWidthCm', String(printWidthCm));
            formData.append('printHeightCm', String(printHeightCm));

            const res = await apiClient.post('/images/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const data = res.data;
            const image: UploadedImage = {
                id: data.id,
                originalUrl: data.originalUrl,
                thumbUrl: data.thumbUrl,
                widthPx: data.widthPx,
                heightPx: data.heightPx,
                dpiStatus: data.quality?.status ?? 'ok',
                effectiveDpi: data.quality?.effectiveDpi ?? 0,
            };

            setSlotStates((prev) => ({
                ...prev,
                [slotId]: { image, uploading: false, error: null },
            }));
            onPhotosChange?.(slotId, image);
        } catch (err: any) {
            setSlotStates((prev) => ({
                ...prev,
                [slotId]: { ...prev[slotId], uploading: false, error: err.message },
            }));
        }
    }, [printWidthCm, printHeightCm, onPhotosChange, token]);

    const handleFileChange = useCallback((slotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadToSlot(slotId, file);
        // Reset input
        e.target.value = '';
    }, [uploadToSlot]);

    const handleDrop = useCallback((slotId: string, e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            uploadToSlot(slotId, file);
        }
    }, [uploadToSlot]);

    const handleRemove = useCallback((slotId: string) => {
        setSlotStates((prev) => ({
            ...prev,
            [slotId]: { image: null, uploading: false, error: null },
        }));
        onPhotosChange?.(slotId, null);
    }, [onPhotosChange]);

    const filledCount = Object.values(slotStates).filter((s) => s.image !== null).length;
    const totalCount = slots.length;

    // Scale slots to fit display (max ~800px wide)
    const DISPLAY_MAX_W = 760;
    const scale = DISPLAY_MAX_W / canvasWidthPx;

    return (
        <div className="flex flex-col gap-4">
            {/* Progress */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${filledCount === totalCount ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${(filledCount / totalCount) * 100}%` }}
                    />
                </div>
                <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                    {filledCount}/{totalCount} photos
                </span>
            </div>

            {/* Grid preview area */}
            <div
                className="relative bg-white border border-gray-200 rounded-lg overflow-hidden mx-auto shadow-inner"
                style={{
                    width: canvasWidthPx * scale,
                    height: canvasHeightPx * scale,
                }}
            >
                {slots.map((slot) => {
                    const state = slotStates[slot.id];
                    const isDpiBlocked = state.image?.dpiStatus === 'blocked';
                    const isDpiWarning = state.image?.dpiStatus === 'warning';

                    return (
                        <div
                            key={slot.id}
                            className={`absolute group cursor-pointer border-2 rounded overflow-hidden transition-all ${state.image
                                ? isDpiBlocked
                                    ? 'border-red-400'
                                    : isDpiWarning
                                        ? 'border-yellow-400'
                                        : 'border-green-400'
                                : 'border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                            style={{
                                left: slot.x * scale,
                                top: slot.y * scale,
                                width: slot.w * scale,
                                height: slot.h * scale,
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => handleDrop(slot.id, e)}
                            onClick={() => !state.uploading && fileInputRefs.current[slot.id]?.click()}
                        >
                            {/* Hidden input */}
                            <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/tiff"
                                className="hidden"
                                ref={(el) => { fileInputRefs.current[slot.id] = el; }}
                                onChange={(e) => handleFileChange(slot.id, e)}
                            />

                            {state.uploading ? (
                                /* Uploading spinner */
                                <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500" />
                                </div>
                            ) : state.image ? (
                                /* Image preview */
                                <div className="relative w-full h-full">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={state.image.thumbUrl || state.image.originalUrl}
                                        alt={slot.label}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Hover overlay with remove button */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            className="bg-white text-gray-700 rounded-full p-1.5 hover:bg-red-50 hover:text-red-600 transition-colors"
                                            onClick={(e) => { e.stopPropagation(); handleRemove(slot.id); }}
                                            title="Supprimer"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            className="bg-white text-gray-700 rounded-full p-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                            onClick={(e) => { e.stopPropagation(); fileInputRefs.current[slot.id]?.click(); }}
                                            title="Remplacer"
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    {/* DPI indicator */}
                                    {(isDpiBlocked || isDpiWarning) && (
                                        <div className={`absolute bottom-0.5 left-0.5 right-0.5 text-center text-[8px] font-bold px-1 py-0.5 rounded ${isDpiBlocked ? 'bg-red-500 text-white' : 'bg-yellow-400 text-yellow-900'}`}>
                                            {isDpiBlocked ? '⚠ Résolution faible' : '~ Qualité moyenne'}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* Empty slot */
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-1">
                                    {state.error ? (
                                        <>
                                            <X className="w-5 h-5 text-red-400" />
                                            <span className="text-[9px] text-red-400 text-center px-1 leading-tight">{state.error}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            <span className="text-[9px] text-center leading-tight">{slot.label}</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Tips */}
            {filledCount < totalCount && (
                <p className="text-xs text-gray-400 text-center">
                    Cliquez sur une cellule ou glissez une photo pour la placer.
                </p>
            )}
            {filledCount === totalCount && (
                <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium">
                    <span>✅ Toutes les photos sont placées !</span>
                </div>
            )}
        </div>
    );
};

export default PhotoGridEditor;
