'use client';

import clsx from 'clsx';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './DomeGallery.module.css';

type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  sizeX?: number;
  sizeY?: number;
};

type LayoutItem = GalleryItem & {
  offsetX: number;
  offsetY: number;
  sizeX: number;
  sizeY: number;
};

export interface DomeGalleryProps {
  items: GalleryItem[];
  segmentsX?: number;
  segmentsY?: number;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function DomeGallery({ items, segmentsX = 16, segmentsY = 10 }: DomeGalleryProps) {
  const [rotation, setRotation] = useState({ x: -16, y: 24 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [phase, setPhase] = useState<'idle' | 'entering' | 'entered'>('idle');
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const momentumRef = useRef<number | null>(null);
  const pointerRef = useRef({
    active: false,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0
  });

  const layoutItems = useMemo<LayoutItem[]>(() => {
    if (!items.length) {
      return [];
    }

    const rows = Math.min(segmentsY - 1, Math.max(3, Math.round(Math.sqrt(items.length)) + 1));
    const columns = Math.ceil(items.length / rows);
    const stepY = rows > 1 ? (segmentsY - 2) / (rows - 1) : 0;
    const stepX = columns > 1 ? (segmentsX - 2) / (columns - 1) : 0;

    const arranged: LayoutItem[] = [];
    let index = 0;

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < columns; col += 1) {
        if (index >= items.length) {
          break;
        }

        const item = items[index];
        const offsetX = stepX * col - ((columns - 1) * stepX) / 2;
        const offsetY = stepY * row - ((rows - 1) * stepY) / 2;

        arranged.push({
          ...item,
          offsetX,
          offsetY,
          sizeX: item.sizeX ?? 1,
          sizeY: item.sizeY ?? 1
        });

        index += 1;
      }
    }

    return arranged;
  }, [items, segmentsX, segmentsY]);

  const activeItem = useMemo(() => layoutItems.find((item) => item.id === activeId) ?? null, [activeId, layoutItems]);

  const cancelMomentum = useCallback(() => {
    if (momentumRef.current) {
      cancelAnimationFrame(momentumRef.current);
      momentumRef.current = null;
    }
  }, []);

  const stepMomentum = useCallback(() => {
    const decay = 0.92;
    let vx = pointerRef.current.velocityX;
    let vy = pointerRef.current.velocityY;

    const tick = () => {
      vx *= decay;
      vy *= decay;

      if (Math.abs(vx) < 0.1 && Math.abs(vy) < 0.1) {
        cancelMomentum();
        return;
      }

      setRotation((prev) => ({
        x: clamp(prev.x + vy * 0.18, -78, 78),
        y: prev.y + vx * 0.18
      }));

      pointerRef.current.velocityX = vx;
      pointerRef.current.velocityY = vy;
      momentumRef.current = requestAnimationFrame(tick);
    };

    momentumRef.current = requestAnimationFrame(tick);
  }, [cancelMomentum]);

  useEffect(() => {
    return () => cancelMomentum();
  }, [cancelMomentum]);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    pointerRef.current.active = true;
    pointerRef.current.lastX = event.clientX;
    pointerRef.current.lastY = event.clientY;
    pointerRef.current.velocityX = 0;
    pointerRef.current.velocityY = 0;
    cancelMomentum();
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }, [cancelMomentum]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerRef.current.active) {
      return;
    }

    const deltaX = event.clientX - pointerRef.current.lastX;
    const deltaY = event.clientY - pointerRef.current.lastY;

    pointerRef.current.lastX = event.clientX;
    pointerRef.current.lastY = event.clientY;
    pointerRef.current.velocityX = deltaX;
    pointerRef.current.velocityY = deltaY;

    setRotation((prev) => ({
      x: clamp(prev.x + deltaY * 0.25, -78, 78),
      y: prev.y + deltaX * 0.25
    }));
  }, []);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    pointerRef.current.active = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    if (Math.abs(pointerRef.current.velocityX) > 0.5 || Math.abs(pointerRef.current.velocityY) > 0.5) {
      stepMomentum();
    }
  }, [stepMomentum]);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const delta = event.deltaY;
    setRotation((prev) => ({
      x: clamp(prev.x + delta * 0.04, -78, 78),
      y: prev.y
    }));
  }, []);

  const openItem = useCallback(
    (item: LayoutItem, event: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      setOriginRect(rect);
      setActiveId(item.id);
      setPhase('entering');
    },
    []
  );

  useEffect(() => {
    if (phase === 'entering') {
      const frame = requestAnimationFrame(() => setPhase('entered'));
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [phase]);

  const closeViewer = useCallback(() => {
    setPhase('idle');
    setActiveId(null);
    setOriginRect(null);
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeViewer();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [closeViewer]);

  useEffect(() => {
    if (activeItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setOriginRect(null);
      setPhase('idle');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeItem]);

  const rootStyle = useMemo(
    () =>
      ({
        '--segments-x': segmentsX,
        '--segments-y': segmentsY
      }) as React.CSSProperties,
    [segmentsX, segmentsY]
  );

  const sphereStyle: React.CSSProperties = useMemo(
    () => ({
      transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
    }),
    [rotation]
  );

  let enlargeStyle: React.CSSProperties | undefined;
  if (activeItem) {
    enlargeStyle = { transform: 'translate3d(0, 0, 0) scale(1)', opacity: 1 };
    const viewerRect = viewerRef.current?.getBoundingClientRect();
    if (originRect && viewerRect && phase !== 'entered') {
      const scaleX = originRect.width / viewerRect.width;
      const scaleY = originRect.height / viewerRect.height;
      const translateX = originRect.left - viewerRect.left;
      const translateY = originRect.top - viewerRect.top;
      enlargeStyle = {
        transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`,
        opacity: 0.65
      };
    }
  }

  return (
    <div
      className={styles.sphereRoot}
      style={rootStyle}
      data-enlarging={Boolean(activeItem)}
    >
      <div
        className={styles.main}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      >
        <div className={styles.stage}>
          <div className={styles.sphere} style={sphereStyle}>
            {layoutItems.map((item) => {
              const itemStyle = {
                '--offset-x': item.offsetX,
                '--offset-y': item.offsetY,
                '--item-size-x': item.sizeX,
                '--item-size-y': item.sizeY
              } as React.CSSProperties;

              return (
                <div key={item.id} className={styles.item} style={itemStyle}>
                  <div
                    role="button"
                    tabIndex={0}
                    className={styles.itemImage}
                    onClick={(event) => openItem(item, event)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openItem(item, event);
                      }
                    }}
                  >
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      className={styles.tileImage}
                      sizes="(max-width: 768px) 60vw, (max-width: 1200px) 40vw, 420px"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className={styles.overlay} />
        <div className={styles.overlayBlur} />
        <div className={clsx(styles.edgeFade, styles.edgeFadeTop)} />
        <div className={clsx(styles.edgeFade, styles.edgeFadeBottom)} />
      </div>

      <div
        ref={viewerRef}
        className={clsx(styles.viewer, activeItem && styles.viewerActive)}
        aria-hidden={!activeItem}
      >
        <div className={styles.scrim} onClick={closeViewer} />
        {activeItem && (
          <>
            <button type="button" className={styles.closeButton} onClick={closeViewer}>
              Close
            </button>
            <div className={styles.frame}>
              <div className={styles.enlarge} style={enlargeStyle}>
                <Image
                  src={activeItem.src}
                  alt={activeItem.alt}
                  fill
                  className={styles.tileImage}
                  sizes="(max-width: 768px) 80vw, 560px"
                />
              </div>
            </div>
            {activeItem.caption ? (
              <p style={{ marginTop: '1.5rem', maxWidth: '26rem', textAlign: 'center', color: 'rgba(226, 232, 255, 0.75)' }}>
                {activeItem.caption}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default DomeGallery;
