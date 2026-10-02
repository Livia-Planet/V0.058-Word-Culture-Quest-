import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls, type Variants } from 'motion/react';
import {
  BookOpen,
  Sparkles,
  Volume2,
  VolumeX,
  Settings,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Flame,
  Star,
  Award,
  Compass,
  X,
  HelpCircle,
  Play,
  Heart,
  Bookmark,
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Library,
  GripVertical,
  Check,
  Move,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  STORY_LEVELS,
  StoryLevel,
  StoryCategory,
  STORY_CATEGORIES,
  getStoryDifficultyStars,
} from '../data/storyLevels';
import { sound, speakChinese, stopChineseSpeech } from '../utils/audio';
import { DailyLore } from './DailyLore';
import { BobuUfoCompanion } from './BobuUfoCompanion';
import { TiltBookSpine } from './TiltBookSpine';
import { DailyLearningRecord } from '../data/weeklyLearningData';
import { useSettingsStore } from '../store/useSettingsStore';
import { useGameStore } from '../store/useGameStore';
import { safeGetItem, safeSetItem } from '../utils/storage';

// Visual spine styling helper by category
export const getSpineStyle = (story: StoryLevel) => {
  switch (story.category) {
    case 'myth':
      return {
        spineBg: 'from-red-800 via-rose-700 to-amber-900',
        spineBorder: 'border-amber-300',
        ribbonColor: 'bg-yellow-400',
        titleColor: 'text-amber-100',
        accentColor: 'text-yellow-300',
      };
    case 'history':
      return {
        spineBg: 'from-emerald-800 via-teal-700 to-stone-900',
        spineBorder: 'border-emerald-300',
        ribbonColor: 'bg-emerald-400',
        titleColor: 'text-emerald-100',
        accentColor: 'text-emerald-300',
      };
    case 'fairy':
      return {
        spineBg: 'from-amber-700 via-orange-600 to-stone-900',
        spineBorder: 'border-amber-300',
        ribbonColor: 'bg-amber-400',
        titleColor: 'text-amber-100',
        accentColor: 'text-amber-300',
      };
    case 'news':
      return {
        spineBg: 'from-cyan-800 via-sky-700 to-indigo-950',
        spineBorder: 'border-cyan-300',
        ribbonColor: 'bg-cyan-300',
        titleColor: 'text-cyan-100',
        accentColor: 'text-cyan-300',
      };
    case 'science':
      return {
        spineBg: 'from-violet-800 via-purple-700 to-indigo-950',
        spineBorder: 'border-purple-300',
        ribbonColor: 'bg-purple-400',
        titleColor: 'text-purple-100',
        accentColor: 'text-purple-300',
      };
    default:
      return {
        spineBg: 'from-stone-800 via-stone-700 to-stone-900',
        spineBorder: 'border-amber-300',
        ribbonColor: 'bg-amber-400',
        titleColor: 'text-amber-100',
        accentColor: 'text-yellow-300',
      };
  }
};

// Staggered Fade-in animation variants for Bookshelf story scrolls (典藏故事画卷依次优雅浮现)
export const bookshelfStaggerContainerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.09, // 每一卷画卷依次延后 90ms 优雅浮现
      delayChildren: 0.05,   // 初始微等待，营造典籍依次徐徐展开的典雅仪式感
    },
  },
};

export const bookSpineStaggerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 32,
    scale: 0.93,
    rotateZ: -1.2,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateZ: 0,
    transition: {
      type: 'spring',
      stiffness: 280,
      damping: 22,
      mass: 0.85,
    },
  },
};

interface ReorderableBookItemProps {
  story: StoryLevel;
  index: number;
  totalCount: number;
  isCurrent: boolean;
  progress: number;
  isWobbling: boolean;
  isBreathingTarget: boolean;
  isIdlePromptActive: boolean;
  style: ReturnType<typeof getSpineStyle>;
  spineHeight: string;
  isReorderMode: boolean;
  onSelectBook: (story: StoryLevel) => void;
  onTouchStart: (storyId: string) => void;
  onTouchEnd: () => void;
  onHoverSound: () => void;
  onResetIdle: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onMoveToTop?: () => void;
}

const ReorderableBookItem: React.FC<ReorderableBookItemProps> = ({
  story,
  index,
  totalCount,
  isCurrent,
  progress,
  isWobbling,
  isBreathingTarget,
  isIdlePromptActive,
  style,
  spineHeight,
  isReorderMode,
  onSelectBook,
  onTouchStart,
  onTouchEnd,
  onHoverSound,
  onResetIdle,
  onMoveLeft,
  onMoveRight,
  onMoveToTop,
}) => {
  const dragControls = useDragControls();
  const [isDragging, setIsDragging] = useState(false);
  const isUnlocked = story.unlocked !== false;

  return (
    <Reorder.Item
      as="div"
      key={story.id}
      value={story}
      variants={bookSpineStaggerVariants}
      dragListener={isUnlocked && isReorderMode}
      dragControls={dragControls}
      onDragStart={() => {
        setIsDragging(true);
        sound.playPop();
      }}
      onDragEnd={() => {
        setIsDragging(false);
        sound.playSnap();
      }}
      whileDrag={{
        scale: 1.08,
        zIndex: 50,
      }}
      className={`relative shrink-0 select-none ${
        isReorderMode && isUnlocked ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      style={{ touchAction: isReorderMode && isUnlocked ? 'none' : 'auto' }}
    >
      <TiltBookSpine
        story={story}
        index={index}
        totalCount={totalCount}
        isCurrent={isCurrent}
        progress={progress}
        isWobbling={isWobbling}
        isBreathingTarget={isBreathingTarget}
        isIdlePromptActive={isIdlePromptActive}
        style={style}
        spineHeight={spineHeight}
        onSelectBook={onSelectBook}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onHoverSound={onHoverSound}
        onResetIdle={onResetIdle}
        isReorderMode={isReorderMode}
        isDragging={isDragging}
        isUnlocked={isUnlocked}
        onDragHandlePointerDown={(e) => {
          if (isUnlocked) {
            dragControls.start(e);
          }
        }}
        onMoveLeft={onMoveLeft}
        onMoveRight={onMoveRight}
        onMoveToTop={onMoveToTop}
      />
    </Reorder.Item>
  );
};

interface BookshelfHomeProps {
  currentStoryId?: string;
  onSelectAndStartStory: (storyId: string) => void;
  collectedCount?: number;
  totalTarget?: number;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onOpenParentConsole?: () => void;
  onOpenDailyCenter?: () => void;
  onOpenTreasury?: () => void;
  streakDays?: number;
  isTodayCheckedIn?: boolean;
  weeklyRecords?: DailyLearningRecord[];
  studyMinutes?: number;
}

export const BookshelfHome: React.FC<BookshelfHomeProps> = ({
  currentStoryId: propCurrentStoryId,
  onSelectAndStartStory,
  collectedCount: propCollectedCount,
  totalTarget: propTotalTarget,
  isMuted: propIsMuted,
  onToggleMute: propOnToggleMute,
  onOpenParentConsole: propOnOpenParentConsole,
  onOpenDailyCenter,
  onOpenTreasury,
  streakDays: propStreakDays,
  isTodayCheckedIn: propIsTodayCheckedIn,
  weeklyRecords: propWeeklyRecords,
  studyMinutes,
}) => {
  const settingsStore = useSettingsStore();
  const gameStore = useGameStore();

  const currentStoryId = propCurrentStoryId ?? gameStore.currentStoryId;
  const collectedCount = propCollectedCount ?? gameStore.collectedCount;
  const totalTarget = propTotalTarget ?? gameStore.totalTarget;
  const isMuted = propIsMuted ?? settingsStore.isMuted;
  const onToggleMute = propOnToggleMute ?? settingsStore.toggleMute;
  const onOpenParentConsole = propOnOpenParentConsole ?? settingsStore.openParentConsole;
  const streakDays = propStreakDays ?? gameStore.streakState.streakDays;
  const isTodayCheckedIn = propIsTodayCheckedIn ?? gameStore.streakState.isTodayCheckedIn;
  const weeklyRecords = propWeeklyRecords ?? gameStore.weeklyRecords;
  // Selected book for expanded preview (pull-out state)
  const [selectedBook, setSelectedBook] = useState<StoryLevel | null>(null);

  // Category filter state
  const [activeCategory, setActiveCategory] = useState<'all' | StoryCategory>('all');

  // 绘本排序模式：默认（自定义拖拽）/ 难度升序 (1-5星) / 难度降序 (5-1星) / 练习完成度优先
  const [sortOption, setSortOption] = useState<'default' | 'difficulty-asc' | 'difficulty-desc' | 'progress'>(() =>
    safeGetItem<'default' | 'difficulty-asc' | 'difficulty-desc' | 'progress'>('bookshelf_sort_option', 'default')
  );

  const handleSetSortOption = (opt: 'default' | 'difficulty-asc' | 'difficulty-desc' | 'progress') => {
    sound.playTap();
    setSortOption(opt);
    safeSetItem('bookshelf_sort_option', opt);
    const labels: Record<string, string> = {
      default: '默认推荐顺序',
      'difficulty-asc': '难度升序 (1星➔5星)',
      'difficulty-desc': '难度降序 (5星➔1星)',
      progress: '修业完成度优先',
    };
    setOrderToast(`✨ 已按【${labels[opt]}】重新编排书架`);
    setTimeout(() => setOrderToast(null), 2200);
  };

  // Category Collapsible Drawer state (折叠式 / 抽屉式面板，告别横向拖轴)
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState<boolean>(false);

  // Reorder mode state (触控拖拽整理书架模式与排序提示)
  const [isReorderMode, setIsReorderMode] = useState<boolean>(false);
  const [orderToast, setOrderToast] = useState<string | null>(null);

  // Touch wobble & Idle breathing light state (触摸晃动与长时间未操作呼吸灯提示)
  const [touchedBookId, setTouchedBookId] = useState<string | null>(null);
  const [isIdlePromptActive, setIsIdlePromptActive] = useState<boolean>(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIdleTimer = () => {
    setIsIdlePromptActive(false);
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }
    // 6.5s 未操作自动激活魔法呼吸灯提示
    idleTimerRef.current = setTimeout(() => {
      setIsIdlePromptActive(true);
    }, 6500);
  };

  useEffect(() => {
    resetIdleTimer();
    const handleActivity = () => {
      resetIdleTimer();
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
    };
  }, []);

  const handleBookTouchStart = (storyId: string) => {
    sound.playSpineHover();
    setTouchedBookId(storyId);
    resetIdleTimer();
  };

  const handleBookTouchEnd = () => {
    setTimeout(() => {
      setTouchedBookId((prev) => (prev === touchedBookId ? null : prev));
    }, 450);
  };

  // Session study duration tracking (auto increments every minute of active study)
  const [sessionMinutes, setSessionMinutes] = useState<number>(() =>
    safeGetItem('bookshelf_session_minutes', 15)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSessionMinutes((prev) => {
        const next = prev + 1;
        safeSetItem('bookshelf_session_minutes', next);
        return next;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Compute total study duration
  const weeklyStudyMinutes = weeklyRecords
    ? weeklyRecords.reduce((sum, r) => sum + (r.studyMinutes || 0), 0)
    : 145;
  const totalStudyMinutes = (studyMinutes ?? weeklyStudyMinutes) + sessionMinutes;

  // Time of Day (早中晚) Color Temperature System
  // Requirement: 根据当前一天中的时间（早中晚）自动调节书架背景的色温滤镜，例如清晨偏冷蓝，傍晚偏暖橙，营造沉浸式的时间流转感
  const getRealTimeOfDay = (): 'dawn' | 'noon' | 'dusk' | 'night' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) return 'dawn';
    if (hour >= 10 && hour < 16) return 'noon';
    if (hour >= 16 && hour < 19.5) return 'dusk';
    return 'night';
  };

  const [timeOfDayMode, setTimeOfDayMode] = useState<'auto' | 'dawn' | 'noon' | 'dusk' | 'night'>('auto');
  const resolvedTimeOfDay = timeOfDayMode === 'auto' ? getRealTimeOfDay() : timeOfDayMode;

  const TIME_OF_DAY_CONFIGS = {
    dawn: {
      period: 'dawn' as const,
      name: '清晨 · 辰光冷蓝',
      label: '清晨 · 偏冷蓝',
      tag: '冷蓝色温 · 晨曦微露',
      icon: '🌅',
      filterOverlay: 'hue-rotate(-24deg) saturate(1.18) brightness(0.98)',
      roomGradient: 'from-[#0b1b2b] via-[#102438] to-[#07131e]',
      ambientBloom:
        'radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.32) 0%, rgba(30, 58, 138, 0.16) 45%, transparent 75%)',
      breezeColor: 'bg-sky-400/22',
      timePillStyle: 'bg-sky-950/85 text-sky-200 border-sky-400/70 shadow-[0_0_12px_rgba(56,189,248,0.4)]',
    },
    noon: {
      period: 'noon' as const,
      name: '正午 · 晴昼金阳',
      label: '正午 · 晴阳金光',
      tag: '纯金色温 · 金光朗照',
      icon: '☀️',
      filterOverlay: 'hue-rotate(0deg) saturate(1.06) brightness(1.06)',
      roomGradient: 'from-[#2e1509] via-[#1c0c05] to-[#0c0502]',
      ambientBloom:
        'radial-gradient(ellipse at 50% 0%, rgba(251, 191, 36, 0.32) 0%, rgba(217, 119, 6, 0.14) 45%, transparent 75%)',
      breezeColor: 'bg-amber-400/22',
      timePillStyle: 'bg-amber-950/85 text-yellow-200 border-amber-400/70 shadow-[0_0_12px_rgba(251,191,36,0.4)]',
    },
    dusk: {
      period: 'dusk' as const,
      name: '傍晚 · 暮霞暖橙',
      label: '傍晚 · 偏暖橙',
      tag: '暖橙色温 · 晚霞熔金',
      icon: '🌇',
      filterOverlay: 'sepia(0.24) hue-rotate(24deg) saturate(1.42) brightness(1.04)',
      roomGradient: 'from-[#3a1306] via-[#260a03] to-[#120401]',
      ambientBloom:
        'radial-gradient(ellipse at 50% 0%, rgba(249, 115, 22, 0.42) 0%, rgba(225, 29, 72, 0.18) 45%, transparent 75%)',
      breezeColor: 'bg-orange-500/28',
      timePillStyle: 'bg-orange-950/85 text-orange-200 border-orange-500/80 shadow-[0_0_14px_rgba(249,115,22,0.45)]',
    },
    night: {
      period: 'night' as const,
      name: '夜读 · 宵月静谧',
      label: '夜读 · 幽蓝夜色',
      tag: '夜读深幽 · 烛影摇红',
      icon: '🌙',
      filterOverlay: 'hue-rotate(-12deg) saturate(1.1) brightness(0.9) contrast(114%)',
      roomGradient: 'from-[#080a14] via-[#0d1022] to-[#04050a]',
      ambientBloom:
        'radial-gradient(ellipse at 50% 0%, rgba(129, 140, 248, 0.25) 0%, rgba(245, 158, 11, 0.18) 40%, transparent 75%)',
      breezeColor: 'bg-indigo-400/18',
      timePillStyle: 'bg-indigo-950/85 text-indigo-200 border-indigo-400/70 shadow-[0_0_12px_rgba(129,140,248,0.4)]',
    },
  };

  const activeTimeConfig = TIME_OF_DAY_CONFIGS[resolvedTimeOfDay];

  // Cycle time of day preview
  const handleCycleTimeOfDay = () => {
    sound.playTap();
    setTimeOfDayMode((prev) => {
      if (prev === 'auto') return 'dawn';
      if (prev === 'dawn') return 'noon';
      if (prev === 'noon') return 'dusk';
      if (prev === 'dusk') return 'night';
      return 'auto';
    });
  };

  // Manual Ambiance Preview Toggle (auto -> rustic -> glowing -> radiant)
  const [ambiancePreviewMode, setAmbiancePreviewMode] = useState<
    'auto' | 'rustic' | 'glowing' | 'radiant'
  >('auto');

  // Compute normalized learning progress (0.0 to 1.0)
  const wordScore = Math.min(1, collectedCount / 85);
  const timeScore = Math.min(1, totalStudyMinutes / 135);
  const completionScore =
    STORY_LEVELS.reduce((sum, s) => sum + (s.completion?.reading || 0), 0) /
    (STORY_LEVELS.length * 100);

  const naturalProgress = Math.min(
    1,
    Math.max(0.08, wordScore * 0.4 + timeScore * 0.4 + completionScore * 0.2)
  );

  const effectiveProgress =
    ambiancePreviewMode === 'rustic'
      ? 0.05
      : ambiancePreviewMode === 'glowing'
      ? 0.52
      : ambiancePreviewMode === 'radiant'
      ? 1.0
      : naturalProgress;

  // Cycle preview mode on click
  const handleCycleAmbiancePreview = () => {
    sound.playTap();
    setAmbiancePreviewMode((prev) => {
      if (prev === 'auto') return 'rustic';
      if (prev === 'rustic') return 'glowing';
      if (prev === 'glowing') return 'radiant';
      return 'auto';
    });
  };

  // Dynamic CSS filter formula:
  // From rustic aged parchment & dark wood to radiant celestial imperial gold & starlight,
  // blended with Time of Day temperature filter (清晨偏冷蓝 / 傍晚偏暖橙)
  const brightnessVal = (0.78 + effectiveProgress * 0.46).toFixed(2);
  const contrastVal = (104 + effectiveProgress * 26).toFixed(0);
  const saturateVal = (0.68 + effectiveProgress * 1.08).toFixed(2);
  const sepiaVal = ((1 - effectiveProgress) * 0.52).toFixed(2);
  const hueRotateVal = (-16 + effectiveProgress * 44).toFixed(0);
  const dropShadowBlur = (12 + effectiveProgress * 22).toFixed(0);
  const dropShadowAlpha = (0.35 + effectiveProgress * 0.55).toFixed(2);

  const ancientPedestalFilter = `brightness(${brightnessVal}) contrast(${contrastVal}%) saturate(${saturateVal}) sepia(${sepiaVal}) hue-rotate(${hueRotateVal}deg) drop-shadow(0 15px ${dropShadowBlur}px rgba(245, 158, 11, ${dropShadowAlpha})) ${activeTimeConfig.filterOverlay}`;

  // Ambiance label
  let ambianceTitle = '陈旧古拙 · 沉香初识';
  let ambianceBadgeStyle = 'bg-stone-900/80 text-amber-200/90 border-amber-600/50';
  if (effectiveProgress >= 0.7) {
    ambianceTitle = '流光溢彩 · 星辉书院';
    ambianceBadgeStyle =
      'bg-gradient-to-r from-amber-950/90 via-purple-950/90 to-cyan-950/90 text-yellow-200 border-yellow-400 ring-2 ring-yellow-400/50 shadow-[0_0_18px_rgba(250,204,21,0.6)]';
  } else if (effectiveProgress >= 0.35) {
    ambianceTitle = '晨曦微照 · 墨韵生辉';
    ambianceBadgeStyle = 'bg-amber-950/85 text-amber-200 border-amber-500/70 shadow-md';
  }

  // Computed stories list reflecting user custom touch-drag order or difficulty sorting
  const allOrderedBooks = useMemo<StoryLevel[]>(() => {
    const map = new Map(STORY_LEVELS.map((s) => [s.id, s]));
    const result: StoryLevel[] = [];
    const currentOrder = gameStore.customStoryOrder || STORY_LEVELS.map((s) => s.id);
    currentOrder.forEach((id) => {
      const story = map.get(id);
      if (story) {
        result.push(story);
        map.delete(id);
      }
    });
    map.forEach((story) => result.push(story));

    if (sortOption === 'difficulty-asc') {
      return [...result].sort((a, b) => getStoryDifficultyStars(a) - getStoryDifficultyStars(b));
    }
    if (sortOption === 'difficulty-desc') {
      return [...result].sort((a, b) => getStoryDifficultyStars(b) - getStoryDifficultyStars(a));
    }
    if (sortOption === 'progress') {
      return [...result].sort((a, b) => {
        const sumA = gameStore.getStoryCompletionSummary(a.id).percentage;
        const sumB = gameStore.getStoryCompletionSummary(b.id).percentage;
        return sumB - sumA;
      });
    }

    return result;
  }, [gameStore.customStoryOrder, sortOption, gameStore.storyExerciseMap]);

  const filteredBooks = useMemo<StoryLevel[]>(() => {
    return activeCategory === 'all'
      ? allOrderedBooks
      : allOrderedBooks.filter((s) => s.category === activeCategory);
  }, [allOrderedBooks, activeCategory]);

  // 水平 4 本划动翻页与小圆点（保留原有书卡样式与点击逻辑）
  const BOOKS_PER_PAGE = 4;
  const [currentPage, setCurrentPage] = useState<number>(0);
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / BOOKS_PER_PAGE));

  // 分类变动时自动重置为第 0 页
  useEffect(() => {
    setCurrentPage(0);
  }, [activeCategory]);

  // 边界保护：确保当前页数不超过总页数
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  // 当前分页呈现的书目切片 (保留现有书卡所有视觉样式与点击逻辑)
  const pagedBooks = useMemo<StoryLevel[]>(() => {
    const start = currentPage * BOOKS_PER_PAGE;
    return filteredBooks.slice(start, start + BOOKS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  const isCustomOrder = useMemo(() => {
    const defaultIds = STORY_LEVELS.map((s) => s.id);
    const currentIds = gameStore.customStoryOrder || defaultIds;
    return currentIds.some((id, idx) => id !== defaultIds[idx]);
  }, [gameStore.customStoryOrder]);

  // Reordering handler for touch drag
  const handleReorder = (newFilteredBooks: StoryLevel[]) => {
    const newFilteredIds = newFilteredBooks.map((s) => s.id);
    let updatedOrder: string[];

    if (activeCategory === 'all') {
      updatedOrder = newFilteredIds;
    } else {
      const allOrder = [...(gameStore.customStoryOrder || STORY_LEVELS.map((s) => s.id))];
      const indicesToReplace: number[] = [];
      allOrder.forEach((id, idx) => {
        if (newFilteredIds.includes(id)) {
          indicesToReplace.push(idx);
        }
      });
      newFilteredIds.forEach((id, i) => {
        if (indicesToReplace[i] !== undefined) {
          allOrder[indicesToReplace[i]] = id;
        }
      });
      updatedOrder = allOrder;
    }

    gameStore.updateStoryOrder(updatedOrder);
  };

  // 分页内触控拖拽重排
  const handlePagedReorder = (newPagedBooks: StoryLevel[]) => {
    const start = currentPage * BOOKS_PER_PAGE;
    const nextList = [...filteredBooks];
    nextList.splice(start, newPagedBooks.length, ...newPagedBooks);
    handleReorder(nextList);
  };

  // 划动（Swipe）手势翻页控制
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const handleTrackTouchStart = (e: React.TouchEvent) => {
    if (isReorderMode) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTrackTouchEnd = (e: React.TouchEvent) => {
    if (isReorderMode || touchStartXRef.current === null) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - (touchStartYRef.current ?? touch.clientY);

    // 水平手势判定阈值：移动距离 > 38px 且水平位移显著大于垂直位移
    if (Math.abs(deltaX) > 38 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
      if (deltaX < 0 && currentPage < totalPages - 1) {
        sound.playPop();
        setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
      } else if (deltaX > 0 && currentPage > 0) {
        sound.playPop();
        setCurrentPage((prev) => Math.max(0, prev - 1));
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  // Step nudges for quick access on smaller touchscreens
  const handleMoveStory = (storyId: string, direction: 'left' | 'right' | 'top') => {
    sound.playSnap();
    const currentIndex = filteredBooks.findIndex((s) => s.id === storyId);
    if (currentIndex === -1) return;

    const nextList = [...filteredBooks];
    if (direction === 'top') {
      const [item] = nextList.splice(currentIndex, 1);
      nextList.unshift(item);
      setCurrentPage(0);
    } else if (direction === 'left' && currentIndex > 0) {
      const temp = nextList[currentIndex];
      nextList[currentIndex] = nextList[currentIndex - 1];
      nextList[currentIndex - 1] = temp;
      const targetPage = Math.floor((currentIndex - 1) / BOOKS_PER_PAGE);
      if (targetPage !== currentPage) {
        setCurrentPage(targetPage);
      }
    } else if (direction === 'right' && currentIndex < nextList.length - 1) {
      const temp = nextList[currentIndex];
      nextList[currentIndex] = nextList[currentIndex + 1];
      nextList[currentIndex + 1] = temp;
      const targetPage = Math.floor((currentIndex + 1) / BOOKS_PER_PAGE);
      if (targetPage !== currentPage) {
        setCurrentPage(targetPage);
      }
    }
    handleReorder(nextList);
  };

  const handleResetOrder = () => {
    sound.playCorrect();
    gameStore.resetStoryOrder();
    setOrderToast('🔄 已恢复为初始推荐典籍顺序');
    setTimeout(() => setOrderToast(null), 2500);
  };

  const activeCategoryMeta =
    STORY_CATEGORIES.find((c) => c.key === activeCategory) || STORY_CATEGORIES[0];

  // Click on book spine -> pull out book and voice intro
  const handleSelectBook = (story: StoryLevel) => {
    sound.playSnap();
    setSelectedBook(story);

    // Audio-visual sync: vocalize short child-friendly synopsis
    const speechIntro = `${story.title}！${story.subtitle}。${story.summary.slice(0, 42)}……快点击开始探索吧！`;
    speakChinese(speechIntro, 0.95);
  };

  // Close book and put back on shelf
  const handlePutBackBook = () => {
    sound.playTap();
    stopChineseSpeech();
    setSelectedBook(null);
  };

  // Start reading the book
  const handleConfirmStart = (storyId: string) => {
    sound.playCorrect();
    stopChineseSpeech();
    onSelectAndStartStory(storyId);
  };

  return (
    <div className="relative min-h-screen bg-stone-900 flex flex-col font-sans select-none overflow-x-hidden">
      {/* 1. MINIMALIST TOP NAV BAR (极简魔法书架顶部) */}
      <header className="shrink-0 z-30 bg-stone-950/85 backdrop-blur-md border-b-3 border-amber-600/70 px-3.5 sm:px-6 py-2.5 flex items-center justify-between text-white shadow-lg">
        {/* Left: App Logo & Bookshelf Title */}
        <div className="flex items-center gap-2.5">
          {/* 魔法书架 Logo 印章（同步 HeaderDashboard 审美）：渐变背景、粗体节庆字体、阴影与缩放微动效 */}
          <button
            type="button"
            onClick={() => {
              sound.playReward();
            }}
            className="group relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 text-red-950 font-festive font-black text-base sm:text-lg shadow-md border-2 border-yellow-200 flex items-center justify-center shrink-0 cursor-pointer transition-all duration-300 hover:scale-115 hover:rotate-6 hover:shadow-[0_0_18px_rgba(250,204,21,0.9)] active:scale-90"
            title="魔法书架 · 点击探索奇妙书海！✨"
            aria-label="魔法书架印章"
          >
            <span>书</span>
            <Sparkles className="w-2.5 h-2.5 text-red-900 absolute -top-1 -right-1 animate-pulse" />
          </button>
          <div className="flex flex-col justify-center">
            <h1 className="font-festive text-base sm:text-lg font-black text-amber-100 tracking-wide leading-tight">
              魔法书架
            </h1>
            <p className="text-[10px] text-amber-200/70 mt-0.5 hidden xs:block">
              触抚书脊感知实体质感 · 点击开启奇妙探索
            </p>
          </div>
        </div>

        {/* Center: 折叠式 / 抽屉式分类快捷入口 (纯净图标与分类名，精简无数量冗余) */}
        <button
          onClick={() => {
            sound.playTap();
            setIsCategoryDrawerOpen((prev) => !prev);
          }}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/35 border-2 border-amber-400/60 text-amber-200 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm group active:scale-95"
          title="点击展开/收起书籍分类抽屉"
        >
          {activeCategory === 'all' ? (
            <>
              <Library className="w-4 h-4 text-yellow-300 shrink-0" />
              <span className="text-yellow-100 font-festive font-black text-xs sm:text-sm">
                全部篇章
              </span>
            </>
          ) : (
            <>
              <Layers className="w-4 h-4 text-yellow-300 shrink-0" />
              <span className="text-yellow-100 font-festive font-black text-xs sm:text-sm">
                {activeCategoryMeta.icon} {activeCategoryMeta.name}
              </span>
            </>
          )}
          <motion.div animate={{ rotate: isCategoryDrawerOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-3.5 h-3.5 text-amber-300" />
          </motion.div>
        </button>

        {/* Right: Sound Mute & Parent Console & Streak Pill */}
        <div className="flex items-center gap-2">
          {/* Daily Streak Chip */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenDailyCenter?.();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-yellow-200 text-xs font-bold transition-all cursor-pointer"
            title="研习中心 · 查看连续签到与成长轨迹"
          >
            <Flame className={`w-3.5 h-3.5 ${isTodayCheckedIn ? 'text-orange-400' : 'text-yellow-300 animate-pulse'}`} />
            <span>{streakDays}天</span>
          </button>

          {/* Parent/Teacher Console Button */}
          <button
            onClick={() => {
              sound.playTap();
              onOpenParentConsole();
            }}
            className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-amber-400/30 text-amber-200 hover:text-yellow-200 active:scale-95 transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="家长与教师辅导设置（拼音模式/语速微调）"
            aria-label="家长设置"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Sound Mute Toggle Button */}
          <button
            onClick={() => {
              onToggleMute();
              sound.playTap();
            }}
            className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700 border border-amber-400/30 text-amber-200 hover:text-yellow-200 active:scale-95 transition-all cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title={isMuted ? '开启音效' : '静音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-yellow-300" />}
          </button>
        </div>
      </header>

      {/* 2. COLLAPSIBLE DRAWER FOR CATEGORIES (抽屉式分类面板，完全替代横向滚动) */}
      <AnimatePresence>
        {isCategoryDrawerOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.26, ease: 'easeInOut' }}
            className="overflow-hidden bg-[#24130a] border-b-3 border-amber-500/70 shadow-2xl relative z-20"
          >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
                <div className="flex items-center gap-2">
                  <span className="font-festive font-black text-amber-200 text-sm sm:text-base tracking-wide flex items-center gap-1.5">
                    <span>❖</span>
                    <span>典籍分类抽屉</span>
                    <span>❖</span>
                  </span>
                  <span className="text-xs text-amber-300/70 hidden sm:inline">
                    点击任意分类卡片快速筛选，无需任何横向滑动
                  </span>
                </div>
                <button
                  onClick={() => {
                    sound.playTap();
                    setIsCategoryDrawerOpen(false);
                  }}
                  className="text-xs text-amber-300 hover:text-yellow-100 font-bold flex items-center gap-1 cursor-pointer bg-black/40 hover:bg-black/60 px-3 py-1 rounded-xl border border-amber-400/30"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>收起抽屉</span>
                </button>
              </div>

              {/* Grid of Categories (2 cols on mobile, 3 cols on tablet, 6 cols on desktop) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
                {STORY_CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.key;
                  const count =
                    cat.key === 'all'
                      ? STORY_LEVELS.length
                      : STORY_LEVELS.filter((s) => s.category === cat.key).length;

                  return (
                    <motion.button
                      key={cat.key}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        sound.playCharClick();
                        setActiveCategory(cat.key);
                        setIsCategoryDrawerOpen(false);
                      }}
                      className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between group active:scale-95 shadow-md ${
                        isActive
                          ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-500 text-red-950 font-black border-yellow-200 shadow-xl ring-2 ring-yellow-300'
                          : 'bg-black/45 border-amber-500/30 text-amber-200 hover:border-amber-400 hover:bg-black/65'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        {cat.key === 'all' ? (
                          <Library className="w-6 h-6 text-amber-300 drop-shadow-sm" />
                        ) : (
                          <span className="text-2xl drop-shadow-sm">{cat.icon}</span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-red-950 text-yellow-200 border border-yellow-300'
                              : 'bg-stone-800 text-amber-300 border border-amber-400/20'
                          }`}
                        >
                          {count} 卷
                        </span>
                      </div>

                      <div className="mt-2.5">
                        <span className="font-festive font-black text-sm sm:text-base block tracking-wide">
                          {cat.name}
                        </span>
                        <p
                          className={`text-[10px] leading-snug mt-0.5 line-clamp-1 ${
                            isActive ? 'text-red-950/85 font-medium' : 'text-stone-400'
                          }`}
                        >
                          {cat.desc}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. MAIN BOOKSHELF ROOM (书香藏书阁 · 沉浸木质陈列) */}
      <main className="flex-1 relative overflow-y-auto px-3 sm:px-8 pt-3 pb-28">
        {/* 1. 魔法书院深邃渐变底色 (根据早中晚时序动态调配基底色温) */}
        <div className={`absolute inset-0 bg-gradient-to-b ${activeTimeConfig.roomGradient} transition-all duration-1000 pointer-events-none`} />

        {/* 1.5 早中晚时序色温滤镜流转层 (Time of Day Atmospheric Color Temperature Wash Layer) */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-1000 mix-blend-color-dodge z-0"
          style={{
            background: activeTimeConfig.ambientBloom,
            filter: activeTimeConfig.filterOverlay,
            opacity: 0.65,
          }}
        />

        {/* 2. 渐变平铺背景纹理 (Tiled Parchment & Academy Pattern with Gradient Overlay) */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.2) 1.5px, transparent 1.5px),
              repeating-linear-gradient(45deg, rgba(217, 119, 6, 0.05) 0px, rgba(217, 119, 6, 0.05) 1px, transparent 1px, transparent 24px),
              repeating-linear-gradient(-45deg, rgba(217, 119, 6, 0.05) 0px, rgba(217, 119, 6, 0.05) 1px, transparent 1px, transparent 24px)
            `,
            backgroundSize: '24px 24px, 24px 24px, 24px 24px',
          }}
        />

        {/* 3. 魔法书院自上而下的光晕渲染 (Atmospheric Warm Academy Radial Bloom) */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-1000"
          style={{ background: activeTimeConfig.ambientBloom }}
        />

        {/* 4. 微风浮动与魔法书院灵气动态光影动效 (Magical Breeze Float & Ambient Wind Currents) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* 微风光晕流动 (Floating warm breeze currents with time of day color tone) */}
          <motion.div
            animate={{
              x: [-35, 35, -35],
              y: [-12, 12, -12],
              opacity: [0.18, 0.42, 0.18],
              scale: [1, 1.08, 1],
            }}
            transition={{
              duration: 11,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`absolute top-12 left-1/6 w-96 h-80 ${activeTimeConfig.breezeColor} rounded-full blur-3xl pointer-events-none transition-colors duration-1000`}
          />
          <motion.div
            animate={{
              x: [25, -25, 25],
              y: [15, -15, 15],
              opacity: [0.12, 0.3, 0.12],
              scale: [1.05, 0.95, 1.05],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute bottom-24 right-1/6 w-[420px] h-[350px] bg-red-600/10 rounded-full blur-3xl pointer-events-none"
          />

          {/* 随微风轻舞的金色灵气微粒 (Stardust motes gently floating on the breeze) */}
          {[
            { id: 'b1', left: '10%', top: '22%', size: 4, dur: 8, delay: 0 },
            { id: 'b2', left: '26%', top: '38%', size: 3, dur: 12, delay: 1.2 },
            { id: 'b3', left: '46%', top: '18%', size: 5, dur: 10, delay: 0.5 },
            { id: 'b4', left: '65%', top: '50%', size: 4, dur: 14, delay: 2 },
            { id: 'b5', left: '82%', top: '30%', size: 3, dur: 9, delay: 2.8 },
            { id: 'b6', left: '35%', top: '65%', size: 4, dur: 11, delay: 1.5 },
            { id: 'b7', left: '74%', top: '12%', size: 5, dur: 13, delay: 0.8 },
          ].map((mote) => (
            <motion.div
              key={mote.id}
              animate={{
                y: [0, -22, -6, 0],
                x: [0, 16, -10, 0],
                opacity: [0.25, 0.9, 0.4, 0.25],
                scale: [0.85, 1.2, 0.95, 0.85],
              }}
              transition={{
                duration: mote.dur,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: mote.delay,
              }}
              style={{
                left: mote.left,
                top: mote.top,
                width: `${mote.size}px`,
                height: `${mote.size}px`,
              }}
              className="absolute rounded-full bg-gradient-to-tr from-amber-300 to-yellow-100 shadow-[0_0_8px_rgba(251,191,36,0.85)] pointer-events-none"
            />
          ))}
        </div>

        <div className="relative z-10 max-w-5xl mx-auto space-y-6 sm:space-y-8">
          {/* DAILY LORE COMPONENT (今日典籍新知 · 显赫置顶卡片) */}
          <DailyLore />

          {/* WOODEN SHELF UNIT (实木层板书架) */}
          <div className="relative rounded-3xl bg-[#26150c] p-3 sm:p-7 border-3 sm:border-4 border-[#593319] shadow-[0_20px_50px_rgba(0,0,0,0.85)] overflow-visible">
            {/* Shelf Header Trim (古朴木雕楣额与早中晚色温流转开关) */}
            <div className="min-h-8 sm:h-9 py-1 bg-gradient-to-r from-[#442312] via-[#6a371c] to-[#442312] rounded-t-xl border-b-2 border-[#804222] shadow-sm flex items-center justify-between px-2 sm:px-4 text-[11px] font-bold text-amber-300/80 gap-1.5 overflow-hidden">
              <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-hidden">
                <span className="tracking-wider flex items-center gap-1 shrink-0 text-[10px] sm:text-[11px]">
                  <span>❖</span>
                  <span className="hidden xs:inline">文渊阁 · </span>
                  <span>魔法书架</span>
                  <span className="text-[10px] text-amber-400 font-normal hidden lg:inline">
                    ({activeCategoryMeta.name} · {filteredBooks.length} 篇)
                  </span>
                </span>

                {/* Requirement: 早中晚色温流转指示与切换按钮 (清晨偏冷蓝 / 傍晚偏暖橙) */}
                <button
                  onClick={handleCycleTimeOfDay}
                  className={`px-2 py-0.5 rounded-full border text-[10px] font-festive font-bold transition-all backdrop-blur-md cursor-pointer active:scale-95 flex items-center gap-1 shrink-0 ${activeTimeConfig.timePillStyle}`}
                  title="点击切换早中晚色温流转（清晨偏冷蓝/正午金阳/傍晚偏暖橙/幽蓝夜读/自动感应）"
                >
                  <span>{activeTimeConfig.icon}</span>
                  <span className="hidden sm:inline">{activeTimeConfig.label}</span>
                </button>

                {/* 难度系数与进度排序切换器 (增强成就感反馈与难度递进筛选) */}
                <div className="flex items-center gap-0.5 sm:gap-1 bg-black/40 p-0.5 rounded-full border border-amber-500/40 text-[10px] shrink-0">
                  {[
                    { key: 'default' as const, label: '推荐', icon: '📖' },
                    { key: 'difficulty-asc' as const, label: '难度', icon: '⭐' },
                    { key: 'difficulty-desc' as const, label: '高难', icon: '🏆' },
                    { key: 'progress' as const, label: '完成度', icon: '📊' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => handleSetSortOption(item.key)}
                      className={`px-1.5 sm:px-2 py-0.5 rounded-full transition-all cursor-pointer font-festive font-bold flex items-center gap-0.5 ${
                        sortOption === item.key
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-stone-950 shadow-sm scale-102 font-black'
                          : 'text-amber-200 hover:text-white'
                      }`}
                      title={`按${item.label}编排书架`}
                    >
                      <span>{item.icon}</span>
                      <span className="text-[10px] hidden md:inline">{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* 编排书架模式按钮（纯 SVG 图标化，去文字） */}
                <button
                  onClick={() => {
                    sound.playTap();
                    setIsReorderMode((prev) => {
                      const next = !prev;
                      if (next) {
                        sound.playPop();
                        setOrderToast('🖐️ 已开启书架编排：可触控拖拽或按箭头排序');
                      } else {
                        sound.playReward();
                        setOrderToast('✨ 书架典籍排序已保存');
                      }
                      setTimeout(() => setOrderToast(null), 2500);
                      return next;
                    });
                  }}
                  className={`p-1.5 rounded-full border transition-all backdrop-blur-md cursor-pointer active:scale-95 flex items-center justify-center shrink-0 min-w-[28px] min-h-[28px] ${
                    isReorderMode
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-stone-950 border-yellow-200 shadow-[0_0_12px_rgba(250,204,21,0.85)] ring-2 ring-yellow-300'
                      : 'bg-amber-950/80 text-yellow-200 border-amber-500/60 hover:bg-amber-900/90 shadow-sm'
                  }`}
                  title={isReorderMode ? '完成编排' : '编排书架'}
                  aria-label={isReorderMode ? '完成' : '编辑'}
                >
                  {isReorderMode ? (
                    <Check size={18} className="text-stone-950 stroke-[2.5]" />
                  ) : (
                    <Pencil size={18} className="text-yellow-300" />
                  )}
                </button>
              </div>

              <span className="text-[10px] text-amber-200/70 hidden sm:inline shrink-0">
                甲辰岁律 · 听说驱动启蒙
              </span>
            </div>

            {/* Shelf Compartment Row 1: The Spines of Selected Stories (古朴实木书架书脊陈列) */}
            <div className="pt-8 pb-2 px-2 sm:px-6 relative">
              {/* 魔法飞碟伴读 Bobu：根据连胜天数挥舞小旗子、闲置微动作、点击触发励志语录、冷知识读完收起或渐隐 */}
              <div className="absolute -top-7 right-3 sm:right-10 z-30 pointer-events-none">
                <BobuUfoCompanion
                  className="pointer-events-auto"
                  currentStoryId={currentStoryId}
                  streakDays={streakDays}
                  collectedCount={collectedCount}
                  totalTarget={totalTarget}
                  isTodayCheckedIn={isTodayCheckedIn}
                />
              </div>

              {/* ANCIENT BOOK DISPLAY PEDESTAL & ALCOVE BACKDROP (古籍陈列台 · 随学习进度与时长动态调整CSS滤镜由陈旧走向流光溢彩) */}
              <div className="absolute inset-x-1.5 sm:inset-x-3.5 top-2 bottom-11 rounded-2xl overflow-hidden pointer-events-none z-0 transition-all duration-700">
                {/* 1. 仿古博古云纹背景图片叠加与动态 CSS 滤镜 (Dynamic CSS Filters: hue-rotate, brightness, saturate, sepia, contrast) */}
                <div
                  className="absolute inset-0 opacity-45 mix-blend-color-dodge transition-all duration-700"
                  style={{
                    backgroundImage: `
                      radial-gradient(ellipse 75% 65% at 50% 18%, rgba(245, 158, 11, 0.28) 0%, rgba(180, 83, 9, 0.09) 60%, transparent 95%),
                      radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.14) 1.5px, transparent 1.5px),
                      url("data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18 0l18 18-18 18L0 18 18 0zm0 7.5L5.5 18 18 30.5 30.5 18 18 7.5z' fill='%23d97706' fill-opacity='0.08' fill-rule='evenodd'/%3E%3Ccircle cx='18' cy='18' r='2.5' fill='%23f59e0b' fill-opacity='0.12'/%3E%3C/svg%3E"),
                      linear-gradient(180deg, #240e06 0%, #170702 65%, #0a0301 100%)
                    `,
                    backgroundSize: '100% 100%, 28px 28px, 36px 36px, 100% 100%',
                    filter: ancientPedestalFilter,
                  }}
                />

                {/* 2. 流光溢彩魔法灵气浮层 (随学习进度与时长绽放的彩虹星辉流光，由黯淡蜕变为璀璨华彩) */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-1000 mix-blend-color-dodge"
                  style={{
                    opacity: (0.04 + effectiveProgress * 0.58).toFixed(2),
                    backgroundImage: `
                      radial-gradient(ellipse 80% 60% at 50% 30%, rgba(251, 191, 36, ${0.15 + effectiveProgress * 0.45}) 0%, rgba(236, 72, 153, ${effectiveProgress * 0.25}) 35%, rgba(56, 189, 248, ${effectiveProgress * 0.3}) 70%, transparent 100%),
                      radial-gradient(circle at 50% 50%, rgba(254, 240, 138, ${0.1 + effectiveProgress * 0.35}) 2px, transparent 2px)
                    `,
                    backgroundSize: '100% 100%, 24px 24px',
                  }}
                />

                {/* 3. 深度壁龛内阴影（CSS Inset Shadows 营造内凹立体纵深） */}
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    boxShadow:
                      'inset 0 20px 42px rgba(0,0,0,0.95), inset 0 -14px 28px rgba(0,0,0,0.85), inset 16px 0 32px rgba(0,0,0,0.8), inset -16px 0 32px rgba(0,0,0,0.8)',
                  }}
                />

                {/* 4. 聚光灯漫射光晕 (Spotlight: 从陈旧黯淡烛光演进为璀璨星空光华) */}
                <div
                  className="absolute -top-10 left-1/2 -translate-x-1/2 w-4/5 h-48 rounded-full blur-2xl pointer-events-none transition-all duration-700"
                  style={{
                    background: `radial-gradient(ellipse at 50% 0%, rgba(251, 191, 36, ${0.15 + effectiveProgress * 0.35}) 0%, rgba(168, 85, 247, ${effectiveProgress * 0.22}) 50%, transparent 80%)`,
                  }}
                />

                {/* 5. 陈列台背光浮托光带 (Pedestal ambient underglow beneath book spines) */}
                <div
                  className="absolute inset-x-4 bottom-2.5 h-20 blur-lg pointer-events-none transition-all duration-700"
                  style={{
                    background: `linear-gradient(to top, rgba(245, 158, 11, ${0.15 + effectiveProgress * 0.35}) 0%, rgba(251, 191, 36, ${0.08 + effectiveProgress * 0.2}) 60%, transparent 100%)`,
                  }}
                />

                {/* 6. 左右透视深渊暗角与仿古铜质包角 (Perspective Depth Alcove Sides & Brass Corners) */}
                <div className="absolute inset-y-0 left-0 w-8 sm:w-14 bg-gradient-to-r from-black/90 via-black/45 to-transparent pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-8 sm:w-14 bg-gradient-to-l from-black/90 via-black/45 to-transparent pointer-events-none" />
                {/* Brass Corner Filigrees */}
                <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-amber-500/60 rounded-tl-sm pointer-events-none" />
                <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-amber-500/60 rounded-tr-sm pointer-events-none" />

                {/* 7. 立体承书台基 (Tiered Ancient Codex Showcase Riser Platform) */}
                <div className="absolute bottom-0 inset-x-0 h-10 flex flex-col justify-end pointer-events-none">
                  {/* 台基立体倒角阴影 */}
                  <div className="h-2 bg-gradient-to-b from-black/70 to-transparent" />
                  {/* 上阶浮雕承书面 (Upper Riser Step with golden inlay) */}
                  <div className="h-4 bg-gradient-to-r from-[#4d2411] via-[#6e3519] to-[#4d2411] border-t-2 border-amber-500/50 flex items-center justify-between px-3 shadow-md">
                    <div
                      className="h-[1.5px] w-full transition-all duration-700"
                      style={{
                        background: `linear-gradient(to right, transparent, rgba(253, 224, 71, ${0.4 + effectiveProgress * 0.6}), transparent)`,
                        boxShadow: effectiveProgress >= 0.5 ? '0 0 8px rgba(250, 204, 21, 0.8)' : 'none',
                      }}
                    />
                  </div>
                  {/* 下阶基座立面 (Lower Pedestal Plinth) */}
                  <div className="h-4 bg-gradient-to-b from-[#2e1509] to-[#160803] border-t border-[#804222]/40 shadow-inner" />
                </div>

                {/* 8. 古籍陈列台徽标匾额与灵气阶数 (Showcase Alcove Crest & Magic Ambiance Indicator) */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 pointer-events-auto">
                  <button
                    onClick={handleCycleAmbiancePreview}
                    className={`px-3 py-0.5 rounded-full border text-[10px] font-festive tracking-widest backdrop-blur-md shadow-md flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${ambianceBadgeStyle}`}
                    title={`点击切换/预览：古籍陈列台由陈旧至流光溢彩氛围（当前进度: ${Math.round(effectiveProgress * 100)}% · 研习时长: ${totalStudyMinutes}分钟）`}
                  >
                    <span className="text-amber-300">❖</span>
                    <span>古籍陈列台 · {ambianceTitle}</span>
                    <span className="text-[9px] font-mono opacity-85 px-1 py-0.2 rounded-full bg-black/40">
                      {Math.round(effectiveProgress * 100)}%
                    </span>
                    <Sparkles className={`w-2.5 h-2.5 text-yellow-300 ${effectiveProgress >= 0.7 ? 'animate-spin' : 'animate-pulse'}`} />
                  </button>
                </div>
              </div>

              {/* 魔法呼吸灯提示横幅 (长时间未选择书籍时静候探索) */}
              <AnimatePresence>
                {isIdlePromptActive && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.9 }}
                    transition={{ duration: 0.35 }}
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
                  >
                    <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-red-950 via-amber-950 to-red-950 border-2 border-yellow-400 text-yellow-200 text-[11px] font-bold shadow-[0_0_22px_rgba(250,204,21,0.7)] backdrop-blur-md animate-pulse whitespace-nowrap">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                      <span>✨ 魔法书院灵光呼吸 · 触抚任一典籍开启修读 ✨</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 触控拖拽整理模式指南与快速操作栏（移动端视口适配与纯 SVG 图标化） */}
              <AnimatePresence>
                {isReorderMode && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    className="relative z-30 mb-3 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-950/95 via-stone-900/95 to-amber-950/95 border-2 border-yellow-400/80 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex flex-wrap items-center justify-between gap-2 text-xs text-amber-100 max-w-[92vw] mx-auto w-full"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-yellow-400/20 border border-yellow-400/50 flex items-center justify-center text-yellow-300 shrink-0">
                        <Move className="w-3.5 h-3.5 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-festive font-black text-yellow-300 text-xs sm:text-sm">
                            编排书架
                          </span>
                          <span className="text-[10px] text-yellow-200/90 bg-black/40 px-2 py-0.2 rounded-full border border-yellow-400/30">
                            触控拖拽重排 · 自动保存
                          </span>
                        </div>
                        <p className="text-[10px] text-amber-200/80 mt-0.5">
                          拖动典籍或点击 ◀ / ▶ 换位；亦可点按勾号保存完成
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCustomOrder && (
                        <button
                          type="button"
                          onClick={handleResetOrder}
                          className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-yellow-200 border border-amber-500/40 cursor-pointer transition-all active:scale-95 flex items-center justify-center min-w-[34px] min-h-[34px]"
                          title="恢复初始推荐顺序"
                          aria-label="恢复默认"
                        >
                          <RotateCcw size={18} className="text-amber-400" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          sound.playReward();
                          setIsReorderMode(false);
                          setOrderToast('✨ 书架典籍顺序已保存');
                          setTimeout(() => setOrderToast(null), 2500);
                        }}
                        className="p-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-stone-950 border border-yellow-200 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center min-w-[34px] min-h-[34px]"
                        title="完成编排"
                        aria-label="完成"
                      >
                        <Check size={18} className="text-stone-950 stroke-[2.5]" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Books Spines Container: 水平 4 本划动翻页与固定高度（消除垂直滚动条，隐藏原生横向滚动条） */}
              <div
                className="relative overflow-visible"
                onTouchStart={handleTrackTouchStart}
                onTouchEnd={handleTrackTouchEnd}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`page-${currentPage}-${activeCategory}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -16, transition: { duration: 0.16 } }}
                    className="w-full flex justify-center"
                  >
                    <Reorder.Group
                      as="div"
                      axis="x"
                      values={pagedBooks}
                      onReorder={handlePagedReorder}
                      variants={bookshelfStaggerContainerVariants}
                      initial="hidden"
                      animate="visible"
                      className="relative z-10 flex items-end justify-center gap-2 xs:gap-3 sm:gap-5 h-[272px] sm:h-[295px] pt-4 pb-2 px-1 overflow-y-hidden overflow-x-hidden scrollbar-none w-full max-w-full"
                    >
                      {pagedBooks.map((story, pageIndex) => {
                        const globalIndex = currentPage * BOOKS_PER_PAGE + pageIndex;
                        const style = getSpineStyle(story);
                        const isCurrent = story.id === currentStoryId;
                        const progress = story.completion.reading || 0;
                        const isWobbling = touchedBookId === story.id;
                        const isBreathingTarget = isIdlePromptActive && (isCurrent || globalIndex === 0);

                        // Vary heights slightly for authentic hand-drawn feel
                        const heightVariants = ['h-[240px]', 'h-[255px]', 'h-[248px]', 'h-[260px]', 'h-[250px]'];
                        const spineHeight = heightVariants[globalIndex % heightVariants.length];

                        return (
                          <ReorderableBookItem
                            key={story.id}
                            story={story}
                            index={globalIndex}
                            totalCount={filteredBooks.length}
                            isCurrent={isCurrent}
                            progress={progress}
                            isWobbling={isWobbling}
                            isBreathingTarget={isBreathingTarget}
                            isIdlePromptActive={isIdlePromptActive}
                            style={style}
                            spineHeight={spineHeight}
                            isReorderMode={isReorderMode}
                            onSelectBook={handleSelectBook}
                            onTouchStart={handleBookTouchStart}
                            onTouchEnd={handleBookTouchEnd}
                            onHoverSound={() => sound.playSpineHover()}
                            onResetIdle={resetIdleTimer}
                            onMoveLeft={() => handleMoveStory(story.id, 'left')}
                            onMoveRight={() => handleMoveStory(story.id, 'right')}
                            onMoveToTop={() => handleMoveStory(story.id, 'top')}
                          />
                        );
                      })}
                    </Reorder.Group>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* HEAVY WOODEN SHELF PLANK (粗厚手绘实木层板) */}
              <div className="relative mt-0.5">
                {/* Plank top bevel edge */}
                <div className="h-3 bg-gradient-to-r from-[#824424] via-[#b35d2f] to-[#824424] rounded-t-sm shadow-inner" />
                {/* Plank front face (thick wood beam) */}
                <div className="h-7 sm:h-8 bg-gradient-to-b from-[#603017] via-[#43210f] to-[#2b1409] rounded-b-md border-t-2 border-[#d97c45] border-b-3 border-[#160a04] shadow-2xl flex items-center justify-between px-4">
                  {/* Brass bracket screws */}
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 border border-amber-300 shadow-xs" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 border border-amber-300 shadow-xs" />
                </div>
                {/* Deep bottom drop shadow beneath plank */}
                <div className="h-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
              </div>

              {/* Pagination Dots Indicator (极简小圆点指示器 · 位于书架下方，不遮挡 Bobu 与背景) */}
              {totalPages > 1 && (
                <div className="mt-2.5 mb-0.5 flex items-center justify-center gap-2 relative z-20">
                  <button
                    type="button"
                    disabled={currentPage === 0}
                    onClick={() => {
                      sound.playTap();
                      setCurrentPage((prev) => Math.max(0, prev - 1));
                    }}
                    className={`p-1.5 rounded-full transition-all cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center ${
                      currentPage === 0
                        ? 'opacity-20 text-stone-500 cursor-not-allowed'
                        : 'bg-black/50 hover:bg-black/80 text-yellow-300 border border-amber-500/40 active:scale-90 shadow-sm'
                    }`}
                    title="上一页 (前4卷)"
                    aria-label="上一页"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-amber-500/40 backdrop-blur-xs shadow-inner">
                    {Array.from({ length: totalPages }).map((_, pageIdx) => {
                      const isActive = currentPage === pageIdx;
                      return (
                        <button
                          key={pageIdx}
                          type="button"
                          onClick={() => {
                            sound.playTap();
                            setCurrentPage(pageIdx);
                          }}
                          className={`transition-all duration-300 rounded-full cursor-pointer ${
                            isActive
                              ? 'w-6 h-2 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.9)] ring-1 ring-yellow-200'
                              : 'w-2 h-2 bg-amber-200/35 hover:bg-amber-200/70'
                          }`}
                          title={`第 ${pageIdx + 1} / ${totalPages} 页 (${pageIdx * BOOKS_PER_PAGE + 1}-${Math.min((pageIdx + 1) * BOOKS_PER_PAGE, filteredBooks.length)} 卷)`}
                          aria-label={`切换至第 ${pageIdx + 1} 页`}
                        />
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => {
                      sound.playTap();
                      setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
                    }}
                    className={`p-1.5 rounded-full transition-all cursor-pointer min-w-[28px] min-h-[28px] flex items-center justify-center ${
                      currentPage >= totalPages - 1
                        ? 'opacity-20 text-stone-500 cursor-not-allowed'
                        : 'bg-black/50 hover:bg-black/80 text-yellow-300 border border-amber-500/40 active:scale-90 shadow-sm'
                    }`}
                    title="下一页 (后4卷)"
                    aria-label="下一页"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Shelf Footer: Motivational Quote & Statistics */}
            <div className="mt-4 pt-4 border-t-2 border-[#593319] flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200/80 px-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Bookmark className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  共收录 <strong className="text-yellow-300 font-bold">{STORY_LEVELS.length}</strong> 部传统经典与科普名篇
                </span>
                {isCustomOrder && (
                  <span className="text-[10px] text-yellow-300 bg-amber-950/90 border border-amber-500/50 px-2 py-0.5 rounded-full font-bold">
                    已自定书序
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {isCustomOrder && (
                  <button
                    onClick={handleResetOrder}
                    className="text-amber-300/80 hover:text-yellow-200 text-xs flex items-center gap-1 cursor-pointer transition-colors active:scale-95"
                    title="恢复为默认推荐典籍顺序"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>恢复推荐顺序</span>
                  </button>
                )}
                <span>
                  累计掌握高频字: <strong className="text-yellow-300 font-bold">{collectedCount}</strong> / {totalTarget}
                </span>
                <button
                  onClick={() => {
                    sound.playTap();
                    onOpenTreasury?.();
                  }}
                  className="text-amber-300 hover:text-yellow-200 underline font-bold cursor-pointer"
                >
                  查看文位宝库 ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 实时书架排序变动反馈 Toast */}
      <AnimatePresence>
        {orderToast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-stone-950/95 text-yellow-300 border-2 border-yellow-400/80 shadow-[0_10px_25px_rgba(0,0,0,0.85)] backdrop-blur-md text-xs font-bold font-festive flex items-center gap-2 pointer-events-none"
          >
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
            <span>{orderToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. EXPANDED BOOK COVER MODAL (抽出书本飞行动效与封面展示，移动端视口适配) */}
      <AnimatePresence>
        {selectedBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6">
            {/* Backdrop: Clicking outside puts book back on shelf */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={handlePutBackBook}
              className="absolute inset-0 bg-stone-950/80 backdrop-blur-md cursor-pointer"
            />

            {/* Pulled-out Book Cover Card with layoutId animation */}
            <motion.div
              layoutId={`book-card-${selectedBook.id}`}
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative z-10 w-full max-w-xl max-w-[92vw] max-h-[85vh] bg-amber-50 rounded-[28px] sm:rounded-[32px] border-3 sm:border-4 border-amber-400 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col text-stone-800"
            >
              {/* Cover Top Illustrated Header Banner */}
              <div className={`relative p-5 sm:p-7 bg-gradient-to-br ${selectedBook.coverTheme.gradient} text-white border-b-4 border-amber-300/80 overflow-hidden`}>
                {/* Auspicious background clouds / stars */}
                <div className="absolute top-2 right-4 text-4xl opacity-30 pointer-events-none select-none">
                  {selectedBook.icon} 📜 🏮
                </div>

                <div className="relative z-10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 text-yellow-300 font-bold text-xs border border-yellow-300/40">
                      <span>{selectedBook.icon}</span>
                      <span>第 {selectedBook.chapterNumber} 卷 · {selectedBook.theme}</span>
                    </span>

                    {/* Put back on shelf button (Top right big target) */}
                    <button
                      onClick={handlePutBackBook}
                      className="p-2 rounded-2xl bg-black/40 hover:bg-black/60 text-amber-200 hover:text-white border border-amber-300/30 transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="放回书架"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <h2 className="font-festive font-black text-2xl sm:text-3xl text-amber-100 tracking-wide pt-1">
                    {selectedBook.title}
                  </h2>
                  <p className="text-amber-200/90 text-sm font-bold">
                    {selectedBook.subtitle}
                  </p>
                </div>
              </div>

              {/* Cover Body: Content Synopsis & Pedagogical Target Characters */}
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
                {/* Level Tag & Grade Level & 1-5 Star Rating */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-300 text-amber-950 text-xs font-black shadow-2xs">
                    <span className="text-amber-800">难度系数:</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < getStoryDifficultyStars(selectedBook)
                              ? 'text-yellow-500 fill-yellow-400 drop-shadow-xs'
                              : 'text-stone-300 fill-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-amber-900 font-bold ml-0.5">
                      ({getStoryDifficultyStars(selectedBook)}星 · {selectedBook.difficulty})
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs font-black">
                    适用：{selectedBook.gradeLevel}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-black flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    修业综合进度：{gameStore.getStoryCompletionSummary(selectedBook.id).percentage}%
                  </span>
                </div>

                {/* Exercise Module Completion Dashboard (增强成就感反馈) */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50/70 rounded-2xl p-4 border-2 border-amber-300 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-600" />
                      本篇修业模块完成度 ({gameStore.getStoryCompletionSummary(selectedBook.id).completedCount}/6 通关)
                    </span>
                    <span className="text-xs font-black text-amber-800 font-mono">
                      {gameStore.getStoryCompletionSummary(selectedBook.id).percentage}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2.5 bg-amber-200/80 rounded-full overflow-hidden p-0.5 border border-amber-300">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 shadow-xs"
                      style={{ width: `${gameStore.getStoryCompletionSummary(selectedBook.id).percentage}%` }}
                    />
                  </div>

                  {/* 6 Module Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    {[
                      { type: 'reading', label: '📖 朗读研习' },
                      { type: 'sound', label: '🔊 听音选字' },
                      { type: 'radical', label: '🧩 偏旁积木' },
                      { type: 'handwriting', label: '✍️ 汉字书写' },
                      { type: 'cloze', label: '📝 原文挖空' },
                      { type: 'essay', label: '📜 400字作文' },
                    ].map((mod) => {
                      const rec = gameStore.getModuleCompletion(selectedBook.id, mod.type as any);
                      const isDone = !!rec?.completed;
                      return (
                        <div
                          key={mod.type}
                          className={`p-2 rounded-xl border flex items-center justify-between gap-1 text-[11px] font-bold ${
                            isDone
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                              : 'bg-white/80 border-stone-200 text-stone-500'
                          }`}
                        >
                          <span>{mod.label}</span>
                          {isDone ? (
                            <span className="flex items-center text-emerald-600 text-[10px] font-black">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-0.5" />
                              已通关
                            </span>
                          ) : (
                            <span className="text-stone-400 text-[10px]">待完成</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Child-friendly summary */}
                <div className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      故事剧情简介
                    </span>
                    <button
                      onClick={() => {
                        sound.playTap();
                        speakChinese(selectedBook.summary, 0.95);
                      }}
                      className="flex items-center gap-1 text-[11px] text-red-800 hover:text-red-950 font-bold px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 transition-colors cursor-pointer"
                      title="朗读简介"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> 听听看
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    {selectedBook.summary}
                  </p>
                </div>

                {/* Core target characters to learn */}
                <div className="bg-gradient-to-r from-amber-100/60 to-orange-100/60 rounded-2xl p-4 border-2 border-amber-200/80 space-y-2">
                  <span className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-600" />
                    本篇核心必学高频字 ({selectedBook.targetCharacters.length}字)
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedBook.targetCharacters.map((char) => (
                      <div
                        key={char.id}
                        className="px-3 py-1.5 rounded-xl bg-white border-2 border-amber-300 text-red-950 font-black shadow-xs flex items-center gap-1.5"
                      >
                        <span className="font-festive text-base sm:text-lg">{char.char}</span>
                        <span className="text-[11px] text-stone-500 font-sans font-normal">
                          {char.pinyin}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cultural Lore snippet */}
                <p className="text-[11px] text-stone-500 italic bg-stone-100/80 p-3 rounded-xl border border-stone-200">
                  💡 文化锦囊：{selectedBook.culturalLore}
                </p>
              </div>

              {/* Cover Bottom Action Bar: Clear Exit & Bright Glow "开始探索" */}
              <div className="p-4 sm:p-5 bg-stone-100 border-t-2 border-amber-200 flex items-center justify-between gap-3">
                {/* Put back on shelf button (永远有退路) */}
                <button
                  onClick={handlePutBackBook}
                  className="flex-1 py-3 px-4 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs sm:text-sm border-2 border-stone-300 shadow-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[50px]"
                >
                  <RotateCcw className="w-4 h-4 text-stone-500" />
                  <span>放回书架</span>
                </button>

                {/* Start exploration button (明亮大按键，防误触) */}
                <button
                  onClick={() => handleConfirmStart(selectedBook.id)}
                  className="flex-[2] py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-white font-festive font-black text-base sm:text-lg shadow-[0_8px_20px_rgba(234,88,12,0.45)] border-2 border-yellow-200 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[50px] ring-4 ring-yellow-400/30"
                >
                  <Sparkles className="w-5 h-5 text-yellow-200 animate-spin" />
                  <span>🌟 开始探索</span>
                  <ArrowRight className="w-5 h-5 text-yellow-100 ml-1" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
