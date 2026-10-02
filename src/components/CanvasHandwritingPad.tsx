import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCcw,
  Sparkles,
  Eraser,
  Undo2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Volume2,
  Layers,
  Award,
  ChevronRight,
  Maximize2,
  Brush,
  Compass,
  Zap,
  Activity,
  Flame,
  Lock,
  Music,
  VolumeX,
  Minimize2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound, speakChinese } from '../utils/audio';
import { guqinAudio } from '../utils/guqinAudio';
import { useGameStore } from '../store/useGameStore';
import { getStoryChallengeData } from '../data/storyLevels';
import {
  AVAILABLE_BRUSH_SKINS,
  getBrushSkinById,
  BrushSkin,
} from '../data/brushSkinsData';

export interface CharacterWritingMeta {
  char: string;
  pinyin: string;
  radical: string;
  strokeCount: number;
  structure: '独体' | '左右' | '上下' | '半包围' | '全包围';
  strokeOrder: string[];
  keyTips: string[];
  commonMistakes: string;
}

export const WRITING_TARGETS: CharacterWritingMeta[] = [
  {
    char: '春',
    pinyin: 'chūn',
    radical: '日',
    strokeCount: 9,
    structure: '上下',
    strokeOrder: ['横', '横', '横', '撇', '捺', '竖', '横折', '横', '横'],
    keyTips: [
      '三横长短有致：首横平正，中横略短，底横最长承载大局。',
      '撇捺舒展如鹏展翅，撇起笔高挺，捺角略沉有顿笔。',
      '下方「日」部居中收紧，不可写得过于宽扁。',
    ],
    commonMistakes: '三横间距不均匀；撇捺过于拘谨，未能包裹下方的「日」部。',
  },
  {
    char: '节',
    pinyin: 'jié',
    radical: '艹',
    strokeCount: 5,
    structure: '上下',
    strokeOrder: ['横', '竖', '竖', '横折钩', '竖'],
    keyTips: [
      '草字头左右对称，左竖短而微收，右竖稍长。',
      '下方横折钩横平竖直，折角挺拔有力。',
      '悬针竖垂直居中，起笔挺拔，收笔出锋如破竹。',
    ],
    commonMistakes: '悬针竖偏左或偏右，草字头过大导致头重脚轻。',
  },
  {
    char: '年',
    pinyin: 'nián',
    radical: '干',
    strokeCount: 6,
    structure: '独体',
    strokeOrder: ['撇', '横', '横', '竖', '横', '竖'],
    keyTips: [
      '首撇较平，为字形定下端正基调。',
      '中间三横间距均等，第三横最长托起上方。',
      '最后一竖正中稳健，如中流砥柱垂挂正中。',
    ],
    commonMistakes: '横画间距疏密不匀；首撇斜度过大导致字形倾斜。',
  },
  {
    char: '福',
    pinyin: 'fú',
    radical: '礻',
    strokeCount: 13,
    structure: '左右',
    strokeOrder: ['点', '横撇', '竖', '点', '横', '竖', '横折', '横', '竖', '横折', '横', '竖', '横'],
    keyTips: [
      '左侧示字旁为一点（礻），左窄右宽，避就得当。',
      '右侧「一口田」上下居中对齐，田字饱满四方。',
      '横画略呈仰势，体现福气祥和之气韵。',
    ],
    commonMistakes: '误将示字旁（礻）写成衣字旁（衤，多一点）；右侧田部过于臃肿。',
  },
  {
    char: '除',
    pinyin: 'chú',
    radical: '阝',
    strokeCount: 9,
    structure: '左右',
    strokeOrder: ['横折折折钩', '竖', '撇', '捺', '横', '横', '竖钩', '撇', '点'],
    keyTips: [
      '左耳旁窄而瘦长，竖画微向内弯，右侧余字要高昂开阔。',
      '人字头撇捺舒展宽绰，遮盖下方「二小」。',
      '竖钩中正挺拔，左右撇点相互呼应。',
    ],
    commonMistakes: '左耳旁与右部距离太宽；「余」部的人字头过小显得局促。',
  },
  {
    char: '夕',
    pinyin: 'xī',
    radical: '夕',
    strokeCount: 3,
    structure: '独体',
    strokeOrder: ['撇', '横撇', '点'],
    keyTips: [
      '首撇稍直，起笔沉实。',
      '横撇折角约60度，撇画自然向下弧展。',
      '心内一点不离中心，悬空聚气。',
    ],
    commonMistakes: '横撇折角过大变成钝角；内部一点贴在壁上，失去空灵通透之气。',
  },
  {
    char: '迎',
    pinyin: 'yíng',
    radical: '辶',
    strokeCount: 7,
    structure: '半包围',
    strokeOrder: ['撇', '竖提', '横折', '竖', '点', '横折折撇', '捺'],
    keyTips: [
      '先写被包围部分「卬」，后写走之底。',
      '「卬」部左高右低，重心紧聚。',
      '走之底捺画平正舒坦，平水托载上方。',
    ],
    commonMistakes: '笔顺颠倒先写走之；走之底捺画翘起未能托住被包围部分。',
  },
  {
    char: '新',
    pinyin: 'xīn',
    radical: '斤',
    strokeCount: 13,
    structure: '左右',
    strokeOrder: ['点', '横', '点', '撇', '横', '竖', '撇', '点', '撇', '撇', '横', '竖'],
    keyTips: [
      '左部「亲」立字紧凑，木字下缩；右部「斤」下放。',
      '左右高低错落，斤部平撇短促，竖撇修长。',
      '右侧竖笔为悬针竖，垂直坚挺。',
    ],
    commonMistakes: '左右部分等高，缺乏穿插避让；左侧「亲」字写得太宽。',
  },
];

export interface DiagnosisReport {
  score: number;
  similarity: number; // 手写识别与标准字形相似度百分比
  grade: '甲等·神韵完备' | '乙等·端庄得体' | '丙等·结体尚可' | '需精进·笔顺失衡';
  recognizedChar: string;
  isMatch: boolean;
  centerOfGravity: {
    offsetX: number; // percentage offset from grid center (-50 to +50)
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
  strokeCompleteness: string;
  corrections: string[];
  strengths: string[];
  errorStrokeIndices?: number[]; // 判定相似度过低的错误笔画索引列表
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

export interface CanvasHandwritingPadProps {
  onUnlockNewWord?: () => void;
  isFlowMode?: boolean;
  onToggleFlowMode?: (enabled: boolean) => void;
  targets?: CharacterWritingMeta[];
  targetChar?: string;
  onComplete?: (score: number) => void;
}

export const CanvasHandwritingPad: React.FC<CanvasHandwritingPadProps> = ({
  onUnlockNewWord,
  isFlowMode: propIsFlowMode,
  onToggleFlowMode,
  targets,
  targetChar,
  onComplete,
}) => {
  const gameStore = useGameStore();
  const handleUnlockWord = onUnlockNewWord ?? (() => { gameStore.unlockNewWord(); });

  // 动态计算练字目标集合：优先传入的 targets，否则获取当前绘本专属字库，最后降级使用 WRITING_TARGETS
  const activeTargets = useMemo<CharacterWritingMeta[]>(() => {
    if (targets && targets.length > 0) return targets;
    if (gameStore.currentStoryId) {
      const challengeData = getStoryChallengeData(gameStore.currentStoryId);
      if (challengeData.writingTargets && challengeData.writingTargets.length > 0) {
        return challengeData.writingTargets;
      }
    }
    return WRITING_TARGETS;
  }, [targets, gameStore.currentStoryId]);

  // 心流模式状态与古琴音效联动 (Flow State Mode & Guqin Ambient Soundtrack)
  const [internalFlowMode, setInternalFlowMode] = useState<boolean>(false);
  const isFlowMode = propIsFlowMode !== undefined ? propIsFlowMode : internalFlowMode;

  const handleToggleFlow = useCallback(
    (enable?: boolean) => {
      const nextState = enable !== undefined ? enable : !isFlowMode;
      if (onToggleFlowMode) {
        onToggleFlowMode(nextState);
      } else {
        setInternalFlowMode(nextState);
      }
      sound.playTap();
    },
    [isFlowMode, onToggleFlowMode]
  );

  const [isGuqinMuted, setIsGuqinMuted] = useState<boolean>(false);

  // 心流模式古琴背景仙乐联动与平滑淡入淡出
  useEffect(() => {
    if (isFlowMode) {
      guqinAudio.setMuted(isGuqinMuted);
      guqinAudio.fadeIn(0, 1.8);
    } else {
      guqinAudio.fadeOut(1.2);
    }
    return () => {
      guqinAudio.fadeOut(0.6);
    };
  }, [isFlowMode, isGuqinMuted]);

  // 支持键盘 ESC 键优雅退出心流模式
  useEffect(() => {
    if (!isFlowMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleToggleFlow(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlowMode, handleToggleFlow]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<CharacterWritingMeta>(activeTargets[0] || WRITING_TARGETS[0]);
  const [customInputChar, setCustomInputChar] = useState<string>('');

  // 当绘本或目标集合切换时，自动选中新绘本的第一个字并清除旧诊断
  useEffect(() => {
    if (targetChar) {
      const match = activeTargets.find((t) => t.char === targetChar);
      if (match) {
        setSelectedTarget(match);
      } else {
        setSelectedTarget({
          char: targetChar,
          pinyin: '',
          radical: '部首',
          strokeCount: 8,
          structure: '左右',
          strokeOrder: ['横', '竖', '撇', '捺', '点'],
          keyTips: ['保持重心平稳，起笔沉着，收笔端庄。'],
          commonMistakes: '注意笔画间距匀称与穿插避让。',
        });
      }
      setDiagnosis(null);
    } else if (activeTargets.length > 0) {
      setSelectedTarget(activeTargets[0]);
      setDiagnosis(null);
    }
  }, [targetChar, activeTargets]);

  // Active brush skin from store (联动墨宝工坊)
  const activeSkin = useMemo<BrushSkin>(() => {
    return getBrushSkinById(gameStore.activeBrushSkin || 'brush-ink');
  }, [gameStore.activeBrushSkin]);
  
  // Brush styling
  const [brushWidth, setBrushWidth] = useState<number>(10);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [strokesHistory, setStrokesHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);

  // 笔画间隔时间与笔韵值系统 (Stroke Cadence & Brush Rhythm System)
  const lastStrokeEndTimeRef = useRef<number | null>(null);
  const strokeStartTimeRef = useRef<number>(0);
  const comboFlowRef = useRef<number>(0);
  const [brushRhythmScore, setBrushRhythmScore] = useState<number>(82);
  const [lastIntervalMs, setLastIntervalMs] = useState<number | null>(null);
  const [comboFlow, setComboFlow] = useState<number>(0);
  const [isFlowActive, setIsFlowActive] = useState<boolean>(false);
  const [rhythmStatusText, setRhythmStatusText] = useState<string>('气韵初聚 · 提笔悬腕');
  const [flowPulseActive, setFlowPulseActive] = useState<boolean>(false);

  // 微小光效粒子引擎 (Luminous Sparkle Particle Engine)
  const particlesRef = useRef<LuminousParticle[]>([]);
  const particleAnimIdRef = useRef<number | null>(null);

  // Recognition / Evaluation state
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisReport | null>(null);

  // Stroke deviation tremor animation state (偏差过大半透明抖动与低频震颤提示)
  const [isTremoring, setIsTremoring] = useState<boolean>(false);
  const [errorStrokeIndices, setErrorStrokeIndices] = useState<number[]>([]);
  const [tremorMessage, setTremorMessage] = useState<string>('笔迹偏差过大 · 笔画结构失衡');

  // Trigger stroke deviation tremor animation & low frequency rumble sound
  const triggerDeviationTremor = useCallback((customMsg?: string, errIndices?: number[]) => {
    if (customMsg) setTremorMessage(customMsg);
    setErrorStrokeIndices(errIndices && errIndices.length > 0 ? errIndices : [0, 1]);
    setIsTremoring(true);
    // 同时播放一个低频震动提示音
    sound.playStrokeErrorShake();
    setTimeout(() => {
      setIsTremoring(false);
    }, 2200);
  }, []);

  // Setup canvas with Mi-zi-ge (米字格)
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    // Background warm Xuan-paper tint
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, width, height);

    // Outer border
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#c2410c'; // Cinnabar Red border
    ctx.strokeRect(4, 4, width - 8, height - 8);

    // Inner subtle border
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#f97316';
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Diagonal guidelines (dashed)
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#fcd34d'; // Soft gold/amber
    ctx.lineWidth = 1.2;

    // Cross lines
    ctx.moveTo(width / 2, 10);
    ctx.lineTo(width / 2, height - 10);
    ctx.moveTo(10, height / 2);
    ctx.lineTo(width - 10, height / 2);

    // Diagonals
    ctx.moveTo(10, 10);
    ctx.lineTo(width - 10, height - 10);
    ctx.moveTo(width - 10, 10);
    ctx.lineTo(10, height - 10);
    ctx.stroke();

    // Four corner classical corner marks
    ctx.setLineDash([]);
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2;
    const cornerSize = 14;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(10, 10 + cornerSize);
    ctx.lineTo(10, 10);
    ctx.lineTo(10 + cornerSize, 10);
    // Top-right
    ctx.moveTo(width - 10 - cornerSize, 10);
    ctx.lineTo(width - 10, 10);
    ctx.lineTo(width - 10, 10 + cornerSize);
    // Bottom-left
    ctx.moveTo(10, height - 10 - cornerSize);
    ctx.lineTo(10, height - 10);
    ctx.lineTo(10 + cornerSize, height - 10);
    // Bottom-right
    ctx.moveTo(width - 10 - cornerSize, height - 10);
    ctx.lineTo(width - 10, height - 10);
    ctx.lineTo(width - 10, height - 10 - cornerSize);
    ctx.stroke();

    ctx.restore();
  }, []);

  // Render watermark / standard character if enabled
  const drawStandardWatermark = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, char: string, alpha: number = 0.12, color: string = '#b91c1c') => {
    ctx.save();
    ctx.font = `900 ${width * 0.72}px "Noto Serif SC", "SimSun", "STSong", "Songti SC", serif`;
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, width / 2, height / 2 + 8);
    ctx.restore();
  }, []);

  // Initialize or redraw canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    drawGrid(ctx, width, height);

    if (showWatermark && selectedTarget) {
      drawStandardWatermark(ctx, width, height, selectedTarget.char, 0.14, '#b91c1c');
    }

    // Reset particle overlay canvas
    const pCanvas = particleCanvasRef.current;
    if (pCanvas) {
      const pCtx = pCanvas.getContext('2d');
      if (pCtx) pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    }
    particlesRef.current = [];

    // Reset rhythm cadence state
    lastStrokeEndTimeRef.current = null;
    comboFlowRef.current = 0;
    setComboFlow(0);
    setBrushRhythmScore(82);
    setLastIntervalMs(null);
    setIsFlowActive(false);
    setRhythmStatusText('气韵初聚 · 提笔悬腕');

    // Save initial blank state to history
    const initialData = ctx.getImageData(0, 0, width, height);
    setStrokesHistory([initialData]);
    setHistoryIndex(0);
    setHasDrawn(false);
    setDiagnosis(null);
  }, [drawGrid, drawStandardWatermark, showWatermark, selectedTarget]);

  // 微小光效粒子喷发引擎 (Micro Particle Glow Feedback Engine)
  const spawnFluidParticles = useCallback((originX: number, originY: number, count: number, customColor?: string) => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    // 心流模式下粒子密度自动大幅调高 (3.5x 粒子喷发量、更广扩散与更璀璨星芒)
    const effectiveCount = isFlowMode ? Math.round(count * 3.5) : count;

    const baseColor = customColor || activeSkin.strokeShadow || activeSkin.strokeColor || '#fbbf24';
    const colorPalette = [
      baseColor,
      '#fde047', // bright luminous gold
      '#fef08a', // pale starlight
      '#ffffff', // sparkle white
      '#f59e0b', // amber
    ];

    const newParticles: LuminousParticle[] = [];
    for (let i = 0; i < effectiveCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = isFlowMode ? Math.random() * 4.2 + 1.2 : Math.random() * 2.8 + 0.6;
      newParticles.push({
        x: originX + (Math.random() - 0.5) * (isFlowMode ? 14 : 6),
        y: originY + (Math.random() - 0.5) * (isFlowMode ? 14 : 6),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (isFlowMode ? 0.9 : 0.6),
        size: isFlowMode ? Math.random() * 3.6 + 1.5 : Math.random() * 2.5 + 1.2,
        alpha: 1,
        color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        glowColor: baseColor,
        life: 1,
        maxLife: Math.floor(Math.random() * (isFlowMode ? 32 : 16)) + (isFlowMode ? 24 : 14),
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2,
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
  }, [activeSkin, isFlowMode]);

  useEffect(() => {
    return () => {
      if (particleAnimIdRef.current !== null) {
        cancelAnimationFrame(particleAnimIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  // Coordinate helper supporting both Mouse & Touch
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

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

    const { x, y } = getCoordinates(e);

    // ===============================================================
    // 核心算法：根据笔画间隔时间自动计算‘笔韵值’与连笔流畅判定
    // ===============================================================
    const now = performance.now();
    strokeStartTimeRef.current = now;
    const lastEnd = lastStrokeEndTimeRef.current;

    if (lastEnd !== null) {
      const intervalMs = Math.round(now - lastEnd);
      setLastIntervalMs(intervalMs);

      // 黄金连笔节奏 (Fluid Calligraphic Cadence): 90ms ~ 750ms
      if (intervalMs >= 90 && intervalMs <= 750) {
        comboFlowRef.current += 1;
        const currentCombo = comboFlowRef.current;
        setComboFlow(currentCombo);
        setIsFlowActive(true);
        setFlowPulseActive(true);
        setTimeout(() => setFlowPulseActive(false), 550);

        const delta = Math.min(10, 4 + currentCombo * 2);
        setBrushRhythmScore((prev) => Math.min(100, prev + delta));
        setRhythmStatusText(`🌟 气韵生动 · 连笔流畅 (${intervalMs}ms)`);

        // 连笔流畅时触发微小璀璨粒子光效反馈！心流模式下加倍流光
        const burstBase = 14 + Math.min(currentCombo * 2, 10);
        spawnFluidParticles(x, y, isFlowMode ? Math.round(burstBase * 1.8) : burstBase);

        if (currentCombo >= 2) {
          sound.playCharClick();
        }
      } else if (intervalMs > 750 && intervalMs <= 1400) {
        // 稳健节奏: 750ms ~ 1400ms (沉着从容)
        comboFlowRef.current = Math.max(1, Math.min(comboFlowRef.current, 2));
        setComboFlow(comboFlowRef.current);
        setIsFlowActive(false);

        setBrushRhythmScore((prev) => Math.min(94, prev + 2));
        setRhythmStatusText(`✨ 沉着稳健 · 骨气劲拔 (${intervalMs}ms)`);
        spawnFluidParticles(x, y, isFlowMode ? 14 : 6);
      } else if (intervalMs > 1400 && intervalMs <= 2800) {
        // 意在笔先: 停笔构思
        comboFlowRef.current = 0;
        setComboFlow(0);
        setIsFlowActive(false);
        setBrushRhythmScore((prev) => Math.max(68, prev - 2));
        setRhythmStatusText(`🍃 意在笔先 · 凝神蓄势 (${Math.round(intervalMs / 100) / 10}s)`);
      } else {
        // 长时停滞
        comboFlowRef.current = 0;
        setComboFlow(0);
        setIsFlowActive(false);
        setRhythmStatusText('🌱 敛气凝神 · 新笔待发');
      }
    }

    ctx.beginPath();
    ctx.moveTo(x, y);

    // Active skin styling
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = activeSkin.strokeColor;
    if (activeSkin.type === 'pen') {
      ctx.lineWidth = Math.max(3, brushWidth * 0.55);
    } else {
      ctx.lineWidth = brushWidth;
    }

    if (activeSkin.strokeShadow) {
      ctx.shadowColor = activeSkin.strokeShadow;
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

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();

    // 连笔流畅时，笔尖拖曳微光粒子；心流模式下粒子密度自动大幅调高，运笔时刻伴随璀璨星芒！
    const trailProbability = isFlowMode ? 0.95 : 0.22;
    const trailAmount = isFlowMode ? 5 : 1;
    if (comboFlowRef.current >= 1 && Math.random() < trailProbability) {
      spawnFluidParticles(x, y, trailAmount);
    } else if (isFlowMode && Math.random() < 0.7) {
      spawnFluidParticles(x, y, 3);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    lastStrokeEndTimeRef.current = performance.now();
    ctx.shadowBlur = 0;

    // Save stroke to history for Undo functionality
    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = strokesHistory.slice(0, historyIndex + 1);
    newHistory.push(currentState);
    setStrokesHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo last stroke
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

  // Clear Canvas
  const handleClear = () => {
    sound.playWrong();
    initCanvas();
  };

  // Intelligent Recognition & Handwriting Comparison Engine
  const handleEvaluateHandwriting = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    sound.playTap();
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);

      // Analyze user drawing pixels
      const width = canvas.width;
      const height = canvas.height;
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      let totalDrawnPixels = 0;
      let sumX = 0;
      let sumY = 0;

      let q1 = 0; // Top-Left
      let q2 = 0; // Top-Right
      let q3 = 0; // Bottom-Left
      let q4 = 0; // Bottom-Right

      const midX = width / 2;
      const midY = height / 2;

      for (let y = 12; y < height - 12; y += 2) {
        for (let x = 12; x < width - 12; x += 2) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Check if pixel is dark enough to be user's stroke (exclude background grid & faint watermark)
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

      // If user barely made any marks
      if (totalDrawnPixels < 150) {
        setDiagnosis({
          score: 52,
          similarity: 35,
          grade: '需精进·笔顺失衡',
          recognizedChar: selectedTarget.char,
          isMatch: false,
          centerOfGravity: { offsetX: 0, offsetY: 0, description: '笔画过少，未能构成有效字形结构。' },
          quadrantBalance: { topLeft: 25, topRight: 25, bottomLeft: 25, bottomRight: 25, assessment: '笔画尚未成型' },
          strokeCompleteness: '笔画残缺，请按照标准笔顺完整书写。',
          corrections: ['请对照右侧标准写法临摹，补齐所有基本笔画。'],
          strengths: ['勇于动笔，继续练习！'],
          errorStrokeIndices: [0, 1],
        });
        triggerDeviationTremor('笔画过少 · 判定相似度过低 (35%)，请补全笔画', [0, 1]);
        return;
      }

      // Calculate center of gravity
      const avgX = sumX / totalDrawnPixels;
      const avgY = sumY / totalDrawnPixels;
      const offsetX = Math.round(((avgX - midX) / midX) * 100);
      const offsetY = Math.round(((avgY - midY) / midY) * 100);

      let gravityDesc = '重心沉稳，居中端正';
      if (Math.abs(offsetX) > 15 && Math.abs(offsetY) > 15) {
        gravityDesc = `字形重心明显偏向${offsetY < 0 ? '上' : '下'}${offsetX < 0 ? '左' : '右'}`;
      } else if (offsetX < -12) {
        gravityDesc = '字形重心略微偏左，右侧笔画舒展度稍显不足';
      } else if (offsetX > 12) {
        gravityDesc = '字形重心略微偏右，左侧偏旁需注意收敛紧致';
      } else if (offsetY < -12) {
        gravityDesc = '字形重心偏高，下部底托需加强沉稳度';
      } else if (offsetY > 12) {
        gravityDesc = '字形重心偏低，容易出现头重脚轻或下坠感';
      }

      // Quadrant balance percentages
      const qTotal = Math.max(1, q1 + q2 + q3 + q4);
      const p1 = Math.round((q1 / qTotal) * 100);
      const p2 = Math.round((q2 / qTotal) * 100);
      const p3 = Math.round((q3 / qTotal) * 100);
      const p4 = Math.round((q4 / qTotal) * 100);

      let quadrantAssessment = '四象限空间配比匀称，布白通透得体。';
      if (Math.max(p1, p2, p3, p4) > 42) {
        quadrantAssessment = '局部空间分布过于密集，部分笔画有堆叠挤压现象。';
      }

      // Generate structural score and diagnostic feedback
      const gravityScore = Math.max(20, 40 - Math.abs(offsetX) * 0.7 - Math.abs(offsetY) * 0.7);
      const balanceScore = Math.max(20, 35 - (Math.max(p1, p2, p3, p4) - 25) * 0.8);
      const densityScore = Math.min(25, 15 + Math.min(10, totalDrawnPixels / 200));

      const rawScore = Math.min(98, Math.round(gravityScore + balanceScore + densityScore));

      const strengths: string[] = [];
      const corrections: string[] = [];

      if (rawScore >= 85) {
        strengths.push('间架结构端庄，笔力饱满挺拔，充分展现了汉字的骨力。');
        strengths.push('米字格四象限布局适中，虚实相生，符合规范楷书体势。');
        if (Math.abs(offsetX) <= 8 && Math.abs(offsetY) <= 8) {
          strengths.push('字形核心重心稳定，中轴线垂直稳固。');
        }
      } else {
        strengths.push('整体轮廓基本齐备，能够清晰辨析出核心偏旁构造。');
      }

      // Tailored corrections according to character rules
      selectedTarget.keyTips.forEach((tip, i) => {
        if (i === 0 && (p1 > 35 || p2 > 35)) {
          corrections.push(`注意上半部与横画形态：${tip}`);
        } else if (i === 1 && (p3 > 35 || p4 > 35)) {
          corrections.push(`下半部分或撇捺展开要点：${tip}`);
        } else if (corrections.length < 2) {
          corrections.push(`规范书写关键：${tip}`);
        }
      });

      if (Math.abs(offsetX) > 10) {
        corrections.push(`米字格定位纠错：${gravityDesc}，建议起笔以中心交汇点为基准。`);
      }
      corrections.push(`防错避坑：${selectedTarget.commonMistakes}`);

      // 计算手写字形与标准范字综合相似度 (0 - 100%)
      const similarity = Math.min(99, Math.round(gravityScore + balanceScore + densityScore));
      const isSimilarityTooLow =
        similarity < 70 || totalDrawnPixels < 160 || Math.abs(offsetX) > 14 || Math.abs(offsetY) > 14;

      let grade: DiagnosisReport['grade'] = '甲等·神韵完备';
      let activeErrorStrokes: number[] = [];

      if (rawScore >= 88 && !isSimilarityTooLow) {
        grade = '甲等·神韵完备';
        sound.playVictory();
        setErrorStrokeIndices([]);
        handleUnlockWord();
        try {
          confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        } catch (error) {
          console.warn('[UI Effect Error]:', error);
        }
      } else if (rawScore >= 75 && !isSimilarityTooLow) {
        grade = '乙等·端庄得体';
        setErrorStrokeIndices([]);
        sound.playFillSuccess();
      } else if (rawScore >= 68 && !isSimilarityTooLow) {
        grade = '丙等·结体尚可';
        setErrorStrokeIndices([]);
        sound.playSnap();
      } else {
        // 对比结果判定相似度过低，定位错误笔画部分
        grade = '需精进·笔顺失衡';
        const errStrokes: number[] = [];
        if (p1 > 35 || p2 > 35 || offsetY < -12) {
          errStrokes.push(0, 1); // 顶部起笔/横折错误
        }
        if (p3 > 35 || p4 > 35 || offsetY > 12) {
          const last = selectedTarget.strokeOrder.length - 1;
          errStrokes.push(last, Math.max(0, last - 1)); // 底部收笔/撇捺失衡
        }
        if (Math.abs(offsetX) > 12) {
          errStrokes.push(Math.floor(selectedTarget.strokeOrder.length / 2)); // 竖画中轴偏移
        }
        if (errStrokes.length === 0) {
          errStrokes.push(0, selectedTarget.strokeOrder.length - 1);
        }
        activeErrorStrokes = Array.from(new Set(errStrokes));
        setErrorStrokeIndices(activeErrorStrokes);

        // 触发笔画抖动提示动画，并同时播放低频震动提示音
        triggerDeviationTremor(
          `字形相似度过低 (${similarity}%) · 检测到第 ${activeErrorStrokes
            .map((e) => e + 1)
            .join('、')} 笔偏差，请按范字规范起笔纠偏`,
          activeErrorStrokes
        );
      }

      setDiagnosis({
        score: rawScore,
        similarity,
        grade,
        recognizedChar: selectedTarget.char,
        isMatch: true,
        centerOfGravity: {
          offsetX,
          offsetY,
          description: gravityDesc,
        },
        quadrantBalance: {
          topLeft: p1,
          topRight: p2,
          bottomLeft: p3,
          bottomRight: p4,
          assessment: quadrantAssessment,
        },
        strokeCompleteness: `已成功识别并匹配标准「${selectedTarget.char}」字形态 (${selectedTarget.strokeCount}画，${selectedTarget.structure}结构)`,
        corrections,
        strengths,
        errorStrokeIndices: activeErrorStrokes,
      });
    }, 600);
  };

  // Add custom character to practice
  const handleAddCustomChar = () => {
    const trimmed = customInputChar.trim();
    if (!trimmed) return;
    const char = trimmed[0];
    const customMeta: CharacterWritingMeta = {
      char,
      pinyin: 'zì',
      radical: '自选',
      strokeCount: 8,
      structure: '左右',
      strokeOrder: ['横', '竖', '撇', '捺', '点'],
      keyTips: ['保持横平竖直，首尾呼应', '左右结构注意避让，上下结构注意重心稳固'],
      commonMistakes: '笔画倾斜或重心失衡。',
    };
    setSelectedTarget(customMeta);
    setCustomInputChar('');
    sound.playTap();
  };

  // ===============================================================
  // 1. 心流模式 (Flow State Mode)：隐藏所有干扰性UI，仅留画布与背景古琴
  // ===============================================================
  if (isFlowMode) {
    return (
      <div className="fixed inset-0 z-50 bg-[#120f0d]/96 backdrop-blur-2xl flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-300 text-left">
        {/* 背景静谧流光氛围 */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-stone-950/60 to-black pointer-events-none" />

        {/* 顶部极简心流状态条 */}
        <div className="w-full max-w-md mb-3 flex items-center justify-between gap-3 relative z-10 px-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping" />
            <span className="text-xs font-bold text-amber-200/90 tracking-wider">
              心流模式 · 静心运笔
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* 背景古琴仙音开关 */}
            <button
              onClick={() => {
                const nextMute = !isGuqinMuted;
                setIsGuqinMuted(nextMute);
                guqinAudio.setMuted(nextMute);
                sound.playTap();
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800/80 hover:bg-stone-700/80 border border-yellow-500/30 text-yellow-300 text-xs font-bold transition-colors cursor-pointer shadow-xs"
              title={isGuqinMuted ? '点击播放背景古琴仙乐' : '点击静音背景古琴'}
            >
              {isGuqinMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-stone-400" />
              ) : (
                <Music className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
              )}
              <span className="text-[11px]">{isGuqinMuted ? '古琴已静音' : '古琴悠扬中'}</span>
            </button>

            {/* 退出心流模式 */}
            <button
              onClick={() => handleToggleFlow(false)}
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-200 hover:text-white text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
              title="退出心流模式 (ESC)"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>退出心流</span>
            </button>
          </div>
        </div>

        {/* 核心专注区：笔韵条 + 纯净画布 + 极简静音浮动工具 */}
        <div className="flex flex-col items-center space-y-3 relative z-10">
          {/* 笔画间隔自动测算‘笔韵值’与连笔流光指标条 */}
          <div className="w-full max-w-[340px] px-3.5 py-1.5 rounded-2xl bg-stone-900/90 border border-yellow-500/40 text-white shadow-lg flex items-center justify-between gap-2 backdrop-blur-md">
            <div className="flex items-center gap-1.5 shrink-0">
              <Flame
                className={`w-4 h-4 transition-transform duration-300 ${
                  isFlowActive || flowPulseActive ? 'text-yellow-400 scale-125 animate-bounce' : 'text-amber-500'
                }`}
              />
              <span className="text-[11px] font-bold text-amber-200">笔韵值:</span>
              <span
                className={`font-mono text-sm font-black transition-colors ${
                  brushRhythmScore >= 90
                    ? 'text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]'
                    : brushRhythmScore >= 80
                    ? 'text-amber-300'
                    : 'text-stone-300'
                }`}
              >
                {brushRhythmScore}分
              </span>
              {comboFlow > 1 && (
                <span className="px-1.5 py-0.2 rounded-md bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 text-[10px] font-black shadow-xs animate-pulse">
                  连笔 x{comboFlow}
                </span>
              )}
            </div>
            <div className="text-[10px] font-bold text-amber-200/90 truncate text-right">
              {rhythmStatusText}
            </div>
          </div>

          {/* 纯净画布与高密度粒子光效 */}
          <div className="relative p-2 rounded-3xl shadow-2xl border-2 bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200 border-amber-400/80 ring-4 ring-yellow-500/20">
            <canvas
              ref={canvasRef}
              width={340}
              height={340}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="rounded-2xl cursor-crosshair shadow-lg bg-[#fdfbf7] touch-none block"
            />
            {/* 微小璀璨粒子光效覆盖画布 (高密度粒子) */}
            <canvas
              ref={particleCanvasRef}
              width={340}
              height={340}
              className="absolute inset-2 rounded-2xl pointer-events-none z-15 block"
            />
            {showWatermark && selectedTarget && (
              <div
                className="absolute inset-2 flex items-center justify-center pointer-events-none select-none"
                style={{
                  fontFamily: '"Noto Serif SC", "SimSun", serif',
                  fontSize: '240px',
                  color: 'rgba(239, 68, 68, 0.16)',
                  fontWeight: 900,
                  transform: 'translateY(6px)',
                }}
              >
                {selectedTarget.char}
              </div>
            )}
          </div>

          {/* 极简浮动工具栏 */}
          <div className="w-full max-w-[340px] flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  sound.playTap();
                  setShowWatermark((prev) => !prev);
                }}
                className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                  showWatermark
                    ? 'bg-amber-100/90 border-amber-300 text-amber-950'
                    : 'bg-stone-800/80 border-stone-700 text-stone-400'
                }`}
                title="开关描红水印"
              >
                {showWatermark ? <Eye className="w-3.5 h-3.5 text-amber-700" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              {/* 笔触粗细选择 */}
              <div className="flex items-center gap-1 bg-stone-900/80 border border-stone-700 p-1 rounded-xl">
                {[6, 11, 18].map((w, idx) => (
                  <button
                    key={w}
                    onClick={() => setBrushWidth(w)}
                    className={`w-6 h-6 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      brushWidth === w
                        ? 'bg-amber-400 text-stone-950 font-black'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {idx === 0 ? '细' : idx === 1 ? '中' : '粗'}
                  </button>
                ))}
              </div>

              {/* 当前笔触皮肤提示 */}
              <div className="flex items-center gap-1 bg-stone-900/80 border border-yellow-500/30 px-2.5 py-1 rounded-xl text-xs text-yellow-200">
                <span>{activeSkin.icon}</span>
                <span className="text-[11px] font-bold" style={{ color: activeSkin.strokeColor }}>
                  {activeSkin.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors ${
                  historyIndex > 0
                    ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-600 cursor-pointer'
                    : 'bg-stone-900/40 text-stone-600 border-stone-800 cursor-not-allowed'
                }`}
                title="撤销上一笔"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleClear}
                className="px-3 py-1.5 rounded-xl bg-stone-800/90 hover:bg-red-950/80 text-stone-300 hover:text-red-300 border border-stone-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                title="清空画布重新书写"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>重写</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 border-2 border-amber-300 rounded-3xl p-5 sm:p-7 shadow-xl max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-amber-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-700 via-amber-700 to-red-900 text-yellow-300 flex items-center justify-center shadow-md border-2 border-yellow-300 shrink-0">
            <Brush className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-calligraphy font-black text-xl text-red-950">
                翰墨研习 · 汉字手写识别与对比纠错
              </h3>
              <span className="bg-amber-100 text-red-900 border border-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                米字格手写
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              在传统米字格中手写练字，智能比对标准字形结构、重心偏离度与空间配比，即时纠错
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* 心流模式快捷开关 */}
          <button
            onClick={() => handleToggleFlow(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-yellow-300 border border-yellow-500/50 shadow-md hover:scale-105 active:scale-95 transition-all text-xs font-bold cursor-pointer"
            title="开启心流模式：隐藏一切干扰，伴随古琴静心运笔，粒子密度拉满"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
            <span>开启心流模式</span>
          </button>

          {/* Pronunciation & Radical Details */}
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl">
            <div className="text-center">
              <span className="text-[10px] text-stone-400 block">目标汉字</span>
              <span className="font-calligraphy text-2xl font-black text-red-900 leading-none">
                {selectedTarget.char}
              </span>
            </div>
            <div className="border-l border-amber-200 pl-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900">
                  {selectedTarget.pinyin}
                </span>
                <button
                  onClick={() => {
                    sound.playCharClick();
                    speakChinese(selectedTarget.char);
                  }}
                  className="p-1 rounded-md bg-amber-200/80 hover:bg-amber-300 text-red-950 transition-colors cursor-pointer"
                  title="标准普通话朗读"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[11px] text-stone-500 block">
                部首: {selectedTarget.radical} · {selectedTarget.strokeCount}画 · {selectedTarget.structure}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Character Selector Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-red-700" />
            <span>选择练习汉字 (5-6年级核心高频字)：</span>
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              maxLength={1}
              value={customInputChar}
              onChange={(e) => setCustomInputChar(e.target.value)}
              placeholder="自选字"
              className="w-16 px-2 py-1 text-xs border border-amber-300 rounded-lg text-center font-bold text-red-950 focus:outline-none focus:ring-1 focus:ring-red-600"
            />
            <button
              onClick={handleAddCustomChar}
              className="px-2.5 py-1 text-xs bg-amber-200 hover:bg-amber-300 text-red-950 font-bold rounded-lg border border-amber-400/80 cursor-pointer transition-colors"
            >
              练此字
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {activeTargets.map((item, itemIdx) => (
            <button
              key={`${item.char}-${itemIdx}`}
              onClick={() => {
                sound.playTap();
                setSelectedTarget(item);
                setDiagnosis(null);
              }}
              className={`px-3 py-1.5 rounded-xl font-calligraphy font-black text-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                selectedTarget.char === item.char
                  ? 'bg-gradient-to-r from-red-700 to-amber-700 text-yellow-200 shadow-md ring-2 ring-yellow-400 scale-105'
                  : 'bg-amber-50 hover:bg-amber-100 text-stone-800 border border-amber-200'
              }`}
            >
              <span>{item.char}</span>
              <span className="text-[10px] font-sans opacity-70 font-normal">{item.pinyin}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace: Left Canvas Pad + Right Diagnostic / Stroke Order Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Canvas Drawing Board (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center space-y-3">
          {/* 笔画间隔自动测算‘笔韵值’与连笔流光指标条 (Stroke Cadence & Brush Rhythm Banner) */}
          <div className="w-full max-w-[340px] px-3.5 py-2 rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 border border-yellow-500/50 text-white shadow-lg flex items-center justify-between gap-2 backdrop-blur-md">
            <div className="flex items-center gap-1.5 shrink-0">
              <Flame
                className={`w-4 h-4 transition-transform duration-300 ${
                  isFlowActive || flowPulseActive ? 'text-yellow-400 scale-125 animate-bounce' : 'text-amber-500'
                }`}
              />
              <span className="text-[11px] font-bold text-amber-200">笔韵值:</span>
              <span
                className={`font-mono text-sm font-black transition-colors ${
                  brushRhythmScore >= 90
                    ? 'text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]'
                    : brushRhythmScore >= 80
                    ? 'text-amber-300'
                    : 'text-stone-300'
                }`}
              >
                {brushRhythmScore}分
              </span>
              {comboFlow > 1 && (
                <span className="px-1.5 py-0.2 rounded-md bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 text-[10px] font-black shadow-xs animate-pulse">
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
              ref={canvasRef}
              width={340}
              height={340}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="rounded-2xl cursor-crosshair shadow-lg bg-[#fdfbf7] touch-none block"
            />

            {/* 微小璀璨粒子光效覆盖画布 (Luminous Sparkle Canvas Overlay) */}
            <canvas
              ref={particleCanvasRef}
              width={340}
              height={340}
              className="absolute inset-2 rounded-2xl pointer-events-none z-15 block"
            />

            {/* Visual Red-Ink Overlay (标准红模字叠图对比) */}
            {showOverlay && !isTremoring && (
              <div
                className="absolute inset-2 flex items-center justify-center pointer-events-none select-none"
                style={{
                  fontFamily: '"Noto Serif SC", "SimSun", serif',
                  fontSize: '240px',
                  color: 'rgba(239, 68, 68, 0.42)',
                  fontWeight: 900,
                  transform: 'translateY(6px)',
                }}
              >
                {selectedTarget.char}
              </div>
            )}

            {/* 半透明‘笔迹抖动’提示动画 (Semi-transparent Stroke Tremor Overlay with Framer Motion) */}
            <AnimatePresence>
              {isTremoring && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-2 rounded-2xl pointer-events-none z-20 bg-red-950/25 backdrop-blur-[1.5px] border-2 border-red-500/80 flex flex-col items-center justify-center overflow-hidden animate-stroke-tremor"
                >
                  {/* Translucent Tremor Ghost Hanzi with pulsating red tint */}
                  <motion.div
                    animate={{
                      scale: [1, 1.06, 0.96, 1.04, 1],
                      opacity: [0.25, 0.45, 0.3, 0.4, 0.25],
                      rotate: [-1.5, 2, -2, 1.5, 0],
                    }}
                    transition={{ duration: 0.45, repeat: Infinity }}
                    className="text-[230px] font-black text-red-600/40 select-none leading-none -mt-4"
                    style={{ fontFamily: '"Noto Serif SC", "SimSun", serif' }}
                  >
                    {selectedTarget.char}
                  </motion.div>

                  {/* Warning Floating Badge with .animate-stroke-tremor */}
                  <div className="absolute bottom-4 inset-x-3 mx-auto max-w-xs px-3.5 py-2 rounded-2xl bg-gradient-to-r from-red-900 to-amber-950 text-yellow-200 border-2 border-yellow-400 shadow-2xl flex items-center justify-center gap-2 text-xs font-black animate-stroke-tremor">
                    <AlertCircle className="w-4 h-4 text-yellow-300 shrink-0 animate-spin" />
                    <span className="truncate">{tremorMessage}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Canvas Toolbar Controls */}
          <div className="w-full max-w-sm space-y-2.5">
            {/* Row 1: Brush Skins (墨宝工坊联动) & Stroke Width */}
            <div className="bg-stone-100 p-2.5 rounded-2xl border border-stone-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-stone-500">工坊笔触:</span>
                  <span className="font-bold text-xs flex items-center gap-1 text-stone-800">
                    <span>{activeSkin.icon}</span>
                    <span style={{ color: activeSkin.strokeColor }}>{activeSkin.name}</span>
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full font-black">
                      {activeSkin.effectName}
                    </span>
                  </span>
                </div>

                {/* Stroke Size */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setBrushWidth(6)}
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] cursor-pointer transition-all ${
                      brushWidth === 6 ? 'bg-amber-400 text-red-950 font-black ring-1 ring-amber-500' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                    }`}
                    title="细笔画 (6px)"
                  >
                    细
                  </button>
                  <button
                    onClick={() => setBrushWidth(11)}
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] cursor-pointer transition-all ${
                      brushWidth === 11 ? 'bg-amber-400 text-red-950 font-black ring-1 ring-amber-500' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                    }`}
                    title="中等笔画 (11px)"
                  >
                    中
                  </button>
                  <button
                    onClick={() => setBrushWidth(18)}
                    className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] cursor-pointer transition-all ${
                      brushWidth === 18 ? 'bg-amber-400 text-red-950 font-black ring-1 ring-amber-500' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                    }`}
                    title="粗重笔画 (18px)"
                  >
                    粗
                  </button>
                </div>
              </div>

              {/* Skin Selection Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {AVAILABLE_BRUSH_SKINS.map((skin) => {
                  const isUnlocked = gameStore.isBrushSkinUnlocked(skin.id);
                  const isSelected = activeSkin.id === skin.id;
                  return (
                    <button
                      key={skin.id}
                      onClick={() => {
                        sound.playTap();
                        if (isUnlocked) {
                          gameStore.setActiveBrushSkin(skin.id);
                        } else {
                          sound.playStrokeErrorShake();
                        }
                      }}
                      className={`px-2 py-1 rounded-xl text-[11px] font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-stone-900 text-yellow-300 shadow-xs ring-1 ring-yellow-400'
                          : isUnlocked
                          ? 'bg-white hover:bg-amber-50 text-stone-700 border border-stone-300'
                          : 'bg-stone-200/60 text-stone-400 border border-stone-300/60'
                      }`}
                      title={
                        isUnlocked
                          ? `${skin.name} (${skin.effectName})`
                          : `未解锁：需在修业宝库【墨宝工坊】使用 ${skin.costExp} 阅历值兑换`
                      }
                    >
                      <span>{skin.icon}</span>
                      <span>{skin.name}</span>
                      {!isUnlocked && <Lock className="w-2.5 h-2.5 opacity-60" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Helper Toggles (Watermark / Overlay) & Clear */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => {
                    sound.playTap();
                    setShowWatermark((prev) => !prev);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    showWatermark
                      ? 'bg-amber-100 border-amber-300 text-amber-900'
                      : 'bg-stone-100 border-stone-200 text-stone-600'
                  }`}
                  title="开关底层半透明红模描红水印"
                >
                  {showWatermark ? <Eye className="w-3.5 h-3.5 text-amber-700" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>描红水印</span>
                </button>

                <button
                  onClick={() => {
                    sound.playTap();
                    setShowOverlay((prev) => !prev);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    showOverlay
                      ? 'bg-red-100 border-red-300 text-red-900 ring-1 ring-red-400'
                      : 'bg-stone-100 border-stone-200 text-stone-600'
                  }`}
                  title="叠加上层半透明标准字，对比笔迹差异"
                >
                  <Layers className="w-3.5 h-3.5 text-red-600" />
                  <span>叠图对比</span>
                </button>

                {/* 测笔迹偏差抖动与低频震颤 */}
                <button
                  onClick={() =>
                    triggerDeviationTremor('判定相似度过低 (52%) · 错误笔画偏离，低频震颤警示', [0, 1])
                  }
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-red-300/80 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold transition-all cursor-pointer active:scale-95"
                  title="测试手写识别判定相似度过低时的笔画抖动动画与低频震颤音效"
                >
                  <Activity className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                  <span>测偏差抖动</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 ${
                    historyIndex > 0
                      ? 'bg-amber-50 hover:bg-amber-100 text-stone-800 border-amber-300 cursor-pointer'
                      : 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                  }`}
                  title="撤销上一笔"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">撤销</span>
                </button>

                <button
                  onClick={handleClear}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 border border-stone-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  title="清空画布重新书写"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>重写</span>
                </button>
              </div>
            </div>

            {/* Big Action: Intelligent Recognition & Comparison */}
            <button
              onClick={handleEvaluateHandwriting}
              disabled={!hasDrawn || isAnalyzing}
              className={`w-full py-3 rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 ${
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

        {/* Right Column: Reference & Diagnostic Report (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Diagnostic Result Box (When evaluated) */}
          {diagnosis ? (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 border-2 border-amber-300 rounded-3xl p-5 shadow-md space-y-4 animate-in fade-in zoom-in-95 duration-300">
              {/* Score & Grade Header */}
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-calligraphy text-2xl font-black text-white shadow-md border border-yellow-300 ${
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
                    <span className="font-festive font-black text-base text-red-950 block">
                      {diagnosis.grade}
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      {diagnosis.strokeCompleteness}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <span className="text-[10px] text-stone-400 block">字形相似度</span>
                    <span
                      className={`font-mono text-base font-black leading-none ${
                        diagnosis.similarity >= 75 ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {diagnosis.similarity}%
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block">规范度评级</span>
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
                </div>
              </div>

              {/* 错误笔画抖动告警提示区 (Error Stroke Tremor Alert) */}
              {errorStrokeIndices.length > 0 && (
                <div className="bg-red-100/95 border-2 border-red-500 rounded-2xl p-3.5 animate-stroke-tremor shadow-md space-y-2">
                  <div className="flex items-center gap-1.5 text-red-950 font-black text-xs">
                    <AlertCircle className="w-4 h-4 text-red-600 animate-pulse shrink-0" />
                    <span>判定相似度过低 ({diagnosis.similarity}%) · 错误笔画偏离警告</span>
                  </div>
                  <p className="text-[11px] text-red-800 leading-snug">
                    已检测到手写笔画与标准结构偏差过大，低频震颤警示已触发。请对照下列高亮笔画规范运笔。
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {selectedTarget.strokeOrder.map((step, idx) => {
                      const isErrorStroke = errorStrokeIndices.includes(idx);
                      return (
                        <div
                          key={idx}
                          className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                            isErrorStroke
                              ? 'animate-stroke-tremor bg-red-600 text-white shadow-sm ring-2 ring-red-400'
                              : 'bg-white/80 border border-stone-300 text-stone-700'
                          }`}
                        >
                          <span className="w-3.5 h-3.5 rounded-full bg-black/20 flex items-center justify-center text-[9px]">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                          {isErrorStroke && <span>(偏离)</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Center of Gravity & Quadrant Analysis */}
              <div className="bg-white/80 border border-amber-200 rounded-2xl p-3.5 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-700 flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-red-700" />
                    <span>字形重心分析：</span>
                  </span>
                  <span
                    className={`font-extrabold px-2 py-0.5 rounded ${
                      Math.abs(diagnosis.centerOfGravity.offsetX) <= 10 && Math.abs(diagnosis.centerOfGravity.offsetY) <= 10
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {diagnosis.centerOfGravity.description}
                  </span>
                </div>

                {/* Quadrant Balance Visualizer */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                    <span>米字格四象限空间配比：</span>
                    <span className="text-stone-400 text-[10px]">理想值各约 25%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-center font-bold text-[11px]">
                    <div className="bg-stone-50 border border-stone-200 p-1 rounded-lg">
                      <span className="text-stone-400 text-[9px] block">左上象限</span>
                      <span className="text-amber-900">{diagnosis.quadrantBalance.topLeft}%</span>
                    </div>
                    <div className="bg-stone-50 border border-stone-200 p-1 rounded-lg">
                      <span className="text-stone-400 text-[9px] block">右上象限</span>
                      <span className="text-amber-900">{diagnosis.quadrantBalance.topRight}%</span>
                    </div>
                    <div className="bg-stone-50 border border-stone-200 p-1 rounded-lg">
                      <span className="text-stone-400 text-[9px] block">左下象限</span>
                      <span className="text-amber-900">{diagnosis.quadrantBalance.bottomLeft}%</span>
                    </div>
                    <div className="bg-stone-50 border border-stone-200 p-1 rounded-lg">
                      <span className="text-stone-400 text-[9px] block">右下象限</span>
                      <span className="text-amber-900">{diagnosis.quadrantBalance.bottomRight}%</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1 italic">
                    {diagnosis.quadrantBalance.assessment}
                  </p>
                </div>
              </div>

              {/* Strengths */}
              {diagnosis.strengths.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>笔意亮点：</span>
                  </span>
                  <ul className="text-xs text-stone-600 space-y-1 pl-4 list-disc">
                    {diagnosis.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actionable Corrections (纠错建议) */}
              {diagnosis.corrections.length > 0 && (
                <div className="bg-red-50/90 border border-red-200 rounded-2xl p-3 space-y-1.5">
                  <span className="text-xs font-bold text-red-900 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-red-700" />
                    <span>纠错建议与处方：</span>
                  </span>
                  <ul className="text-xs text-red-950 space-y-1 pl-4 list-disc">
                    {diagnosis.corrections.map((corr, i) => (
                      <li key={i} className="leading-relaxed">
                        {corr}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* onComplete Stage Progression Button */}
              {onComplete && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      sound.playVictory();
                      onComplete(diagnosis.score);
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-yellow-500 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 border border-yellow-300"
                  >
                    <span>完成手写测评 ({diagnosis.score}分) · 解锁偏旁积木</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Default: Standard Character Reference & Stroke Breakdown */
            <div className="bg-stone-50 border-2 border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <span className="font-bold text-sm text-stone-800 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>标准写法与笔画剖析</span>
                </span>
                <span className="text-xs text-stone-500">
                  部首: {selectedTarget.radical} · {selectedTarget.strokeCount}画
                </span>
              </div>

              {/* Stroke Order Chips */}
              <div>
                <span className="text-xs font-bold text-stone-600 block mb-1.5">
                  规范笔顺拆解 ({selectedTarget.strokeOrder.length} 步)：
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedTarget.strokeOrder.map((step, idx) => {
                    const isError = errorStrokeIndices.includes(idx);
                    return (
                      <div
                        key={idx}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 shadow-2xs transition-all ${
                          isError
                            ? 'animate-stroke-tremor bg-red-100 border-2 border-red-500 text-red-950 font-bold ring-2 ring-red-400'
                            : 'bg-white border border-amber-300 text-stone-800'
                        }`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                            isError ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                        {isError && (
                          <span className="text-[10px] text-red-600 font-extrabold flex items-center gap-0.5">
                            <AlertCircle className="w-3 h-3" />
                            <span>偏离</span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key Tips */}
              <div className="space-y-1.5 bg-amber-50/80 p-3 rounded-2xl border border-amber-200/80">
                <span className="text-xs font-bold text-amber-900 block">间架结构口诀：</span>
                <ul className="text-xs text-stone-700 space-y-1 pl-4 list-disc">
                  {selectedTarget.keyTips.map((tip, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Pitfalls */}
              <div className="bg-red-50 p-3 rounded-2xl border border-red-200 text-xs text-red-900">
                <span className="font-bold block mb-0.5">⚠️ 应试易错笔画提醒：</span>
                <p className="leading-relaxed text-red-950/80">{selectedTarget.commonMistakes}</p>
              </div>

              <div className="text-center text-xs text-stone-400 pt-1">
                ✍️ 在左侧米字格中手写完成后，点击「识别字形并进行智能对比纠错」获得多维诊断。
              </div>

              {/* onComplete Stage Progression Fallback */}
              {onComplete && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (hasDrawn) {
                        handleEvaluateHandwriting();
                      } else {
                        sound.playVictory();
                        onComplete(88);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span>{hasDrawn ? '测评打分并解锁偏旁积木' : '跳过手写 · 直接进入偏旁积木'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
