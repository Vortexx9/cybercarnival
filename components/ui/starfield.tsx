'use client';

import { useEffect, useRef } from 'react';

interface StarfieldProps {
  starCount?: number;
  waveFrequency?: number;
  starEscapeWidth?: number;
  voidWidth?: number;
  starColor?: { r: number; g: number; b: number };
  maxOpacity?: number;
  rotationSpeed?: number;
  waveSpeed?: number;
}

const Starfield = ({
  starCount = 25000,
  waveFrequency = 20,
  starEscapeWidth = 255,
  voidWidth = 100,
  starColor = { r: 168, g: 85, b: 247 }, 
  maxOpacity = 255,
  rotationSpeed = 0.0005,
  waveSpeed = 0.01,
}: StarfieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const starsRef = useRef<any[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let size = { x: 0, y: 0 };
    let imagedata: ImageData, buf: ArrayBuffer, buf8: Uint8ClampedArray, data: Uint32Array;
    let startTime = performance.now();
    let currentTime = 0;

    const setSize = () => {
      size.x = container.clientWidth;
      size.y = container.clientHeight;
      canvas.width = size.x;
      canvas.height = size.y;

      // Initialize pixel data
      imagedata = context.createImageData(size.x, size.y);
      buf = new ArrayBuffer(imagedata.data.length);
      buf8 = new Uint8ClampedArray(buf);
      data = new Uint32Array(imagedata.data.buffer);
      
      // Do NOT reset starsRef.current here to keep the loop continuous during resizes
    };

    const createStar = () => {
      const star: any = {};
      const rands = [
        Math.random() * (starEscapeWidth / 2) + 1,
        Math.random() * (starEscapeWidth / 2) + starEscapeWidth,
      ];
      star.orbital = rands.reduce((p, c) => p + c, 0) / rands.length;
      
      let opacity = Math.floor(
        (1 - star.orbital / starEscapeWidth) * maxOpacity + Math.random() * 80
      );
      if (opacity < 0) opacity = 0;
      if (opacity > 255) opacity = 255;
      star.opacity = opacity;

      star.rotation = Math.PI * (Math.random() * 2);
      star.rSpeed = Math.random() * rotationSpeed + star.opacity / 20000;
      star.waveSpeed1 = Math.random() * waveSpeed;
      star.waveSpeed2 = Math.random() * waveSpeed;
      star.wave1 = 0;
      star.wave2 = 0;
      star.id = starsRef.current.length;
      starsRef.current.push(star);
    };

    const drawStar = (star: any) => {
      // Calculate current angle and center position dynamically
      const currentAngle = star.rotation + star.rSpeed * currentTime;
      const cx = size.x / 2;
      const cy = size.y / 2;
      
      const px = cx + Math.cos(currentAngle) * star.orbital;
      const py = cy + Math.sin(currentAngle) * star.orbital;

      // Update waves
      star.wave1 = Math.sin(currentTime * star.waveSpeed1) * waveFrequency;
      star.wave2 = Math.sin(currentTime * star.waveSpeed2) * waveFrequency;
      
      let opacity = Math.floor(
        (1 - star.orbital / starEscapeWidth) * maxOpacity + Math.random() * 80
      );
      if (opacity < 0) opacity = 0;
      if (opacity > 255) opacity = 255;
      star.opacity = opacity;

      // Draw new pixel
      const index =
        Math.floor(py + star.wave1) * size.x +
        Math.floor(px + star.wave2);
      if (index >= 0 && index < data.length) {
        data[index] =
          (star.opacity << 24) | // alpha
          (starColor.b << 16) | // blue
          (starColor.g << 8) | // green
          starColor.r; // red
      }
    };

    const render = () => {
      currentTime = (performance.now() - startTime) / 10;
 
      // Clear the entire pixel buffer to ensure a fresh clean render frame
      if (data) {
        data.fill(0);
      }

      // Create new stars up to starCount
      if (starsRef.current.length < starCount) {
        const batchSize = Math.min(150, starCount - starsRef.current.length);
        for (let i = 0; i < batchSize; i++) {
          createStar();
        }
      }

      // Draw all stars
      for (const star of starsRef.current) {
        drawStar(star);
      }

      // Update canvas
      context.putImageData(imagedata, 0, 0);

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(render);
    };

    // Initialize
    setSize();
    render();

    // Handle resize
    const resizeHandler = () => setSize();
    window.addEventListener('resize', resizeHandler);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', resizeHandler);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [starCount, waveFrequency, starEscapeWidth, voidWidth, starColor, maxOpacity, rotationSpeed, waveSpeed]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export { Starfield };
