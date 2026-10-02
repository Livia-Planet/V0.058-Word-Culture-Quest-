import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';

export type BurstIntensity = 'mini' | 'grand' | 'wordUnlock';
export type BurstTrajectory = 'fountain' | 'starburst' | 'spiral' | 'combo';

export interface BurstOptions {
  x?: number; // relative 0..1 or absolute pixels
  y?: number; // relative 0..1 or absolute pixels
  count?: number;
  intensity?: BurstIntensity;
  trajectory?: BurstTrajectory;
  characterGlyph?: string; // Floating golden character imprint
}

export interface CanvasParticleBurstRef {
  triggerBurst: (options?: BurstOptions) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  // Multi-stop color gradient
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  shape: 'coin' | 'star' | 'sparkle' | 'petal' | 'ribbon' | 'spark' | 'glyph';
  glyphText?: string;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
  gravity: number;
  drag: number;
  wobble: number;
  wobbleSpeed: number;
  trajectoryType: BurstTrajectory;
  // Spiral vortex specific
  spiralAngle?: number;
  spiralRadius?: number;
  spiralSpeed?: number;
  spiralGrowth?: number;
  centerOriginX?: number;
  centerOriginY?: number;
  // Spark stardust trails
  trail?: { x: number; y: number; alpha: number }[];
}

// Rich royal Chinese & celestial festival gradient palettes
const GRADIENT_PALETTES = [
  // 1. 皇室金辉 (Imperial Gold & Amber)
  {
    primary: '#fde047',
    secondary: '#f59e0b',
    accent: '#b45309',
  },
  // 2. 朱砂红霞 (Cinnabar Vermilion & Ruby)
  {
    primary: '#fecdd3',
    secondary: '#ef4444',
    accent: '#991b1b',
  },
  // 3. 昆仑碧玉 (Celestial Jade & Emerald)
  {
    primary: '#a7f3d0',
    secondary: '#10b981',
    accent: '#047857',
  },
  // 4. 紫微星芒 (Amethyst Galaxy & Radiant Lilac)
  {
    primary: '#f5d0fe',
    secondary: '#c084fc',
    accent: '#7e22ce',
  },
  // 5. 琉璃青鸾 (Cyan Phoenix & Aqua Jewel)
  {
    primary: '#a5f3fc',
    secondary: '#06b6d4',
    accent: '#0e7490',
  },
  // 6. 夕照流光 (Sunset Coral & Blazing Tangerine)
  {
    primary: '#fed7aa',
    secondary: '#f97316',
    accent: '#c2410c',
  },
];

export const CanvasParticleBurst = forwardRef<CanvasParticleBurstRef, {}>((_props, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Resize canvas with devicePixelRatio crispness
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [resizeCanvas]);

  // Main high-performance render loop
  const renderLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];

      // Update positions based on rich trajectory behaviors
      if (p.trajectoryType === 'spiral' && p.spiralAngle !== undefined && p.spiralRadius !== undefined) {
        // Logarithmic / Archimedean vortex path
        p.spiralAngle += p.spiralSpeed || 0.08;
        p.spiralRadius += p.spiralGrowth || 1.8;
        p.spiralGrowth = Math.max(0.3, (p.spiralGrowth || 1.8) * 0.985);

        const cx = p.centerOriginX || canvas.width / (2 * dpr);
        const cy = p.centerOriginY || canvas.height / (2 * dpr);

        p.x = cx + Math.cos(p.spiralAngle) * p.spiralRadius;
        p.y = cy + Math.sin(p.spiralAngle) * p.spiralRadius + p.vy;
        p.vy += p.gravity * 0.4;
      } else {
        // Starburst, fountain, or combo trajectory with aerodynamic drag
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;

        // Gentle breeze drift based on wobble
        p.x += Math.sin(p.wobble) * 0.65;
      }

      p.rotation += p.vRot;
      p.wobble += p.wobbleSpeed;
      p.alpha -= p.decay;

      // Spark stardust trail recording
      if (p.shape === 'sparkle' || p.shape === 'spark') {
        if (!p.trail) p.trail = [];
        p.trail.unshift({ x: p.x, y: p.y, alpha: p.alpha });
        if (p.trail.length > 5) p.trail.pop();
      }

      // Check boundary death
      if (p.alpha <= 0.005 || p.y * dpr > canvas.height + 80 || p.x * dpr < -80 || p.x * dpr > canvas.width + 80) {
        particles.splice(i, 1);
        continue;
      }

      const px = p.x * dpr;
      const py = p.y * dpr;
      const pSize = p.size * dpr;

      // Draw particle trails if present
      if (p.trail && p.trail.length > 1) {
        ctx.save();
        for (let t = 0; t < p.trail.length; t++) {
          const pt = p.trail[t];
          const trailAlpha = (pt.alpha * (1 - t / p.trail.length) * 0.5);
          if (trailAlpha <= 0.01) continue;

          ctx.beginPath();
          ctx.arc(pt.x * dpr, pt.y * dpr, (pSize * 0.45) * (1 - t / p.trail.length), 0, Math.PI * 2);
          ctx.fillStyle = p.primaryColor;
          ctx.globalAlpha = Math.max(0, trailAlpha);
          ctx.fill();
        }
        ctx.restore();
      }

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.translate(px, py);
      ctx.rotate(p.rotation);

      // Render based on shape with vibrant color gradients
      if (p.shape === 'glyph' && p.glyphText) {
        // Floating Golden Character Seal with Radiant Halo
        const haloGrad = ctx.createRadialGradient(0, 0, pSize * 0.3, 0, 0, pSize * 1.4);
        haloGrad.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
        haloGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.7)');
        haloGrad.addColorStop(1, 'rgba(180, 83, 9, 0)');

        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(0, 0, pSize * 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Tianzige-styled seal box
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2 * dpr;
        ctx.strokeRect(-pSize, -pSize, pSize * 2, pSize * 2);

        // Character font render
        ctx.font = `900 ${pSize * 1.3}px "KaiTi", "STKaiti", "Noto Serif SC", serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#7f1d1d';
        ctx.fillText(p.glyphText, 0, 0);

        ctx.fillStyle = '#fef08a';
        ctx.fillText(p.glyphText, -1, -1);
      } else if (p.shape === 'coin') {
        // Traditional Chinese Square-Hole Gold Coin with radial gradient
        const coinGrad = ctx.createRadialGradient(-pSize * 0.3, -pSize * 0.3, pSize * 0.1, 0, 0, pSize);
        coinGrad.addColorStop(0, p.primaryColor);
        coinGrad.addColorStop(0.7, p.secondaryColor);
        coinGrad.addColorStop(1, p.accentColor);

        ctx.beginPath();
        ctx.arc(0, 0, pSize, 0, Math.PI * 2);
        ctx.fillStyle = coinGrad;
        ctx.fill();

        ctx.lineWidth = 1.8 * dpr;
        ctx.strokeStyle = '#fef9c3';
        ctx.stroke();

        // Inner square hole
        const innerHole = pSize * 0.38;
        ctx.fillStyle = '#7f1d1d';
        ctx.fillRect(-innerHole / 2, -innerHole / 2, innerHole, innerHole);

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 0.9 * dpr;
        ctx.strokeRect(-innerHole / 2, -innerHole / 2, innerHole, innerHole);
      } else if (p.shape === 'sparkle') {
        // 4-Point Radiant Diamond Sparkle with luminous glow
        const radGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, pSize * 1.5);
        radGrad.addColorStop(0, '#ffffff');
        radGrad.addColorStop(0.3, p.primaryColor);
        radGrad.addColorStop(0.8, p.secondaryColor);
        radGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = radGrad;

        // Long horizontal and vertical diamond rays
        ctx.beginPath();
        ctx.moveTo(0, -pSize * 2.2);
        ctx.quadraticCurveTo(0, 0, pSize * 0.35, 0);
        ctx.quadraticCurveTo(0, 0, 0, pSize * 2.2);
        ctx.quadraticCurveTo(0, 0, -pSize * 0.35, 0);
        ctx.quadraticCurveTo(0, 0, 0, -pSize * 2.2);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-pSize * 2.2, 0);
        ctx.quadraticCurveTo(0, 0, 0, pSize * 0.35);
        ctx.quadraticCurveTo(0, 0, pSize * 2.2, 0);
        ctx.quadraticCurveTo(0, 0, 0, -pSize * 0.35);
        ctx.quadraticCurveTo(0, 0, -pSize * 2.2, 0);
        ctx.closePath();
        ctx.fill();

        // Bright sparkling core
        ctx.beginPath();
        ctx.arc(0, 0, pSize * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      } else if (p.shape === 'petal') {
        // Graceful Oriental Plum Blossom Petal
        const petalGrad = ctx.createLinearGradient(0, -pSize * 1.3, 0, pSize * 1.3);
        petalGrad.addColorStop(0, p.primaryColor);
        petalGrad.addColorStop(0.6, p.secondaryColor);
        petalGrad.addColorStop(1, p.accentColor);

        ctx.fillStyle = petalGrad;
        ctx.beginPath();
        ctx.moveTo(0, -pSize * 1.4);
        ctx.bezierCurveTo(pSize * 0.9, -pSize * 1.1, pSize * 1.1, pSize * 0.6, 0, pSize * 1.4);
        ctx.bezierCurveTo(-pSize * 1.1, pSize * 0.6, -pSize * 0.9, -pSize * 1.1, 0, -pSize * 1.4);
        ctx.closePath();
        ctx.fill();
      } else if (p.shape === 'ribbon') {
        // 3D Twisting Confetti Ribbon with sinusoidal perspective wobble
        const wobbleFactor = Math.cos(p.wobble);
        const ribbonGrad = ctx.createLinearGradient(-pSize, 0, pSize, 0);
        ribbonGrad.addColorStop(0, p.primaryColor);
        ribbonGrad.addColorStop(0.5, p.secondaryColor);
        ribbonGrad.addColorStop(1, p.accentColor);

        ctx.fillStyle = ribbonGrad;
        ctx.fillRect(-pSize / 2, (-pSize * 1.8 * wobbleFactor) / 2, pSize, pSize * 1.8 * wobbleFactor);
      } else if (p.shape === 'star') {
        // 5-Point Twinkling Star with dual-stop gradient
        const spikes = 5;
        const outerRadius = pSize * 1.35;
        const innerRadius = pSize * 0.58;
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;

        const starGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, outerRadius);
        starGrad.addColorStop(0, '#ffffff');
        starGrad.addColorStop(0.4, p.primaryColor);
        starGrad.addColorStop(1, p.secondaryColor);

        ctx.fillStyle = starGrad;
        ctx.beginPath();
        ctx.moveTo(0, -outerRadius);
        for (let s = 0; s < spikes; s++) {
          let xStar = Math.cos(rot) * outerRadius;
          let yStar = Math.sin(rot) * outerRadius;
          ctx.lineTo(xStar, yStar);
          rot += step;

          xStar = Math.cos(rot) * innerRadius;
          yStar = Math.sin(rot) * innerRadius;
          ctx.lineTo(xStar, yStar);
          rot += step;
        }
        ctx.lineTo(0, -outerRadius);
        ctx.closePath();
        ctx.fill();
      } else {
        // Shimmering stardust spark with luminous core
        const sparkGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, pSize);
        sparkGrad.addColorStop(0, '#ffffff');
        sparkGrad.addColorStop(0.4, p.primaryColor);
        sparkGrad.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = sparkGrad;
        ctx.beginPath();
        ctx.arc(0, 0, pSize * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    if (particles.length > 0) {
      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    } else {
      animFrameIdRef.current = null;
    }
  }, []);

  // Enhanced trigger burst function
  const triggerBurst = useCallback(
    (options?: BurstOptions) => {
      const intensity = options?.intensity ?? 'wordUnlock';
      const isGrand = intensity === 'grand';
      const isWordUnlock = intensity === 'wordUnlock';
      const count = options?.count ?? (isGrand ? 220 : isWordUnlock ? 85 : 45);

      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      // Base origin
      const originX = screenW * (options?.x ?? 0.5);
      const originY = screenH * (options?.y ?? (isGrand ? 0.6 : isWordUnlock ? 0.5 : 0.75));

      const origins = isGrand
        ? [
            { x: screenW * 0.22, y: screenH * 0.62 },
            { x: screenW * 0.5, y: screenH * 0.52 },
            { x: screenW * 0.78, y: screenH * 0.62 },
          ]
        : [{ x: originX, y: originY }];

      const particlesPerOrigin = Math.ceil(count / origins.length);

      // If unlocking a specific character, spawn an iconic ascending golden character imprint
      if (options?.characterGlyph) {
        particlesRef.current.push({
          x: originX,
          y: originY,
          vx: 0,
          vy: -2.8,
          size: 28,
          primaryColor: '#fde047',
          secondaryColor: '#f59e0b',
          accentColor: '#b45309',
          shape: 'glyph',
          glyphText: options.characterGlyph,
          alpha: 1,
          decay: 0.012,
          rotation: 0,
          vRot: 0,
          gravity: -0.01, // Ascending ethereal flight
          drag: 0.985,
          wobble: 0,
          wobbleSpeed: 0.05,
          trajectoryType: 'starburst',
        });
      }

      origins.forEach((orig) => {
        for (let i = 0; i < particlesPerOrigin; i++) {
          const palette = GRADIENT_PALETTES[Math.floor(Math.random() * GRADIENT_PALETTES.length)];
          const shapes: Particle['shape'][] = ['coin', 'star', 'sparkle', 'petal', 'ribbon', 'spark'];
          const shape = shapes[Math.floor(Math.random() * shapes.length)];

          // Determine trajectory type: starburst, spiral, or fountain
          let chosenTrajectory = options?.trajectory || (isWordUnlock ? 'combo' : isGrand ? 'combo' : 'fountain');
          if (chosenTrajectory === 'combo') {
            const types: BurstTrajectory[] = ['starburst', 'spiral', 'fountain'];
            chosenTrajectory = types[i % types.length];
          }

          let vx = 0;
          let vy = 0;
          let gravity = 0.28;
          let drag = 0.98;
          let spiralAngle: number | undefined;
          let spiralRadius: number | undefined;
          let spiralSpeed: number | undefined;
          let spiralGrowth: number | undefined;

          if (chosenTrajectory === 'starburst') {
            // 360-degree radial blast explosion with aerodynamic drag
            const angle = Math.random() * Math.PI * 2;
            const speed = isGrand ? 8 + Math.random() * 16 : isWordUnlock ? 6 + Math.random() * 13 : 5 + Math.random() * 9;
            vx = Math.cos(angle) * speed;
            vy = Math.sin(angle) * speed;
            drag = 0.96;
            gravity = 0.22;
          } else if (chosenTrajectory === 'spiral') {
            // Swirling vortex math
            spiralAngle = Math.random() * Math.PI * 2;
            spiralRadius = 6 + Math.random() * 20;
            spiralSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.07 + Math.random() * 0.09);
            spiralGrowth = 2.2 + Math.random() * 3.8;
            vy = -2 - Math.random() * 3;
            gravity = 0.06;
          } else {
            // Parabolic upward fountain arc
            const angle = Math.PI * 1.5 + (Math.random() - 0.5) * Math.PI * (isGrand ? 0.95 : 0.65);
            const speed = isGrand ? 10 + Math.random() * 16 : isWordUnlock ? 7 + Math.random() * 12 : 6 + Math.random() * 8;
            vx = Math.cos(angle) * speed;
            vy = Math.sin(angle) * speed;
            gravity = 0.32;
            drag = 0.985;
          }

          particlesRef.current.push({
            x: orig.x + (Math.random() - 0.5) * 16,
            y: orig.y + (Math.random() - 0.5) * 16,
            vx,
            vy,
            size: shape === 'coin' ? (isGrand ? 6.5 : 5.2) + Math.random() * 3 : (shape === 'sparkle' ? 5 + Math.random() * 5 : 3.5 + Math.random() * 4.5),
            primaryColor: palette.primary,
            secondaryColor: palette.secondary,
            accentColor: palette.accent,
            shape,
            alpha: 1,
            decay: isGrand ? 0.008 + Math.random() * 0.01 : 0.012 + Math.random() * 0.015,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.28,
            gravity,
            drag,
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.08 + Math.random() * 0.16,
            trajectoryType: chosenTrajectory,
            spiralAngle,
            spiralRadius,
            spiralSpeed,
            spiralGrowth,
            centerOriginX: orig.x,
            centerOriginY: orig.y,
          });
        }
      });

      // Start animation loop if not active
      if (!animFrameIdRef.current) {
        animFrameIdRef.current = requestAnimationFrame(renderLoop);
      }
    },
    [renderLoop]
  );

  useImperativeHandle(ref, () => ({
    triggerBurst,
  }));

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[9999]"
      aria-hidden="true"
    />
  );
});

CanvasParticleBurst.displayName = 'CanvasParticleBurst';
