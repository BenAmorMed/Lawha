import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useEditorStore } from './editorStore';

const mockStorage: Record<string, string> = {};
global.localStorage = {
    getItem: vi.fn((key) => mockStorage[key] || null),
    setItem: vi.fn((key, value) => { mockStorage[key] = value; }),
    removeItem: vi.fn((key) => { delete mockStorage[key]; }),
    clear: vi.fn(() => { for (let num in mockStorage) { delete mockStorage[num]; } }),
    length: 0,
    key: vi.fn()
} as any;

describe('EditorStore Logic', () => {
    const loveflixTemplate = {
        id: 't1',
        templateKey: 'loveflix-01',
        name: 'Loveflix Movie Poster',
        category: 'couple',
        definition: {
            canvasSize: { width: 5905, height: 8268 },
            dpi: 300,
            printSizeCm: { w: 50, h: 70 },
            slots: [
                { id: 'img1', type: 'image', x: 0, y: 0, w: 5905, h: 5500, required: true, label: 'Photo principale' }
            ],
            textFields: [
                { id: 'title', font: 'Cinzel', size: 180, maxChars: 30, x: 200, y: 5700, required: true, label: 'Titre' },
                { id: 'subtitle', font: 'Montserrat', size: 100, maxChars: 40, x: 200, y: 5950, required: false, label: 'Sous-titre' },
                { id: 'date', font: 'Lato', size: 80, maxChars: 30, x: 200, y: 6150, required: false, label: 'Date' }
            ]
        },
        thumbnailUrl: '/thumb.jpg'
    } as any;

    const mockImage = {
        id: 'upload-1',
        originalUrl: 'img.jpg',
        thumbUrl: 'thumb.jpg',
        widthPx: 4000,
        heightPx: 4000,
        dpiStatus: 'ok',
        effectiveDpi: 300
    } as any;

    const mockBlockedImage = {
        ...mockImage,
        dpiStatus: 'blocked'
    } as any;

    beforeEach(() => {
        useEditorStore.getState().clearDraft();
        useEditorStore.setState({
            selectedProduct: { id: 'p1', name: 'Product', basePrice: 50 },
            selectedSize: { id: 's1', label: '50x70', widthCm: 50, heightCm: 70, priceDelta: 0 }
        });
    });

    // 1. setTemplate
    it('initialise les TextLayers vides a partir du template', () => {
        useEditorStore.getState().setTemplate(loveflixTemplate);
        const layers = useEditorStore.getState().layers;
        expect(layers).toHaveLength(3);
        expect(layers.every(l => l.type === 'text')).toBe(true);
        expect(layers.map(l => l.slotId)).toEqual(['title', 'subtitle', 'date']);
    });

    // 2. addImageToSlot
    it('cree un ImageLayer quand on assigne une image a un slot', () => {
        useEditorStore.getState().setTemplate(loveflixTemplate);
        useEditorStore.getState().addImageToSlot('img1', mockImage);
        const layers = useEditorStore.getState().layers;
        const imgLayer = layers.find(l => l.type === 'image');
        expect(imgLayer).toBeDefined();
        expect(imgLayer?.slotId).toBe('img1');
        expect(imgLayer?.src).toBe('img.jpg');
    });

    // 3. canCheckout() false if missing slot
    it('canCheckout retourne false si un slot required est vide', () => {
        useEditorStore.getState().setTemplate(loveflixTemplate);
        expect(useEditorStore.getState().canCheckout()).toBe(false);
        expect(useEditorStore.getState().missingSlots()).toContain('img1');
    });

    // 4. canCheckout() false if blocked
    it('canCheckout retourne false si une image est bloquee (DPI faible)', () => {
        useEditorStore.getState().setTemplate(loveflixTemplate);
        useEditorStore.getState().addImageToSlot('img1', mockBlockedImage);
        expect(useEditorStore.getState().canCheckout()).toBe(false);
    });

    // 5. canCheckout() true
    it('canCheckout retourne true si tout est rempli et valide', () => {
        useEditorStore.getState().setTemplate(loveflixTemplate);
        useEditorStore.getState().addImageToSlot('img1', mockImage);
        expect(useEditorStore.getState().canCheckout()).toBe(true);
    });

    // 6. getDesignJson() serializable
    it('getDesignJson retourne un objet JSON', () => {
        useEditorStore.getState().setTemplate(loveflixTemplate);
        useEditorStore.getState().addImageToSlot('img1', mockImage);
        const json = useEditorStore.getState().getDesignJson();
        expect(json).toHaveProperty('templateId', 't1');
        expect(json).toHaveProperty('layers');
        expect(Array.isArray((json as any).layers)).toBe(true);
    });

    // 7. validate storage
    it('saveToLocalStorage/loadFromLocalStorage fonctionne', () => {
        useEditorStore.getState().setTemplate(loveflixTemplate);
        useEditorStore.getState().addImageToSlot('img1', mockImage);
        useEditorStore.getState().saveToLocalStorage();

        // reset state
        useEditorStore.getState().clearDraft();
        expect(useEditorStore.getState().selectedTemplate).toBeNull();

        // reload
        useEditorStore.getState().loadFromLocalStorage();
        expect(useEditorStore.getState().selectedTemplate?.id).toBe('t1');
        expect(useEditorStore.getState().layers).toHaveLength(4);
    });
});
