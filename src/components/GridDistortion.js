import React, { useRef, useEffect } from 'react';

export default function GridDistortion({
  gridSize = 45,
  mouseRadius = 250,
  magneticPull = 0.6,
  springDelay = 0.08,
  friction = 0.85,
  color = 'rgba(59, 130, 246, 0.4)', // blue-500 with opacity
  backgroundColor = '#050a14' // very dark blue
}) {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    let width, height;
    let cols, rows;
    let points = [];
    
    // Virtual mouse to allow smooth trailing
    const mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
    
    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      
      // Calculate how many columns and rows needed to cover screen
      cols = Math.ceil(width / gridSize) + 1;
      rows = Math.ceil(height / gridSize) + 1;
      
      points = [];
      for (let y = 0; y <= rows; y++) {
        const row = [];
        for (let x = 0; x <= cols; x++) {
          row.push({
            x: x * gridSize,
            y: y * gridSize,
            baseX: x * gridSize,
            baseY: y * gridSize,
            vx: 0,
            vy: 0
          });
        }
        points.push(row);
      }
    };
    
    const onMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    };
    
    const onTouchMove = (e) => {
      mouse.targetX = e.touches[0].clientX;
      mouse.targetY = e.touches[0].clientY;
    };
    
    const onMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener('resize', init);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove);
    document.addEventListener('mouseleave', onMouseLeave);
    
    init();
    
    const draw = () => {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      
      // Smooth mouse transition
      mouse.x += (mouse.targetX - mouse.x) * 0.15;
      mouse.y += (mouse.targetY - mouse.y) * 0.15;
      
      // Update physics for each point
      for (let y = 0; y <= rows; y++) {
        for (let x = 0; x <= cols; x++) {
          const p = points[y][x];
          
          const dx = mouse.x - p.baseX;
          const dy = mouse.y - p.baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          let targetX = p.baseX;
          let targetY = p.baseY;
          
          // Magnet distortion logic
          if (dist < mouseRadius) {
            // Force is stronger closer to mouse (0 to 1)
            const force = (mouseRadius - dist) / mouseRadius;
            // Pull points towards the mouse
            targetX += (dx * force * magneticPull);
            targetY += (dy * force * magneticPull);
          }
          
          // Spring physics (pull back to target)
          p.vx += (targetX - p.x) * springDelay;
          p.vy += (targetY - p.y) * springDelay;
          
          // Friction (slow down)
          p.vx *= friction;
          p.vy *= friction;
          
          p.x += p.vx;
          p.y += p.vy;
        }
      }
      
      // Draw grid lines
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      
      // Optional: Add glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = color;
      
      // Draw horizontal curves
      for (let y = 0; y <= rows; y++) {
        ctx.beginPath();
        for (let x = 0; x <= cols; x++) {
          const p = points[y][x];
          if (x === 0) {
            ctx.moveTo(p.x, p.y);
          } else {
            // Use quadratic curves for smoother grid intersections
            const prevP = points[y][x - 1];
            const xc = (prevP.x + p.x) / 2;
            const yc = (prevP.y + p.y) / 2;
            ctx.quadraticCurveTo(prevP.x, prevP.y, xc, yc);
            if (x === cols) {
               ctx.lineTo(p.x, p.y);
            }
          }
        }
        ctx.stroke();
      }
      
      // Draw vertical curves
      for (let x = 0; x <= cols; x++) {
        ctx.beginPath();
        for (let y = 0; y <= rows; y++) {
          const p = points[y][x];
          if (y === 0) {
            ctx.moveTo(p.x, p.y);
          } else {
            const prevP = points[y - 1][x];
            const xc = (prevP.x + p.x) / 2;
            const yc = (prevP.y + p.y) / 2;
            ctx.quadraticCurveTo(prevP.x, prevP.y, xc, yc);
            if (y === rows) {
               ctx.lineTo(p.x, p.y);
            }
          }
        }
        ctx.stroke();
      }
      
      // Reset shadow for performance
      ctx.shadowBlur = 0;
      
      animationFrameId = window.requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [gridSize, mouseRadius, magneticPull, springDelay, friction, color, backgroundColor]);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
}
