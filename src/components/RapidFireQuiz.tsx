import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Zap,
  Timer,
  Volume2,
  Sparkles,
  Flame,
  Award,
  RotateCcw,
  Play,
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import {
  RapidFireQuestion,
  getRandomizedQuestions,
  generatePriorityWordPool,
  GeneratedPoolResult,
} from '../data/rapidFireData';
import { sound, speakChinese, stopChineseSpeech } from '../utils/audio';
import { safeGetItem, safeSetItem } from '../utils/storage';
import { useGameStore } from '../store/useGameStore';

interface RapidFireQuizProps {
  onUnlockNewWord?: () => void;
  onGoToWriting?: () => void;
}

export const RapidFireQuiz: React.FC<RapidFireQuizProps> = ({
  onUnlockNewWord,
  onGoToWriting,
}) => {
  const gameStore = useGameStore();
  const handleUnlock = onUnlockNewWord ?? (() => { gameStore.unlockNewWord(); });
  // Game Phases: 'idle' | 'countdown' | 'playing' | 'gameover'
  const [phase, setPhase] = useState<'idle' | 'countdown' | 'playing' | 'gameover'>('idle');

  // 3-second pre-start countdown
  const [readyCountdown, setReadyCountdown] = useState<number>(3);

  // 60-second in-game timer (in deciseconds, 600 = 60.0s)
  const [timeLeftDeci, setTimeLeftDeci] = useState<number>(600);

  const currentStoryId = gameStore.currentStoryId;
  const readChapterIds = gameStore.readingProgress?.readChapterIds || [];
  const weeklyRecords = gameStore.weeklyRecords || [];

  // Questions and current index
  const [quizQuestions, setQuizQuestions] = useState<RapidFireQuestion[]>([]);
  const questions = quizQuestions;
  const setQuestions = setQuizQuestions;
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // 动态题库构成统计
  const [poolStats, setPoolStats] = useState<{
    currentCount: number;
    reviewCount: number;
    fallbackCount: number;
    total: number;
  }>({
    currentCount: 0,
    reviewCount: 0,
    fallbackCount: 0,
    total: 0,
  });

  // Scoring and combo stats
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalAttempted, setTotalAttempted] = useState<number>(0);

  // Instant feedback state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [floatingScoreText, setFloatingScoreText] = useState<string | null>(null);

  // Audio prompt voice status
  const [isAudioPrompting, setIsAudioPrompting] = useState<boolean>(false);

  // High score in local storage
  const [highScore, setHighScore] = useState<number>(() => {
    return safeGetItem('hanzi_rapid_fire_high_score', 0);
  });

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const audioPromptTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      if (audioPromptTimeoutRef.current) clearTimeout(audioPromptTimeoutRef.current);
      stopChineseSpeech();
    };
  }, []);

  // RapidFireQuiz.tsx 依赖项重构：修改 useEffect 依赖为值类型（如 readChapterIds.length, weeklyRecords.length）
  useEffect(() => {
    const pool = generatePriorityWordPool({
      currentStoryId,
      readChapterIdsCount: readChapterIds.length,
      weeklyRecordsCount: weeklyRecords.length,
      unlockedStoryIds: readChapterIds,
      studiedWords: weeklyRecords.flatMap((r) => r.charactersLearned || []),
      targetPoolSize: 36,
    });
    setQuizQuestions(pool.questions);
    setPoolStats(pool.stats);
  }, [currentStoryId, readChapterIds.length, weeklyRecords.length]);

  const currentQ = questions[currentIndex];

  // Play audio cue for current question
  const playCurrentCue = useCallback((q: RapidFireQuestion) => {
    if (!q) return;
    setIsAudioPrompting(true);
    speakChinese(q.audioPrompt);
    if (audioPromptTimeoutRef.current) clearTimeout(audioPromptTimeoutRef.current);
    audioPromptTimeoutRef.current = setTimeout(() => {
      setIsAudioPrompting(false);
    }, 1200);
  }, []);

  // Start 3-2-1 Countdown
  const handleStartCountdown = () => {
    stopChineseSpeech();
    sound.playTap();

    // 重新随机洗牌并生成最新一轮混合出题词库
    const pool = generatePriorityWordPool({
      currentStoryId,
      readChapterIdsCount: readChapterIds.length,
      weeklyRecordsCount: weeklyRecords.length,
      unlockedStoryIds: readChapterIds,
      studiedWords: weeklyRecords.flatMap((r) => r.charactersLearned || []),
      targetPoolSize: 36,
    });

    setQuizQuestions(pool.questions);
    setPoolStats(pool.stats);
    setCurrentIndex(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setTotalAttempted(0);
    setTimeLeftDeci(600);
    setSelectedOption(null);
    setIsAnswerCorrect(null);
    setFloatingScoreText(null);

    setReadyCountdown(3);
    setPhase('countdown');
  };

  // 监听绘本切换，若正在答题则自动重置回大厅并清空题目进度
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
    if (audioPromptTimeoutRef.current) clearTimeout(audioPromptTimeoutRef.current);
    stopChineseSpeech();

    setPhase('idle');
    setReadyCountdown(3);
    setTimeLeftDeci(600);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setTotalAttempted(0);
    setSelectedOption(null);
    setIsAnswerCorrect(null);
    setFloatingScoreText(null);
  }, [gameStore.currentStoryId]);

  // Pre-game 3-second countdown loop
  useEffect(() => {
    if (phase !== 'countdown') return;

    if (readyCountdown > 0) {
      sound.playCharClick();
      const timer = setTimeout(() => {
        setReadyCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Begin game!
      sound.playBadgeUnlock();
      setPhase('playing');
      if (questions[0]) {
        playCurrentCue(questions[0]);
      }
    }
  }, [phase, readyCountdown, questions, playCurrentCue]);

  // Main 60s Timer Loop (100ms ticks)
  useEffect(() => {
    if (phase !== 'playing') return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeftDeci((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current as NodeJS.Timeout);
          // End game
          handleGameOver();
          return 0;
        }
        // Play tick warning when in last 5 seconds (50 deciseconds)
        if (prev <= 50 && prev % 10 === 0) {
          sound.playSnap();
        }
        return prev - 1;
      });
    }, 100);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [phase]);

  // Game over settlement
  const handleGameOver = () => {
    stopChineseSpeech();
    setPhase('gameover');
    sound.playVictory();

    // High score update
    setHighScore((prev) => {
      const nextHigh = Math.max(prev, score);
      safeSetItem('hanzi_rapid_fire_high_score', nextHigh);
      return nextHigh;
    });

    // Confetti celebration if decent score
    if (correctCount >= 5) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (error) {
        console.warn('[UI Effect Error]:', error);
      }
      handleUnlock();
    }
  };

  // Keyboard support: 1, 2, 3, 4
  useEffect(() => {
    if (phase !== 'playing' || selectedOption !== null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentQ) return;
      if (e.key === '1' && currentQ.options[0]) handleSelectOption(currentQ.options[0]);
      if (e.key === '2' && currentQ.options[1]) handleSelectOption(currentQ.options[1]);
      if (e.key === '3' && currentQ.options[2]) handleSelectOption(currentQ.options[2]);
      if (e.key === '4' && currentQ.options[3]) handleSelectOption(currentQ.options[3]);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, selectedOption, currentQ]);

  // Handle user answer click
  const handleSelectOption = (option: string) => {
    if (selectedOption !== null || phase !== 'playing' || !currentQ) return;

    setSelectedOption(option);
    setTotalAttempted((prev) => prev + 1);

    const isCorrect = option === currentQ.correctAnswer;
    setIsAnswerCorrect(isCorrect);

    if (isCorrect) {
      sound.playCorrect();
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo((prev) => Math.max(prev, newCombo));
      setCorrectCount((prev) => prev + 1);

      // Scoring formula: Base 100 + Combo bonus (x1 to x3 multiplier) + speed bonus
      const comboMultiplier = newCombo >= 10 ? 3 : newCombo >= 5 ? 2 : 1.5;
      const points = Math.round(100 * comboMultiplier);
      setScore((prev) => prev + points);

      setFloatingScoreText(`+${points} ${newCombo >= 5 ? '🔥FEVER!' : '连击!'}`);
    } else {
      sound.playWrong();
      setCombo(0);
      setFloatingScoreText('MISS 连击重置');
    }

    // Fast-paced automatic advance (320ms transition)
    transitionTimeoutRef.current = setTimeout(() => {
      setSelectedOption(null);
      setIsAnswerCorrect(null);
      setFloatingScoreText(null);

      // Advance question
      const nextIndex = (currentIndex + 1) % questions.length;
      setCurrentIndex(nextIndex);
      if (questions[nextIndex]) {
        playCurrentCue(questions[nextIndex]);
      }
    }, 320);
  };

  // Determine Rank
  const getRankBadge = () => {
    if (correctCount >= 18) {
      return {
        rank: 'S·神行文曲',
        desc: '眼明心疾，破魔宗师！60秒内横扫千军，汉字音形辨析登峰造极！',
        color: 'from-amber-400 via-yellow-300 to-amber-500 text-red-950',
        border: 'border-yellow-300 ring-2 ring-yellow-400',
      };
    } else if (correctCount >= 12) {
      return {
        rank: 'A·迅捷剑客',
        desc: '气势如虹，连击惊艳！对于形声字音形匹配具备卓越直觉。',
        color: 'from-red-600 via-orange-600 to-amber-600 text-white',
        border: 'border-amber-400',
      };
    } else if (correctCount >= 6) {
      return {
        rank: 'B·熟能生巧',
        desc: '基础扎实，循序渐进！多加练习即可激活高倍连击狂暴状态。',
        color: 'from-amber-200 to-orange-200 text-amber-950',
        border: 'border-amber-300',
      };
    } else {
      return {
        rank: 'C·潜心磨砺',
        desc: '初入险境，熟悉节奏。多听声韵提示，静心辨析形近字差异！',
        color: 'from-stone-200 to-amber-100 text-stone-800',
        border: 'border-stone-300',
      };
    }
  };

  // Seconds display
  const secondsLeft = (timeLeftDeci / 10).toFixed(1);
  const isDangerTime = timeLeftDeci <= 100 && timeLeftDeci > 0; // last 10 seconds

  return (
    <div className="bg-gradient-to-br from-red-950 via-stone-900 to-amber-950 text-white rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-amber-400/80 relative overflow-hidden">
      {/* Ambient RPG Background Runes */}
      <div className="absolute top-2 right-6 text-8xl font-calligraphy text-amber-500/5 select-none pointer-events-none font-black">
        乾坤速决
      </div>
      <div className="absolute -bottom-8 -left-8 text-9xl font-calligraphy text-red-500/5 select-none pointer-events-none font-black">
        连击
      </div>

      {/* PHASE 1: IDLE / COVER */}
      {phase === 'idle' && (
        <div className="text-center py-8 sm:py-12 space-y-6 max-w-xl mx-auto">
          {/* Animated Emblem */}
          <div className="relative inline-block">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-red-600 via-orange-600 to-yellow-500 text-yellow-200 flex items-center justify-center mx-auto shadow-2xl border-4 border-yellow-300 animate-pulse">
              <Zap className="w-14 h-14 sm:w-16 sm:h-16 text-yellow-300 drop-shadow-md" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-900 text-yellow-300 border border-yellow-400/60 text-[10px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-md">
              60秒极速挑战
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-yellow-300 text-xs font-black border border-yellow-400/40 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                演武题库联动：{gameStore.currentStory?.icon} 《{gameStore.currentStory?.title || '经典绘本'}》
              </span>
            </div>
            <h3 className="font-festive font-black text-2xl sm:text-3xl text-yellow-300 tracking-wide drop-shadow-md">
              ⚡ 极限连击 · 60秒听音辨字速决
            </h3>
            <p className="text-xs sm:text-sm text-amber-200/90 mt-2 leading-relaxed">
              根据当前选中的绘本重点生字，系统播放汉字声韵提示，你必须在 60 秒内以闪电般的速度选出正确汉字。连击数越高，得分倍率越狂暴！
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 bg-red-900/40 border border-amber-500/30 rounded-2xl p-3.5 text-center text-xs">
            <div className="border-r border-amber-500/20 pr-1">
              <span className="text-yellow-400 font-extrabold text-sm block">⏱️ 60.0s</span>
              <span className="text-[11px] text-amber-200/70">极限倒计时</span>
            </div>
            <div className="border-r border-amber-500/20 pr-1">
              <span className="text-yellow-400 font-extrabold text-sm block">🔥 x3 狂暴</span>
              <span className="text-[11px] text-amber-200/70">连击倍率加成</span>
            </div>
            <div>
              <span className="text-yellow-400 font-extrabold text-sm block">👑 历史最高</span>
              <span className="text-[11px] text-amber-200/70">{highScore} 分</span>
            </div>
          </div>

          {/* 动态优先级混合出题题库指示器 */}
          <div className="bg-amber-950/60 border border-amber-500/30 rounded-2xl p-3 text-left space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold">
              <span>🎯 出题池智能配比 (共 {poolStats.total || questions.length} 题)</span>
              <span className="text-amber-400/80 font-normal">基于阅读进度动态调度</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="bg-red-900/50 rounded-xl p-2 border border-red-500/30">
                <span className="text-amber-200/80 block text-[10px]">
                  一阶 · 当前生字 ({Math.round(((poolStats.currentCount || 1) / (poolStats.total || questions.length || 1)) * 100)}%)
                </span>
                <span className="text-yellow-300 font-black text-sm">{poolStats.currentCount} 题</span>
              </div>
              <div className="bg-amber-900/50 rounded-xl p-2 border border-amber-500/30">
                <span className="text-amber-200/80 block text-[10px]">二阶 · 历史复习</span>
                <span className="text-amber-300 font-black text-sm">{poolStats.reviewCount} 题</span>
              </div>
              <div className="bg-stone-900/60 rounded-xl p-2 border border-stone-600/40">
                <span className="text-amber-200/80 block text-[10px]">三阶 · 基础兜底</span>
                <span className="text-stone-300 font-black text-sm">{poolStats.fallbackCount} 题</span>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStartCountdown}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 hover:from-yellow-300 hover:to-amber-200 text-red-950 font-black text-base sm:text-lg shadow-xl hover:shadow-yellow-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ring-4 ring-yellow-400/40"
          >
            <Play className="w-5 h-5 fill-red-950" />
            <span>开启 60 秒极速挑战！</span>
          </button>
        </div>
      )}

      {/* PHASE 2: 3-SECOND COUNTDOWN */}
      {phase === 'countdown' && (
        <div className="text-center py-16 space-y-6">
          <span className="text-sm font-bold text-amber-300 tracking-widest block uppercase">
            年兽伏魔阵正在开启...
          </span>
          <div className="text-8xl sm:text-9xl font-festive font-black text-yellow-300 animate-ping drop-shadow-2xl">
            {readyCountdown === 0 ? '战！' : readyCountdown}
          </div>
          <p className="text-xs text-amber-200/70">准备听音，双手就位（支持点击或按键 1/2/3/4）</p>
        </div>
      )}

      {/* PHASE 3: PLAYING (60-SECOND RAPID FIRE QUIZ) */}
      {phase === 'playing' && currentQ && (
        <div className="space-y-4 sm:space-y-5">
          {/* Top HUD Status Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-amber-500/30 pb-3 flex-wrap">
            {/* Left: Timer Display */}
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border transition-all ${
                isDangerTime
                  ? 'bg-red-600/90 border-yellow-300 text-yellow-200 animate-pulse ring-2 ring-red-500'
                  : 'bg-stone-900/80 border-amber-400/40 text-yellow-300'
              }`}
            >
              <Timer className={`w-4 h-4 ${isDangerTime ? 'text-yellow-200 animate-spin' : 'text-amber-400'}`} />
              <div className="text-left">
                <span className="text-[9px] text-stone-300 block leading-tight">剩余时间</span>
                <span className="font-mono font-black text-base sm:text-lg tracking-wider">
                  {secondsLeft}s
                </span>
              </div>
            </div>

            {/* Middle: Combo Streak Display */}
            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-1 rounded-2xl flex items-center gap-1.5 border ${
                  combo >= 10
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-red-950 font-black border-yellow-200 animate-bounce'
                    : combo >= 5
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white font-extrabold border-yellow-400'
                    : combo > 0
                    ? 'bg-amber-900/60 text-yellow-300 font-bold border-amber-500/40'
                    : 'bg-stone-900 text-stone-500 border-stone-800'
                }`}
              >
                <Flame className={`w-4 h-4 ${combo >= 5 ? 'text-yellow-300' : 'text-orange-400'}`} />
                <span className="text-xs sm:text-sm">
                  {combo > 0 ? `${combo} 连击` : '连击准备'}
                </span>
                {combo >= 5 && (
                  <span className="text-[10px] bg-red-950/80 text-yellow-300 px-1 rounded">
                    {combo >= 10 ? 'x3' : 'x2'}
                  </span>
                )}
              </div>
            </div>

            {/* Right: Score & Count */}
            <div className="flex items-center gap-3 bg-stone-900/80 border border-amber-400/40 px-3.5 py-1.5 rounded-2xl text-xs">
              <div>
                <span className="text-[9px] text-stone-400 block leading-tight">得分</span>
                <span className="font-black text-yellow-300 text-base">{score}</span>
              </div>
              <div className="border-l border-stone-700 pl-2">
                <span className="text-[9px] text-stone-400 block leading-tight">命中</span>
                <span className="font-black text-emerald-400 text-base">{correctCount}</span>
              </div>
            </div>
          </div>

          {/* Time Progress Bar */}
          <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden border border-amber-500/20">
            <div
              className={`h-full transition-all duration-100 ${
                isDangerTime
                  ? 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400'
                  : 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-200'
              }`}
              style={{ width: `${Math.max(0, (timeLeftDeci / 600) * 100)}%` }}
            />
          </div>

          {/* Audio Prompt Arena Card */}
          <div className="bg-gradient-to-r from-red-900/80 via-stone-900/90 to-red-900/80 border-2 border-amber-400/60 rounded-3xl p-4 sm:p-5 text-center relative shadow-lg">
            {/* Floating combo float text */}
            {floatingScoreText && (
              <div className="absolute top-2 right-4 text-xs sm:text-sm font-black text-yellow-300 animate-bounce bg-red-950/90 px-2.5 py-1 rounded-full border border-yellow-400 shadow-md">
                {floatingScoreText}
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => playCurrentCue(currentQ)}
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-red-950 flex items-center justify-center shadow-lg border-2 border-yellow-200 cursor-pointer transition-transform active:scale-95 ${
                  isAudioPrompting ? 'animate-ping' : 'hover:scale-105'
                }`}
                title="重听语音提示"
              >
                <Volume2 className="w-7 h-7" />
              </button>

              <div className="text-left">
                <span className="text-[10px] text-amber-300/80 font-bold block uppercase tracking-wider">
                  听到声韵提示：
                </span>
                <div className="text-xl sm:text-2xl font-black text-yellow-200 font-sans tracking-wide">
                  【{currentQ.pinyin}】
                </div>
                <span className="text-xs text-amber-100/90 font-medium">
                  {currentQ.audioPrompt}
                </span>
              </div>
            </div>

            <div className="mt-2 text-[11px] text-stone-400">
              💡 提示：{currentQ.hint}
            </div>
          </div>

          {/* 4 Character Choice Tiles (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto pt-1">
            {currentQ.options.map((option, idx) => {
              const isChosen = selectedOption === option;
              const isCorrectTarget = option === currentQ.correctAnswer;

              let btnStyle =
                'bg-gradient-to-b from-stone-800 to-stone-900 border-2 border-amber-400/40 text-yellow-100 hover:border-yellow-400 hover:scale-102';

              if (selectedOption !== null) {
                if (isCorrectTarget) {
                  btnStyle =
                    'bg-gradient-to-b from-emerald-600 to-emerald-800 border-2 border-emerald-300 text-white ring-4 ring-emerald-400/50 scale-105 animate-pulse';
                } else if (isChosen && !isCorrectTarget) {
                  btnStyle =
                    'bg-gradient-to-b from-red-600 to-red-800 border-2 border-red-300 text-white ring-4 ring-red-400/50';
                } else {
                  btnStyle = 'opacity-40 bg-stone-900 border-stone-800 text-stone-600';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option)}
                  disabled={selectedOption !== null}
                  className={`p-4 sm:p-6 rounded-3xl transition-all shadow-lg flex flex-col items-center justify-center relative cursor-pointer active:scale-95 ${btnStyle}`}
                >
                  {/* Key index tag */}
                  <span className="absolute top-2 left-3 text-[10px] font-mono text-stone-400 bg-stone-950/60 px-1.5 py-0.5 rounded-md border border-stone-700">
                    {idx + 1}
                  </span>

                  {/* Big Character Tile */}
                  <span className="font-calligraphy text-4xl sm:text-5xl font-black leading-none my-1">
                    {option}
                  </span>

                  {/* Success / Failure Icon indicator */}
                  {selectedOption !== null && isCorrectTarget && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-300 absolute bottom-2 right-3 animate-bounce" />
                  )}
                  {selectedOption !== null && isChosen && !isCorrectTarget && (
                    <XCircle className="w-5 h-5 text-red-300 absolute bottom-2 right-3" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-center text-[11px] text-stone-400">
            ⌨️ 电脑端支持键盘快捷键 <kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700">1</kbd> <kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700">2</kbd> <kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700">3</kbd> <kbd className="bg-stone-800 px-1.5 py-0.5 rounded border border-stone-700">4</kbd> 秒速抢答！
          </div>
        </div>
      )}

      {/* PHASE 4: GAMEOVER / REPORT */}
      {phase === 'gameover' && (
        <div className="py-6 sm:py-8 space-y-6 max-w-xl mx-auto text-center animate-in fade-in zoom-in-95 duration-300">
          {/* Rank Badge Emblem */}
          {(() => {
            const badge = getRankBadge();
            return (
              <div className="space-y-3">
                <div
                  className={`inline-block px-6 py-2 rounded-2xl bg-gradient-to-r ${badge.color} ${badge.border} shadow-2xl font-festive font-black text-xl sm:text-2xl`}
                >
                  🏆 {badge.rank}
                </div>
                <h3 className="font-festive font-black text-2xl sm:text-3xl text-yellow-300">
                  60秒速决战报结算
                </h3>
                <p className="text-xs text-amber-200/90 max-w-md mx-auto leading-relaxed">
                  {badge.desc}
                </p>
              </div>
            );
          })()}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-stone-900/90 border-2 border-amber-400/40 rounded-3xl p-4 text-center">
            <div className="bg-red-950/60 p-2.5 rounded-2xl border border-amber-500/20">
              <span className="text-[10px] text-stone-400 block">本局总得分</span>
              <span className="font-black text-yellow-300 text-xl sm:text-2xl">{score}</span>
            </div>
            <div className="bg-red-950/60 p-2.5 rounded-2xl border border-amber-500/20">
              <span className="text-[10px] text-stone-400 block">正确答对</span>
              <span className="font-black text-emerald-400 text-xl sm:text-2xl">
                {correctCount} <span className="text-xs text-stone-400 font-normal">/ {totalAttempted}</span>
              </span>
            </div>
            <div className="bg-red-950/60 p-2.5 rounded-2xl border border-amber-500/20">
              <span className="text-[10px] text-stone-400 block">最高连击</span>
              <span className="font-black text-orange-400 text-xl sm:text-2xl">{maxCombo} x</span>
            </div>
            <div className="bg-red-950/60 p-2.5 rounded-2xl border border-amber-500/20">
              <span className="text-[10px] text-stone-400 block">平均反应</span>
              <span className="font-black text-amber-300 text-xl sm:text-2xl">
                {totalAttempted > 0 ? (60 / totalAttempted).toFixed(1) : '0'}s
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStartCountdown}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 hover:from-yellow-300 text-red-950 font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 ring-2 ring-yellow-300"
            >
              <RotateCcw className="w-4 h-4" />
              <span>再战一局 (Play Again)</span>
            </button>

            {onGoToWriting && (
              <button
                onClick={() => {
                  sound.playTap();
                  onGoToWriting();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-red-900 hover:bg-red-800 text-amber-200 border border-amber-400/60 font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors active:scale-95"
              >
                <span>前往小作文实验室</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
