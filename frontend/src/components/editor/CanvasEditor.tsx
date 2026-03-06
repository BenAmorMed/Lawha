'use client';

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import Konva from 'konva';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Transformer, Rect, Group } from 'react-konva';
import useImage from 'use-image';
import { useEditorStore, ImageLayer, TextLayer, Layer as EditorLayer } from '@/store/editorStore';

export interface CanvasEditorProps {
  width: number;
  height: number;
  widthCm?: number;
  heightCm?: number;
  dpi?: number;
}

export interface CanvasEditorRef {
  getPreviewDataUrl: () => string | null;
}

// Image component for Konva
const ImageElement: React.FC<{
  layer: ImageLayer;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ImageLayer>) => void;
}> = ({ layer, isSelected, onSelect, onUpdate }) => {
  const [image, status] = useImage(layer.src, 'anonymous');

  useEffect(() => {
    if (status === 'failed') {
      console.error(`Failed to load image: ${layer.src}`);
    }
  }, [status, layer.src]);

  return (
    <Group
      id={layer.id}
      x={layer.x}
      y={layer.y}
      scaleX={layer.scale}
      scaleY={layer.scale}
      rotation={layer.rotation}
      draggable
      onClick={() => onSelect(layer.id)}
      onTap={() => onSelect(layer.id)}
      onDragEnd={(e) => {
        onUpdate(layer.id, {
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        onUpdate(layer.id, {
          x: node.x(),
          y: node.y(),
          scale: node.scaleX(),
          rotation: node.rotation(),
        });
      }}
    >
      {image && (
        <KonvaImage
          image={image}
          width={layer.widthPx}
          height={layer.heightPx}
        />
      )}
      {status === 'loading' && (
        <Rect width={100} height={100} fill="#eee" opacity={0.5} />
      )}
    </Group>
  );
};

// Text component for Konva
const TextElement: React.FC<{
  layer: TextLayer;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TextLayer>) => void;
}> = ({ layer, isSelected, onSelect, onUpdate }) => {
  return (
    <Group
      id={layer.id}
      x={layer.x}
      y={layer.y}
      draggable
      onClick={() => onSelect(layer.id)}
      onTap={() => onSelect(layer.id)}
      onDragEnd={(e) => {
        onUpdate(layer.id, {
          x: e.target.x(),
          y: e.target.y(),
        });
      }}
    >
      <KonvaText
        text={layer.content}
        fontSize={layer.size}
        fill={layer.color}
        fontFamily={layer.font}
        fontStyle={layer.bold ? (layer.italic ? 'bold italic' : 'bold') : (layer.italic ? 'italic' : 'normal')}
        align={layer.align}
      />
    </Group>
  );
};

export const CanvasEditor = forwardRef<CanvasEditorRef, CanvasEditorProps>((props, ref) => {
  const {
    width,
    height,
    widthCm,
    heightCm,
    dpi = 300,
  } = props;
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [displayScale, setDisplayScale] = React.useState(1);

  const {
    layers,
    selectedLayerId,
    setSelectedLayer,
    updateImageLayer,
    updateTextLayer,
    addImageLayer,
    uploadedImages
  } = useEditorStore();

  // Re-calculate scale to fit container
  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerW = containerRef.current.offsetWidth;
        // Padding/margin adjustment
        const targetW = containerW - 40;
        const newScale = targetW / width;
        setDisplayScale(newScale);
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [width]);

  useImperativeHandle(ref, () => ({
    getPreviewDataUrl: () => {
      const stage = stageRef.current;
      if (!stage) return null;
      return stage.toDataURL({ pixelRatio: 0.3 });
    }
  }));

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedLayer(null);
      return;
    }
  };

  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      if (selectedLayerId) {
        const selectedNode = stageRef.current.findOne(`#${selectedLayerId}`);
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode]);
        } else {
          transformerRef.current.nodes([]);
        }
      } else {
        transformerRef.current.nodes([]);
      }
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedLayerId, layers]);

  return (
    <div ref={containerRef} className="w-full flex items-center justify-center p-4">
      <div
        className="bg-white shadow-xl relative"
        style={{
          width: width * displayScale,
          height: height * displayScale,
        }}
      >
        <Stage
          ref={stageRef}
          width={width * displayScale}
          height={height * displayScale}
          scaleX={displayScale}
          scaleY={displayScale}
          onClick={handleStageClick}
          onTap={handleStageClick}
          onDragOver={(e: Konva.KonvaEventObject<DragEvent>) => {
            e.evt.preventDefault();
          }}
          onDrop={(e: Konva.KonvaEventObject<DragEvent>) => {
            e.evt.preventDefault();
            const imageId = e.evt.dataTransfer?.getData('imageId');
            if (!imageId) return;

            const image = uploadedImages.find(img => img.id === imageId);
            if (!image) return;

            const stage = stageRef.current;
            if (stage) {
              stage.setPointersPositions(e.evt);
              const pos = stage.getPointerPosition();
              if (pos) {
                // Adjust position by current stage scale
                addImageLayer(image, pos.x / displayScale, pos.y / displayScale);
              }
            }
          }}
        >
          <Layer>
            <Rect width={width} height={height} fill="white" />
            {layers.map((layer) => {
              if (layer.type === 'image') {
                return (
                  <ImageElement
                    key={layer.id}
                    layer={layer}
                    isSelected={layer.id === selectedLayerId}
                    onSelect={setSelectedLayer}
                    onUpdate={updateImageLayer}
                  />
                );
              } else if (layer.type === 'text') {
                return (
                  <TextElement
                    key={layer.id}
                    layer={layer}
                    isSelected={layer.id === selectedLayerId}
                    onSelect={setSelectedLayer}
                    onUpdate={updateTextLayer}
                  />
                );
              }
              return null;
            })}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) return oldBox;
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>
    </div>
  );
});

CanvasEditor.displayName = 'CanvasEditor';
