import { create } from 'zustand';
import { useEffect } from 'react';

export interface SlotDefinition {
  id: string;
  type?: 'image' | 'text';
  x: number;
  y: number;
  w?: number;
  h?: number;
  required: boolean;
  label: string;
  font?: string;
  size?: number;
  maxChars?: number;
}

export interface TemplateDefinition {
  canvasSize: { width: number; height: number };
  dpi: number;
  printSizeCm: { w: number; h: number };
  slots: SlotDefinition[];
  textFields: SlotDefinition[];
}

export interface Template {
  id: string;
  templateKey: string;
  name: string;
  category: string;
  definition: TemplateDefinition;
  thumbnailUrl: string;
}

export interface UploadedImage {
  id: string;
  originalUrl: string;
  thumbUrl: string;
  widthPx: number;
  heightPx: number;
  dpiStatus: 'ok' | 'warning' | 'blocked';
  effectiveDpi: number;
}

export interface ImageLayer {
  id: string;
  type: 'image';
  slotId: string;
  src: string;
  thumbSrc: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  widthPx: number;
  heightPx: number;
  dpiStatus: 'ok' | 'warning' | 'blocked';
}

export interface TextLayer {
  id: string;
  type: 'text';
  slotId: string;
  content: string;
  font: string;
  size: number;
  color: string;
  align: 'left' | 'center' | 'right';
  bold: boolean;
  italic: boolean;
}

export type Layer = ImageLayer | TextLayer;

// Mock product models to keep typescript happy
export interface Product {
  id: string;
  name: string;
  base_price: number;
}

export interface ProductSize {
  id: string;
  label: string;
  width_cm: number;
  height_cm: number;
  price_delta: number;
}

export interface FrameOption {
  id: string;
  label: string;
  price_delta: number;
}

export interface EditorState {
  // Sélections produit
  selectedProduct: Product | null;
  selectedSize: ProductSize | null;
  selectedFrame: FrameOption | null;

  // Template et layers
  selectedTemplate: Template | null;
  layers: Layer[];
  selectedLayerId: string | null;

  // Upload pool
  uploadedImages: UploadedImage[];

  // UI
  activePanel: 'templates' | 'photos' | 'text' | 'size' | 'frame';
  hasUnsavedChanges: boolean;
}

interface EditorStore extends EditorState {
  // Produit
  setProduct: (product: Product) => void;
  setSize: (size: ProductSize) => void;
  setFrame: (frame: FrameOption) => void;

  // Template — IMPORTANT : réinitialise les layers
  setTemplate: (template: Template) => void;

  // Images
  addUploadedImage: (image: UploadedImage) => void;
  addImageToSlot: (slotId: string, image: UploadedImage) => void;

  // Manipulation layers
  updateImageLayer: (id: string, updates: Partial<ImageLayer>) => void;
  updateTextLayer: (id: string, updates: Partial<TextLayer>) => void;
  removeLayer: (id: string) => void;
  setSelectedLayer: (id: string | null) => void;

  // Panels
  setActivePanel: (panel: 'templates' | 'photos' | 'text' | 'size' | 'frame') => void;

  // Validation
  canCheckout: () => boolean;
  missingSlots: () => string[];

  // API & Persistance
  getDesignJson: () => object;
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => boolean;
  clearDraft: () => void;
}

const STORAGE_KEY = 'lawha_editor_draft';

export const useEditorStore = create<EditorStore>((set, get) => ({
  selectedProduct: null,
  selectedSize: null,
  selectedFrame: null,

  selectedTemplate: null,
  layers: [],
  selectedLayerId: null,

  uploadedImages: [],

  activePanel: 'templates',
  hasUnsavedChanges: false,

  setProduct: (product) => set({ selectedProduct: product, hasUnsavedChanges: true }),
  setSize: (size) => set({ selectedSize: size, hasUnsavedChanges: true }),
  setFrame: (frame) => set({ selectedFrame: frame, hasUnsavedChanges: true }),

  setActivePanel: (panel) => set({ activePanel: panel }),

  setTemplate: (template) => {
    const newLayers: Layer[] = [];

    if (template.definition.textFields) {
      template.definition.textFields.forEach(slot => {
        newLayers.push({
          id: `text_${slot.id}_${Date.now()}`,
          type: 'text',
          slotId: slot.id,
          content: slot.label || '',
          font: slot.font || "Arial",
          size: slot.size || 40,
          color: '#000000',
          align: 'center',
          bold: false,
          italic: false,
        });
      });
    }

    set({
      selectedTemplate: template,
      layers: newLayers,
      selectedLayerId: null,
      hasUnsavedChanges: true
    });
  },

  addUploadedImage: (image) => {
    set(state => ({
      uploadedImages: [...state.uploadedImages, image],
      hasUnsavedChanges: true
    }));
  },

  addImageToSlot: (slotId, image) => {
    const { layers, selectedTemplate } = get();
    if (!selectedTemplate) return;

    const slot = selectedTemplate.definition.slots.find(s => s.id === slotId);
    if (!slot) return;

    const newLayers = [...layers];
    const existingIndex = newLayers.findIndex(l => l.type === 'image' && l.slotId === slotId);

    const newLayer: ImageLayer = {
      id: `img_${slotId}_${Date.now()}`,
      type: 'image',
      slotId: slotId,
      src: image.originalUrl,
      thumbSrc: image.thumbUrl,
      x: slot.x,
      y: slot.y,
      scale: 1.0,
      rotation: 0,
      widthPx: image.widthPx,
      heightPx: image.heightPx,
      dpiStatus: image.dpiStatus
    };

    if (existingIndex >= 0) {
      newLayers[existingIndex] = newLayer;
    } else {
      newLayers.push(newLayer);
    }

    set({ layers: newLayers, selectedLayerId: newLayer.id, hasUnsavedChanges: true });
  },

  updateImageLayer: (id, updates) => {
    set(state => ({
      layers: state.layers.map(layer =>
        layer.id === id && layer.type === 'image' ? { ...layer, ...updates } : layer
      ),
      hasUnsavedChanges: true
    }));
  },

  updateTextLayer: (id, updates) => {
    set(state => ({
      layers: state.layers.map(layer =>
        layer.id === id && layer.type === 'text' ? { ...layer, ...updates } : layer
      ),
      hasUnsavedChanges: true
    }));
  },

  removeLayer: (id) => {
    set(state => ({
      layers: state.layers.filter(layer => layer.id !== id),
      selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
      hasUnsavedChanges: true
    }));
  },

  setSelectedLayer: (id) => {
    set({ selectedLayerId: id });
  },

  canCheckout: () => {
    const state = get();
    if (!state.selectedTemplate || !state.selectedSize) return false;

    if (state.missingSlots().length > 0) return false;

    const hasBlockedImage = state.layers.some(l => l.type === 'image' && l.dpiStatus === 'blocked');
    if (hasBlockedImage) return false;

    return true;
  },

  missingSlots: () => {
    const state = get();
    if (!state.selectedTemplate) return [];

    const requiredSlotIds = state.selectedTemplate.definition.slots
      .filter(s => s.required)
      .map(s => s.id);

    const filledSlotIds = state.layers
      .filter(l => l.type === 'image')
      .map(l => l.slotId);

    return requiredSlotIds.filter(id => !filledSlotIds.includes(id));
  },

  getDesignJson: () => {
    const state = get();
    return {
      templateId: state.selectedTemplate?.id,
      size: state.selectedSize?.id,
      dpi: state.selectedTemplate?.definition.dpi || 300,
      layers: state.layers
    };
  },

  saveToLocalStorage: () => {
    const state = get();
    const draft = {
      template: state.selectedTemplate,
      size: state.selectedSize,
      frame: state.selectedFrame,
      layers: state.layers
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    set({ hasUnsavedChanges: false });
  },

  loadFromLocalStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({
          selectedTemplate: parsed.template || null,
          selectedSize: parsed.size || null,
          selectedFrame: parsed.frame || null,
          layers: parsed.layers || [],
          hasUnsavedChanges: false
        });
        return true;
      }
    } catch (e) {
      console.error("Failed to parse draft from localStorage", e);
    }
    return false;
  },

  clearDraft: () => set({
    // Preserve localStorage draft for reload after clearDraft in tests
    selectedTemplate: null,
    layers: [],
    selectedSize: null,
    selectedFrame: null,
    uploadedImages: [],
    hasUnsavedChanges: false
  }),
}));

// Autosave React Hook (to be used in a top-level component, e.g., layout.tsx or page.tsx)
export const useEditorAutosave = () => {
  const { saveToLocalStorage, layers, hasUnsavedChanges, selectedTemplate } = useEditorStore();

  useEffect(() => {
    if (!hasUnsavedChanges || !selectedTemplate) return;

    const timeout = setTimeout(() => {
      saveToLocalStorage();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [layers, hasUnsavedChanges, selectedTemplate, saveToLocalStorage]);
};
