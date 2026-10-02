import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Award,
  Palette,
  Compass,
  Crown,
  Check,
  Lock,
  RotateCw,
  Volume2,
  ChevronRight,
  Shield,
  Sparkles,
  BookOpen,
  ScrollText,
  Brush,
  AlertCircle,
  Play,
  Eye,
  Layers,
  Star,
  Coins,
  Zap,
  CheckCircle2,
  X,
  Undo2,
  RotateCcw,
} from 'lucide-react';
import {
  ACHIEVEMENTS,
  AVAILABLE_DECORATIONS,
  AchievementBadge,
  DecorationType,
} from '../data/achievementData';
import { UserEquippedDecorations } from './ProfileAchievementsModal';
import { CulturalCodex } from './CulturalCodex';
import { sound, speakChinese, stopChineseSpeech } from '../utils/audio';
import { useGameStore } from '../store/useGameStore';
import {
  STORY_SCROLL_COLLECTIONS,
  StoryScrollArt,
  ScrollFragmentPiece,
} from '../data/storyScrollsData';
import {
  AVAILABLE_BRUSH_SKINS,
  getBrushSkinById,
  BrushSkin,
} from '../data/brushSkinsData';
import { TARGET_CHARACTERS, HanziChar } from '../data/level1Data';

export type TreasurySubTab = 'scrolls' | 'workshop' | 'badges' | 'wardrobe' | 'explorer';

interface TreasuryPavilionProps {
  collectedCount?: number;
  onUpdateCollectedCount?: (newCount: number) => void;
  equipped?: UserEquippedDecorations;
  onSaveEquipped?: (newEquipped: UserEquippedDecorations) => void;
  streakDays?: number;
  onUnlockNewWord?: () => void;
  onNavigateToWriting?: (char?: string) => void;
  initialSubTab?: TreasurySubTab;
}

export const TreasuryPavilion: React.FC<TreasuryPavilionProps> = ({
  collectedCount: propCollectedCount,
  onUpdateCollectedCount: propOnUpdateCollectedCount,
  equipped: propEquipped,
  onSaveEquipped: propOnSaveEquipped,
  streakDays: propStreakDays,
  onUnlockNewWord: propOnUnlockNewWord,
  onNavigateToWriting,
  initialSubTab = 'scrolls',
}) => {
  const gameStore = useGameStore();

  const collectedCount = propCollectedCount ?? gameStore.collectedCount;
  const onUpdateCollectedCount = propOnUpdateCollectedCount ?? gameStore.setCollectedCount;
  const equipped = propEquipped ?? gameStore.equippedDecorations;
  const onSaveEquipped = propOnSaveEquipped ?? gameStore.setEquippedDecorations;
  const streakDays = propStreakDays ?? gameStore.streakState.streakDays;
  const onUnlockNewWord = propOnUnlockNewWord ?? (() => { gameStore.unlockNewWord(); });

  const [subTab, setSubTab] = useState<TreasurySubTab>(initialSubTab);

  // 1. 典藏画卷状态
  const [scrollCategory, setScrollCategory] = useState<'all' | 'myth' | 'history' | 'science' | 'fairy' | 'news'>('all');
  const [selectedScroll, setSelectedScroll] = useState<StoryScrollArt | null>(null);

  // 2. 墨宝工坊试写台状态
  const workshopCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isWorkshopDrawing, setIsWorkshopDrawing] = useState<boolean>(false);
  const [workshopPadNotice, setWorkshopPadNotice] = useState<string | null>(null);

  // 3. 档案卡装扮阁状态
  const [decoCategory, setDecoCategory] = useState<DecorationType>('frame');
  const [flippedBadgeIds, setFlippedBadgeIds] = useState<Record<string, boolean>>({});
  const [isPlayingDecreeId, setIsPlayingDecreeId] = useState<string | null>(null);

  // 活跃笔触皮肤
  const activeSkin = useMemo<BrushSkin>(() => {
    return getBrushSkinById(gameStore.activeBrushSkin || 'brush-ink');
  }, [gameStore.activeBrushSkin]);

  // 典藏画卷统计
  const scrollStats = useMemo(() => {
    let unlockedCount = 0;
    STORY_SCROLL_COLLECTIONS.forEach((scroll) => {
      if (gameStore.isScrollUnlocked(scroll.storyId)) {
        unlockedCount++;
      }
    });
    return {
      unlockedCount,
      totalCount: STORY_SCROLL_COLLECTIONS.length,
      progressPct: Math.round((unlockedCount / STORY_SCROLL_COLLECTIONS.length) * 100),
    };
  }, [gameStore]);

  // 过滤后的画卷列表
  const filteredScrolls = useMemo(() => {
    if (scrollCategory === 'all') return STORY_SCROLL_COLLECTIONS;
    return STORY_SCROLL_COLLECTIONS.filter((s) => s.category === scrollCategory);
  }, [scrollCategory]);

  // 装扮阁当前配置
  const currentFrame =
    AVAILABLE_DECORATIONS.frames.find((f) => f.id === equipped.frameId) ||
    AVAILABLE_DECORATIONS.frames[0];

  const currentSeal =
    AVAILABLE_DECORATIONS.seals.find((s) => s.id === equipped.sealId) ||
    AVAILABLE_DECORATIONS.seals[0];

  const currentTheme =
    AVAILABLE_DECORATIONS.bgThemes.find((t) => t.id === equipped.bgThemeId) ||
    AVAILABLE_DECORATIONS.bgThemes[0];

  const currentTitle =
    AVAILABLE_DECORATIONS.titles.find((t) => t.id === equipped.titleId) ||
    AVAILABLE_DECORATIONS.titles[0];

  const handleToggleFlipBadge = (achId: string) => {
    sound.playTap();
    setFlippedBadgeIds((prev) => ({
      ...prev,
      [achId]: !prev[achId],
    }));
  };

  const handleSpeakDecree = (ach: AchievementBadge, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    stopChineseSpeech();
    sound.playImperialBell();
    setIsPlayingDecreeId(ach.id);
    speakChinese(ach.decreeAudio);
    setTimeout(() => {
      setIsPlayingDecreeId(null);
    }, 9000);
  };

  const handleEquip = (type: DecorationType, id: string) => {
    if (type === 'seal') {
      sound.playSealStamp();
      onSaveEquipped({ ...equipped, sealId: id });
    } else {
      sound.playEquip();
      if (type === 'frame') onSaveEquipped({ ...equipped, frameId: id });
      else if (type === 'bgTheme') onSaveEquipped({ ...equipped, bgThemeId: id });
      else if (type === 'title') onSaveEquipped({ ...equipped, titleId: id });
    }
  };

  // 墨宝工坊：兑换笔触皮肤
  const handleRedeemSkin = (skin: BrushSkin) => {
    sound.playTap();
    const result = gameStore.redeemBrushSkin(skin.id, skin.costExp);
    if (result.success) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#eab308', '#dc2626', '#10b981', '#6366f1'],
      });
      setWorkshopPadNotice(`🎉 ${result.message}`);
    } else {
      setWorkshopPadNotice(`⚠️ ${result.message}`);
    }
    setTimeout(() => {
      setWorkshopPadNotice(null);
    }, 4500);
  };

  // 严格复用 <CharacterModal/> 展示生字音形义 (单一信任源)
  const handleOpenCharacterModal = (charStr: string) => {
    sound.playCharClick();
    const found = TARGET_CHARACTERS.find((c) => c.char === charStr);
    if (found) {
      gameStore.setModalChar(found);
    } else {
      const syntheticChar: HanziChar = {
        id: `char-${charStr}`,
        char: charStr,
        pinyin: 'zhōng',
        radical: '一部',
        radicalName: '核心部首',
        components: [charStr],
        etymology: `典藏画卷名篇核心高频字【${charStr}】，承载着篇章的文化典故与科学精义。`,
        meaning: `典藏画卷收录的核心字词【${charStr}】。`,
        mnemonic: `细细观察【${charStr}】在米字格中的间架结构与神韵笔势。`,
        strokeCount: 8,
        examWords: [charStr, `${charStr}美`, `${charStr}韵`],
        exampleSentence: `在故事画卷中细细领悟【${charStr}】字的意境与造字之美。`,
        unlocked: true,
      };
      gameStore.setModalChar(syntheticChar);
    }
  };

  // 工坊试写台 Canvas 绘制逻辑
  const initWorkshopCanvas = useCallback(() => {
    const canvas = workshopCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const size = 180;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 绘制米字格
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, size, size);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ea580c';
    ctx.strokeRect(2, 2, size - 4, size - 4);

    ctx.beginPath();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 1;
    ctx.moveTo(size / 2, 4);
    ctx.lineTo(size / 2, size - 4);
    ctx.moveTo(4, size / 2);
    ctx.lineTo(size - 4, size / 2);
    ctx.moveTo(4, 4);
    ctx.lineTo(size - 4, size - 4);
    ctx.moveTo(size - 4, 4);
    ctx.lineTo(4, size - 4);
    ctx.stroke();

    // 绘制微水印
    ctx.font = '900 110px "Noto Serif SC", serif';
    ctx.fillStyle = activeSkin.strokeColor;
    ctx.globalAlpha = 0.08;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('墨', size / 2, size / 2 + 4);
    ctx.globalAlpha = 1;
  }, [activeSkin]);

  useEffect(() => {
    if (subTab === 'workshop') {
      initWorkshopCanvas();
    }
  }, [subTab, initWorkshopCanvas, activeSkin]);

  const getWorkshopCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = workshopCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scale = 180 / rect.width;
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scale,
        y: (touch.clientY - rect.top) * scale,
      };
    }
    return {
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale,
    };
  };

  const startWorkshopDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = workshopCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const { x, y } = getWorkshopCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = activeSkin.strokeColor;
    ctx.lineWidth = activeSkin.type === 'pen' ? 4 : 7;
    if (activeSkin.strokeShadow) {
      ctx.shadowColor = activeSkin.strokeShadow;
      ctx.shadowBlur = 4;
    } else {
      ctx.shadowBlur = 0;
    }

    setIsWorkshopDrawing(true);
  };

  const drawWorkshop = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isWorkshopDrawing) return;
    e.preventDefault();
    const canvas = workshopCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getWorkshopCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopWorkshopDraw = () => {
    setIsWorkshopDrawing(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto pb-10">
      {/* 宝库修业五大 Realm Sub-Navigation Bar (Min 48px touch target) */}
      <div className="bg-amber-100/90 border-2 border-amber-300 p-2 rounded-3xl shadow-sm flex items-center justify-between gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => {
            sound.playTap();
            setSubTab('scrolls');
          }}
          className={`min-h-[48px] px-3.5 sm:px-4 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95 ${
            subTab === 'scrolls'
              ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md ring-2 ring-yellow-300'
              : 'bg-white/80 hover:bg-white text-stone-700'
          }`}
        >
          <ScrollText className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
          <span>1. 典藏画卷</span>
        </button>

        <button
          onClick={() => {
            sound.playTap();
            setSubTab('workshop');
          }}
          className={`min-h-[48px] px-3.5 sm:px-4 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95 ${
            subTab === 'workshop'
              ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md ring-2 ring-yellow-300'
              : 'bg-white/80 hover:bg-white text-stone-700'
          }`}
        >
          <Brush className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
          <span>2. 墨宝工坊</span>
        </button>

        <button
          onClick={() => {
            sound.playTap();
            setSubTab('badges');
          }}
          className={`min-h-[48px] px-3.5 sm:px-4 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95 ${
            subTab === 'badges'
              ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md ring-2 ring-yellow-300'
              : 'bg-white/80 hover:bg-white text-stone-700'
          }`}
        >
          <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
          <span>3. 四阶文位勋章</span>
        </button>

        <button
          onClick={() => {
            sound.playTap();
            setSubTab('wardrobe');
          }}
          className={`min-h-[48px] px-3.5 sm:px-4 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95 ${
            subTab === 'wardrobe'
              ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md ring-2 ring-yellow-300'
              : 'bg-white/80 hover:bg-white text-stone-700'
          }`}
        >
          <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
          <span>4. 档案卡装扮</span>
        </button>

        <button
          onClick={() => {
            sound.playTap();
            setSubTab('explorer');
          }}
          className={`min-h-[48px] px-3.5 sm:px-4 py-2 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-95 ${
            subTab === 'explorer'
              ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md ring-2 ring-yellow-300'
              : 'bg-white/80 hover:bg-white text-stone-700'
          }`}
        >
          <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          <span>5. 3500字部首</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. 典藏画卷展示区 (根据 readingProgress 网格展示已解锁插画碎片与未解锁虚线框) */}
      {/* ========================================================================= */}
      {subTab === 'scrolls' && (
        <div className="bg-white/95 border-3 border-amber-300 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
          {/* Header & Overview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-amber-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-calligraphy font-black text-2xl text-red-950 flex items-center gap-2">
                  <span>📜</span>
                  <span>典藏故事画卷阁</span>
                </h3>
                <span className="bg-amber-200 text-amber-950 text-xs font-black px-2.5 py-0.5 rounded-full">
                  阅读具象化 · 插画碎片
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                通读神话、历史、童话名篇与外星兔科普探案，点亮珍罕故事插画碎片。点击已解锁画卷展开全景鉴赏！
              </p>
            </div>

            {/* Scroll Stats */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 py-2.5 rounded-2xl self-start sm:self-auto shadow-2xs">
              <div className="text-center border-r border-amber-200 pr-3">
                <span className="text-[10px] text-stone-500 block">收集画卷</span>
                <span className="font-black text-lg text-red-700">
                  {scrollStats.unlockedCount} / {scrollStats.totalCount} 卷
                </span>
              </div>
              <div className="text-center pl-1">
                <span className="text-[10px] text-stone-500 block">篇章阅历</span>
                <span className="font-black text-lg text-amber-600">
                  {gameStore.missionsState.totalExpEarned} 点
                </span>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => {
                sound.playTap();
                setScrollCategory('all');
              }}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0 ${
                scrollCategory === 'all'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              全部画卷 ({STORY_SCROLL_COLLECTIONS.length})
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setScrollCategory('myth');
              }}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0 ${
                scrollCategory === 'myth'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              🏮 神话传说
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setScrollCategory('history');
              }}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0 ${
                scrollCategory === 'history'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              🏛️ 历史风华
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setScrollCategory('science');
              }}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0 ${
                scrollCategory === 'science'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              🔬 Bobu 科学探案
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setScrollCategory('fairy');
              }}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0 ${
                scrollCategory === 'fairy'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              🐴 童话寓言
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setScrollCategory('news');
              }}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0 ${
                scrollCategory === 'news'
                  ? 'bg-red-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              🚀 太空强国
            </button>
          </div>

          {/* Scrolls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredScrolls.map((scroll) => {
              const isUnlocked = gameStore.isScrollUnlocked(scroll.storyId);
              const readingScore = gameStore.readingProgress.readingScores[scroll.storyId] || 0;

              return (
                <div
                  key={scroll.id}
                  className={`rounded-3xl p-5 transition-all flex flex-col justify-between relative overflow-hidden select-none ${
                    isUnlocked
                      ? 'bg-gradient-to-br from-[#2c1308] via-[#1f0a04] to-[#120401] text-amber-50 border-2 border-amber-400 shadow-xl ring-1 ring-amber-300/40'
                      : 'bg-stone-50/90 border-2 border-dashed border-stone-300 text-stone-800'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                          isUnlocked
                            ? 'bg-amber-400/20 text-yellow-300 border-amber-400/40'
                            : 'bg-stone-200 text-stone-600 border-stone-300'
                        }`}
                      >
                        第{scroll.chapterNumber}章 · {scroll.categoryName}
                      </span>
                      {isUnlocked && (
                        <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-md">
                          典藏已收录
                        </span>
                      )}
                    </div>

                    {isUnlocked ? (
                      <div className="flex items-center gap-1 text-xs text-yellow-300 font-bold bg-yellow-950/60 border border-yellow-500/40 px-2 py-0.5 rounded-full">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span>朗读评级: {readingScore > 0 ? `${readingScore}分` : '甲等'}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-500 font-bold flex items-center gap-1 bg-stone-200/80 px-2 py-0.5 rounded-full">
                        <Lock className="w-3 h-3 text-stone-500" />
                        <span>待解锁</span>
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="my-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-md border-2 ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-amber-500 to-red-600 border-yellow-300'
                            : 'bg-stone-200 border-stone-300 text-stone-400 grayscale'
                        }`}
                      >
                        {scroll.icon}
                      </div>

                      <div className="min-w-0">
                        <h4
                          className={`font-calligraphy text-lg font-black tracking-wide truncate ${
                            isUnlocked ? 'text-yellow-100' : 'text-stone-700'
                          }`}
                        >
                          {scroll.title}
                        </h4>
                        <p
                          className={`text-xs mt-0.5 line-clamp-1 font-medium ${
                            isUnlocked ? 'text-amber-200/80' : 'text-stone-500'
                          }`}
                        >
                          {scroll.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* 4 Fragments Grid Preview */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className={isUnlocked ? 'text-amber-300' : 'text-stone-500'}>
                          卷轴插画碎片 ({isUnlocked ? '4/4 已拼合' : '0/4 尚未点亮'}):
                        </span>
                        {isUnlocked && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> 故事全卷完整
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-1.5">
                        {scroll.fragments.map((frag) => (
                          <div
                            key={frag.id}
                            className={`p-1.5 rounded-xl text-center border transition-all ${
                              isUnlocked
                                ? 'bg-amber-950/70 border-amber-500/40 text-amber-100 shadow-2xs'
                                : 'bg-stone-200/60 border-dashed border-stone-300 text-stone-400 opacity-60'
                            }`}
                            title={`${frag.name}: ${frag.desc}`}
                          >
                            <span className="text-base block">{isUnlocked ? frag.icon : '❓'}</span>
                            <span className="text-[10px] font-bold block truncate mt-0.5">
                              {frag.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Unlock Condition Banner for Locked Scrolls */}
                    {!isUnlocked && (
                      <div className="bg-amber-50 border border-amber-300/80 rounded-xl p-2.5 text-xs text-stone-700 space-y-1">
                        <div className="font-bold text-red-900 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                          <span>解锁条件：{scroll.unlockCondition}</span>
                        </div>
                        <div className="text-[11px] text-stone-500 pl-4.5">
                          朗读考核达标后自动在宝库生成专属画卷，获赐 50 阅历值与文昌通宝！
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                    {isUnlocked ? (
                      <>
                        <button
                          onClick={() => {
                            sound.playTap();
                            setSelectedScroll(scroll);
                          }}
                          className="min-h-[44px] flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-red-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <ScrollText className="w-4 h-4" />
                          <span>展开长卷精赏 (字词研习)</span>
                        </button>
                        <button
                          onClick={() => {
                            sound.playTap();
                            speakChinese(`${scroll.title}。${scroll.summary}`);
                          }}
                          className="min-h-[44px] px-3.5 py-2 bg-white/10 hover:bg-white/20 text-yellow-200 font-bold text-xs rounded-xl border border-yellow-400/40 transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                          title="听取画卷概览"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>概览</span>
                        </button>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-between text-xs text-stone-500">
                        <span>待通关解锁</span>
                        <span className="font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-lg">
                          需阅读评分 ≥ {scroll.readingScoreRequired} 分
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. 墨宝工坊展示区 (阅历值兑换 CharacterModal 笔触皮肤，直接写入 Zustand Store) */}
      {/* ========================================================================= */}
      {subTab === 'workshop' && (
        <div className="bg-white/95 border-3 border-amber-300 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
          {/* Header & Overview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-amber-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-calligraphy font-black text-2xl text-red-950 flex items-center gap-2">
                  <span>🖌️</span>
                  <span>墨宝工坊 · 笔触皮肤研制所</span>
                </h3>
                <span className="bg-amber-200 text-amber-950 text-xs font-black px-2.5 py-0.5 rounded-full">
                  阅历值兑换 · 实时生效
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                以阅读积累的‘阅历值’研制兑换国风神韵笔触。解锁后在 CharacterModal 书写画板中自动生效，挥毫落纸自带光华！
              </p>
            </div>

            {/* Exp & Equipped Badge */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-4 py-2.5 rounded-2xl self-start sm:self-auto shadow-2xs">
              <div className="text-center border-r border-amber-200 pr-3">
                <span className="text-[10px] text-stone-500 block">可用阅历值</span>
                <span className="font-black text-lg text-amber-700 flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  {gameStore.missionsState.totalExpEarned} 点
                </span>
              </div>
              <div className="text-center pl-1">
                <span className="text-[10px] text-stone-500 block">当前画笔</span>
                <span
                  className="font-black text-sm block"
                  style={{ color: activeSkin.strokeColor }}
                >
                  {activeSkin.name}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Workshop Notice */}
          {workshopPadNotice && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-100 border border-amber-300 text-amber-950 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-between"
            >
              <span>{workshopPadNotice}</span>
              <button
                onClick={() => setWorkshopPadNotice(null)}
                className="text-stone-500 hover:text-stone-800"
              >
                ✕
              </button>
            </motion.div>
          )}

          {/* Brush Skins Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_BRUSH_SKINS.map((skin) => {
              const isUnlocked = gameStore.isBrushSkinUnlocked(skin.id);
              const isActive = activeSkin.id === skin.id;
              const hasEnoughExp = gameStore.missionsState.totalExpEarned >= skin.costExp;

              return (
                <div
                  key={skin.id}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col justify-between select-none ${
                    isActive
                      ? 'bg-amber-50/90 border-red-500 shadow-md ring-2 ring-red-300'
                      : isUnlocked
                      ? 'bg-white border-amber-200 hover:border-amber-400 shadow-xs'
                      : 'bg-stone-50/90 border-stone-200'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header: Name, Icon, Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{skin.icon}</span>
                        <div>
                          <h4 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                            <span>{skin.name}</span>
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block shadow-2xs"
                              style={{ backgroundColor: skin.strokeColor }}
                            />
                          </h4>
                          <span className="text-[10px] text-stone-500 block">
                            {skin.effectName}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                          isUnlocked
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {skin.badgeText}
                      </span>
                    </div>

                    {/* Sample Stroke Preview Banner */}
                    <div
                      className="p-2.5 rounded-2xl text-center border relative overflow-hidden bg-[#fdfbf7]"
                      style={{ borderColor: skin.strokeColor + '40' }}
                    >
                      <span
                        className="font-calligraphy font-black text-sm tracking-wider"
                        style={{
                          color: skin.strokeColor,
                          textShadow: skin.strokeShadow
                            ? `0 0 6px ${skin.strokeShadow}`
                            : undefined,
                        }}
                      >
                        {skin.samplePhrase}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-2">
                      {skin.desc}
                    </p>
                  </div>

                  {/* Actions & Cost */}
                  <div className="pt-3 border-t border-stone-100 mt-3">
                    {isUnlocked ? (
                      <button
                        onClick={() => {
                          gameStore.setActiveBrushSkin(skin.id);
                          sound.playTap();
                          setWorkshopPadNotice(`已装配【${skin.name}】至书写画板！`);
                        }}
                        disabled={isActive}
                        className={`w-full min-h-[44px] rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isActive
                            ? 'bg-stone-900 text-white cursor-default shadow-xs'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white active:scale-95 shadow-md'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>当前正在使用</span>
                          </>
                        ) : (
                          <span>装配此笔触</span>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRedeemSkin(skin)}
                        disabled={!hasEnoughExp}
                        className={`w-full min-h-[44px] rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                          hasEnoughExp
                            ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white shadow-md active:scale-95 cursor-pointer ring-2 ring-yellow-400/60'
                            : 'bg-stone-200 text-stone-500 cursor-not-allowed'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 text-yellow-300" />
                        <span>
                          {hasEnoughExp
                            ? `立即研制兑换 (${skin.costExp} 阅历)`
                            : `阅历不足 (需 ${skin.costExp} 阅历)`}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Workshop Interactive Mini Test Pad */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <span className="text-xl">🖌️</span>
                <h4 className="font-calligraphy font-black text-lg text-red-950">
                  工坊试写台 · 触感预览
                </h4>
              </div>
              <p className="text-xs text-stone-600 max-w-md leading-relaxed">
                当前正使用【<strong style={{ color: activeSkin.strokeColor }}>{activeSkin.name}</strong>】。
                可在右侧米字格内随心勾勒笔锋，检验泥金或朱砂墨韵！
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    sound.playTap();
                    initWorkshopCanvas();
                  }}
                  className="px-3 py-1.5 bg-white border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>清除试写</span>
                </button>
                <button
                  onClick={() => {
                    handleOpenCharacterModal('福');
                  }}
                  className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>前往 CharacterModal 练字</span>
                </button>
              </div>
            </div>

            {/* Canvas Box */}
            <div className="bg-white p-2 rounded-2xl border-2 border-amber-300 shadow-md shrink-0">
              <canvas
                ref={workshopCanvasRef}
                onMouseDown={startWorkshopDraw}
                onMouseMove={drawWorkshop}
                onMouseUp={stopWorkshopDraw}
                onMouseLeave={stopWorkshopDraw}
                onTouchStart={startWorkshopDraw}
                onTouchMove={drawWorkshop}
                onTouchEnd={stopWorkshopDraw}
                className="cursor-crosshair rounded-xl touch-none block"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. 四阶文位 3D 翻转勋章墙 */}
      {/* ========================================================================= */}
      {subTab === 'badges' && (
        <div className="bg-white/95 border-3 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-amber-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-calligraphy font-black text-2xl text-red-950">
                  科举四阶文位进阶榜
                </h3>
                <span className="bg-amber-200 text-amber-950 text-xs font-black px-2.5 py-0.5 rounded-full">
                  国风神话 · 授勋诏书
                </span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                点击已获得的勋章，卡片将触发 3D 翻转动效，展示皇帝御赐【授勋诏书】，支持点击朗读皇朝宣旨音频！
              </p>
            </div>

            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-2xl self-start sm:self-auto">
              <span className="text-xs text-stone-500">当前认字进度:</span>
              <span className="font-black text-lg text-red-700">{collectedCount} / 3500 字</span>
            </div>
          </div>

          {/* 3D Flip Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ACHIEVEMENTS.map((ach) => {
              const isAchieved = collectedCount >= ach.requiredCount;
              const isFlipped = flippedBadgeIds[ach.id] || false;
              const progressPct = Math.min(
                100,
                Math.round((collectedCount / ach.requiredCount) * 100)
              );

              return (
                <div
                  key={ach.id}
                  className="relative h-72 sm:h-80 w-full [perspective:1000px] select-none"
                >
                  <motion.div
                    className="relative w-full h-full rounded-3xl transition-transform duration-500 [transform-style:preserve-3d] shadow-lg"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                  >
                    {/* Front Face */}
                    <div
                      onClick={() => {
                        if (isAchieved) handleToggleFlipBadge(ach.id);
                      }}
                      className={`absolute inset-0 w-full h-full rounded-3xl p-5 border-3 [backface-visibility:hidden] flex flex-col justify-between ${
                        !isAchieved
                          ? 'bg-stone-100/90 border-stone-300 opacity-75'
                          : ach.visualTheme === 'phoenix'
                          ? 'bg-gradient-to-br from-rose-950 via-purple-950 to-amber-950 border-amber-400 text-amber-100 ring-2 ring-rose-400 cursor-pointer shadow-rose-950/40'
                          : ach.visualTheme === 'gold'
                          ? 'bg-gradient-to-br from-amber-900 via-yellow-900 to-amber-950 border-yellow-300 text-yellow-100 ring-2 ring-yellow-400 cursor-pointer shadow-amber-950/40'
                          : ach.visualTheme === 'silver'
                          ? 'bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 border-indigo-300 text-white cursor-pointer'
                          : 'bg-gradient-to-br from-emerald-950 via-teal-950 to-amber-950 border-emerald-400 text-emerald-100 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                              !isAchieved
                                ? 'bg-stone-200 text-stone-600 border-stone-300'
                                : 'bg-white/20 text-white border-white/30 backdrop-blur-xs'
                            }`}
                          >
                            {ach.wenwei}
                          </span>
                          <span className="text-xs font-bold opacity-90">{ach.headTitle}</span>
                        </div>

                        {isAchieved ? (
                          <span className="flex items-center gap-1 bg-yellow-400 text-red-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                            <Check className="w-3.5 h-3.5" /> 已授勋
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-stone-300 text-stone-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            <Lock className="w-3 h-3" /> 待解锁
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 my-auto">
                        <div
                          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shrink-0 border-3 shadow-md relative group transition-transform ${
                            !isAchieved
                              ? 'bg-stone-200 border-stone-300 grayscale'
                              : ach.visualTheme === 'phoenix'
                              ? 'bg-gradient-to-br from-rose-600 to-amber-500 border-yellow-300 shadow-rose-500/50 animate-pulse'
                              : ach.visualTheme === 'gold'
                              ? 'bg-gradient-to-br from-yellow-500 to-amber-600 border-yellow-200 shadow-yellow-500/50'
                              : ach.visualTheme === 'silver'
                              ? 'bg-gradient-to-br from-indigo-500 to-slate-400 border-white'
                              : 'bg-gradient-to-br from-emerald-600 to-teal-500 border-emerald-300'
                          }`}
                        >
                          {ach.icon}
                          {isAchieved && (
                            <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-yellow-400 rounded-full border-2 border-red-900 flex items-center justify-center text-[10px] text-red-950 font-black">
                              ★
                            </span>
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-calligraphy text-lg sm:text-xl font-black tracking-wide leading-tight">
                            {ach.badgeVisual}
                          </h4>
                          <p className="text-xs opacity-85 mt-1 font-medium line-clamp-2">
                            {ach.badgeVisualDesc}
                          </p>
                          <div className="mt-2 text-xs font-bold text-yellow-300 flex items-center gap-1">
                            <span>🎁 获赐：</span>
                            <span className="underline decoration-yellow-400/60 truncate">
                              {ach.rewardName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                        {isAchieved ? (
                          <>
                            <span className="text-[11px] text-yellow-200 font-bold flex items-center gap-1">
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                              点击卡片 3D 翻转看诏书
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleFlipBadge(ach.id);
                              }}
                              className="min-h-[44px] px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-red-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                            >
                              <span>查看诏书</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="w-full space-y-1">
                            <div className="text-[11px] text-stone-500 flex justify-between font-bold">
                              <span>达成进度</span>
                              <span>{collectedCount} / {ach.requiredCount} 字</span>
                            </div>
                            <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Back Face (Imperial Decree) */}
                    <div
                      className="absolute inset-0 w-full h-full rounded-3xl p-5 border-4 border-yellow-500 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-b from-[#fdf6e2] via-[#faeed0] to-[#f4deb3] text-stone-900 shadow-2xl flex flex-col justify-between relative overflow-hidden"
                    >
                      <div className="text-center border-b-2 border-amber-300/80 pb-2">
                        <span className="font-calligraphy text-xs font-bold text-red-800 tracking-widest block">
                          皇帝御赐 · 天命昭告
                        </span>
                        <h4 className="font-calligraphy text-xl sm:text-2xl font-black text-red-900 tracking-wider">
                          {ach.decreeTitle}
                        </h4>
                      </div>

                      <div className="my-auto px-3 py-2 bg-white/60 border border-amber-200/80 rounded-2xl shadow-inner relative">
                        <p className="font-calligraphy text-sm sm:text-base leading-relaxed text-stone-800 font-bold indent-6 text-justify">
                          “{ach.decreeText}”
                        </p>
                        <div className="mt-2 flex justify-end">
                          <div className="w-14 h-14 border-2 border-red-700 bg-red-50 text-red-700 rounded-xl p-1 flex items-center justify-center font-calligraphy text-xs font-black shadow-xs rotate-6">
                            文曲御玺
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-amber-300/60 flex items-center justify-between gap-2">
                        <button
                          onClick={(e) => handleSpeakDecree(ach, e)}
                          className={`min-h-[48px] px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer ${
                            isPlayingDecreeId === ach.id
                              ? 'bg-red-800 text-yellow-200 animate-pulse ring-2 ring-yellow-400'
                              : 'bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-800 hover:to-amber-800 text-white'
                          }`}
                        >
                          <Volume2 className="w-4 h-4 text-yellow-300" />
                          <span>{isPlayingDecreeId === ach.id ? '正在宣旨...' : '🔊 恭听皇朝旨意'}</span>
                        </button>

                        <button
                          onClick={() => handleToggleFlipBadge(ach.id)}
                          className="min-h-[48px] px-3.5 py-2 bg-white hover:bg-amber-100 border border-amber-300 text-stone-700 font-bold text-xs rounded-2xl transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>翻回正面</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. 档案卡装扮阁 */}
      {/* ========================================================================= */}
      {subTab === 'wardrobe' && (
        <div className="bg-white/95 border-3 border-amber-300 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b-2 border-amber-200 pb-3">
            <h3 className="font-calligraphy font-black text-2xl text-red-950">
              档案卡装扮阁
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              自由更换已解锁的头像边框、朱砂私印、华丽背景卡套与荣誉称号，名片将实时展示所选国风装扮！
            </p>
          </div>

          {/* Live Card Preview Box */}
          <div className="max-w-md mx-auto">
            <div
              className={`p-6 rounded-3xl border-4 border-amber-400 shadow-2xl relative overflow-hidden bg-gradient-to-br ${currentTheme.bgGradient}`}
            >
              <div className="text-center">
                <div className="relative inline-block my-2">
                  <div
                    className={`w-20 h-20 rounded-3xl bg-amber-50 text-red-900 flex items-center justify-center font-calligraphy text-3xl font-black shadow-lg ${
                      currentFrame.frameClass || 'ring-4 ring-amber-400'
                    }`}
                  >
                    学
                  </div>
                  {collectedCount >= 50 && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full border-2 border-red-900 flex items-center justify-center text-xs text-red-950 font-black">
                      ★
                    </div>
                  )}
                </div>

                <h4 className="font-calligraphy text-2xl font-black tracking-wider text-inherit">
                  {equipped.userName}
                </h4>
                <div className="inline-block mt-1 bg-amber-400/90 text-red-950 text-xs font-black px-3 py-1 rounded-full shadow-xs">
                  {currentTitle.name}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/20 text-xs text-inherit">
                  <div>
                    <span className="block opacity-75 text-[10px]">已通晓汉字</span>
                    <span className="font-black">{collectedCount} 字</span>
                  </div>
                  <div>
                    <span className="block opacity-75 text-[10px]">连续研习</span>
                    <span className="font-black">{streakDays} 天</span>
                  </div>
                  <div>
                    <span className="block opacity-75 text-[10px]">进阶率</span>
                    <span className="font-black">{Math.round((collectedCount / 3500) * 100 * 10) / 10}%</span>
                  </div>
                </div>

                {currentSeal.sealText && (
                  <div className="mt-3 flex justify-end">
                    <div className="w-14 h-14 border-2 border-red-600 bg-red-50 text-red-700 rounded-2xl p-1 flex items-center justify-center font-calligraphy text-xs font-black shadow-md rotate-6">
                      {currentSeal.sealText}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => {
                sound.playTap();
                setDecoCategory('frame');
              }}
              className={`min-h-[48px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                decoCategory === 'frame'
                  ? 'bg-red-700 text-white shadow-md'
                  : 'bg-amber-100 text-stone-700 hover:bg-amber-200'
              }`}
            >
              <span>👑 头像边框</span>
              <span className="text-xs opacity-75">({AVAILABLE_DECORATIONS.frames.length})</span>
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setDecoCategory('seal');
              }}
              className={`min-h-[48px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                decoCategory === 'seal'
                  ? 'bg-red-700 text-white shadow-md'
                  : 'bg-amber-100 text-stone-700 hover:bg-amber-200'
              }`}
            >
              <span>🈴 朱砂私印</span>
              <span className="text-xs opacity-75">({AVAILABLE_DECORATIONS.seals.length})</span>
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setDecoCategory('bgTheme');
              }}
              className={`min-h-[48px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                decoCategory === 'bgTheme'
                  ? 'bg-red-700 text-white shadow-md'
                  : 'bg-amber-100 text-stone-700 hover:bg-amber-200'
              }`}
            >
              <span>📜 档案卡套</span>
              <span className="text-xs opacity-75">({AVAILABLE_DECORATIONS.bgThemes.length})</span>
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setDecoCategory('title');
              }}
              className={`min-h-[48px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                decoCategory === 'title'
                  ? 'bg-red-700 text-white shadow-md'
                  : 'bg-amber-100 text-stone-700 hover:bg-amber-200'
              }`}
            >
              <span>🎖️ 荣誉称号</span>
              <span className="text-xs opacity-75">({AVAILABLE_DECORATIONS.titles.length})</span>
            </button>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {(decoCategory === 'frame'
              ? AVAILABLE_DECORATIONS.frames
              : decoCategory === 'seal'
              ? AVAILABLE_DECORATIONS.seals
              : decoCategory === 'bgTheme'
              ? AVAILABLE_DECORATIONS.bgThemes
              : AVAILABLE_DECORATIONS.titles
            ).map((item) => {
              const isUnlocked =
                (item.requiredChars > 0 ? collectedCount >= item.requiredChars : true) &&
                (item.requiredStreakDays ? streakDays >= item.requiredStreakDays : true);
              const isEquipped =
                (decoCategory === 'frame' && equipped.frameId === item.id) ||
                (decoCategory === 'seal' && equipped.sealId === item.id) ||
                (decoCategory === 'bgTheme' && equipped.bgThemeId === item.id) ||
                (decoCategory === 'title' && equipped.titleId === item.id);

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                    isEquipped
                      ? 'bg-amber-100/90 border-red-500 shadow-md ring-2 ring-red-300'
                      : isUnlocked
                      ? 'bg-white border-amber-200 hover:border-amber-400 shadow-xs'
                      : 'bg-stone-100/90 border-stone-200 opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-900">{item.name}</span>
                        {item.rarity === 'legendary' && (
                          <span className="bg-purple-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-md">
                            传说
                          </span>
                        )}
                        {item.rarity === 'epic' && (
                          <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-md">
                            史诗
                          </span>
                        )}
                      </div>

                      {isEquipped ? (
                        <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> 佩戴中
                        </span>
                      ) : !isUnlocked ? (
                        <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          {item.requiredStreakDays
                            ? `需连签${item.requiredStreakDays}天`
                            : `需${item.requiredChars}字`}
                        </span>
                      ) : null}
                    </div>

                    <p className="text-xs text-stone-600 mb-3">{item.description}</p>
                  </div>

                  <div>
                    {isUnlocked ? (
                      <button
                        onClick={() => handleEquip(decoCategory, item.id)}
                        disabled={isEquipped}
                        className={`w-full min-h-[48px] rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isEquipped
                            ? 'bg-red-700 text-white cursor-default'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white active:scale-95 shadow-md'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>当前正在佩戴</span>
                          </>
                        ) : (
                          <span>立即佩戴此装扮</span>
                        )}
                      </button>
                    ) : (
                      <div className="w-full min-h-[48px] flex items-center justify-center bg-stone-200 text-stone-500 text-xs font-semibold rounded-2xl">
                        {item.requiredStreakDays
                          ? `尚未解锁 (还需连签 ${Math.max(0, item.requiredStreakDays - streakDays)} 天)`
                          : `尚未解锁 (还差 ${Math.max(0, item.requiredChars - collectedCount)} 字)`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. 3500 字部首探索仪 & 民俗典籍 */}
      {/* ========================================================================= */}
      {subTab === 'explorer' && (
        <CulturalCodex
          onNavigateToWriting={onNavigateToWriting}
        />
      )}

      {/* ========================================================================= */}
      {/* 典藏画卷全景详鉴弹窗 (严格复用 <CharacterModal/> 展示生字音形义) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedScroll && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              className="bg-gradient-to-b from-[#2a1308] via-[#1f0b04] to-[#120401] border-3 border-amber-400 text-amber-50 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-7 relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedScroll(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Silk Scroll Header */}
              <div className="text-center border-b border-amber-500/40 pb-4 mb-4">
                <div className="inline-block bg-amber-400/20 text-yellow-300 border border-amber-400/50 text-xs font-black px-3 py-0.5 rounded-full mb-2">
                  第{selectedScroll.chapterNumber}章 · {selectedScroll.categoryName} · 典藏长卷
                </div>
                <h3 className="font-calligraphy text-2xl sm:text-3xl font-black text-yellow-100">
                  {selectedScroll.title}
                </h3>
                <p className="text-xs sm:text-sm text-amber-200/80 mt-1">
                  {selectedScroll.subtitle}
                </p>
              </div>

              {/* 4 Fragments Cards */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-calligraphy font-black text-sm text-yellow-300 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span>已拼合插画碎片典藏 (4/4 完整图卷)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedScroll.fragments.map((frag) => (
                      <div
                        key={frag.id}
                        className="bg-amber-950/60 border border-amber-500/40 p-3 rounded-2xl flex items-start gap-2.5"
                      >
                        <span className="text-2xl p-1.5 bg-black/40 rounded-xl shrink-0">
                          {frag.icon}
                        </span>
                        <div>
                          <h5 className="font-bold text-xs text-yellow-200">{frag.name}</h5>
                          <p className="text-[11px] text-amber-100/70 mt-0.5 leading-relaxed">
                            {frag.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cultural/Science Lore Appreciation */}
                <div className="bg-black/40 border border-amber-500/30 p-4 rounded-2xl space-y-2">
                  <h4 className="font-calligraphy font-black text-xs text-amber-300">
                    【典籍鉴赏 · 文化与科学精义】
                  </h4>
                  <p className="text-xs text-amber-100/85 leading-relaxed text-justify indent-6">
                    {selectedScroll.summary}
                  </p>
                  <p className="text-xs text-yellow-200/90 font-medium leading-relaxed indent-6">
                    “{selectedScroll.loreAppreciation}”
                  </p>
                </div>

                {/* Core Characters: Click to open <CharacterModal/> */}
                <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-calligraphy font-black text-xs text-yellow-300 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-yellow-400" />
                      <span>卷中核心生字宝藏 (点击复用 CharacterModal 研习音形义与书写)</span>
                    </h4>
                    <span className="text-[10px] text-amber-300/80">点击字词练写</span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {selectedScroll.coreCharacters.map((char, charIdx) => (
                      <button
                        key={`${char}-${charIdx}`}
                        onClick={() => handleOpenCharacterModal(char)}
                        className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-red-950 font-calligraphy font-black text-2xl rounded-2xl shadow-md border-2 border-yellow-200 flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                        title={`点击研习【${char}】字音形义`}
                      >
                        {char}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-amber-500/30 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    sound.playTap();
                    speakChinese(`${selectedScroll.title}。${selectedScroll.summary}。${selectedScroll.loreAppreciation}`);
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-yellow-200 text-xs font-bold rounded-xl border border-yellow-400/40 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Volume2 className="w-4 h-4 text-yellow-300" />
                  <span>朗读全卷精义</span>
                </button>

                <button
                  onClick={() => setSelectedScroll(null)}
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white text-xs font-black rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                >
                  收起长卷
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
