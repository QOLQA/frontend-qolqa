"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export const ElectricBackgroundWidget = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const nodeCount = Math.floor((width * height) / 18000);
    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2.5 + 1.5,
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    const drawLightning = (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      alpha: number,
    ) => {
      const distance = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.floor(distance / 20);

      ctx.beginPath();
      ctx.moveTo(x1, y1);

      for (let i = 1; i < steps; i++) {
        const targetX = x1 + ((x2 - x1) / steps) * i;
        const targetY = y1 + ((y2 - y1) / steps) * i;
        const offset = (Math.random() - 0.5) * 10;
        ctx.lineTo(targetX + offset, targetY + offset);
      }

      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(0, 82, 204, ${Math.min(1, alpha * 1.8)})`; // Azul brillante #0052cc
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    const render = () => {
      // Dibujar fondo oscuro directamente en canvas
      ctx.fillStyle = "#0f0f0f";
      ctx.fillRect(0, 0, width, height);

      // Grid de fondo
      const gridSize = 60;
      ctx.strokeStyle = "rgba(54, 54, 54, 0.25)";
      ctx.lineWidth = 0.5;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Nodos y arcos eléctricos
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#0052cc";
        ctx.shadowColor = "#0052cc";
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dist = Math.hypot(node.x - other.x, node.y - other.y);
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.5;
            if (Math.random() > 0.93) {
              drawLightning(node.x, node.y, other.x, other.y, alpha * 2);
            } else {
              ctx.beginPath();
              ctx.moveTo(node.x, node.y);
              ctx.lineTo(other.x, other.y);
              ctx.strokeStyle = `rgba(0, 82, 204, ${alpha})`;
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }

        const mouseDist = Math.hypot(node.x - mouseX, node.y - mouseY);
        if (mouseDist < 200) {
          const alpha = (1 - mouseDist / 200) * 0.8;
          drawLightning(node.x, node.y, mouseX, mouseY, alpha);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
  );
};
