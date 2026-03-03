'use client';

import React, { useRef, useEffect, useState } from 'react';
import Konva from 'konva';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer, Rect, Group } from 'react-konva';
import useImage from 'use-image';
import { useEditorStore, CanvasElement } from '@/store/editorStore';

export interface CanvasEditorProps {
  width: number;
  height: number;
  dpi?: number;
}

// Image component for Konva
const ImageElement: React.FC<{
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}> = ({ element, isSelected, onSelect, onUpdate }) => {
  const [image] = useImage(element.id);
  const elementRef = useRef<Konva.Group>(null);

  return (
    <Group
      ref={elementRef}
      x={element.x}
      y={element.y}
      draggable
      onClick={() => onSelect(element.id)}
      onDragEnd={(e) => {
        onUpdate(element.id, {
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={() => {
        if (elementRef.current) {
          onUpdate(element.id, {
            x: elementRef.current.x(),
            y: elementRef.current.y(),
            scaleX: elementRef.current.scaleX(),
            scaleY: elementRef.current.scaleY(),
            rotation: elementRef.current.rotation(),
          });
        }
      }}
    >
      {image && (
        <KonvaImage
          image={image}
          width={element.width}
          height={element.height}
          scaleX={element.scaleX || 1}
          scaleY={element.scaleY || 1}
          rotation={element.rotation || 0}
        />
      )}
    </Group>
  );
};

// Text component for Konva
const TextElement: React.FC<{
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
}> = ({ element, isSelected, onSelect, onUpdate }) => {
  const elementRef = useRef<Konva.Group>(null);

  return (
    <Group
      ref={elementRef}
      x={element.x}
      y={element.y}
      draggable
      onClick={() => onSelect(element.id)}
      onDragEnd={(e) => {
        onUpdate(element.id, {
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={() => {
        if (elementRef.current) {
          onUpdate(element.id, {
            x: elementRef.current.x(),
            y: elementRef.current.y(),
            scaleX: elementRef.current.scaleX(),
            scaleY: elementRef.current.scaleY(),
            rotation: elementRef.current.rotation(),
          });
        }
      }}
    >
      <KonvaText
        text={element.text || ''}
        fontSize={element.fontSize || 24}
        fill={element.fill || '#000000'}
        fontFamily="Arial"
      />
    </Group>
  );
};

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  width,
  height,
  dpi = 300,
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const {
    elements,
    selectedElementId,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
  } = useEditorStore();

  // Handle stage click
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      selectElement(null);
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
      }
    }
  };

  // Update transformer when selection changes
  useEffect(() => {
    if (stageRef.current && transformerRef.current) {
      if (selectedElementId) {
        const selectedNode = stageRef.current.findOne(
          `#${selectedElementId}`
        ) as Konva.Node;
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
          transformerRef.current.getLayer()?.batchDraw();
        }
      } else {
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedElementId]);

  const addTextElement = () => {
    const newElement: CanvasElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 50,
      y: 50,
      text: 'Edit me',
      fontSize: 24,
      fill: '#000000',
    };
    addElement(newElement);
  };

  const addImageElement = (imageUrl: string) => {
    const newElement: CanvasElement = {
      id: imageUrl,
      type: 'image',
      x: 50,
      y: 50,
      width: 200,
      height: 200,
    };
    addElement(newElement);
  };

  const exportAsImage = (filename: string = 'canvas.png') => {
    if (stageRef.current) {
      const dataURL = stageRef.current.toDataURL();
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = filename;
      link.click();
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Canvas Area */}
      <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white shadow-lg">
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          onClick={handleStageClick}
          className="cursor-crosshair"
        >
          <Layer>
            {/* White background */}
            <Rect
              width={width}
              height={height}
              fill="white"
              listening={true}
            />

            {/* Grid background (optional) */}
            {Array.from({ length: Math.ceil(height / 50) }).map((_, i) =>
              Array.from({ length: Math.ceil(width / 50) }).map((_, j) => (
                <Rect
                  key={`grid-${i}-${j}`}
                  x={j * 50}
                  y={i * 50}
                  width={50}
                  height={50}
                  stroke="#f0f0f0"
                  strokeWidth={0.5}
                  listening={false}
                />
              ))
            )}

            {/* Render elements */}
            {elements.map((element) => (
              <Group key={element.id} id={element.id}>
                {element.type === 'image' && (
                  <ImageElement
                    element={element}
                    isSelected={element.id === selectedElementId}
                    onSelect={selectElement}
                    onUpdate={updateElement}
                  />
                )}
                {element.type === 'text' && (
                  <TextElement
                    element={element}
                    isSelected={element.id === selectedElementId}
                    onSelect={selectElement}
                    onUpdate={updateElement}
                  />
                )}
              </Group>
            ))}

            {/* Transformer */}
            {selectedElementId && (
              <Transformer
                ref={transformerRef}
                enabledAnchors={[
                  'top-left',
                  'top-center',
                  'top-right',
                  'middle-right',
                  'middle-left',
                  'bottom-left',
                  'bottom-center',
                  'bottom-right',
                ]}
                rotationSnaps={[0, 90, 180, 270]}
              />
            )}
          </Layer>
        </Stage>
      </div>

      {/* Controls Toolbar */}
      <div className="flex gap-2 flex-wrap bg-gray-50 p-3 rounded-lg">
        <button
          onClick={addTextElement}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
        >
          + Text
        </button>
        <button
          onClick={() => deleteElement(selectedElementId || '')}
          disabled={!selectedElementId}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-sm font-medium"
        >
          Delete
        </button>
        <button
          onClick={() => exportAsImage()}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium"
        >
          Export PNG
        </button>

        {/* Info */}
        <div className="ml-auto text-sm text-gray-600">
          {width}x{height}px @ {dpi} DPI
        </div>
      </div>

      {/* Element Properties Panel */}
      {selectedElementId && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-bold mb-3 text-sm">Element Properties</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-600">ID:</span> {selectedElementId}
            </p>
            {elements
              .filter((el) => el.id === selectedElementId)
              .map((el) => (
                <div key={el.id} className="space-y-2">
                  <p>
                    <span className="text-gray-600">Type:</span> {el.type}
                  </p>
                  <p>
                    <span className="text-gray-600">Position:</span> ({el.x}, {el.y})
                  </p>
                  {el.type === 'text' && (
                    <>
                      <p>
                        <span className="text-gray-600">Size:</span> {el.fontSize}px
                      </p>
                      <p>
                        <span className="text-gray-600">Color:</span> {el.fill}
                      </p>
                    </>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
