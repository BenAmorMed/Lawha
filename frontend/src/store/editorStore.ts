import { create } from 'zustand';

export interface CanvasElement {
  id: string;
  type: 'image' | 'text';
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
  fill?: string;
  fontSize?: number;
}

export interface CanvasProduct {
  productId: string;
  name: string;
  width: number;
  height: number;
  dpi: number;
  selectedSize: string;
  selectedFrame: string;
}

export interface CanvasState {
  // Canvas settings
  product: CanvasProduct | null;
  width: number;
  height: number;
  dpi: number;
  
  // Elements on canvas
  elements: CanvasElement[];
  selectedElementId: string | null;
  
  // Undo/Redo
  history: CanvasElement[][];
  historyStep: number;
}

interface EditorStore extends CanvasState {
  // Setters
  setProduct: (product: CanvasProduct) => void;
  setCanvasSize: (width: number, height: number) => void;
  setDpi: (dpi: number) => void;
  
  // Element management
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;
  setCanvasState: (state: Partial<CanvasState>) => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  // Initial state
  product: null,
  width: 800,
  height: 600,
  dpi: 300,
  elements: [],
  selectedElementId: null,
  history: [[]],
  historyStep: 0,

  // Product actions
  setProduct: (product) => {
    set({ product });
  },

  setCanvasSize: (width, height) => {
    set({ width, height });
  },

  setDpi: (dpi) => {
    set({ dpi });
  },

  // Element management
  addElement: (element) => {
    const { elements, history, historyStep } = get();
    const newElements = [...elements, element];
    
    // Add to history (remove any redo steps)
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    
    set({
      elements: newElements,
      history: newHistory,
      historyStep: newHistory.length - 1,
      selectedElementId: element.id,
    });
  },

  updateElement: (id, updates) => {
    const { elements, history, historyStep } = get();
    const newElements = elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    );
    
    // Add to history
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    
    set({
      elements: newElements,
      history: newHistory,
      historyStep: newHistory.length - 1,
    });
  },

  deleteElement: (id) => {
    const { elements, history, historyStep } = get();
    const newElements = elements.filter((el) => el.id !== id);
    
    // Add to history
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    
    set({
      elements: newElements,
      selectedElementId: null,
      history: newHistory,
      historyStep: newHistory.length - 1,
    });
  },

  selectElement: (id) => {
    set({ selectedElementId: id });
  },

  // Undo/Redo
  undo: () => {
    const { history, historyStep } = get();
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      set({
        elements: history[newStep],
        historyStep: newStep,
        selectedElementId: null,
      });
    }
  },

  redo: () => {
    const { history, historyStep } = get();
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      set({
        elements: history[newStep],
        historyStep: newStep,
        selectedElementId: null,
      });
    }
  },

  clearHistory: () => {
    set({
      history: [[]],
      historyStep: 0,
    });
  },

  setCanvasState: (state) => {
    set(state);
  },
}));
