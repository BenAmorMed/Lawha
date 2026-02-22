// store/editorStore.ts  –  Global editor state via Zustand
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

// -------------------------------------------------------
// Types
// -------------------------------------------------------
export interface ImageLayer {
  id: string;
  type: 'image';
  slotId: string;
  src: string;           // S3 URL
  thumbSrc?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
  rotation: number;
  cropX?: number;
  cropY?: number;
  cropW?: number;
  cropH?: number;
  naturalWidth: number;
  naturalHeight: number;
}

export interface TextLayer {
  id: string;
  type: 'text';
  slotId: string;
  content: string;
  font: string;
  size: number;
  color: string;
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  x: number;
  y: number;
  maxChars?: number;
}

export type Layer = ImageLayer | TextLayer;

export interface SlotDefinition {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'image' | 'text';
  required?: boolean;
  maxChars?: number;
  defaultFont?: string;
  align?: string;
}

export interface TemplateDefinition {
  templateId: string;
  canvasSize: { width: number; height: number };
  dpi: number;
  slots: SlotDefinition[];
}

export interface ProductSize {
  id: string;
  label: string;
  widthCm: number;
  heightCm: number;
  price: number;
}

export interface FrameOption {
  id: string;
  label: string;
  colorHex?: string;
  material: string;
  priceDelta: number;
}

export interface QualityReport {
  widthPx: number;
  heightPx: number;
  effectiveDpi?: number;
  requiredDpi: number;
  dpiOk: boolean;
  blurRisk: 'none' | 'low' | 'medium' | 'high';
  warnings: string[];
  errors: string[];
}

export interface UploadedImage {
  imageId: string;
  originalUrl: string;
  thumbUrl: string;
  quality: QualityReport;
  blocked: boolean;
  slotId?: string;        // which slot it's assigned to
}

// -------------------------------------------------------
// Store shape
// -------------------------------------------------------
interface EditorStore {
  // Product selection
  productId: string | null;
  selectedSize: ProductSize | null;
  selectedFrame: FrameOption | null;
  template: TemplateDefinition | null;

  // Canvas state
  layers: Layer[];
  selectedLayerId: string | null;
  canvasScale: number;   // viewport zoom (not print DPI)

  // Uploaded images pool
  uploadedImages: UploadedImage[];

  // UI state
  activePanel: 'templates' | 'images' | 'text' | 'size' | 'frame';
  isSaving: boolean;
  isDirty: boolean;
  previewUrl: string | null;

  // Actions
  setProduct: (productId: string, sizes: ProductSize[], frames: FrameOption[]) => void;
  setSize: (size: ProductSize) => void;
  setFrame: (frame: FrameOption) => void;
  setTemplate: (template: TemplateDefinition) => void;

  addImageToSlot: (slotId: string, uploadedImage: UploadedImage) => void;
  updateImageLayer: (id: string, updates: Partial<ImageLayer>) => void;
  updateTextLayer: (id: string, updates: Partial<TextLayer>) => void;
  removeLayer: (id: string) => void;

  addUploadedImage: (image: UploadedImage) => void;
  removeUploadedImage: (imageId: string) => void;

  setSelectedLayer: (id: string | null) => void;
  setCanvasScale: (scale: number) => void;
  setActivePanel: (panel: EditorStore['activePanel']) => void;
  setPreviewUrl: (url: string) => void;
  setIsSaving: (saving: boolean) => void;

  getDesignJson: () => object;
  canCheckout: () => boolean;
  missingSlots: () => string[];
}

// -------------------------------------------------------
// Store implementation
// -------------------------------------------------------
export const useEditorStore = create<EditorStore>()(
  immer((set, get) => ({
    productId: null,
    selectedSize: null,
    selectedFrame: null,
    template: null,
    layers: [],
    selectedLayerId: null,
    canvasScale: 1,
    uploadedImages: [],
    activePanel: 'templates',
    isSaving: false,
    isDirty: false,
    previewUrl: null,

    setProduct: (productId, sizes, frames) =>
      set((state) => {
        state.productId = productId;
        state.selectedSize = sizes[0] || null;
        state.selectedFrame = frames[0] || null;
      }),

    setSize: (size) =>
      set((state) => {
        state.selectedSize = size;
        state.isDirty = true;
      }),

    setFrame: (frame) =>
      set((state) => {
        state.selectedFrame = frame;
        state.isDirty = true;
      }),

    setTemplate: (template) =>
      set((state) => {
        state.template = template;
        // Initialize text layers for required text slots
        const textLayers: TextLayer[] = template.slots
          .filter((s) => s.type === 'text')
          .map((s) => ({
            id: `text-${s.id}`,
            type: 'text' as const,
            slotId: s.id,
            content: '',
            font: s.defaultFont || 'Montserrat',
            size: 48,
            color: '#000000',
            bold: false,
            italic: false,
            align: (s.align as 'left' | 'center' | 'right') || 'center',
            x: s.x || 0,
            y: s.y || 0,
            maxChars: s.maxChars,
          }));
        state.layers = textLayers;
        state.isDirty = true;
      }),

    addImageToSlot: (slotId, uploadedImage) =>
      set((state) => {
        const template = state.template;
        if (!template) return;
        const slot = template.slots.find((s) => s.id === slotId);
        if (!slot) return;

        // Remove existing image layer for this slot
        state.layers = state.layers.filter(
          (l) => !(l.type === 'image' && l.slotId === slotId),
        );

        const newLayer: ImageLayer = {
          id: `img-${slotId}-${Date.now()}`,
          type: 'image',
          slotId,
          src: uploadedImage.originalUrl,
          thumbSrc: uploadedImage.thumbUrl,
          x: slot.x,
          y: slot.y,
          width: slot.w,
          height: slot.h,
          scale: 1,
          rotation: 0,
          naturalWidth: uploadedImage.quality.widthPx,
          naturalHeight: uploadedImage.quality.heightPx,
        };

        state.layers.push(newLayer);
        state.isDirty = true;
      }),

    updateImageLayer: (id, updates) =>
      set((state) => {
        const idx = state.layers.findIndex((l) => l.id === id);
        if (idx >= 0) Object.assign(state.layers[idx], updates);
        state.isDirty = true;
      }),

    updateTextLayer: (id, updates) =>
      set((state) => {
        const idx = state.layers.findIndex((l) => l.id === id);
        if (idx >= 0) Object.assign(state.layers[idx], updates);
        state.isDirty = true;
      }),

    removeLayer: (id) =>
      set((state) => {
        state.layers = state.layers.filter((l) => l.id !== id);
        if (state.selectedLayerId === id) state.selectedLayerId = null;
        state.isDirty = true;
      }),

    addUploadedImage: (image) =>
      set((state) => {
        state.uploadedImages.push(image);
      }),

    removeUploadedImage: (imageId) =>
      set((state) => {
        state.uploadedImages = state.uploadedImages.filter(
          (i) => i.imageId !== imageId,
        );
      }),

    setSelectedLayer: (id) =>
      set((state) => { state.selectedLayerId = id; }),

    setCanvasScale: (scale) =>
      set((state) => { state.canvasScale = scale; }),

    setActivePanel: (panel) =>
      set((state) => { state.activePanel = panel; }),

    setPreviewUrl: (url) =>
      set((state) => { state.previewUrl = url; }),

    setIsSaving: (saving) =>
      set((state) => { state.isSaving = saving; }),

    getDesignJson: () => {
      const { template, selectedSize, layers } = get();
      return {
        templateId: template?.templateId,
        productSizeId: selectedSize?.id,
        canvasWidth: template?.canvasSize.width,
        canvasHeight: template?.canvasSize.height,
        dpi: template?.dpi || 300,
        layers,
      };
    },

    canCheckout: () => {
      const { template, layers } = get();
      if (!template) return false;
      const missing = get().missingSlots();
      return missing.length === 0;
    },

    missingSlots: () => {
      const { template, layers } = get();
      if (!template) return [];
      return template.slots
        .filter((slot) => slot.required)
        .filter((slot) => {
          if (slot.type === 'image') {
            return !layers.some((l) => l.type === 'image' && l.slotId === slot.id);
          }
          if (slot.type === 'text') {
            const textLayer = layers.find(
              (l) => l.type === 'text' && l.slotId === slot.id,
            ) as TextLayer | undefined;
            return !textLayer || !textLayer.content.trim();
          }
          return false;
        })
        .map((s) => s.id);
    },
  })),
);
