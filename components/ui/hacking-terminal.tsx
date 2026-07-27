'use client';

import { useEffect, useRef } from 'react';

interface HackingTerminalProps {
  colorPurple?: string;
  colorCyan?: string;
  fontSize?: number;
  speed?: number;
}

export const HackingTerminal = ({
  colorPurple = '#9d4edf',
  colorCyan = '#00f5ff',
  fontSize = 14,
  speed = 35, // interval in ms
}: HackingTerminalProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    let columns = Math.floor(width / fontSize);
    let drops = new Array(columns).fill(1).map(() => Math.floor(Math.random() * -100)); // stagger start positions

    const handleResize = () => {
      if (!container || !canvas) return;
      width = canvas.width = container.clientWidth;
      height = canvas.height = container.clientHeight;
      columns = Math.floor(width / fontSize);
      drops = new Array(columns).fill(1).map(() => Math.floor(Math.random() * -100));
    };

    window.addEventListener('resize', handleResize);

    // Characters list (binary, hex, and cyber symbols)
    const chars = '0101010101ABCDEF0x[]_$/\\&|^%#@!*+-~{}';
    const charArray = chars.split('');

    // Track frame intervals
    let lastTime = 0;
    let animationFrameId: number;

    const draw = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const elapsed = timestamp - lastTime;

      // Limit frame rate to control speed smoothly
      if (elapsed > speed) {
        // Draw trailing translucent background
        ctx.fillStyle = 'rgba(5, 5, 9, 0.08)'; // matches deep black #050509
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          // Skip drawing if the drop hasn't entered the screen yet
          if (drops[i] < 0) {
            drops[i]++;
            continue;
          }

          // Choose random character
          const text = charArray[Math.floor(Math.random() * charArray.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          // Head of the drop is bright white with purple glow, trail is primarily purple with some cyan accents
          if (Math.random() > 0.98) {
            ctx.fillStyle = '#ffffff'; // White head
            ctx.shadowBlur = 8;
            ctx.shadowColor = colorPurple;
          } else if (Math.random() > 0.15) {
            ctx.fillStyle = colorPurple; // Primary Purple trail
            ctx.shadowBlur = 4;
            ctx.shadowColor = colorPurple;
          } else {
            ctx.fillStyle = colorCyan; // Accent Cyan trail
            ctx.shadowBlur = 4;
            ctx.shadowColor = colorCyan;
          }

          ctx.fillText(text, x, y);
          ctx.shadowBlur = 0; // Reset shadow

          // If drop goes off screen, reset to top randomly
          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }

          drops[i]++;
        }
        
        lastTime = timestamp;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    // Start loop
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [colorPurple, colorCyan, fontSize, speed]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
