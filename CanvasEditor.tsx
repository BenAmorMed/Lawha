'use client';
// components/editor/CanvasEditor.tsx
// Main Konva canvas rendering component

import React, { useRef, useCallback, useEffect, useState } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Image as KonvaImage,
  Text as KonvaText,
  Transformer,
  Group,
} from 'react-konva';
import useImage from 'use-image';
import { useEditorStore, ImageLayer, TextLayer, Layer as EditorLayer } from '@/store/editorStore';
import Konva from 'konva';

// -------------------------------------------------------
// Scale the template coordinate space to viewport
// -------------------------------------------------------
const VIEWPORT_WIDTH = 600; // preview width px

// -------------------------------------------------------
// Individual image slot renderer
// -------------------------------------------------------
function ImageSlotLayer({
  layer,
  scaleRatio,
  isSelected,
  onSelect,
  onUpdate,
}: {
  layer: ImageLayer;
  scaleRatio: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ImageLayer>) => void;
}) {
  const [img] = useImage(layer.thumbSrc || layer.src, 'anonymous');
  const imgRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && imgRef.current) {
      trRef.current.nodes([imgRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const s = scaleRatio;

  return (
    <>
      <KonvaImage
        ref={imgRef}
        image={img}
        x={layer.x * s}
        y={layer.y * s}
        width={layer.width * s}
        height={layer.height * s}
        scaleX={layer.scale}
        scaleY={layer.scale}
        rotation={layer.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onUpdate({
            x: e.target.x() / s,
            y: e.target.y() / s,
          });
        }}
        onTransformEnd={(e) => {
          const node = imgRef.current!;
          onUpdate({
            scale: node.scaleX(),
            rotation: node.rotation(),
            x: node.x() / s,
            y: node.y() / s,
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          boundBoxFunc={(_, newBox) => newBox}
        />
      )}
    </>
  );
}

// -------------------------------------------------------
// Text layer renderer
// -------------------------------------------------------
function TextSlotLayer({
  layer,
  scaleRatio,
  isSelected,
  onSelect,
  onUpdate,
}: {
  layer: TextLayer;
  scaleRatio: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<TextLayer>) => void;
}) {
  const textRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const s = scaleRatio;

  useEffect(() => {
    if (isSelected && trRef.current && textRef.current) {
      trRef.current.nodes([textRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  if (!layer.content) {
    return (
      <Rect
        x={layer.x * s}
        y={layer.y * s}
        width={300 * s}
        height={60 * s}
        stroke="#aaaaaa"
        strokeWidth={1}
        dash={[6, 4]}
        fill="rgba(200,200,200,0.15)"
        onClick={onSelect}
        onTap={onSelect}
      />
    );
  }

  return (
    <>
      <KonvaText
        ref={textRef}
        text={layer.content}
        x={layer.x * s}
        y={layer.y * s}
        fontSize={layer.size * s}
        fontFamily={layer.font}
        fill={layer.color}
        fontStyle={`${layer.bold ? 'bold' : ''} ${layer.italic ? 'italic' : ''}`}
        align={layer.align}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onUpdate({ x: e.target.x() / s, y: e.target.y() / s });
        }}
      />
      {isSelected && (
        <Transformer ref={trRef} rotateEnabled={false} enabledAnchors={[]} />
      )}
    </>
  );
}

// -------------------------------------------------------
// Slot placeholder (empty slot indicator)
// -------------------------------------------------------
function EmptySlotPlaceholder({
  slot,
  scaleRatio,
  onClick,
}: {
  slot: any;
  scaleRatio: number;
  onClick: () => void;
}) {
  const s = scaleRatio;
  return (
    <Group onClick={onClick} onTap={onClick} style={{ cursor: 'pointer' }}>
      <Rect
        x={slot.x * s}
        y={slot.y * s}
        width={slot.w * s}
        height={slot.h * s}
        fill="rgba(230, 235, 245, 0.8)"
        stroke="#b0b8d0"
        strokeWidth={2}
        dash={[10, 6]}
        cornerRadius={4}
      />
      <KonvaText
        x={slot.x * s}
        y={(slot.y + slot.h / 2 - 20) * s}
        width={slot.w * s}
        align="center"
        text="+ Click to add photo"
        fontSize={14 * s}
        fill="#8899bb"
        fontFamily="system-ui"
      />
    </Group>
  );
}

// -------------------------------------------------------
// Main CanvasEditor
// -------------------------------------------------------
interface CanvasEditorProps {
  onSlotClick?: (slotId: string) => void;
}

export default function CanvasEditor({ onSlotClick }: CanvasEditorProps) {
  const {
    template,
    layers,
    selectedLayerId,
    setSelectedLayer,
    updateImageLayer,
    updateTextLayer,
    selectedFrame,
  } = useEditorStore();

  const stageRef = useRef<Konva.Stage>(null);

  if (!template) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
        <p className="text-gray-400 text-lg">Select a template to start designing</p>
      </div>
    );
  }

  const templateW = template.canvasSize.width;
  const templateH = template.canvasSize.height;
  const aspectRatio = templateH / templateW;
  const stageW = VIEWPORT_WIDTH;
  const stageH = Math.round(stageW * aspectRatio);
  const scaleRatio = stageW / templateW;

  // Find which slots have layers
  const filledSlotIds = new Set(layers.map((l) => l.slotId));

  return (
    <div
      className="relative inline-block"
      style={{
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
        borderRadius: 4,
        overflow: 'hidden',
        border: selectedFrame?.colorHex
          ? `16px solid ${selectedFrame.colorHex}`
          : 'none',
      }}
    >
      <Stage
        ref={stageRef}
        width={stageW}
        height={stageH}
        onClick={(e) => {
          if (e.target === e.target.getStage()) setSelectedLayer(null);
        }}
      >
        {/* Background */}
        <Layer>
          <Rect width={stageW} height={stageH} fill="#ffffff" />
        </Layer>

        {/* Slot placeholders */}
        <Layer>
          {template.slots
            .filter((s) => s.type === 'image' && !filledSlotIds.has(s.id))
            .map((slot) => (
              <EmptySlotPlaceholder
                key={slot.id}
                slot={slot}
                scaleRatio={scaleRatio}
                onClick={() => onSlotClick?.(slot.id)}
              />
            ))}
        </Layer>

        {/* Layers */}
        <Layer>
          {layers.map((layer) => {
            const isSelected = layer.id === selectedLayerId;
            if (layer.type === 'image') {
              return (
                <ImageSlotLayer
                  key={layer.id}
                  layer={layer}
                  scaleRatio={scaleRatio}
                  isSelected={isSelected}
                  onSelect={() => setSelectedLayer(layer.id)}
                  onUpdate={(updates) => updateImageLayer(layer.id, updates)}
                />
              );
            }
            if (layer.type === 'text') {
              return (
                <TextSlotLayer
                  key={layer.id}
                  layer={layer}
                  scaleRatio={scaleRatio}
                  isSelected={isSelected}
                  onSelect={() => setSelectedLayer(layer.id)}
                  onUpdate={(updates) => updateTextLayer(layer.id, updates)}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
}
