'use client';

import React, { useRef, useEffect, useState } from 'react';
import Konva from 'konva';
import { Stage, Layer, Image, Text, Transformer, Rect, Group } from 'react-konva';
import { useEditorStore } from '@/store/editorStore';

interface CanvasElement {
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

export const CanvasEditor: React.FC<{
  width: number;
  height: number;
  dpi?: number;
}> = ({ width, height, dpi = 300 }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const { canvasState, setCanvasState } = useEditorStore();

  // Handle canvas click to select elements
  const handleCanvasClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Check if user clicked an element
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
      }
    }
  };

  // Select element and show transformer
  const handleElementSelect = (id: string) => {
    setSelectedId(id);
    const stage = stageRef.current;
    if (stage && transformerRef.current) {
      const selectedNode = stage.findOne(`#${id}`) as Konva.Node;
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
      }
    }
  };

  // Add image to canvas
  const addImage = (imageUrl: string, imageId: string) => {
    const img = new window.Image();
    img.onload = () => {
      const newElement: CanvasElement = {
        id: `image-${imageId}`,
        type: 'image',
        x: 50,
        y: 50,
        width: Math.min(img.width / 2, width - 100),
        height: Math.min(img.height / 2, height - 100),
        scaleX: 1,
        scaleY: 1,
      };
      setElements([...elements, newElement]);
      setCanvasState({ ...canvasState, elements: [...elements, newElement] });
    };
    img.src = imageUrl;
  };

  // Add text to canvas
  const addText = (text: string = 'Click to edit') => {
    const newElement: CanvasElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 50,
      y: 50,
      text,
      fontSize: 24,
      fill: '#000000',
    };
    setElements([...elements, newElement]);
    setCanvasState({ ...canvasState, elements: [...elements, newElement] });
  };

  // Update element
  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    const updated = elements.map((el) =>
      el.id === id ? { ...el, ...updates } : el
    );
    setElements(updated);
    setCanvasState({ ...canvasState, elements: updated });
  };

  // Delete element
  const deleteElement = (id: string) => {
    const filtered = elements.filter((el) => el.id !== id);
    setElements(filtered);
    setCanvasState({ ...canvasState, elements: filtered });
    setSelectedId(null);
  };

  // Export canvas as PNG
  const exportAsImage = (filename: string = 'canvas.png') => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL();
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = filename;
      link.click();
    }
  };

  // Export canvas as PDF
  const exportAsPDF = async (filename: string = 'canvas.pdf') => {
    // This will be implemented with jsPDF library
    console.log(`Export as PDF: ${filename}`);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Canvas */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          onClick={handleCanvasClick}
          className="cursor-crosshair"
        >
          <Layer>
            {/* Canvas background */}
            <Rect
              width={width}
              height={height}
              fill="white"
              listening={true}
            />

            {/* Render elements */}
            {elements.map((element) => (
              <Group
                key={element.id}
                id={element.id}
                draggable
                onClick={() => handleElementSelect(element.id)}
                onDragEnd={(e) => {
                  updateElement(element.id, {
                    x: e.target.x(),
                    y: e.target.y(),
                  });
                }}
              >
                {element.type === 'image' && (
                  <KonvaImage
                    src={element.id}
                    x={0}
                    y={0}
                    width={element.width}
                    height={element.height}
                    scaleX={element.scaleX}
                    scaleY={element.scaleY}
                  />
                )}
                {element.type === 'text' && (
                  <Text
                    text={element.text}
                    fontSize={element.fontSize}
                    fill={element.fill}
                    fontFamily="Arial"
                    align="left"
                  />
                )}
              </Group>
            ))}

            {/* Transformer for selected element */}
            {selectedId && (
              <Transformer ref={transformerRef} />
            )}
          </Layer>
        </Stage>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => addText()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Text
        </button>
        <button
          onClick={() => deleteElement(selectedId || '')}
          disabled={!selectedId}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Delete
        </button>
        <button
          onClick={() => exportAsImage()}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Export PNG
        </button>
        <button
          onClick={() => exportAsPDF()}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Export PDF
        </button>
      </div>

      {/* Element properties panel */}
      {selectedId && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold mb-3">Element Properties</h3>
          <div className="grid grid-cols-2 gap-2">
            {/* Properties will be shown here */}
            <p className="text-sm text-gray-600">Selected: {selectedId}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Konva Image component wrapper
const KonvaImage: React.FC<{
  src: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
}> = ({ src, x, y, width, height, scaleX = 1, scaleY = 1 }) => {
  const imageRef = useRef<Konva.Image>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setImage(img);
    // Extract actual image URL from src ID
    img.src = src;
  }, [src]);

  return image ? (
    <Image
      ref={imageRef}
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      scaleX={scaleX}
      scaleY={scaleY}
    />
  ) : null;
};
