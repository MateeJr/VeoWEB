'use client';

import { useEffect, useRef } from 'react';

const BubbleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas to full window size
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Create bubbles
    const bubbles: Bubble[] = [];
    const colors = ['#8c3bff', '#b866ff', '#d18fff', '#ff6ad5', '#cb6ce6']; // Purple to pink hues

    for (let i = 0; i < 20; i++) {
      bubbles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 100 + 50, // Large bubbles
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: Math.random() * 0.3 - 0.15, // Slower movement
        vy: Math.random() * 0.3 - 0.15, // Slower movement
        alpha: Math.random() * 0.15 + 0.05, // Very transparent
      });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw each bubble
      bubbles.forEach((bubble) => {
        // Move bubble
        bubble.x += bubble.vx;
        bubble.y += bubble.vy;
        
        // Wrap around edges
        if (bubble.x < -bubble.radius) bubble.x = canvas.width + bubble.radius;
        if (bubble.x > canvas.width + bubble.radius) bubble.x = -bubble.radius;
        if (bubble.y < -bubble.radius) bubble.y = canvas.height + bubble.radius;
        if (bubble.y > canvas.height + bubble.radius) bubble.y = -bubble.radius;
        
        // Draw bubble with blur effect
        ctx.save();
        ctx.filter = 'blur(40px)';
        ctx.globalAlpha = bubble.alpha;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = bubble.color;
        ctx.fill();
        ctx.restore();
      });
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
};

// TypeScript interface for bubbles
interface Bubble {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  alpha: number;
}

export default BubbleBackground; 