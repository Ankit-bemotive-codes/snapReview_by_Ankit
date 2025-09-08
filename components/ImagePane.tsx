import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Revision } from '../types';
import { Icon } from './Icon';

interface ImagePaneProps {
  title: string;
  revision: Revision | null;
  isLoading?: boolean;
  loadingMessage?: string;
}

export const ImagePane: React.FC<ImagePaneProps> = ({ title, revision, isLoading = false, loadingMessage = 'Processing...' }) => {
  const [transform, setTransform] = useState({ scale: 1, x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Reset transform when image changes or on load
  useEffect(() => {
    setTransform({ scale: 1, x: 0, y: 0 });
  }, [revision?.id, isLoading]);

  const getBoundedTransform = useCallback((scale: number, x: number, y: number) => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) return { scale: 1, x: 0, y: 0 };
    
    const { clientWidth: cw, clientHeight: ch } = container;
    const { clientWidth: iw, clientHeight: ih } = image; // Rendered size at scale=1

    const finalScale = Math.max(1, Math.min(scale, 10));

    if (finalScale <= 1) {
      return { scale: 1, x: 0, y: 0 };
    }

    const scaledWidth = iw * finalScale;
    const scaledHeight = ih * finalScale;
    
    const maxPanX = Math.max(0, (scaledWidth - cw) / 2);
    const maxPanY = Math.max(0, (scaledHeight - ch) / 2);
    
    const boundedX = Math.max(-maxPanX, Math.min(x, maxPanX));
    const boundedY = Math.max(-maxPanY, Math.min(y, maxPanY));

    return { scale: finalScale, x: boundedX, y: boundedY };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (!revision || isLoading) return;
    e.preventDefault();
    
    const container = containerRef.current;
    if (!container) return;

    const { clientWidth: cw, clientHeight: ch } = container;
    const rect = container.getBoundingClientRect();
    const zoomFactor = 1.1;

    setTransform(prev => {
      const newScale = e.deltaY < 0 ? prev.scale * zoomFactor : prev.scale / zoomFactor;
      
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const pointX = mouseX - cw / 2 - prev.x;
      const pointY = mouseY - ch / 2 - prev.y;
      
      const scaleRatio = newScale / prev.scale;

      const newX = prev.x - (pointX * scaleRatio - pointX);
      const newY = prev.y - (pointY * scaleRatio - pointY);

      return getBoundedTransform(newScale, newX, newY);
    });
  }, [revision, isLoading, getBoundedTransform]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!revision || isLoading || transform.scale <= 1 || e.button !== 0) return;
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX - transform.x,
      y: e.clientY - transform.y,
    };
    if (containerRef.current) containerRef.current.style.cursor = 'grabbing';
  }, [revision, isLoading, transform]);
  
  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    if (containerRef.current) containerRef.current.style.cursor = 'grab';
  }, []);
  
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    e.preventDefault();
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    setTransform(prev => getBoundedTransform(prev.scale, newX, newY));
  }, [getBoundedTransform]);
  
  const resetTransform = useCallback(() => {
    setTransform({ scale: 1, x: 0, y: 0 });
  }, []);

  const isZoomed = transform.scale > 1.01;

  const handleMouseLeave = useCallback(() => {
    isDraggingRef.current = false;
    if (containerRef.current) containerRef.current.style.cursor = isZoomed ? 'grab' : 'default';
  }, [isZoomed]);

  return (
    <div 
      className="bg-gray-800 rounded-xl flex flex-col items-center justify-center p-4 border border-gray-700 shadow-lg relative aspect-square h-full overflow-hidden touch-none"
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: isZoomed ? 'grab' : 'default' }}
    >
      <h2 className="absolute top-4 left-4 text-lg font-semibold bg-gray-900/50 px-3 py-1 rounded-full z-10 select-none pointer-events-none">{title}</h2>
      {revision ? (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            transform: `scale(${transform.scale}) translate(${transform.x}px, ${transform.y}px)`,
            transition: isDraggingRef.current ? 'none' : 'transform 0.1s ease-out'
          }}
        >
            <img 
              ref={imageRef}
              src={revision.imageUrl} 
              alt={revision.prompt} 
              className="max-w-full max-h-full object-contain rounded-lg"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            />
        </div>
      ) : (
        <div className="text-center text-gray-500 flex flex-col items-center select-none">
          <Icon name="Image" className="w-16 h-16 mb-2" />
          <p>Your image will appear here</p>
        </div>
      )}

      {isZoomed && (
        <button
          onClick={resetTransform}
          className="absolute bottom-4 right-4 z-10 bg-gray-900/70 p-2 rounded-full text-white hover:bg-gray-900/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500"
          aria-label="Reset zoom and pan"
          title="Reset zoom and pan"
        >
          <Icon name="Frame" className="w-5 h-5" />
        </button>
      )}

      {isLoading && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-xl backdrop-blur-sm z-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mb-4"></div>
          <p className="text-lg font-semibold text-white">{loadingMessage}</p>
        </div>
      )}
    </div>
  );
};
