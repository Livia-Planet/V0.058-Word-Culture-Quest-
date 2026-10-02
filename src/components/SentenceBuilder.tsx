import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  Award,
  BookOpen,
  Feather,
  Flame,
  ThumbsUp,
} from 'lucide-react';
import { sound, speakChinese } from '../utils/audio';
import { useGameStore } from '../store/useGameStore';
import {
  getStoryChallengeData,
  SentencePuzzle,
  DEFAULT_SENTENCE_PUZZLES,
} from '../data/storyLevels';

// Re-export type for compatibility
export type { SentencePuzzle };

interface SentenceBuilderProps {
  onUnlockNewWord?: () => void;
}

export const SentenceBuilder: React.FC<SentenceBuilderProps> = ({ onUnlockNewWord }) => {
  const gameStore = useGameStore();
  const handleUnlock = onUnlockNewWord ?? (() => { gameStore.unlockNewWord(); });

  // 动态根据当前阅读绘本，通过 getStoryChallengeData 获取专属生活情境造句题库
  const challengeData = useMemo(() => {
    return getStoryChallengeData(gameStore.currentStoryId);
  }, [gameStore.currentStoryId]);

  // SentenceBuilder.tsx 防御性加载：确保数据缺失时平滑兜底而不崩溃
  const puzzles: SentencePuzzle[] = useMemo(() => {
    const list = challengeData?.sentenceBuilding || challengeData?.sentencePuzzles;
    return list && list.length > 0 ? list : DEFAULT_SENTENCE_PUZZLES;
  }, [challengeData]);

  const [levelIndex, setLevelIndex] = useState<number>(0);
  const [filledWord, setFilledWord] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [isTremoring, setIsTremoring] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [draggedOption, setDraggedOption] = useState<string | null>(null);

  // 监听当前阅读绘本切换，彻底重置关卡进度并同步新文章语境
  useEffect(() => {
    setLevelIndex(0);
    setFilledWord(null);
    setIsSuccess(null);
    setIsTremoring(false);
    setScore(0);
    setCombo(0);
  }, [gameStore.currentStoryId]);

  const currentPuzzle: SentencePuzzle = puzzles[levelIndex] || puzzles[0] || DEFAULT_SENTENCE_PUZZLES[0];

  // Auto-play voice guidance on level change
  useEffect(() => {
    setFilledWord(null);
    setIsSuccess(null);
    setIsTremoring(false);
    if (currentPuzzle?.audioPrompt) {
      speakChinese(currentPuzzle.audioPrompt);
    }
  }, [levelIndex, currentPuzzle?.audioPrompt]);

  // Handle slot fill attempt (via click or drop)
  const handleAttemptFill = useCallback(
    (word: string) => {
      if (!currentPuzzle) return;
      sound.playTap();
      sound.playFillSlot();
      setFilledWord(word);

      if (word === currentPuzzle.correctWord) {
        // Success
        setIsSuccess(true);
        setIsTremoring(false);
        sound.playFillSuccess();
        sound.playReward();
        setScore((prev) => prev + 20);
        setCombo((prev) => prev + 1);
        handleUnlock();

        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (error) {
          console.warn('[UI Effect Error]:', error);
        }
      } else {
        // Incorrect: Tremor feedback and error rumble sound
        setIsSuccess(false);
        setIsTremoring(true);
        sound.playWrong();
        sound.playStrokeErrorShake();
        setCombo(0);

        setTimeout(() => {
          setIsTremoring(false);
        }, 1200);
      }
    },
    [currentPuzzle, handleUnlock]
  );

  const handleClearSlot = () => {
    sound.playTap();
    setFilledWord(null);
    setIsSuccess(null);
    setIsTremoring(false);
  };

  const handleNextLevel = () => {
    sound.playTap();
    if (levelIndex + 1 < puzzles.length) {
      setLevelIndex((prev) => prev + 1);
    } else {
      // Completed all levels! Loop with celebration
      sound.playVictory();
      setLevelIndex(0);
    }
  };

  if (!currentPuzzle) {
    return (
      <div className="p-8 text-center text-stone-500">
        正在装载《{challengeData.storyShortTitle || challengeData.storyTitle}》专属生活情境造句题库...
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto text-left">
      {/* 1. TOP HEADER BANNER (作文造句情境工坊) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-700 to-amber-700 p-5 sm:p-6 text-white shadow-xl border-3 border-amber-300">
        <div className="absolute top-2 right-4 text-3xl opacity-80 animate-pulse">
          {currentPuzzle.themeIcon}
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-yellow-300 mb-2 border border-yellow-400/40">
            <Feather className="w-3.5 h-3.5" />
            <span>第三阶 · 《{challengeData.storyShortTitle || challengeData.storyTitle}》情节复述与延展造句</span>
            {currentPuzzle.storyChapterRef && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full bg-yellow-400/25 text-yellow-200 border border-yellow-400/40 text-[10px]">
                第 {currentPuzzle.storyChapterRef} 章节情节
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="font-festive text-2xl sm:text-3xl font-extrabold text-amber-100 tracking-wide">
              故事复述造句 · 妙笔生花
            </h2>
            <button
              onClick={() => {
                sound.playTap();
                speakChinese('第三阶作文造句情境工坊。阅读故事情节短句，拖拽或点击下方词语卡片填入横线，完成情节复述与优美延展句子！');
              }}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-yellow-300 transition-colors cursor-pointer"
              title="朗读工坊规则说明"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
          <p className="text-amber-100/90 text-xs sm:text-sm leading-relaxed">
            深入《{challengeData.storyShortTitle || challengeData.storyTitle}》故事情节，点击或拖拽生字成语卡片补全句子。巩固字词、融汇情节！
          </p>
        </div>

        {/* Progress & Combo Stats Bar */}
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="bg-black/30 px-3 py-1 rounded-xl text-yellow-200 font-bold border border-yellow-400/30">
              关卡: {levelIndex + 1} / {puzzles.length}
            </span>
            <span className="bg-black/30 px-3 py-1 rounded-xl text-amber-200 font-bold border border-amber-400/30">
              金币: +{score} 🪙
            </span>
            {combo > 1 && (
              <span className="bg-red-600/90 text-yellow-200 px-2.5 py-0.5 rounded-full font-black animate-bounce flex items-center gap-1">
                <Flame className="w-3 h-3 text-yellow-300" />
                <span>连对 x{combo}</span>
              </span>
            )}
          </div>

          <button
            onClick={() => {
              sound.playTap();
              speakChinese(currentPuzzle.audioPrompt);
            }}
            className="px-3 py-1 rounded-xl bg-yellow-400 hover:bg-yellow-300 active:scale-95 text-red-950 font-black text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>听题目情境</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN SENTENCE WORKBENCH (情境句子填空核心舞台) */}
      <div className="bg-stone-50 border-2 border-amber-300/80 rounded-3xl p-5 sm:p-8 shadow-lg text-stone-900 space-y-6 relative">
        {/* Instructions banner with TTS */}
        <div className="flex items-center justify-between bg-amber-100/70 border border-amber-200 rounded-2xl px-4 py-2.5 text-xs text-amber-900 font-bold">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
            <span>情境短句 (点击或将词语拖入虚线框中):</span>
          </div>
          <button
            onClick={() => {
              sound.playTap();
              const fullText = `${currentPuzzle.prefix}${filledWord || '某某成语'}${currentPuzzle.suffix}`;
              speakChinese(fullText);
            }}
            className="flex items-center gap-1 text-red-800 hover:text-red-950 underline cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>试听整句</span>
          </button>
        </div>

        {/* The Sentence with Drop Slot */}
        <div className="bg-white border-2 border-stone-200 rounded-3xl p-6 sm:p-8 shadow-xs text-center">
          <div className="font-calligraphy text-2xl sm:text-3xl lg:text-4xl text-stone-800 leading-loose flex flex-wrap items-center justify-center gap-x-2 gap-y-3">
            <span>{currentPuzzle.prefix}</span>

            {/* Interactive Drop / Fill Slot */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingOver(false);
                const word = e.dataTransfer.getData('text/plain') || draggedOption;
                if (word) {
                  handleAttemptFill(word);
                }
              }}
              onClick={() => {
                if (filledWord) handleClearSlot();
              }}
              className={`inline-flex items-center justify-center min-w-[140px] sm:min-w-[170px] min-h-[54px] sm:min-h-[64px] px-4 py-1.5 rounded-2xl border-3 border-dashed font-bold transition-all cursor-pointer relative ${
                isDraggingOver
                  ? 'border-yellow-500 bg-amber-100/90 scale-105 shadow-md'
                  : filledWord
                  ? isSuccess === true
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md ring-2 ring-emerald-300'
                    : isSuccess === false
                    ? 'border-red-500 bg-red-50 text-red-900 animate-stroke-tremor ring-2 ring-red-300'
                    : 'border-amber-400 bg-amber-50 text-amber-950'
                  : 'border-amber-400/80 bg-amber-50/50 hover:bg-amber-100/60 text-stone-400'
              }`}
            >
              {filledWord ? (
                <div className="flex items-center gap-1.5">
                  <span className="font-calligraphy text-2xl sm:text-3xl font-black drop-shadow-xs">
                    {filledWord}
                  </span>
                  {isSuccess === true && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                  {isSuccess === false && (
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 animate-pulse" />
                  )}
                </div>
              ) : (
                <span className="text-sm font-sans font-medium text-amber-700/70">
                  【 拖入或点击词语 】
                </span>
              )}
            </div>

            <span>{currentPuzzle.suffix}</span>
          </div>

          {/* Reset / Clear slot hint */}
          {filledWord && !isSuccess && (
            <div className="mt-3">
              <button
                onClick={handleClearSlot}
                className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-3 py-1 rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>重新选择</span>
              </button>
            </div>
          )}
        </div>

        {/* 3. WORD TILES POOL (可拖拽 / 可点击的成语词语卡片) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-stone-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>候选词语卡片 (点击卡片或按住拖拽至横线)：</span>
            </span>
            <span className="text-[11px] text-stone-400">支持拖拽或直接点击</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {currentPuzzle.options.map((option, idx) => {
              const isSelected = filledWord === option;
              const isCorrectCard = isSelected && isSuccess === true;
              const isWrongCard = isSelected && isSuccess === false;

              return (
                <div
                  key={idx}
                  draggable={true}
                  onDragStart={(e) => {
                    setDraggedOption(option);
                    e.dataTransfer.setData('text/plain', option);
                    sound.playTap();
                  }}
                  onDragEnd={() => setDraggedOption(null)}
                  onClick={() => handleAttemptFill(option)}
                  className={`group relative p-3 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer select-none active:scale-95 flex flex-col items-center justify-center shadow-xs ${
                    isCorrectCard
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400 shadow-md scale-102 font-black'
                      : isWrongCard
                      ? 'bg-red-100 border-red-500 text-red-950 animate-stroke-tremor ring-2 ring-red-400'
                      : isSelected
                      ? 'bg-amber-200 border-amber-400 text-amber-950'
                      : 'bg-white hover:bg-amber-50 border-amber-300 hover:border-amber-400 text-stone-800 hover:shadow-md'
                  }`}
                >
                  {/* Speaker icon for pronunciation */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playTap();
                      speakChinese(option);
                    }}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-red-700 transition-colors"
                    title={`听【${option}】发音`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>

                  <span className="font-calligraphy text-2xl sm:text-2xl font-bold tracking-wide">
                    {option}
                  </span>
                  <span className="text-[10px] text-stone-400 mt-1 font-mono">
                    点击填入 · 或拖动
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. SUCCESS CELEBRATION & EXPLANATION PANEL */}
        <AnimatePresence>
          {isSuccess === true && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-gradient-to-br from-emerald-50 to-amber-50 border-2 border-emerald-400 rounded-2xl p-4 sm:p-5 shadow-md space-y-3"
            >
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-festive font-black text-emerald-900 text-base">
                      妙笔生花 · 造句成功！(+20 金币)
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      拼读音: {currentPuzzle.pinyin}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playTap();
                    const full = `${currentPuzzle.prefix}${currentPuzzle.correctWord}${currentPuzzle.suffix}`;
                    speakChinese(full);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>朗读完整美句</span>
                </button>
              </div>

              <div className="text-xs text-stone-700 space-y-1.5 leading-relaxed">
                <p>
                  <strong className="text-emerald-900">词汇含义：</strong>
                  {currentPuzzle.meaning}
                </p>
                <p className="text-stone-600 bg-white/70 p-2.5 rounded-xl border border-emerald-200/60">
                  <strong className="text-amber-900">故事情节与文化拓展：</strong>
                  {currentPuzzle.contextLore}
                </p>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  onClick={handleNextLevel}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>
                    {levelIndex + 1 < puzzles.length ? '下一句情境挑战' : '全部通关！再次挑战'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {isSuccess === false && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs text-red-900 animate-stroke-tremor"
            >
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>
                  成语不够契合这个生活情境哦，低频震颤纠偏已提醒。想一想长辈最爱听的吉祥话是什么呢？
                </span>
              </div>
              <button
                onClick={() => {
                  sound.playTap();
                  speakChinese('再试一次哦，想一想哪个成语最适合这里的节日情境呢？');
                }}
                className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 shrink-0 cursor-pointer"
                title="听语音引导"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
