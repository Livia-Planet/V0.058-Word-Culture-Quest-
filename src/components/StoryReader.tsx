import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  Sparkles,
  BookOpen,
  ChevronRight,
  HelpCircle,
  Flame,
  Star,
  Play,
  Pause,
  Square,
  FastForward,
  Info,
  X,
  Gauge,
  SkipForward,
  SkipBack,
  Eye,
  Settings,
  Headphones,
  Music,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Trophy,
  Award,
  Crown,
  Zap,
  Check,
  Mic,
  TrendingUp,
  Maximize2,
  Minimize2,
  Waves,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { STORY_PARAGRAPHS, TARGET_CHARACTERS, HanziChar } from '../data/level1Data';
import { StoryLevel } from '../data/storyLevels';
import {
  sound,
  speakChinese,
  speakChineseTracked,
  stopChineseSpeech,
  pauseChineseSpeech,
  resumeChineseSpeech,
} from '../utils/audio';
import { guqinAudio } from '../utils/guqinAudio';
import { bookNoiseAudio } from '../utils/bookNoiseAudio';
import { PinyinMode } from './HeaderDashboard';
import { useSettingsStore } from '../store/useSettingsStore';
import { useGameStore, LEVEL_TIERS } from '../store/useGameStore';
import { safeGetItem, safeSetItem } from '../utils/storage';

interface StoryReaderProps {
  pinyinMode?: PinyinMode;
  onChangePinyinMode?: (mode: PinyinMode) => void;
  onSelectCharacter?: (charData: HanziChar) => void;
  onGoToChallenge: () => void;
  storyData?: StoryLevel;
  onOpenParentConsole?: () => void;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  pinyinMode: propPinyinMode,
  onChangePinyinMode: propOnChangePinyinMode,
  onSelectCharacter: propOnSelectCharacter,
  onGoToChallenge,
  storyData: propStoryData,
  onOpenParentConsole: propOnOpenParentConsole,
}) => {
  // Direct store hook consumption (解耦 Prop Drilling)
  const settingsStore = useSettingsStore();
  const gameStore = useGameStore();

  const pinyinMode = propPinyinMode ?? settingsStore.pinyinMode;
  const onChangePinyinMode = propOnChangePinyinMode ?? settingsStore.setPinyinMode;
  const onSelectCharacter = propOnSelectCharacter ?? gameStore.setModalChar;
  const onOpenParentConsole = propOnOpenParentConsole ?? settingsStore.openParentConsole;
  const effectiveStoryData = propStoryData ?? gameStore.currentStory;

  const paragraphs = effectiveStoryData?.storyParagraphs || STORY_PARAGRAPHS;
  const targetChars = effectiveStoryData?.targetCharacters || TARGET_CHARACTERS;
  const storyTitle = effectiveStoryData?.title || '《春节与年兽》';
  const storySubtitle = effectiveStoryData?.subtitle || '第一关：除夕夜与年兽的三个弱点';
  const storySummary =
    effectiveStoryData?.summary ||
    '很久以前，神秘的“年兽”会在除夕夜袭击村庄。聪明的祖先发现了击退年兽的三大法宝！请阅读故事，点击故事中带有红框的高频汉字，查看偏旁积木奥秘，或开启原汁原味影子跟读！';
  const storyIcon = effectiveStoryData?.icon || '🏮';
  // TTS & Word Tracking State
  const [activeParagraphId, setActiveParagraphId] = useState<number | null>(null);
  const [activeCharIndex, setActiveCharIndex] = useState<number | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState<'stopped' | 'playing' | 'paused'>('stopped');
  const [speechRate, setSpeechRate] = useState<number>(0.9); // 0.8: slow, 1.0: normal, 1.2: fast
  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

  // Bobu Interactive Mystery Question State
  const [selectedMysteryOption, setSelectedMysteryOption] = useState<number | null>(null);
  const [showMysteryExplanation, setShowMysteryExplanation] = useState<boolean>(false);

  useEffect(() => {
    setSelectedMysteryOption(null);
    setShowMysteryExplanation(false);
  }, [effectiveStoryData?.id]);

  const handleSelectMysteryOption = (index: number) => {
    if (!effectiveStoryData?.bobuMystery) return;
    setSelectedMysteryOption(index);
    if (index === effectiveStoryData.bobuMystery.answer) {
      sound.playReward();
      setShowMysteryExplanation(true);
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    } else {
      sound.playWrong();
    }
  };

  // Auto Dwell Pre-reading State (停留在段落较长时间时自动触发 TTS 语音预读)
  const [autoDwellPreRead, setAutoDwellPreRead] = useState<boolean>(() =>
    safeGetItem('story_auto_dwell_preread', true)
  );

  // Lightweight Guqin Reading Background Music State (停留在段落时触发柔和古琴背景音乐淡入，切换段落平滑过渡)
  const [guqinMusicEnabled, setGuqinMusicEnabled] = useState<boolean>(() =>
    safeGetItem('story_guqin_music_enabled', true)
  );

  // --- Reading Segments XP & Level-Up System ---
  const storyKey = effectiveStoryData?.id || 'story-1';
  const [completedSegments, setCompletedSegments] = useState<
    Record<number, { readTimeSeconds: number; accuracy: number; expGained: number }>
  >(() => safeGetItem(`story_completed_segments_${storyKey}`, {}));

  // Track start time of segment reading
  const segmentStartTimesRef = useRef<Record<number, number>>({});

  // Floating XP Gain Banner / Chip
  const [xpNotification, setXpNotification] = useState<{
    id: number;
    expGained: number;
    coinsGained: number;
    text: string;
    accuracy: number;
  } | null>(null);

  // Level-Up Celebration Modal Data
  const [levelUpModalData, setLevelUpModalData] = useState<{
    oldLevel: number;
    newLevel: number;
    newTitle: string;
    expGained: number;
    badgeIcon: string;
  } | null>(null);

  // Active testing / practicing state for specific paragraph
  const [activePracticingParagraphId, setActivePracticingParagraphId] = useState<number | null>(null);

  // Progression Bar feedback & Coin Counter Growth states
  const [isProgressBarShaking, setIsProgressBarShaking] = useState<boolean>(false);
  const [displayedCoins, setDisplayedCoins] = useState<number>(() => gameStore.totalCoins);
  const [recentCoinDiff, setRecentCoinDiff] = useState<number | null>(null);
  const [coinBurstTokens, setCoinBurstTokens] = useState<Array<{ id: number; amount: number }>>([]);

  // Keep displayed coins in sync if updated from outside
  useEffect(() => {
    setDisplayedCoins(gameStore.totalCoins);
  }, [gameStore.totalCoins]);

  const handleCompleteSegment = (
    paragraphId: number,
    customDuration?: number,
    customAccuracy?: number
  ) => {
    const startTime = segmentStartTimesRef.current[paragraphId] || (Date.now() - 4000);
    const calculatedDuration = customDuration ?? Math.max(3, Math.round((Date.now() - startTime) / 1000));
    const calculatedAccuracy = customAccuracy ?? (Math.floor(Math.random() * 6) + 94); // 94% - 99%

    const result = gameStore.recordReadingSegmentExp(
      paragraphId,
      calculatedDuration,
      calculatedAccuracy
    );

    setCompletedSegments((prev) => {
      const next = {
        ...prev,
        [paragraphId]: {
          readTimeSeconds: calculatedDuration,
          accuracy: calculatedAccuracy,
          expGained: result.expGained,
        },
      };
      safeSetItem(`story_completed_segments_${storyKey}`, next);
      return next;
    });

    // 1. 触发阅读进度条轻微震动反馈 (Haptic + Visual Tremor)
    setIsProgressBarShaking(true);
    setTimeout(() => setIsProgressBarShaking(false), 550);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([18, 30, 20]);
      } catch {}
    }

    // 2. 触发金币数字平滑增长动画与散金音效
    sound.playCoin();
    setRecentCoinDiff(result.coinsGained);
    const startCoins = displayedCoins;
    const targetCoins = startCoins + result.coinsGained;
    const animStart = performance.now();
    const animDuration = 650;

    const animateCoinCounter = (time: number) => {
      const elapsed = time - animStart;
      const progress = Math.min(1, elapsed / animDuration);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setDisplayedCoins(Math.round(startCoins + (targetCoins - startCoins) * easeProgress));
      if (progress < 1) {
        requestAnimationFrame(animateCoinCounter);
      } else {
        setDisplayedCoins(targetCoins);
      }
    };
    requestAnimationFrame(animateCoinCounter);

    const burstId = Date.now();
    setCoinBurstTokens((prev) => [...prev, { id: burstId, amount: result.coinsGained }]);
    setTimeout(() => {
      setCoinBurstTokens((prev) => prev.filter((t) => t.id !== burstId));
      setRecentCoinDiff(null);
    }, 2000);

    setXpNotification({
      id: Date.now(),
      expGained: result.expGained,
      coinsGained: result.coinsGained,
      text: `第 ${paragraphId} 段研习完成！`,
      accuracy: calculatedAccuracy,
    });

    setTimeout(() => {
      setXpNotification((curr) => (curr && Date.now() - curr.id > 2800 ? null : curr));
    }, 3200);

    if (result.leveledUp) {
      sound.playBadgeUnlock();
      try {
        confetti({
          particleCount: 85,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#f59e0b', '#ef4444', '#10b981', '#fbbf24', '#8b5cf6'],
        });
      } catch {}

      const newTier = LEVEL_TIERS.find((t) => t.level === result.newLevel);
      setLevelUpModalData({
        oldLevel: result.oldLevel,
        newLevel: result.newLevel,
        newTitle: result.newLevelTitle,
        expGained: result.expGained,
        badgeIcon: newTier?.badgeIcon || '👑',
      });
    }
  };

  // Interactive paragraph speech practicing / shadowing check
  const handlePracticeParagraph = (paragraphId: number) => {
    sound.playTap();
    setActivePracticingParagraphId(paragraphId);
    segmentStartTimesRef.current[paragraphId] = Date.now();

    setTimeout(() => {
      const duration = 4 + Math.floor(Math.random() * 3);
      const accuracy = 94 + Math.floor(Math.random() * 6); // 94% ~ 99%
      handleCompleteSegment(paragraphId, duration, accuracy);
      setActivePracticingParagraphId(null);
      sound.playReward();
    }, 1200);
  };

  const [hoveredParagraphId, setHoveredParagraphId] = useState<number | null>(null);
  const hoveredParagraphIdRef = useRef<number | null>(null);
  const [dwellProgress, setDwellProgress] = useState<number>(0);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dwellIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastDwellTriggeredParaIdRef = useRef<number | null>(null);
  const DWELL_DURATION_MS = 2600; // 2.6s comfortable dwell threshold

  const toggleGuqinMusic = () => {
    sound.playTap();
    setGuqinMusicEnabled((prev) => {
      const next = !prev;
      safeSetItem('story_guqin_music_enabled', next);
      if (!next) {
        guqinAudio.fadeOut(0.8);
      } else if (hoveredParagraphIdRef.current !== null || activeParagraphId !== null) {
        guqinAudio.fadeIn(hoveredParagraphIdRef.current ?? activeParagraphId ?? 0, 1.2);
      }
      return next;
    });
  };

  const clearDwellTimers = () => {
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
    if (dwellIntervalRef.current) {
      clearInterval(dwellIntervalRef.current);
      dwellIntervalRef.current = null;
    }
    setDwellProgress(0);
  };

  const handleParagraphMouseEnter = (paragraphId: number) => {
    hoveredParagraphIdRef.current = paragraphId;
    setHoveredParagraphId(paragraphId);

    // 触发柔和古琴背景音乐淡入，并在切换段落时音乐平滑过渡
    if (guqinMusicEnabled) {
      if (guqinAudio.getIsPlaying()) {
        guqinAudio.transitionToParagraph(paragraphId);
      } else {
        guqinAudio.fadeIn(paragraphId, 1.8);
      }
    }

    if (!autoDwellPreRead) return;
    // Don't re-trigger if already reading this paragraph
    if (activeParagraphId === paragraphId && playbackStatus === 'playing') return;
    // Don't re-trigger immediately if we just auto-triggered this paragraph
    if (lastDwellTriggeredParaIdRef.current === paragraphId) return;

    clearDwellTimers();

    const stepMs = 50;
    const progressStep = (stepMs / DWELL_DURATION_MS) * 100;
    let currentProgress = 0;

    dwellIntervalRef.current = setInterval(() => {
      currentProgress = Math.min(100, currentProgress + progressStep);
      setDwellProgress(currentProgress);
    }, stepMs);

    dwellTimerRef.current = setTimeout(() => {
      clearDwellTimers();
      lastDwellTriggeredParaIdRef.current = paragraphId;
      // Soft audio feedback & trigger TTS pre-reading
      sound.playSpineHover();
      startReadingParagraph(paragraphId, speechRate, false);
    }, DWELL_DURATION_MS);
  };

  const handleParagraphMouseLeave = (paragraphId: number) => {
    if (hoveredParagraphIdRef.current === paragraphId) {
      hoveredParagraphIdRef.current = null;
      setHoveredParagraphId(null);
      clearDwellTimers();

      // 如果当前没有正在朗读段落，且光标离开所有段落，平滑淡出古琴背景音
      setTimeout(() => {
        if (playbackStatus !== 'playing' && hoveredParagraphIdRef.current === null) {
          guqinAudio.fadeOut(1.5);
        }
      }, 180);
    }
    if (lastDwellTriggeredParaIdRef.current === paragraphId) {
      lastDwellTriggeredParaIdRef.current = null;
    }
  };

  const toggleAutoDwellPreRead = () => {
    sound.playTap();
    setAutoDwellPreRead((prev) => {
      const next = !prev;
      safeSetItem('story_auto_dwell_preread', next);
      if (!next) {
        clearDwellTimers();
        setHoveredParagraphId(null);
      }
      return next;
    });
  };

  // --- 沉浸模式 (Immersive Reading Mode) 全局联动与柔和翻书白噪音控制 ---
  const isImmersive = settingsStore.isImmersiveReading;
  const [isWhiteNoiseMuted, setIsWhiteNoiseMuted] = useState<boolean>(false);

  // 切换沉浸模式：开启后隐藏所有非必要 UI 边框与导航栏，将字体放大并开启柔和翻书背景白噪音
  const toggleImmersiveMode = () => {
    sound.playTap();
    const nextState = !isImmersive;
    settingsStore.setIsImmersiveReading(nextState);
    if (nextState) {
      // 开启柔和的翻书背景白噪音音频，并触发一次清脆纸张翻折音
      bookNoiseAudio.fadeIn(1.2);
      bookNoiseAudio.playPageTurn(0.9);
    } else {
      // 退出沉浸模式，平滑淡出翻书白噪音
      bookNoiseAudio.fadeOut(0.8);
    }
  };

  // 翻书白噪音静音切换
  const toggleWhiteNoise = () => {
    sound.playTap();
    setIsWhiteNoiseMuted((prev) => {
      const next = !prev;
      bookNoiseAudio.setMuted(next);
      return next;
    });
  };

  // 监听全局静音状态，联动翻书白噪音
  useEffect(() => {
    bookNoiseAudio.setMuted(settingsStore.isMuted || isWhiteNoiseMuted);
  }, [settingsStore.isMuted, isWhiteNoiseMuted]);

  // 快捷键支持：按 ESC 键即可随时从容退出沉浸模式
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && settingsStore.isImmersiveReading) {
        toggleImmersiveMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settingsStore.isImmersiveReading]);

  // Stop tracking cancel ref
  const cancelTrackingRef = useRef<(() => void) | null>(null);
  const isContinuousRef = useRef<boolean>(false);

  // Clean up speech, audio synthesizers, and timers on unmount
  useEffect(() => {
    return () => {
      clearDwellTimers();
      isContinuousRef.current = false;
      if (cancelTrackingRef.current) {
        cancelTrackingRef.current();
      }
      stopChineseSpeech();
      guqinAudio.stopImmediately();
      bookNoiseAudio.stopImmediately();
      settingsStore.setIsImmersiveReading(false);
    };
  }, []);

  const getPinyinOpacity = () => {
    if (pinyinMode === 'hidden') return 'opacity-0 select-none h-0 scale-0 overflow-hidden';
    if (pinyinMode === 'faded') return 'opacity-35 hover:opacity-100 transition-opacity';
    return 'opacity-100';
  };

  // Build full text of a paragraph from its tokens
  const getParagraphText = (tokens: { char: string }[]) => {
    return tokens.map((t) => t.char).join('');
  };

  // Start reading a specific paragraph with real-time boundary word tracking
  const startReadingParagraph = (paragraphId: number, targetRate?: number, isContinuous?: boolean) => {
    segmentStartTimesRef.current[paragraphId] = Date.now();
    const rateToUse = targetRate ?? speechRate;
    if (isContinuous !== undefined) {
      isContinuousRef.current = isContinuous;
    }
    const targetParagraph = paragraphs.find((p) => p.id === paragraphId);
    if (!targetParagraph) {
      isContinuousRef.current = false;
      return;
    }

    if (cancelTrackingRef.current) {
      cancelTrackingRef.current();
    }
    stopChineseSpeech();

    setActiveParagraphId(paragraphId);
    setActiveCharIndex(0);
    setPlaybackStatus('playing');

    // 朗读当前段落时平滑同步古琴旋律
    if (guqinMusicEnabled) {
      guqinAudio.transitionToParagraph(paragraphId);
    }

    const fullText = targetParagraph.audioPrompt || getParagraphText(targetParagraph.tokens);

    cancelTrackingRef.current = speakChineseTracked(fullText, rateToUse, {
      onStart: () => {
        setPlaybackStatus('playing');
      },
      onBoundary: (charIndex: number) => {
        setActiveCharIndex(charIndex);
      },
      onPause: () => {
        setPlaybackStatus('paused');
      },
      onResume: () => {
        setPlaybackStatus('playing');
      },
      onEnd: () => {
        // 段落伴读研习完毕，自动根据时长与准确度折算 EXP 并更新玩家等级
        handleCompleteSegment(paragraphId);

        if (isContinuousRef.current) {
          const currentIndex = paragraphs.findIndex((p) => p.id === paragraphId);
          if (currentIndex !== -1 && currentIndex + 1 < paragraphs.length) {
            const nextPara = paragraphs[currentIndex + 1];
            // Smooth brief breath pause between paragraphs
            setTimeout(() => {
              if (isContinuousRef.current) {
                startReadingParagraph(nextPara.id, rateToUse, true);
              }
            }, 300);
            return;
          } else {
            // Reached the end of the entire story
            isContinuousRef.current = false;
            setActiveParagraphId(null);
            setActiveCharIndex(null);
            setPlaybackStatus('stopped');
            sound.playVictory();
            // 全文通关结算
            gameStore.completeReadingTask(effectiveStoryData?.id || 'story-1');
            if (hoveredParagraphIdRef.current === null) {
              guqinAudio.fadeOut(1.2);
            }
            return;
          }
        }
        setActiveParagraphId(null);
        setActiveCharIndex(null);
        setPlaybackStatus('stopped');
        if (hoveredParagraphIdRef.current === null) {
          guqinAudio.fadeOut(1.2);
        }
      },
      onError: () => {
        isContinuousRef.current = false;
        setActiveParagraphId(null);
        setActiveCharIndex(null);
        setPlaybackStatus('stopped');
        if (hoveredParagraphIdRef.current === null) {
          guqinAudio.fadeOut(1.2);
        }
      },
    });
  };

  // Play / Pause Toggle
  const handleTogglePlayPause = () => {
    sound.playTap();
    if (playbackStatus === 'playing') {
      pauseChineseSpeech();
      setPlaybackStatus('paused');
    } else if (playbackStatus === 'paused') {
      resumeChineseSpeech();
      setPlaybackStatus('playing');
      if (guqinMusicEnabled && activeParagraphId !== null) {
        guqinAudio.fadeIn(activeParagraphId, 1.0);
      }
    } else {
      // Start from first paragraph or currently chosen
      const targetId = activeParagraphId || (paragraphs[0] ? paragraphs[0].id : 1);
      startReadingParagraph(targetId, speechRate, false);
    }
  };

  // Stop playback completely
  const handleStopPlayback = () => {
    sound.playTap();
    clearDwellTimers();
    isContinuousRef.current = false;
    if (cancelTrackingRef.current) {
      cancelTrackingRef.current();
    }
    stopChineseSpeech();
    setActiveParagraphId(null);
    setActiveCharIndex(null);
    setPlaybackStatus('stopped');
    if (hoveredParagraphIdRef.current === null) {
      guqinAudio.fadeOut(1.2);
    }
  };

  // Change Speech Rate
  const handleChangeRate = (newRate: number) => {
    sound.playTap();
    clearDwellTimers();
    setSpeechRate(newRate);
    if (playbackStatus === 'playing' && activeParagraphId !== null) {
      // Restart current paragraph smoothly with the new speed
      startReadingParagraph(activeParagraphId, newRate, isContinuousRef.current);
    }
  };

  // Next or Previous Paragraph
  const handleStepParagraph = (delta: number) => {
    sound.playTap();
    clearDwellTimers();
    const currentId = activeParagraphId || 1;
    const currentIndex = paragraphs.findIndex((p) => p.id === currentId);
    const targetIndex = Math.max(0, Math.min(paragraphs.length - 1, (currentIndex >= 0 ? currentIndex : 0) + delta));
    const nextId = paragraphs[targetIndex]?.id || 1;
    startReadingParagraph(nextId, speechRate, false);
  };

  // Read entire story in sequence
  const handleReadAllStory = () => {
    sound.playTap();
    clearDwellTimers();
    isContinuousRef.current = true;
    if (paragraphs.length > 0) {
      startReadingParagraph(paragraphs[0].id, speechRate, true);
    }
  };

  // Handle clicking a single character or token
  const handleCharacterClick = (tokenChar: string, _tokenPinyin?: string, charId?: string, isTarget?: boolean) => {
    clearDwellTimers();
    // If currently playing whole text, stop it smoothly to give focus to clicked word
    if (playbackStatus === 'playing' || playbackStatus === 'paused') {
      if (cancelTrackingRef.current) {
        cancelTrackingRef.current();
      }
      stopChineseSpeech();
      setPlaybackStatus('stopped');
      setActiveParagraphId(null);
      setActiveCharIndex(null);
    }

    // 交互直达：点击红字（目标生字）直接唤起生字全景卡，零断层！
    if (isTarget) {
      sound.playCharClick();
      const matched =
        (charId ? targetChars.find((c) => c.id === charId) : null) ||
        targetChars.find((c) => c.char === tokenChar) ||
        (charId ? TARGET_CHARACTERS.find((c) => c.id === charId) : null) ||
        TARGET_CHARACTERS.find((c) => c.char === tokenChar);

      if (matched) {
        setSelectedCharId(matched.id);
        onSelectCharacter(matched);
        return;
      }
    }

    // 点击普通白字：保持仅播放读音，无弹窗打扰
    sound.playCharClick();
    speakChinese(tokenChar, speechRate);
  };

  return (
    <div
      className={`animate-in fade-in duration-300 ${
        isImmersive
          ? 'space-y-4 max-w-4xl mx-auto py-2 px-2 sm:px-4'
          : 'space-y-5 sm:space-y-6'
      }`}
    >
      {/* 1. VISUAL STORY BANNER / IMMERSIVE HEADER */}
      {!isImmersive ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 p-5 sm:p-7 text-white shadow-xl border-4 border-amber-300">
          <div className="absolute top-2 right-4 flex gap-2 text-2xl opacity-80 animate-bounce">
            {storyIcon} {storyIcon}
          </div>
          <div className="absolute -bottom-6 -right-6 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl text-left">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="inline-flex items-center gap-1.5 bg-amber-400/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-yellow-200 border border-yellow-300/40">
                <Sparkles className="w-3.5 h-3.5" /> 听说反向驱动 · 词音同步影子跟读
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h2 className="font-festive text-2xl sm:text-3xl font-extrabold text-amber-100 tracking-wide">
                {storyTitle}：{storySubtitle}
              </h2>
              <button
                onClick={() => {
                  sound.playTap();
                  speakChinese(`${storyTitle}：${storySubtitle}`, speechRate);
                }}
                className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-yellow-300 transition-colors cursor-pointer"
                title="朗读标题"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed mb-4">
              {storySummary}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-100 border border-amber-300/30">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>核心本关字: {targetChars.map((c) => c.char).join(' · ')}</span>
                <button
                  onClick={() => {
                    sound.playTap();
                    speakChinese(`核心本关字：${targetChars.map((c) => c.char).join('、')}`, speechRate);
                  }}
                  className="ml-1 p-1 rounded-md hover:bg-white/20 text-yellow-300 cursor-pointer"
                  title="朗读核心字"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={handleReadAllStory}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-red-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" /> 故事全篇伴读
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* 沉浸模式极简典雅篇章标题（隐藏喧闹大边框，保留古典书香纯净质感） */
        <div className="text-center pt-2 pb-3 border-b border-amber-900/10">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100/80 text-amber-900 text-xs font-serif mb-2 shadow-2xs">
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>沉浸研读 · 翻书白噪音伴读中</span>
          </div>
          <h1 className="font-calligraphy text-2xl sm:text-4xl font-black text-amber-950 tracking-wider">
            {storyTitle}
          </h1>
          <p className="text-xs sm:text-sm text-amber-900/70 font-serif mt-1">
            {storySubtitle}
          </p>
        </div>
      )}

      {/* 2. EXPERIENCE PROGRESSION BAR (文位阅历研习进度条，在沉浸模式下收起厚重卡片，转为极简顶部进度光轨) */}
      {(() => {
        const currentLevelInfo = gameStore.playerLevelInfo;
        const nextTier = LEVEL_TIERS.find((t) => t.level === currentLevelInfo.level + 1);
        const expToNextLevel = currentLevelInfo.expNeededForNextLevel - currentLevelInfo.expInCurrentLevel;
        const completedCount = Object.keys(completedSegments).length;

        if (isImmersive) {
          return (
            <div className="w-full pt-1 pb-1">
              <div className="relative w-full h-1 bg-amber-900/10 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-700"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentLevelInfo.progressPercent}%` }}
                  transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                />
              </div>
            </div>
          );
        }

        return (
          <motion.div
            animate={
              isProgressBarShaking
                ? {
                    x: [0, -5, 5, -3, 3, -1, 1, 0],
                    scale: [1, 1.018, 0.995, 1.008, 1],
                    boxShadow: [
                      '0 10px 25px -5px rgba(0,0,0,0.4)',
                      '0 0 28px rgba(251,191,36,0.85), 0 0 10px rgba(234,179,8,0.6)',
                      '0 0 16px rgba(251,191,36,0.5)',
                      '0 10px 25px -5px rgba(0,0,0,0.4)',
                    ],
                  }
                : {}
            }
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 border-2 border-amber-400/80 p-3.5 sm:p-4 shadow-xl text-white"
          >
            {/* Ambient background bloom */}
            <div className="absolute top-0 right-1/4 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Top row: Current Level Badge, Title, Gold Coins Counter, Exp Counter */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 border border-yellow-200 text-stone-950 flex items-center justify-center text-xl font-bold shadow-md shrink-0">
                  {currentLevelInfo.badgeIcon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-300 tracking-wider">
                      文位研习进阶
                    </span>
                    <span className="text-[10px] font-black text-amber-100 bg-amber-500/30 border border-amber-300/40 px-2 py-0.5 rounded-full">
                      Lv.{currentLevelInfo.level}
                    </span>
                  </div>
                  <div className="font-calligraphy font-black text-base sm:text-lg text-yellow-100 tracking-wide flex items-center gap-2">
                    <span>{currentLevelInfo.title}</span>
                    <span className="text-xs font-sans font-normal text-amber-200/70 hidden sm:inline">
                      (已累计 {currentLevelInfo.currentExp} 阅历)
                    </span>
                  </div>
                </div>
              </div>

              {/* Coins & EXP counters */}
              <div className="flex items-center gap-3 flex-wrap justify-end">
                {/* 金币数字动态增长区 (伴随金币跳动与浮动散金动效) */}
                <div className="relative flex items-center gap-2 bg-black/45 border border-amber-400/35 px-3 py-1.5 rounded-xl shadow-inner">
                  <div className="relative flex items-center justify-center">
                    <motion.span
                      animate={isProgressBarShaking ? { rotate: [0, -25, 25, -15, 15, 0], scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.45 }}
                      className="text-lg inline-block select-none"
                    >
                      🪙
                    </motion.span>
                    {/* Floating Coin burst token */}
                    <AnimatePresence>
                      {coinBurstTokens.map((token) => (
                        <motion.span
                          key={token.id}
                          initial={{ opacity: 0, y: 0, scale: 0.8 }}
                          animate={{ opacity: 1, y: -20, scale: 1.2 }}
                          exit={{ opacity: 0, y: -30, scale: 0.7 }}
                          transition={{ duration: 0.85, ease: 'easeOut' }}
                          className="absolute -top-1 -right-2 text-xs font-black text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.95)] pointer-events-none whitespace-nowrap z-20"
                        >
                          +{token.amount}
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] text-amber-300/80 font-bold leading-tight">文昌通宝</span>
                    <motion.span
                      key={displayedCoins}
                      initial={isProgressBarShaking ? { scale: 1.25, color: '#fef08a' } : false}
                      animate={{ scale: 1, color: '#fef3c7' }}
                      transition={{ duration: 0.3 }}
                      className="font-mono font-black text-sm sm:text-base leading-tight text-yellow-100"
                    >
                      {displayedCoins}
                    </motion.span>
                  </div>
                </div>

                {/* EXP counter */}
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-200">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                    <span className="text-yellow-100">{currentLevelInfo.currentExp}</span>
                    <span className="text-stone-400">/</span>
                    <span className="text-stone-400">{currentLevelInfo.nextLevelExpThreshold} EXP</span>
                  </div>
                  <div className="text-[11px] text-amber-300/80 font-medium mt-0.5">
                    {nextTier ? (
                      <span>距晋升【{nextTier.title}】还需 <strong className="text-yellow-300 font-bold">{expToNextLevel}</strong> EXP</span>
                    ) : (
                      <span className="text-yellow-300 font-bold">已达至尊文位 · 独步天下</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Experience progression bar with smooth animated gradient & shimmer */}
            <div className="relative w-full h-3.5 bg-black/60 rounded-full overflow-hidden border border-amber-500/40 p-0.5 shadow-inner mb-2">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 shadow-[0_0_12px_rgba(251,191,36,0.7)] relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${currentLevelInfo.progressPercent}%` }}
                transition={{ type: 'spring', stiffness: 50, damping: 15 }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-shimmer" />
              </motion.div>
            </div>

            {/* Bottom metadata row */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-amber-400/20 text-xs text-stone-300">
              <div className="flex items-center gap-2 flex-wrap text-[11px]">
                <span className="inline-flex items-center gap-1 text-emerald-300 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  已精读 {completedCount} / {paragraphs.length} 段落
                </span>
                <span className="text-stone-600">·</span>
                <span className="text-stone-400">
                  朗读时长与发音准确度自动折算 EXP
                </span>
              </div>

              {/* Realtime floating XP notification pill */}
              <AnimatePresence>
                {xpNotification && (
                  <motion.div
                    key={xpNotification.id}
                    initial={{ opacity: 0, y: 6, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.9 }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 text-stone-950 font-bold text-[11px] shadow-md border border-yellow-100"
                  >
                    <Zap className="w-3.5 h-3.5 text-stone-950 fill-stone-950" />
                    <span>+{xpNotification.expGained} EXP</span>
                    <span className="text-[10px] text-stone-800">
                      (准{xpNotification.accuracy}% · +{xpNotification.coinsGained}通宝)
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })()}

      {/* 3. IMMERSIVE ZEN BAR OR FLOATING AUDIO CONTROL PANEL */}
      {isImmersive ? (
        /* 沉浸模式极简浮动伴读工具条 (无厚重边框，极简毛玻璃微光胶囊) */
        <div className="sticky top-2 sm:top-4 z-40 max-w-lg mx-auto bg-stone-900/90 backdrop-blur-md text-white rounded-full px-3.5 py-1.5 sm:px-4 sm:py-2 shadow-2xl flex items-center justify-between gap-2 border border-amber-400/50">
          {/* Play / Pause & Prev / Next */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleTogglePlayPause}
              className={`p-1.5 sm:px-3 sm:py-1 rounded-full font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95 ${
                playbackStatus === 'playing'
                  ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                  : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {playbackStatus === 'playing' ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">暂停</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">伴读</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleStepParagraph(-1)}
              className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 cursor-pointer transition-colors"
              title="上一段"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleStepParagraph(1)}
              className="p-1.5 rounded-full hover:bg-white/10 text-stone-300 cursor-pointer transition-colors"
              title="下一段"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <span className="text-[11px] text-amber-200/90 font-mono hidden md:inline ml-1">
              {playbackStatus === 'playing' ? `第${activeParagraphId || 1}段伴读` : '沉浸模式'}
            </span>
          </div>

          {/* Center: Pinyin & White Noise */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onChangePinyinMode && (
              <button
                onClick={() => {
                  sound.playTap();
                  onChangePinyinMode(pinyinMode === 'hidden' ? 'full' : pinyinMode === 'full' ? 'faded' : 'hidden');
                }}
                className="px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-yellow-200 text-[11px] font-bold cursor-pointer transition-colors"
                title="切换拼音模式"
              >
                拼:{pinyinMode === 'full' ? '全' : pinyinMode === 'faded' ? '渐' : '隐'}
              </button>
            )}

            {/* Book noise ambient sound switch */}
            <button
              onClick={toggleWhiteNoise}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                isWhiteNoiseMuted
                  ? 'bg-white/10 text-stone-400'
                  : 'bg-amber-500/25 text-amber-300 border border-amber-400/40'
              }`}
              title="柔和翻书白噪音静音切换"
            >
              <Waves className={`w-3 h-3 ${isWhiteNoiseMuted ? '' : 'animate-pulse text-amber-400'}`} />
              <span className="hidden xs:inline">白噪音:</span>
              <span>{isWhiteNoiseMuted ? '关' : '开'}</span>
            </button>
          </div>

          {/* Right: Exit Immersive */}
          <button
            onClick={toggleImmersiveMode}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
            title="退出沉浸模式 (ESC)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>退出沉浸</span>
          </button>
        </div>
      ) : (
        /* 常规模式点读控制浮动面板 */
        <div className="sticky top-2 z-30 bg-white/95 backdrop-blur-md border-2 border-amber-300 rounded-2xl p-3 sm:p-4 shadow-lg flex flex-wrap items-center justify-between gap-3 text-left">
          {/* Playback Status & Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full transition-all ${
                  playbackStatus === 'playing'
                    ? 'bg-emerald-500 animate-ping'
                    : playbackStatus === 'paused'
                    ? 'bg-amber-500'
                    : 'bg-stone-300'
                }`}
              />
              <span className="text-xs font-bold text-stone-700">
                {playbackStatus === 'playing' && `正在跟读：第 ${activeParagraphId || 1} 段 (字音同步高亮)`}
                {playbackStatus === 'paused' && `已暂停 (点击继续)`}
                {playbackStatus === 'stopped' && '点读伴读已就绪'}
              </span>
            </div>

            {/* Quick jump to prev/next paragraph */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleStepParagraph(-1)}
                className="p-1 rounded-lg hover:bg-amber-100 text-stone-600 cursor-pointer transition-colors"
                title="上一段"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleStepParagraph(1)}
                className="p-1 rounded-lg hover:bg-amber-100 text-stone-600 cursor-pointer transition-colors"
                title="下一段"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons: Play/Pause/Stop & Speed Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            {/* Main Play/Pause Button */}
            <button
              onClick={handleTogglePlayPause}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                playbackStatus === 'playing'
                  ? 'bg-amber-500 hover:bg-amber-600 text-white active:scale-95'
                  : 'bg-red-600 hover:bg-red-700 text-white active:scale-95'
              }`}
            >
              {playbackStatus === 'playing' ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>暂停</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>{playbackStatus === 'paused' ? '继续' : '朗读'}</span>
                </>
              )}
            </button>

            {/* Stop Button */}
            <button
              onClick={handleStopPlayback}
              disabled={playbackStatus === 'stopped'}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all cursor-pointer ${
                playbackStatus !== 'stopped'
                  ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 active:scale-95'
                  : 'bg-stone-50 text-stone-300 cursor-not-allowed'
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>停止</span>
            </button>

            {/* Speed Selector Segment (0.8x 慢速 / 1.0x 标准 / 1.2x 敏捷) */}
            <div className="flex items-center bg-amber-100/80 p-0.5 rounded-xl border border-amber-300 text-xs">
              <button
                onClick={() => handleChangeRate(0.8)}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  speechRate === 0.8
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-stone-700 hover:text-red-900'
                }`}
                title="0.8x 慢速伴读"
              >
                0.8x
              </button>
              <button
                onClick={() => handleChangeRate(1.0)}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  speechRate === 1.0
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-stone-700 hover:text-red-900'
                }`}
                title="1.0x 标准语速"
              >
                1.0x
              </button>
              <button
                onClick={() => handleChangeRate(1.2)}
                className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  speechRate === 1.2
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-stone-700 hover:text-red-900'
                }`}
                title="1.2x 敏捷语速"
              >
                1.2x
              </button>
            </div>

            {/* Pinyin Mode Segment (全显 / 渐隐 / 隐藏) */}
            {onChangePinyinMode && (
              <div className="flex items-center bg-amber-100/80 p-0.5 rounded-xl border border-amber-300 text-xs">
                <span className="text-[11px] font-bold text-amber-900 px-1 hidden xs:inline">
                  拼音:
                </span>
                <button
                  onClick={() => {
                    sound.playTap();
                    onChangePinyinMode('full');
                  }}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    pinyinMode === 'full'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'text-stone-700 hover:text-red-900'
                  }`}
                  title="全部显示拼音"
                >
                  全显
                </button>
                <button
                  onClick={() => {
                    sound.playTap();
                    onChangePinyinMode('faded');
                  }}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    pinyinMode === 'faded'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'text-stone-700 hover:text-red-900'
                  }`}
                  title="渐隐注音（艾宾浩斯强化）"
                >
                  渐隐
                </button>
                <button
                  onClick={() => {
                    sound.playTap();
                    onChangePinyinMode('hidden');
                  }}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    pinyinMode === 'hidden'
                      ? 'bg-red-700 text-white shadow-xs'
                      : 'text-stone-700 hover:text-red-900'
                  }`}
                  title="隐藏拼音"
                >
                  隐藏
                </button>
              </div>
            )}

            {/* 沉浸模式切换开关 (切换为纯净大字号与柔和翻书白噪音) */}
            <button
              onClick={toggleImmersiveMode}
              className="px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border bg-gradient-to-r from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 text-amber-950 border-amber-300 shadow-2xs hover:shadow-xs active:scale-95"
              title="进入沉浸模式：隐藏非必要边框与导航栏，字号放大，开启柔和翻书背景白噪音"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-800" />
              <span className="hidden xs:inline">沉浸模式:</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-black bg-stone-200 text-stone-700">
                开启
              </span>
            </button>

            {/* 沉浸静驻预读开关 (停留在段落较长时间自动触发 TTS 预读) */}
            <button
              onClick={toggleAutoDwellPreRead}
              className={`px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                autoDwellPreRead
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-500 border-stone-300'
              }`}
              title={
                autoDwellPreRead
                  ? '沉浸静驻预读已开启：鼠标或视线在段落停驻 2.6 秒自动伴读，打造身临其境的听读体验'
                  : '沉浸静驻预读已关闭：点击开启静驻自动朗读'
              }
            >
              <Headphones className={`w-3.5 h-3.5 ${autoDwellPreRead ? 'text-red-700' : 'text-stone-400'}`} />
              <span className="hidden xs:inline">静驻预读:</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                  autoDwellPreRead ? 'bg-red-700 text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {autoDwellPreRead ? '开' : '关'}
              </span>
            </button>

            {/* 古琴伴读背景音开关 (停留在段落时淡入柔和古琴声，切换平滑过渡) */}
            <button
              onClick={toggleGuqinMusic}
              className={`px-2.5 py-1 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                guqinMusicEnabled
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300 shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-500 border-stone-300'
              }`}
              title={
                guqinMusicEnabled
                  ? '古琴伴读背景音已开启：在段落停驻时淡入悠扬古琴背景音乐，切换段落平滑过渡'
                  : '古琴伴读背景音已关闭：点击开启古琴伴读背景音乐'
              }
            >
              <Music className={`w-3.5 h-3.5 ${guqinMusicEnabled ? 'text-amber-700 animate-pulse' : 'text-stone-400'}`} />
              <span className="hidden xs:inline">琴韵伴读:</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                  guqinMusicEnabled ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {guqinMusicEnabled ? '开' : '关'}
              </span>
            </button>

            {/* 家长与教师辅导设置 (降噪与定制) */}
            {onOpenParentConsole && (
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenParentConsole();
                }}
                className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-600 hover:text-red-900 transition-colors cursor-pointer"
                title="家长与教师辅导设置"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. STORY BOOK CONTAINER */}
      <div
        className={
          isImmersive
            ? 'bg-transparent border-0 shadow-none p-2 sm:p-4 relative text-left max-w-4xl mx-auto'
            : 'bg-amber-50/90 border-2 border-amber-200 rounded-3xl p-5 sm:p-8 shadow-md relative text-left'
        }
      >
        {/* Book Header Bar (在沉浸模式下隐藏) */}
        {!isImmersive && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-amber-200/80 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 rounded-xl text-red-700">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-calligraphy font-black text-lg text-red-900 tracking-wide">
                    {storyTitle} 故事篇章
                  </h3>
                  <button
                    onClick={() => {
                      sound.playTap();
                      speakChinese(`${storyTitle}故事篇章。支持拼音渐隐辅助，点击汉字听发音与偏旁积木拆解。`, speechRate);
                    }}
                    className="p-1 rounded-md text-amber-700 hover:bg-amber-200/60 cursor-pointer"
                    title="朗读说明"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-stone-500">
                  支持字音同步光标跟随 · 点击任意汉字唤醒发音与拼音卡
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium">当前拼音模式:</span>
              <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                {pinyinMode === 'full' && '全拼音辅助 (入门)'}
                {pinyinMode === 'faded' && '40% 拼音渐隐 (强化)'}
                {pinyinMode === 'hidden' && '隐藏拼音 (自测)'}
              </span>
            </div>
          </div>
        )}

        {/* Story Paragraphs with Char Boundary Tracking */}
        <div className={isImmersive ? 'space-y-8 sm:space-y-10' : 'space-y-6'}>
          {paragraphs.map((paragraph, pIdx) => {
            const isThisParagraphReading = activeParagraphId === paragraph.id;
            const isDwelling =
              autoDwellPreRead &&
              hoveredParagraphId === paragraph.id &&
              dwellProgress > 0 &&
              (!isThisParagraphReading || playbackStatus !== 'playing');

            // Pre-calculate token text offsets for boundary mapping
            let currentOffset = 0;
            const tokenOffsets = paragraph.tokens.map((tok) => {
              const start = currentOffset;
              currentOffset += tok.char.length;
              return { start, end: currentOffset };
            });

            return (
              <div
                key={paragraph.id}
                onMouseEnter={() => handleParagraphMouseEnter(paragraph.id)}
                onMouseLeave={() => handleParagraphMouseLeave(paragraph.id)}
                onClick={() => {
                  if (isImmersive) {
                    bookNoiseAudio.playPageTurn(0.5);
                  }
                }}
                className={`relative transition-all duration-200 overflow-hidden ${
                  isImmersive
                    ? `p-3 sm:p-5 rounded-2xl border-0 ${
                        isThisParagraphReading
                          ? 'bg-amber-100/60 shadow-xs ring-1 ring-amber-400/40'
                          : 'bg-transparent hover:bg-amber-50/50'
                      }`
                    : `p-4 sm:p-5 rounded-2xl border ${
                        isThisParagraphReading
                          ? 'bg-amber-100/90 border-amber-400 shadow-md ring-2 ring-amber-300'
                          : isDwelling
                          ? 'bg-amber-50/95 border-amber-400 shadow-md ring-2 ring-amber-300/80 scale-[1.006]'
                          : 'bg-white/80 hover:bg-white border-amber-200 shadow-xs'
                      }`
                }`}
              >
                {/* 浸润预读顶部倒计时进度光轨 (常规模式) */}
                {!isImmersive && isDwelling && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-200/50 overflow-hidden z-10">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 transition-all duration-75 shadow-sm"
                      style={{ width: `${dwellProgress}%` }}
                    />
                  </div>
                )}

                {/* Sentence action header (沉浸模式下极简化，隐藏测验与伴读操作按钮) */}
                {isImmersive ? (
                  <div className="flex items-center justify-between mb-2 text-xs text-amber-900/40 border-b border-amber-900/10 pb-1.5 font-serif select-none">
                    <span className="font-bold tracking-wide">§ 第 {pIdx + 1} 段</span>
                    {isThisParagraphReading && playbackStatus === 'playing' && (
                      <span className="text-amber-800 font-sans text-[11px] font-bold">正在伴读...</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between mb-3 text-xs text-stone-500 border-b border-amber-100 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-amber-800 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-[11px]">
                          {pIdx + 1}
                        </span>
                        第 {pIdx + 1} 段话
                      </span>

                      {/* Dwell pre-reading indicator badge */}
                      {isDwelling && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-900 bg-gradient-to-r from-amber-200/90 to-orange-200/90 border border-amber-300 px-2 py-0.5 rounded-full font-bold shadow-2xs animate-pulse">
                          <Headphones className="w-3 h-3 text-red-600 animate-bounce" />
                          <span>静驻预读准备 ({((DWELL_DURATION_MS * (1 - dwellProgress / 100)) / 1000).toFixed(1)}s)...</span>
                        </span>
                      )}

                      {isThisParagraphReading && playbackStatus === 'playing' && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-red-800 bg-red-100/90 border border-red-300 px-2 py-0.5 rounded-full font-bold shadow-2xs">
                          <Sparkles className="w-3 h-3 text-amber-600 animate-spin" />
                          <span>沉浸伴读中</span>
                        </span>
                      )}

                      {/* 段落精读完成状态标签与获得的经验值 */}
                      {completedSegments[paragraph.id] && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full font-bold shadow-2xs">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>已精读 (准{completedSegments[paragraph.id].accuracy}% · +{completedSegments[paragraph.id].expGained}EXP)</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* 互动跟读测验 / 精读打卡按钮 */}
                      <button
                        onClick={() => handlePracticeParagraph(paragraph.id)}
                        disabled={activePracticingParagraphId === paragraph.id}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer border ${
                          activePracticingParagraphId === paragraph.id
                            ? 'bg-amber-400 text-stone-950 border-amber-500 animate-pulse'
                            : completedSegments[paragraph.id]
                            ? 'bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-stone-950 border-yellow-200 shadow-2xs'
                        }`}
                        title="朗读本段，实时测评语音时长与准确度，获取阅历经验值升级文位！"
                      >
                        <Mic className={`w-3.5 h-3.5 ${activePracticingParagraphId === paragraph.id ? 'animate-bounce text-red-600' : ''}`} />
                        <span>
                          {activePracticingParagraphId === paragraph.id
                            ? '测验评测中...'
                            : completedSegments[paragraph.id]
                            ? '重新测验'
                            : '跟读打卡 +EXP'}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          clearDwellTimers();
                          startReadingParagraph(paragraph.id);
                        }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                          isThisParagraphReading && playbackStatus === 'playing'
                            ? 'bg-red-600 text-white animate-pulse'
                            : 'bg-amber-100 hover:bg-amber-200 text-red-800'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>
                          {isThisParagraphReading && playbackStatus === 'playing'
                            ? '跟读中...'
                            : '点击伴读'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Tokens flow with shadow highlight and typography magnification */}
                <div
                  className={`flex flex-wrap items-end ${
                    isImmersive
                      ? 'gap-x-2.5 sm:gap-x-3.5 md:gap-x-4 gap-y-6 sm:gap-y-8 md:gap-y-10 py-3 leading-relaxed'
                      : 'gap-x-1.5 sm:gap-x-2 gap-y-3 sm:gap-y-4 leading-none'
                  } select-text`}
                >
                  {paragraph.tokens.map((token, tIdx) => {
                    const isTarget = !!token.isTarget;
                    const isSelected = selectedCharId === token.charId;

                    // Boundary highlight check
                    const offsetInfo = tokenOffsets[tIdx];
                    const isSpeakingThisToken =
                      isThisParagraphReading &&
                      activeCharIndex !== null &&
                      offsetInfo &&
                      activeCharIndex >= offsetInfo.start &&
                      activeCharIndex < offsetInfo.end;

                    // If punctuation
                    if (['，', '。', '！', '、', '——', '“', '”', '：'].includes(token.char)) {
                      return (
                        <span
                          key={tIdx}
                          className={`font-calligraphy self-end pb-1 transition-colors ${
                            isImmersive
                              ? 'text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem]'
                              : 'text-2xl sm:text-3xl'
                          } ${
                            isSpeakingThisToken
                              ? 'text-red-700 font-black scale-110'
                              : 'text-stone-500'
                          }`}
                        >
                          {token.char}
                        </span>
                      );
                    }

                    return (
                      <button
                        key={tIdx}
                        onClick={() =>
                          handleCharacterClick(token.char, token.pinyin, token.charId, token.isTarget)
                        }
                        className={`group relative inline-flex flex-col items-center justify-end rounded-xl transition-all cursor-pointer ${
                          isImmersive
                            ? 'px-1.5 sm:px-2.5 py-1.5 sm:py-2'
                            : 'px-1 sm:px-1.5 py-1'
                        } ${
                          isSpeakingThisToken
                            ? 'bg-gradient-to-b from-yellow-300 to-amber-300 text-red-950 font-black scale-115 shadow-[0_4px_14px_rgba(234,179,8,0.7)] ring-2 ring-yellow-400 z-10'
                            : isTarget
                            ? isSelected
                              ? 'bg-amber-300 ring-2 ring-red-500 shadow-md scale-105'
                              : isImmersive
                              ? 'bg-red-50/70 hover:bg-red-100/90 shadow-2xs'
                              : 'bg-red-50 hover:bg-red-100/90 border border-red-300/80 shadow-xs'
                            : 'hover:bg-amber-100/70'
                        }`}
                        title={
                          isTarget
                            ? `核心考字：点击查看【${token.char}】偏旁拆解`
                            : `发音：${token.pinyin}`
                        }
                      >
                        {/* Pinyin annotation */}
                        <span
                          className={`${
                            isImmersive
                              ? 'text-xs sm:text-sm md:text-base font-bold'
                              : 'text-[11px] sm:text-xs font-semibold'
                          } tracking-tight transition-all mb-0.5 ${
                            isSpeakingThisToken
                              ? 'text-red-900 font-extrabold scale-105'
                              : isTarget
                              ? 'text-red-700 font-bold'
                              : 'text-amber-800'
                          } ${getPinyinOpacity()}`}
                        >
                          {token.pinyin}
                        </span>

                        {/* Character glyph (沉浸模式下字号放大至 3xl~5xl) */}
                        <span
                          className={`font-calligraphy ${
                            isImmersive
                              ? 'text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] leading-none'
                              : 'text-2xl sm:text-3xl leading-none'
                          } font-bold transition-transform ${
                            isSpeakingThisToken
                              ? 'text-red-950 font-black'
                              : isTarget
                              ? 'text-red-800 font-black drop-shadow-xs'
                              : 'text-stone-800'
                          } group-hover:scale-110`}
                        >
                          {token.char}
                        </span>

                        {/* Visual indicator dot for target word */}
                        {isTarget && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full mt-0.5 transition-all ${
                              isSpeakingThisToken
                                ? 'bg-red-800 scale-150'
                                : 'bg-red-500 group-hover:scale-125'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 段落完成渐变式进入成就面板 (framer-motion 渐变进入动画，沉浸模式下隐藏) */}
                {!isImmersive && (
                  <AnimatePresence>
                    {completedSegments[paragraph.id] && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', y: 0, scale: 1 }}
                        exit={{ opacity: 0, height: 0, y: -8, scale: 0.95 }}
                        transition={{ type: 'spring', duration: 0.52, bounce: 0.25 }}
                        className="overflow-hidden mt-3.5"
                      >
                        <div className="relative overflow-hidden rounded-xl p-3 bg-gradient-to-r from-amber-50 via-emerald-50/80 to-yellow-50 border border-emerald-300/80 shadow-xs flex flex-wrap items-center justify-between gap-2.5 text-stone-800">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
                                <span>段落精读研习完成</span>
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-full">
                                  准确率 {completedSegments[paragraph.id].accuracy}%
                                </span>
                              </div>
                              <div className="text-[11px] text-stone-600 mt-0.5">
                                专注研读 {completedSegments[paragraph.id].readTimeSeconds} 秒 · 字音契合，音调纯正
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-900 font-mono font-black text-xs shadow-2xs">
                              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                              +{completedSegments[paragraph.id].expGained} EXP
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-yellow-100 border border-yellow-300 text-yellow-900 font-mono font-black text-xs shadow-2xs">
                              🪙 +{Math.round(completedSegments[paragraph.id].expGained * 0.5)} 通宝
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            );
          })}
        </div>

        {/* Bobu 科学探案 · 互动提问与解密专区 (仅在常规模式显示) */}
        {!isImmersive && effectiveStoryData?.bobuMystery && (
          <div className="mt-8 bg-gradient-to-br from-[#180d28] via-[#24123b] to-[#120722] rounded-3xl p-5 sm:p-7 border-3 border-purple-400/80 text-white shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/40 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-400 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-purple-200 shrink-0">
                  <span>🐰</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-festive font-black text-lg text-purple-200 tracking-wide">
                      Bobu 侦探互动推理站
                    </h4>
                    <span className="text-[11px] bg-purple-600 text-yellow-200 font-bold px-2 py-0.5 rounded-full border border-purple-400/50">
                      科学解谜挑战
                    </span>
                  </div>
                  <p className="text-xs text-purple-200/70 mt-0.5">
                    根据故事中的现场线索，猜猜看 Bobu 侦探会用什么绝妙招数破解谜题？
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playTap();
                  speakChinese(effectiveStoryData.bobuMystery!.question, speechRate);
                }}
                className="self-end sm:self-center flex items-center gap-1.5 text-xs text-yellow-300 hover:text-yellow-100 bg-purple-900/60 hover:bg-purple-900 px-3 py-1.5 rounded-xl border border-purple-400/40 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>朗读问题</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="p-4 rounded-2xl bg-black/40 border border-purple-400/30 text-amber-100 text-sm sm:text-base font-medium leading-relaxed">
              {effectiveStoryData.bobuMystery.question}
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {effectiveStoryData.bobuMystery.options.map((opt, idx) => {
                const isSelected = selectedMysteryOption === idx;
                const isCorrect = idx === effectiveStoryData.bobuMystery!.answer;
                let btnStyle = 'bg-purple-950/60 hover:bg-purple-900/80 border-purple-500/40 text-purple-100';

                if (selectedMysteryOption !== null) {
                  if (isSelected) {
                    btnStyle = isCorrect
                      ? 'bg-emerald-700/80 border-emerald-300 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] ring-2 ring-emerald-400'
                      : 'bg-red-900/80 border-red-400 text-rose-100 ring-2 ring-red-400';
                  } else if (isCorrect && showMysteryExplanation) {
                    btnStyle = 'bg-emerald-950/70 border-emerald-400/70 text-emerald-200';
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectMysteryOption(idx)}
                    className={`p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-98 shadow-sm ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {selectedMysteryOption !== null && (
                      <span className="shrink-0">
                        {isCorrect && (isSelected || showMysteryExplanation) ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                        ) : isSelected ? (
                          <XCircle className="w-5 h-5 text-rose-300" />
                        ) : null}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Science Explanation */}
            {selectedMysteryOption !== null && (
              <div className="pt-2">
                {selectedMysteryOption === effectiveStoryData.bobuMystery.answer ? (
                  <div className="p-4 rounded-2xl bg-emerald-950/80 border-2 border-emerald-400 text-emerald-100 space-y-2 shadow-lg">
                    <div className="flex items-center gap-2 font-festive font-black text-emerald-300 text-base">
                      <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
                      <span>🎉 推理完全正确！恭喜获得 Bobu 科学小侦探徽章！</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-emerald-100/90 whitespace-pre-line font-sans">
                      {effectiveStoryData.bobuMystery.sciencePrinciple}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-amber-950/80 border-2 border-amber-400 text-amber-100 flex items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
                      <Lightbulb className="w-5 h-5 text-yellow-300 shrink-0" />
                      <span>哎呀，还差一点点！再仔细回想一下故事中温度、介质与光线的线索哦~</span>
                    </div>
                    <button
                      onClick={() => setShowMysteryExplanation(true)}
                      className="text-xs font-bold text-yellow-300 hover:text-white underline shrink-0 cursor-pointer"
                    >
                      直接查看解密
                    </button>
                  </div>
                )}

                {showMysteryExplanation && selectedMysteryOption !== effectiveStoryData.bobuMystery.answer && (
                  <div className="mt-3 p-4 rounded-2xl bg-purple-900/60 border-2 border-purple-400 text-purple-100 space-y-2">
                    <div className="flex items-center gap-2 font-festive font-black text-yellow-300 text-base">
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                      <span>💡 Bobu 科学揭秘时间：</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed text-purple-100/90 whitespace-pre-line font-sans">
                      {effectiveStoryData.bobuMystery.sciencePrinciple}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 核心汉字“温故知新”预习复习模块（仅在常规模式显示） */}
        {!isImmersive && (
          <div className="mt-8 bg-gradient-to-br from-amber-100/70 via-orange-50/70 to-amber-50/80 rounded-3xl p-4 sm:p-5 border-2 border-amber-300 shadow-sm text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5 border-b border-amber-200/80 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-red-950 flex items-center justify-center font-bold shadow-xs">
                  <Star className="w-4 h-4 text-red-900 fill-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-calligraphy font-black text-base text-red-950 tracking-wide">
                      温故知新 · 核心生字点兵
                    </h4>
                    <span className="text-[11px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">
                      必考 {targetChars.length} 字
                    </span>
                    <button
                      onClick={() => {
                        sound.playTap();
                        speakChinese(
                          `温故知新，核心生字点兵：${targetChars.map((c) => c.char).join('、')}。点击即可查看详细拆解与描红书写。`,
                          speechRate
                        );
                      }}
                      className="p-1 rounded-md text-amber-800 hover:bg-amber-200/60 cursor-pointer transition-colors"
                      title="朗读说明"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5">
                    进入挑战前重温字形结构与口诀，点击任意生字卡直接调取拆解与书写描红
                  </p>
                </div>
              </div>
              <div className="text-xs text-amber-900 font-semibold self-end sm:self-center">
                点击生字直接开启全景卡 ⚡
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
              {targetChars.map((charObj, cIdx) => (
                <button
                  key={`${charObj.id || charObj.char}-${cIdx}`}
                  onClick={() => {
                    sound.playCharClick();
                    setSelectedCharId(charObj.id);
                    onSelectCharacter(charObj);
                  }}
                  className="p-3 bg-white/90 hover:bg-amber-100/90 border border-amber-200 hover:border-red-400 rounded-2xl flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md text-left group cursor-pointer active:scale-95 shadow-2xs"
                >
                  <div className="w-12 h-12 tianzige rounded-xl flex items-center justify-center font-calligraphy text-2xl font-black text-red-800 shrink-0 group-hover:scale-110 transition-transform shadow-inner bg-amber-50/50">
                    {charObj.char}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-red-800 font-mono">{charObj.pinyin}</div>
                    <div className="text-[11px] text-stone-600 font-medium truncate mt-0.5">
                      部首: <span className="font-bold text-amber-900">{charObj.radical}</span>
                    </div>
                    <div className="text-[10px] text-red-600/90 font-semibold truncate mt-0.5">
                      {charObj.mnemonic}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Action to Challenge (仅在常规模式显示) */}
        {!isImmersive ? (
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-red-900">
                    读懂了故事？快来参加【听说选字】与【偏旁拼图】小游戏！
                  </h4>
                  <button
                    onClick={() => {
                      sound.playTap();
                      speakChinese(
                        '读懂了故事？快来参加听说选字与偏旁拼图小游戏！利用你的听力优势，听读音迅速找到对应汉字！',
                        speechRate
                      );
                    }}
                    className="p-1 rounded-md text-red-800 hover:bg-red-200/60 cursor-pointer"
                    title="朗读提示"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  利用你的口语听力优势，听读音迅速找到对应汉字，还能收集考点文化卡片！
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playTap();
                onGoToChallenge();
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 active:scale-95 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>进入互动挑战区</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* 沉浸研读静心完结收尾卡 */
          <div className="mt-12 mb-8 pt-8 border-t border-amber-900/10 text-center space-y-4">
            <div className="w-16 h-0.5 bg-amber-900/20 mx-auto" />
            <p className="text-amber-900/60 font-calligraphy text-base sm:text-lg">
              “读书百遍，其义自见” · 本篇研读完毕
            </p>
            <button
              onClick={toggleImmersiveMode}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
              <span>退出沉浸，返回完整模式</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. LEVEL-UP ANIMATION CELEBRATION MODAL */}
      <AnimatePresence>
        {levelUpModalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -25 }}
              transition={{ type: 'spring', duration: 0.55, bounce: 0.35 }}
              className="relative w-full max-w-md bg-gradient-to-b from-stone-900 via-red-950 to-amber-950 border-4 border-amber-300 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_rgba(251,191,36,0.5)] text-center text-white overflow-hidden"
            >
              {/* Dragon clouds & radiant sunburst effect */}
              <div className="absolute -top-20 -left-20 w-44 h-44 bg-yellow-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

              {/* Close button */}
              <button
                onClick={() => {
                  sound.playTap();
                  setLevelUpModalData(null);
                }}
                className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
                title="关闭"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Badge Icon Pop Animation */}
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: 'spring', delay: 0.12, stiffness: 200, damping: 12 }}
                className="w-20 h-20 mx-auto mb-3.5 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 border-4 border-yellow-100 shadow-[0_0_28px_rgba(251,191,36,0.85)] flex items-center justify-center text-4xl"
              >
                {levelUpModalData.badgeIcon}
              </motion.div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
                <span>奉天承运 · 文曲加冕</span>
              </div>

              <h3 className="font-calligraphy text-2xl sm:text-3xl font-black text-amber-100 tracking-wide mb-1">
                恭贺学士 · 文阶晋升！
              </h3>
              <p className="text-xs sm:text-sm text-amber-200/80 mb-5">
                勤学精读，字正腔圆，文气如虹贯九天！
              </p>

              {/* Level Transition Pill */}
              <div className="bg-black/50 border border-amber-400/40 rounded-2xl p-4 mb-5 shadow-inner">
                <div className="flex items-center justify-center gap-3 text-base sm:text-lg font-bold">
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] text-stone-400">原本文位</span>
                    <span className="text-stone-300 font-mono">Lv.{levelUpModalData.oldLevel}</span>
                  </div>
                  <ChevronRight className="w-6 h-6 text-amber-400 animate-pulse shrink-0" />
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] text-yellow-400 font-bold">敕封新阶</span>
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                      className="text-yellow-300 font-black text-xl font-calligraphy drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]"
                    >
                      Lv.{levelUpModalData.newLevel} 【{levelUpModalData.newTitle}】
                    </motion.span>
                  </div>
                </div>
              </div>

              {/* Unlocked Privileges */}
              <div className="space-y-2 text-left bg-amber-950/60 border border-amber-400/30 rounded-2xl p-3.5 mb-6 text-xs text-amber-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>荣获专属【{levelUpModalData.newTitle}】头衔与金章加冕</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400 shrink-0" />
                  <span>宝库修业阁高阶卡套与金石印章已同步就绪</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>后续听说挑战与微任务阅历奖励加成提升</span>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playReward();
                  setLevelUpModalData(null);
                }}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 font-black text-sm sm:text-base shadow-lg shadow-amber-500/40 active:scale-95 transition-all cursor-pointer border-2 border-yellow-200"
              >
                承领殊荣 · 继续精读
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
