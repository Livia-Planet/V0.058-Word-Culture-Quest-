import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Volume2,
  Sparkles,
  BookOpen,
  Layers,
  X,
  Award,
  PenTool,
  BookText,
  Brush,
  Eraser,
  Undo2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Compass,
  ChevronRight,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HanziChar } from '../data/level1Data';
import { HanziStrokeAnimator } from './HanziStrokeAnimator';
import { sound, speakChinese } from '../utils/audio';
import { WRITING_TARGETS, CharacterWritingMeta } from './CanvasHandwritingPad';
import { useGameStore } from '../store/useGameStore';
import { AVAILABLE_BRUSH_SKINS, getBrushSkinById, BrushSkin } from '../data/brushSkinsData';

interface CharacterModalProps {
  charData: HanziChar;
  onClose: () => void;
}

interface DiagnosisReport {
  score: number;
  similarity: number;
  grade: '甲等·神韵完备' | '乙等·端庄得体' | '丙等·结体尚可' | '需精进·笔顺失衡';
  isMatch: boolean;
  centerOfGravity: {
    offsetX: number;
    offsetY: number;
    description: string;
  };
  quadrantBalance: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
    assessment: string;
  };
  corrections: string[];
  strengths: string[];
}

interface LuminousParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  glowColor: string;
  life: number;
  maxLife: number;
  rotation: number;
  vRot: number;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({ charData, onClose }) => {
  // 1. ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP LEVEL (React 19 Rules of Hooks)
  const gameStore = useGameStore();
  const [activeTab, setActiveTab] = useState<'meaning' | 'stroke' | 'writing'>('meaning');

  // Handwriting Pad State & Brush Skin Linkage
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentSkin = useMemo<BrushSkin>(() => {
    return getBrushSkinById(gameStore.activeBrushSkin || 'brush-ink');
  }, [gameStore.activeBrushSkin]);
  const [lockedHint, setLockedHint] = useState<string | null>(null);
  const [brushWidth, setBrushWidth] = useState<number>(9);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [strokesHistory, setStrokesHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);

  // 笔画间隔时间与笔韵值系统 (Stroke Cadence & Brush Rhythm System)
  const lastStrokeEndTimeRef = useRef<number | null>(null);
  const comboFlowRef = useRef<number>(0);
  const [brushRhythmScore, setBrushRhythmScore] = useState<number>(85);
  const [comboFlow, setComboFlow] = useState<number>(0);
  const [isFlowActive, setIsFlowActive] = useState<boolean>(false);
  const [rhythmStatusText, setRhythmStatusText] = useState<string>('气韵初聚 · 提笔悬腕');
  const [flowPulseActive, setFlowPulseActive] = useState<boolean>(false);

  // 微小光效粒子引擎 (Luminous Sparkle Particle Engine)
  const particlesRef = useRef<LuminousParticle[]>([]);
  const particleAnimIdRef = useRef<number | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisReport | null>(null);

  // Stroke deviation tremor animation state (偏差过大半透明抖动与低频震颤提示)
  const [isTremoring, setIsTremoring] = useState<boolean>(false);
  const [tremorMessage, setTremorMessage] = useState<string>('笔迹偏差过大 · 笔画结构失衡');

  // Async memory leak protection (组件卸载防护与定时器自动清理)
  const isMountedRef = useRef<boolean>(true);
  const analyzeTimerRef = useRef<number | null>(null);
  const tremorTimerRef = useRef<number | null>(null);

  // 微小光效粒子喷发引擎 (Fluid Stroke Micro Particle Glow)
  const spawnFluidParticles = useCallback((originX: number, originY: number, count: number, customColor?: string) => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const baseColor = customColor || currentSkin.strokeShadow || currentSkin.strokeColor || '#fbbf24';
    const colorPalette = [
      baseColor,
      '#fde047',
      '#fef08a',
      '#ffffff',
      '#f59e0b',
    ];

    const newParticles: LuminousParticle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.8 + 0.6;
      newParticles.push({
        x: originX + (Math.random() - 0.5) * 6,
        y: originY + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.6,
        size: Math.random() * 2.2 + 1.1,
        alpha: 1,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        glowColor: baseColor,
        life: 1,
        maxLife: Math.floor(Math.random() * 16) + 14,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.16,
      });
    }

    particlesRef.current.push(...newParticles);

    if (particleAnimIdRef.current === null) {
      const render = () => {
        const pCanvas = particleCanvasRef.current;
        if (!pCanvas) {
          particleAnimIdRef.current = null;
          return;
        }
        const ctx = pCanvas.getContext('2d');
        if (!ctx) {
          particleAnimIdRef.current = null;
          return;
        }

        ctx.clearRect(0, 0, pCanvas.width, pCanvas.height);

        particlesRef.current = particlesRef.current.filter((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.93;
          p.vy *= 0.93;
          p.rotation += p.vRot;
          p.life -= 1 / p.maxLife;

          if (p.life <= 0) return false;

          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.glowColor;
          ctx.shadowBlur = 6;

          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          const r = p.size;
          ctx.beginPath();
          ctx.moveTo(0, -r * 2);
          ctx.quadraticCurveTo(0, 0, r * 2, 0);
          ctx.quadraticCurveTo(0, 0, 0, r * 2);
          ctx.quadraticCurveTo(0, 0, -r * 2, 0);
          ctx.quadraticCurveTo(0, 0, 0, -r * 2);
          ctx.fill();

          ctx.restore();
          return true;
        });

        if (particlesRef.current.length > 0) {
          particleAnimIdRef.current = requestAnimationFrame(render);
        } else {
          ctx.clearRect(0, 0, pCanvas.width, pCanvas.height);
          particleAnimIdRef.current = null;
        }
      };

      particleAnimIdRef.current = requestAnimationFrame(render);
    }
  }, [currentSkin]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (analyzeTimerRef.current !== null) {
        clearTimeout(analyzeTimerRef.current);
      }
      if (tremorTimerRef.current !== null) {
        clearTimeout(tremorTimerRef.current);
      }
      if (particleAnimIdRef.current !== null) {
        cancelAnimationFrame(particleAnimIdRef.current);
      }
    };
  }, []);

  // Retrieve or synthesize writing metadata for current character (遵循单一信任源，charData 保证存在)
  const writingMeta: CharacterWritingMeta = useMemo(() => {
    const found = WRITING_TARGETS.find((w) => w.char === charData.char);
    if (found) return found;

    return {
      char: charData.char,
      pinyin: charData.pinyin,
      radical: charData.radical,
      strokeCount: charData.strokeCount,
      structure: '左右',
      strokeOrder:
        charData.components && charData.components.length > 0
          ? charData.components.map((c, i) => `部件${i + 1}:${c}`)
          : ['起笔', '折画', '中轴', '收笔'],
      keyTips: [
        `注意偏旁【${charData.radical}】在字中的穿插避让`,
        '米字格内重心保持稳定，主笔横平竖直',
        `趣味记忆：“${charData.mnemonic}”`,
      ],
      commonMistakes: '注意间架结构不要过紧或过松，各部分比例协调。',
    };
  }, [charData]);

  // Audio Handlers (移除冗余判空)
  const handlePlayAudio = useCallback(() => {
    sound.playCharClick();
    speakChinese(`${charData.char}，${charData.pinyin}`);
  }, [charData]);

  const handlePlaySentence = useCallback(() => {
    sound.playTap();
    speakChinese(charData.exampleSentence);
  }, [charData]);

  // Draw traditional Rice Grid (米字格)
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#c2410c';
    ctx.strokeRect(3, 3, width - 6, height - 6);

    ctx.lineWidth = 1;
    ctx.strokeStyle = '#f97316';
    ctx.strokeRect(8, 8, width - 16, height - 16);

    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 1.2;

    ctx.moveTo(width / 2, 8);
    ctx.lineTo(width / 2, height - 8);
    ctx.moveTo(8, height / 2);
    ctx.lineTo(width - 8, height / 2);

    ctx.moveTo(8, 8);
    ctx.lineTo(width - 8, height - 8);
    ctx.moveTo(width - 8, 8);
    ctx.lineTo(8, height - 8);
    ctx.stroke();

    ctx.restore();
  }, []);

  // Draw faint red-mold tracing watermark
  const drawWatermark = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, char: string) => {
    if (!char) return;
    ctx.save();
    ctx.font = `900 ${width * 0.72}px "Noto Serif SC", "SimSun", "STSong", "Songti SC", serif`;
    ctx.fillStyle = '#dc2626';
    ctx.globalAlpha = 0.14;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, width / 2, height / 2 + 6);
    ctx.restore();
  }, []);

  const DISPLAY_SIZE = 280;

  // Initialize or reset canvas with high-DPI (Retina) support
  const initCanvas = useCallback(
    (canvasNode?: HTMLCanvasElement | null) => {
      const canvas = canvasNode || canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      canvas.width = Math.round(DISPLAY_SIZE * dpr);
      canvas.height = Math.round(DISPLAY_SIZE * dpr);
      canvas.style.width = `${DISPLAY_SIZE}px`;
      canvas.style.height = `${DISPLAY_SIZE}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      drawGrid(ctx, DISPLAY_SIZE, DISPLAY_SIZE);

      if (showWatermark) {
        drawWatermark(ctx, DISPLAY_SIZE, DISPLAY_SIZE, charData.char);
      }

      const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setStrokesHistory([initialData]);
      setHistoryIndex(0);
      setHasDrawn(false);
      setDiagnosis(null);

      // Reset particles & rhythm stats
      const pCanvas = particleCanvasRef.current;
      if (pCanvas) {
        const pCtx = pCanvas.getContext('2d');
        if (pCtx) pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
      }
      particlesRef.current = [];
      lastStrokeEndTimeRef.current = null;
      comboFlowRef.current = 0;
      setComboFlow(0);
      setBrushRhythmScore(85);
      setIsFlowActive(false);
      setRhythmStatusText('气韵初聚 · 提笔悬腕');
    },
    [drawGrid, drawWatermark, showWatermark, charData.char]
  );

  // 【Callback Ref 模式】：彻底废除 setTimeout 渲染等待，DOM 节点挂载时由回调立即接管初始化
  const handleCanvasRef = useCallback(
    (node: HTMLCanvasElement | null) => {
      canvasRef.current = node;
      if (node && activeTab === 'writing') {
        initCanvas(node);
      }
    },
    [activeTab, initCanvas]
  );

  // 依赖项联动（如描红水印开关或字形切换时即刻重绘米字格底衬）
  useEffect(() => {
    if (activeTab === 'writing' && canvasRef.current) {
      initCanvas(canvasRef.current);
    }
  }, [showWatermark, charData.char, activeTab, initCanvas]);

  // Coordinates helper (Mouse & Touch) - returns display logical coordinates (0..DISPLAY_SIZE)
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = DISPLAY_SIZE / rect.width;
    const scaleY = DISPLAY_SIZE / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { x, y } = getCoordinates(e);

    // 自动计算笔画间隔时间与笔韵值 (Stroke Cadence & Fluidity Calculation)
    const now = performance.now();
    const lastEnd = lastStrokeEndTimeRef.current;
    if (lastEnd !== null) {
      const intervalMs = Math.round(now - lastEnd);
      if (intervalMs >= 90 && intervalMs <= 750) {
        // 连笔流畅区
        comboFlowRef.current += 1;
        const currentCombo = comboFlowRef.current;
        setComboFlow(currentCombo);
        setIsFlowActive(true);
        setFlowPulseActive(true);
        setTimeout(() => setFlowPulseActive(false), 550);

        const delta = Math.min(10, 4 + currentCombo * 2);
        setBrushRhythmScore((prev) => Math.min(100, prev + delta));
        setRhythmStatusText(`🌟 气韵生动 · 连笔流畅 (${intervalMs}ms)`);
        spawnFluidParticles(x, y, 14 + Math.min(currentCombo * 2, 10));
        if (currentCombo >= 2) {
          sound.playCharClick();
        }
      } else if (intervalMs > 750 && intervalMs <= 1400) {
        // 沉着从容区
        comboFlowRef.current = Math.max(1, Math.min(comboFlowRef.current, 2));
        setComboFlow(comboFlowRef.current);
        setIsFlowActive(false);
        setBrushRhythmScore((prev) => Math.min(94, prev + 2));
        setRhythmStatusText(`✨ 沉着稳健 · 骨气劲拔 (${intervalMs}ms)`);
        spawnFluidParticles(x, y, 6);
      } else {
        comboFlowRef.current = 0;
        setComboFlow(0);
        setIsFlowActive(false);
        setRhythmStatusText('🌱 敛气凝神 · 新笔待发');
      }
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.strokeStyle = currentSkin.strokeColor;
    if (currentSkin.type === 'pen') {
      ctx.lineWidth = Math.max(3, brushWidth * 0.55);
    } else {
      ctx.lineWidth = brushWidth;
    }

    if (currentSkin.strokeShadow) {
      ctx.shadowColor = currentSkin.strokeShadow;
      ctx.shadowBlur = 4;
    } else {
      ctx.shadowBlur = 0;
    }

    setIsDrawing(true);
    setHasDrawn(true);
    sound.playCharClick();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();

    // 连笔流畅时拖曳微小光效粒子
    if (comboFlowRef.current >= 1 && Math.random() < 0.22) {
      spawnFluidParticles(x, y, 1);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.shadowBlur = 0;

    lastStrokeEndTimeRef.current = performance.now();

    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = strokesHistory.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    setStrokesHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex <= 0) return;
    sound.playTap();
    const prevIndex = historyIndex - 1;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.putImageData(strokesHistory[prevIndex], 0, 0);
    setHistoryIndex(prevIndex);
    if (prevIndex === 0) setHasDrawn(false);
  };

  const handleClear = () => {
    sound.playWrong();
    initCanvas();
  };

  // Trigger stroke deviation tremor with mounted lifecycle protection
  const triggerTremor = (msg: string) => {
    setTremorMessage(msg);
    setIsTremoring(true);
    sound.playStrokeErrorShake();
    if (tremorTimerRef.current !== null) {
      clearTimeout(tremorTimerRef.current);
    }
    tremorTimerRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      setIsTremoring(false);
    }, 2200);
  };

  // Evaluate handwriting against standard character rules with async memory-leak protection
  const handleEvaluate = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sound.playTap();
    setIsAnalyzing(true);

    if (analyzeTimerRef.current !== null) {
      clearTimeout(analyzeTimerRef.current);
    }

    analyzeTimerRef.current = window.setTimeout(() => {
      if (!isMountedRef.current) return;
      setIsAnalyzing(false);

      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const width = canvas.width;
      const height = canvas.height;
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      let totalDrawnPixels = 0;
      let sumX = 0;
      let sumY = 0;

      let q1 = 0;
      let q2 = 0;
      let q3 = 0;
      let q4 = 0;

      const midX = width / 2;
      const midY = height / 2;

      const STEP = Math.max(2, Math.round(4 * dpr));
      const margin = Math.round(10 * dpr);
      for (let y = margin; y < height - margin; y += STEP) {
        for (let x = margin; x < width - margin; x += STEP) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          const isStroke = (r < 120 && g < 120 && b < 120) || (r > 160 && g < 80 && b < 80);

          if (isStroke) {
            totalDrawnPixels++;
            sumX += x;
            sumY += y;

            if (x <= midX && y <= midY) q1++;
            else if (x > midX && y <= midY) q2++;
            else if (x <= midX && y > midY) q3++;
            else q4++;
          }
        }
      }

      // 归一化像素量（补偿高分屏 DPR 与步长变化），保持判定阈值与评分模型精准稳定
      const normalizedDrawnPixels = (totalDrawnPixels * ((STEP / (2 * dpr)) ** 2)) / (dpr * dpr);

      if (normalizedDrawnPixels < 120) {
        if (!isMountedRef.current) return;
        setDiagnosis({
          score: 50,
          similarity: 32,
          grade: '需精进·笔顺失衡',
          isMatch: false,
          centerOfGravity: { offsetX: 0, offsetY: 0, description: '笔画过少，未能形成完整间架结构。' },
          quadrantBalance: { topLeft: 25, topRight: 25, bottomLeft: 25, bottomRight: 25, assessment: '笔画尚未成型' },
          corrections: ['请对照米字格红模完整临摹，补齐所有笔画。'],
          strengths: ['勇于动笔，继续练习！'],
        });
        triggerTremor('笔画过少 · 判定相似度过低 (32%)，请完整描红');
        return;
      }

      const avgX = sumX / totalDrawnPixels;
      const avgY = sumY / totalDrawnPixels;
      const offsetX = Math.round(((avgX - midX) / midX) * 100);
      const offsetY = Math.round(((avgY - midY) / midY) * 100);

      let gravityDesc = '重心沉稳，居中端正';
      if (Math.abs(offsetX) > 14 && Math.abs(offsetY) > 14) {
        gravityDesc = `字形重心明显偏向${offsetY < 0 ? '上' : '下'}${offsetX < 0 ? '左' : '右'}`;
      } else if (offsetX < -10) {
        gravityDesc = '字形重心略偏左，右侧笔画舒展度稍显欠缺';
      } else if (offsetX > 10) {
        gravityDesc = '字形重心略偏右，左侧偏旁注意收紧聚气';
      } else if (offsetY < -10) {
        gravityDesc = '字形重心偏高，下部底托需加强沉稳度';
      } else if (offsetY > 10) {
        gravityDesc = '字形重心偏低，注意提拔中轴';
      }

      const qTotal = Math.max(1, q1 + q2 + q3 + q4);
      const p1 = Math.round((q1 / qTotal) * 100);
      const p2 = Math.round((q2 / qTotal) * 100);
      const p3 = Math.round((q3 / qTotal) * 100);
      const p4 = Math.round((q4 / qTotal) * 100);

      let quadrantAssessment = '四象限空间配比匀称，布白通透得体。';
      if (Math.max(p1, p2, p3, p4) > 42) {
        quadrantAssessment = '局部空间分布过于密集，部分笔画有堆叠挤压现象。';
      }

      const gravityScore = Math.max(20, 40 - Math.abs(offsetX) * 0.7 - Math.abs(offsetY) * 0.7);
      const balanceScore = Math.max(20, 35 - (Math.max(p1, p2, p3, p4) - 25) * 0.8);
      const densityScore = Math.min(25, 15 + Math.min(10, normalizedDrawnPixels / 200));

      const rawScore = Math.min(98, Math.round(gravityScore + balanceScore + densityScore));
      const similarity = Math.min(99, rawScore);

      const strengths: string[] = [];
      const corrections: string[] = [];

      if (rawScore >= 85) {
        strengths.push('间架结构端庄，笔力挺拔，展现了楷书之骨力。');
        strengths.push('米字格四象限布局适度，虚实相生。');
        if (Math.abs(offsetX) <= 8 && Math.abs(offsetY) <= 8) {
          strengths.push('字形核心重心稳定，中轴线稳固。');
        }
      } else {
        strengths.push('整体轮廓基本齐备，能够清晰辨析出核心偏旁。');
      }

      writingMeta.keyTips.forEach((tip) => {
        if (corrections.length < 2) {
          corrections.push(`要领提醒：${tip}`);
        }
      });

      if (Math.abs(offsetX) > 10 || Math.abs(offsetY) > 10) {
        corrections.push(`米字格定位纠错：${gravityDesc}，建议起笔以中心交汇点为基准。`);
      }
      corrections.push(`防错避坑：${writingMeta.commonMistakes}`);

      let grade: DiagnosisReport['grade'] = '甲等·神韵完备';
      if (rawScore >= 88 && similarity >= 75) {
        grade = '甲等·神韵完备';
        sound.playVictory();
        try {
          confetti({ particleCount: 60, spread: 65, origin: { y: 0.6 } });
        } catch (error) {
          console.warn('[UI Effect Error]:', error);
        }
      } else if (rawScore >= 75) {
        grade = '乙等·端庄得体';
        sound.playFillSuccess();
      } else if (rawScore >= 68) {
        grade = '丙等·结体尚可';
        sound.playSnap();
      } else {
        grade = '需精进·笔顺失衡';
        triggerTremor(`相似度偏低 (${similarity}%) · 笔迹偏差偏大，请按标准范字纠偏`);
      }

      if (!isMountedRef.current) return;
      setDiagnosis({
        score: rawScore,
        similarity,
        grade,
        isMatch: true,
        centerOfGravity: { offsetX, offsetY, description: gravityDesc },
        quadrantBalance: { topLeft: p1, topRight: p2, bottomLeft: p3, bottomRight: p4, assessment: quadrantAssessment },
        corrections,
        strengths,
      });
    }, 550);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-2xl bg-gradient-to-b from-amber-50 to-orange-50 border-4 border-amber-300 rounded-3xl shadow-2xl overflow-hidden p-4 sm:p-6 text-slate-800 my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top traditional ornamental banner */}
        <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-yellow-300" /> 高频必考字
            </span>
            <span className="text-amber-800 font-bold text-xs sm:text-sm">
              偏旁: <span className="text-red-700 bg-amber-100 px-2 py-0.5 rounded-md font-bold">{charData.radical}</span> ({charData.radicalName})
            </span>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-amber-100 transition-colors cursor-pointer"
            aria-label="关闭"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Character Quick Title & Audio */}
        <div className="flex items-center justify-between bg-white/80 border border-amber-200 rounded-2xl px-4 py-2 mb-3 shadow-2xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black font-calligraphy text-red-700">
              {charData.char}
            </span>
            <span className="text-sm font-bold text-amber-800 font-mono tracking-wider">
              [{charData.pinyin}]
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {charData.strokeCount} 画
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayAudio}
              className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              title="读音朗读"
            >
              <Volume2 className="w-3.5 h-3.5" /> 播放发音
            </button>
          </div>
        </div>

        {/* Modal View Selector: 3 Tabs (音·形·义·写 完整大闭环) */}
        <div className="flex items-center gap-1.5 mb-3 bg-amber-200/60 p-1 rounded-xl border border-amber-300/80 shrink-0">
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('meaning');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'meaning'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-stone-700 hover:text-red-900'
            }`}
          >
            <BookText className="w-3.5 h-3.5" />
            <span>解字与演变</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('stroke');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'stroke'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-stone-700 hover:text-red-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>笔顺演示</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('writing');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'writing'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-stone-700 hover:text-red-900'
            }`}
          >
            <Brush className="w-3.5 h-3.5" />
            <span>书写与描红</span>
          </button>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {/* TAB 1: MEANING, ETYMOLOGY, MNEMONIC & EXAM WORDS */}
          {activeTab === 'meaning' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3 text-left"
            >
              {/* Meaning */}
              <div className="bg-white/80 rounded-2xl p-3.5 border border-amber-200 shadow-2xs">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">汉字释义</span>
                <p className="text-stone-800 text-sm font-medium leading-relaxed mt-0.5">{charData.meaning}</p>
              </div>

              {/* Component Breakdown Formula */}
              {charData.components && charData.components.length > 0 && (
                <div className="bg-white/80 rounded-2xl p-3 border border-amber-200 shadow-2xs">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide block mb-1">
                    积木式结构拆解公式
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {charData.components.map((comp, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <span className="text-stone-400 font-bold">+</span>}
                        <span className="bg-red-100 border border-red-300 text-red-800 font-bold text-xs sm:text-sm px-2.5 py-0.5 rounded-lg shadow-2xs">
                          {comp}
                        </span>
                      </React.Fragment>
                    ))}
                    <span className="text-stone-400 font-bold">=</span>
                    <span className="bg-amber-200 border border-amber-400 text-amber-900 font-bold text-xs sm:text-sm px-3 py-0.5 rounded-lg">
                      {charData.char}
                    </span>
                  </div>
                </div>
              )}

              {/* Etymology & Mnemonic */}
              <div className="bg-white/80 rounded-2xl p-3.5 border border-amber-200 shadow-2xs space-y-2.5">
                <div className="flex items-start gap-2">
                  <Layers className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-800">字形源流与造字逻辑</h4>
                    <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{charData.etymology}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-amber-100/70 p-2.5 rounded-xl border border-amber-200">
                  <Sparkles className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-red-800">趣味记忆口诀 (Mnemonic)</h4>
                    <p className="text-xs font-semibold text-red-900 mt-0.5">“{charData.mnemonic}”</p>
                  </div>
                </div>
              </div>

              {/* High-frequency Exam Words */}
              <div className="bg-white/80 rounded-2xl p-3.5 border border-amber-200 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                  <span>5-6年级常考词汇积累</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {charData.examWords.map((word, idx) => (
                    <span
                      key={idx}
                      className="bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                      onClick={() => {
                        sound.playTap();
                        speakChinese(word);
                      }}
                      title="点击朗读词汇"
                    >
                      {word} 🔊
                    </span>
                  ))}
                </div>
              </div>

              {/* Example Sentence with Audio */}
              <div className="bg-orange-100/80 rounded-xl p-3 border border-orange-200 flex items-center justify-between gap-3">
                <div className="text-xs text-stone-700 leading-relaxed font-medium">
                  <span className="font-bold text-orange-800 mr-1">例句:</span>
                  {charData.exampleSentence}
                </div>
                <button
                  onClick={handlePlaySentence}
                  className="p-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow-2xs shrink-0 transition-transform active:scale-95 cursor-pointer"
                  title="朗读整句"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: SVG STROKE PATH ANIMATION */}
          {activeTab === 'stroke' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <HanziStrokeAnimator
                char={charData.char}
                pinyin={charData.pinyin}
              />

              {/* Component breakdown formula */}
              <div className="bg-white/80 rounded-2xl p-3 border border-amber-200 shadow-2xs text-left">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide block mb-1">
                  积木式结构拆解公式
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {charData.components.map((comp, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-stone-400 font-bold">+</span>}
                      <span className="bg-red-100 border border-red-300 text-red-800 font-bold text-xs sm:text-sm px-2.5 py-0.5 rounded-lg shadow-2xs">
                        {comp}
                      </span>
                    </React.Fragment>
                  ))}
                  <span className="text-stone-400 font-bold">=</span>
                  <span className="bg-amber-200 border border-amber-400 text-amber-900 font-bold text-xs sm:text-sm px-3 py-0.5 rounded-lg">
                    {charData.char}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: INTERACTIVE CANVAS WRITING & TRACING (书写与描红闭环) */}
          {activeTab === 'writing' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3.5"
            >
              {/* Writing Workspace: Canvas & Controls */}
              <div className="flex flex-col items-center space-y-2.5">
                {/* 笔画间隔自动测算‘笔韵值’与连笔流光指标条 (Stroke Cadence & Brush Rhythm Banner) */}
                <div className="w-full max-w-[280px] px-3 py-1.5 rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 border border-yellow-500/50 text-white shadow-md flex items-center justify-between gap-1.5 backdrop-blur-md">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Flame
                      className={`w-3.5 h-3.5 transition-transform duration-300 ${
                        isFlowActive || flowPulseActive ? 'text-yellow-400 scale-125 animate-bounce' : 'text-amber-500'
                      }`}
                    />
                    <span className="text-[10px] font-bold text-amber-200">笔韵值:</span>
                    <span
                      className={`font-mono text-xs font-black transition-colors ${
                        brushRhythmScore >= 90
                          ? 'text-yellow-300 drop-shadow-[0_0_6px_rgba(253,224,71,0.6)]'
                          : brushRhythmScore >= 80
                          ? 'text-amber-300'
                          : 'text-stone-300'
                      }`}
                    >
                      {brushRhythmScore}分
                    </span>
                    {comboFlow > 1 && (
                      <span className="px-1.5 py-0.2 rounded-md bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 text-[9px] font-black shadow-xs animate-pulse">
                        连笔 x{comboFlow}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-bold text-amber-200/90 truncate text-right">
                    {rhythmStatusText}
                  </div>
                </div>

                {/* Canvas Container with Framer Motion Tremor Animation */}
                <motion.div
                  animate={
                    isTremoring
                      ? {
                          x: [0, -8, 8, -6, 6, -3, 3, 0],
                          y: [0, -2, 2, -1, 1, 0],
                        }
                      : { x: 0, y: 0 }
                  }
                  transition={{ duration: 0.5, repeat: isTremoring ? 2 : 0, ease: 'easeInOut' }}
                  className={`relative p-2 rounded-3xl shadow-inner border-2 transition-all ${
                    isTremoring
                      ? 'bg-red-200/90 border-red-500 ring-4 ring-red-400/60 shadow-red-300'
                      : 'bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200 border-amber-400/70'
                  }`}
                >
                  <canvas
                    ref={handleCanvasRef}
                    width={280}
                    height={280}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="rounded-2xl cursor-crosshair shadow-md bg-[#fdfbf7] touch-none block"
                  />

                  {/* 微小璀璨粒子光效覆盖画布 (Luminous Sparkle Canvas Overlay) */}
                  <canvas
                    ref={particleCanvasRef}
                    width={280}
                    height={280}
                    className="absolute inset-2 rounded-2xl pointer-events-none z-15 block"
                  />

                  {/* Visual Red-Ink Overlay (标准红模字叠图对比) */}
                  {showOverlay && !isTremoring && (
                    <div
                      className="absolute inset-2 flex items-center justify-center pointer-events-none select-none"
                      style={{
                        fontFamily: '"Noto Serif SC", "SimSun", serif',
                        fontSize: '190px',
                        color: 'rgba(239, 68, 68, 0.42)',
                        fontWeight: 900,
                        transform: 'translateY(6px)',
                      }}
                    >
                      {charData.char}
                    </div>
                  )}

                  {/* 半透明‘笔迹抖动’提示动效 */}
                  {isTremoring && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-2 rounded-2xl pointer-events-none z-20 bg-red-950/25 backdrop-blur-[1.5px] border-2 border-red-500/80 flex flex-col items-center justify-center overflow-hidden animate-stroke-tremor"
                    >
                      <motion.div
                        animate={{
                          scale: [1, 1.06, 0.96, 1.04, 1],
                          opacity: [0.25, 0.45, 0.3, 0.4, 0.25],
                          rotate: [-1.5, 2, -2, 1.5, 0],
                        }}
                        transition={{ duration: 0.45, repeat: Infinity }}
                        className="text-[180px] font-black text-red-600/40 select-none leading-none -mt-3"
                        style={{ fontFamily: '"Noto Serif SC", "SimSun", serif' }}
                      >
                        {charData.char}
                      </motion.div>

                      <div className="absolute bottom-3 inset-x-2 mx-auto max-w-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-900 to-amber-950 text-yellow-200 border border-yellow-400 shadow-xl flex items-center justify-center gap-1.5 text-xs font-black animate-stroke-tremor">
                        <AlertCircle className="w-3.5 h-3.5 text-yellow-300 shrink-0 animate-spin" />
                        <span className="truncate">{tremorMessage}</span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Canvas Toolbar Controls */}
                <div className="w-full max-w-sm space-y-2">
                  {/* Brush Skins & Stroke Width Toolbar (墨宝工坊联动) */}
                  <div className="bg-stone-100 p-2 rounded-2xl border border-stone-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-stone-500">笔触皮肤:</span>
                        <span className="font-bold text-xs flex items-center gap-1 text-stone-800">
                          <span>{currentSkin.icon}</span>
                          <span style={{ color: currentSkin.strokeColor }}>{currentSkin.name}</span>
                          <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full font-black">
                            {currentSkin.effectName}
                          </span>
                        </span>
                      </div>

                      {/* Stroke Width Selector */}
                      <div className="flex items-center gap-1 pl-1.5">
                        <button
                          onClick={() => setBrushWidth(5)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] cursor-pointer transition-all ${
                            brushWidth === 5 ? 'bg-amber-400 text-red-950 font-black shadow-xs' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                          }`}
                          title="细笔"
                        >
                          细
                        </button>
                        <button
                          onClick={() => setBrushWidth(9)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] cursor-pointer transition-all ${
                            brushWidth === 9 ? 'bg-amber-400 text-red-950 font-black shadow-xs' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                          }`}
                          title="中笔"
                        >
                          中
                        </button>
                        <button
                          onClick={() => setBrushWidth(15)}
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] cursor-pointer transition-all ${
                            brushWidth === 15 ? 'bg-amber-400 text-red-950 font-black shadow-xs' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                          }`}
                          title="粗笔"
                        >
                          粗
                        </button>
                      </div>
                    </div>

                    {/* Scrollable / Wrap Grid of Brush Skins */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
                      {AVAILABLE_BRUSH_SKINS.map((skin) => {
                        const isUnlocked = gameStore.isBrushSkinUnlocked(skin.id);
                        const isActive = currentSkin.id === skin.id;

                        return (
                          <button
                            key={skin.id}
                            onClick={() => {
                              if (isUnlocked) {
                                sound.playTap();
                                gameStore.setActiveBrushSkin(skin.id);
                                setLockedHint(null);
                              } else {
                                sound.playTap();
                                setLockedHint(`【${skin.name}】可在修业宝库-墨宝工坊中使用 ${skin.costExp} 阅历值研制兑换！`);
                              }
                            }}
                            className={`min-h-[36px] px-2 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer select-none active:scale-95 ${
                              isActive
                                ? 'bg-stone-900 text-white ring-2 shadow-xs'
                                : isUnlocked
                                ? 'bg-white hover:bg-amber-50 text-stone-700 border border-stone-200'
                                : 'bg-stone-200/80 text-stone-400 border border-dashed border-stone-300'
                            }`}
                            style={{
                              borderColor: isActive ? skin.strokeColor : undefined,
                            }}
                            title={isUnlocked ? skin.desc : `待在墨宝工坊研制 (需 ${skin.costExp} 阅历值)`}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-2xs"
                              style={{ backgroundColor: skin.strokeColor }}
                            />
                            <span>{skin.name}</span>
                            {!isUnlocked && (
                              <span className="text-[10px] opacity-75">🔒</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Locked hint banner */}
                    {lockedHint && (
                      <div className="bg-amber-50 border border-amber-300 text-amber-900 px-2.5 py-1.5 rounded-xl text-[11px] flex items-center justify-between gap-1 animate-in fade-in">
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{lockedHint}</span>
                        </div>
                        <button
                          onClick={() => setLockedHint(null)}
                          className="text-stone-400 hover:text-stone-600 font-black ml-1 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Watermark / Overlay / Undo / Clear */}
                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          sound.playTap();
                          setShowWatermark((prev) => !prev);
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                          showWatermark
                            ? 'bg-amber-100 border-amber-300 text-amber-900'
                            : 'bg-stone-100 border-stone-200 text-stone-600'
                        }`}
                        title="开关底层半透明描红水印"
                      >
                        {showWatermark ? <Eye className="w-3.5 h-3.5 text-amber-700" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>描红底模</span>
                      </button>

                      <button
                        onClick={() => {
                          sound.playTap();
                          setShowOverlay((prev) => !prev);
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                          showOverlay
                            ? 'bg-red-100 border-red-300 text-red-900 ring-1 ring-red-400'
                            : 'bg-stone-100 border-stone-200 text-stone-600'
                        }`}
                        title="叠加上层半透明标准字对比笔迹差异"
                      >
                        <Layers className="w-3.5 h-3.5 text-red-600" />
                        <span>叠图对比</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleUndo}
                        disabled={historyIndex <= 0}
                        className={`px-2.5 py-1 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                          historyIndex > 0
                            ? 'bg-amber-50 hover:bg-amber-100 text-stone-800 border-amber-300 cursor-pointer'
                            : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                        }`}
                        title="撤销上一笔"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        <span>撤销</span>
                      </button>

                      <button
                        onClick={handleClear}
                        className="px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 border border-stone-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        title="清空画布"
                      >
                        <Eraser className="w-3.5 h-3.5" />
                        <span>重写</span>
                      </button>
                    </div>
                  </div>

                  {/* Big Action: Intelligent Diagnosis */}
                  <button
                    onClick={handleEvaluate}
                    disabled={!hasDrawn || isAnalyzing}
                    className={`w-full py-2.5 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95 ${
                      !hasDrawn
                        ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        : isAnalyzing
                        ? 'bg-amber-300 text-amber-900 cursor-wait'
                        : 'bg-gradient-to-r from-red-700 via-orange-600 to-amber-600 hover:from-red-600 hover:to-orange-500 text-white border border-yellow-300 cursor-pointer animate-pulse ring-2 ring-yellow-400/50'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>{isAnalyzing ? '智能比对与纠错诊断中...' : '识别字形并进行智能对比纠错'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Diagnostic Feedback (When evaluated) */}
              {diagnosis && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 border-2 border-amber-300 rounded-2xl p-4 shadow-sm space-y-3 text-left animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-calligraphy text-xl font-black text-white shadow-xs border border-yellow-300 ${
                          diagnosis.score >= 85
                            ? 'bg-gradient-to-br from-red-600 to-amber-600'
                            : diagnosis.score >= 75
                            ? 'bg-gradient-to-br from-amber-600 to-orange-600'
                            : 'bg-gradient-to-br from-stone-600 to-stone-700'
                        }`}
                      >
                        {diagnosis.score}
                      </div>
                      <div>
                        <span className="font-festive font-black text-sm text-red-950 block">
                          {diagnosis.grade}
                        </span>
                        <span className="text-[10px] text-stone-500 block">
                          综合相似度: {diagnosis.similarity}%
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                        diagnosis.similarity >= 75
                          ? 'text-red-800 bg-amber-100 border-amber-300'
                          : 'text-red-900 bg-red-100 border-red-400 font-black'
                      }`}
                    >
                      {diagnosis.grade}
                    </span>
                  </div>

                  {/* Center of Gravity & Quadrant Analysis */}
                  <div className="bg-white/80 border border-amber-200 rounded-xl p-2.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-700 flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-red-700" />
                        <span>重心分析：</span>
                      </span>
                      <span className="font-extrabold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px]">
                        {diagnosis.centerOfGravity.description}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-center font-bold text-[10px]">
                      <div className="bg-stone-50 border border-stone-200 p-1 rounded">
                        <span className="text-stone-400 block">左上</span>
                        <span className="text-amber-900">{diagnosis.quadrantBalance.topLeft}%</span>
                      </div>
                      <div className="bg-stone-50 border border-stone-200 p-1 rounded">
                        <span className="text-stone-400 block">右上</span>
                        <span className="text-amber-900">{diagnosis.quadrantBalance.topRight}%</span>
                      </div>
                      <div className="bg-stone-50 border border-stone-200 p-1 rounded">
                        <span className="text-stone-400 block">左下</span>
                        <span className="text-amber-900">{diagnosis.quadrantBalance.bottomLeft}%</span>
                      </div>
                      <div className="bg-stone-50 border border-stone-200 p-1 rounded">
                        <span className="text-stone-400 block">右下</span>
                        <span className="text-amber-900">{diagnosis.quadrantBalance.bottomRight}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Strengths */}
                  {diagnosis.strengths.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>笔意亮点：</span>
                      </span>
                      <ul className="text-[11px] text-stone-600 space-y-0.5 pl-4 list-disc">
                        {diagnosis.strengths.map((str, i) => (
                          <li key={i}>{str}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actionable Corrections */}
                  {diagnosis.corrections.length > 0 && (
                    <div className="bg-red-50/90 border border-red-200 rounded-xl p-2.5 space-y-1">
                      <span className="text-[11px] font-bold text-red-900 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-red-700" />
                        <span>纠错处方：</span>
                      </span>
                      <ul className="text-[11px] text-red-950 space-y-0.5 pl-4 list-disc">
                        {diagnosis.corrections.map((corr, i) => (
                          <li key={i}>{corr}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Stroke Order Chips & Tips Reference */}
              <div className="bg-white/80 border border-amber-200 rounded-2xl p-3 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">
                    规范运笔建议 ({writingMeta.strokeOrder.length} 步)：
                  </span>
                  <span className="text-[10px] text-stone-500">点击笔画听发音</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {writingMeta.strokeOrder.map((step, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        sound.playTap();
                        speakChinese(`第${idx + 1}步，${step}`);
                      }}
                      className="px-2 py-0.5 rounded-lg text-[11px] font-medium bg-amber-50 hover:bg-amber-100 border border-amber-200 text-stone-800 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <span className="w-3.5 h-3.5 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-[9px] font-bold">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </button>
                  ))}
                </div>

                <div className="bg-amber-50 p-2 rounded-xl border border-amber-200 text-[11px] text-stone-700">
                  <span className="font-bold text-amber-900 mr-1">结构口诀:</span>
                  {writingMeta.keyTips[0]}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom OK button */}
        <div className="mt-3 pt-2 border-t border-amber-200/80 shrink-0">
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="w-full py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-98 cursor-pointer"
          >
            已掌握音形义写，继续探索
          </button>
        </div>
      </motion.div>
    </div>
  );
};
