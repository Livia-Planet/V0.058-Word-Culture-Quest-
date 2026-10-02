import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import {
  Volume2,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Award,
  ChevronLeft,
  Headphones,
  Layers,
  Brush,
} from 'lucide-react';
import {
  SoundMatchQuestion,
  RadicalBlockGame,
} from '../data/level1Data';
import { getStoryChallengeData, StoryChallengeData } from '../data/storyLevels';
import { sound, speakChinese } from '../utils/audio';
import { CanvasParticleBurst, CanvasParticleBurstRef } from './CanvasParticleBurst';
import { CanvasHandwritingPad } from './CanvasHandwritingPad';
import { useGameStore } from '../store/useGameStore';

export type ChallengeSubStage = 'lobby' | 'listening' | 'writing' | 'radicals';
export type ChallengeMode = 'lobby' | 'sound' | 'writing' | 'radical';

interface ChallengeSectionProps {
  onGoToWriting?: () => void;
}

// =====================================================================
// 1. 子组件：第一阶段【听音选字】(SoundMatchChallenge)
// =====================================================================
interface SoundMatchChallengeProps {
  questions: SoundMatchQuestion[];
  onNext: () => void;
}

export const SoundMatchChallenge: React.FC<SoundMatchChallengeProps> = ({
  questions,
  onNext,
}) => {
  const { currentStoryId, markModuleCompleted, unlockNewWord } = useGameStore();
  const [soundIndex, setSoundIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);

  const currentQ: SoundMatchQuestion | undefined = questions[soundIndex] || questions[0];

  useEffect(() => {
    if (!completed && currentQ) {
      speakChinese(currentQ.audioCue);
    }
  }, [soundIndex, completed, currentQ]);

  const handleSelectOption = (opt: string) => {
    if (selectedAnswer !== null || !currentQ) return;
    setSelectedAnswer(opt);

    if (opt === currentQ.correctAnswer) {
      setIsCorrect(true);
      sound.playCorrect();
      setScore((prev) => prev + 1);
      unlockNewWord();

      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (error) {
        console.warn('[UI Effect Error]:', error);
      }
    } else {
      setIsCorrect(false);
      sound.playWrong();
      sound.playStrokeErrorShake();
    }
  };

  const handleNext = () => {
    sound.playTap();
    if (soundIndex + 1 < questions.length) {
      setSoundIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      setCompleted(true);
      markModuleCompleted(currentStoryId, 'sound', { score });
      sound.playVictory();
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch (error) {
        console.warn('[UI Effect Error]:', error);
      }
    }
  };

  const handleRestart = () => {
    sound.playTap();
    setSoundIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setScore(0);
    setCompleted(false);
  };

  if (!currentQ) return null;

  return (
    <div className="bg-white/95 border-2 border-amber-200 rounded-3xl p-5 sm:p-8 shadow-lg max-w-3xl mx-auto">
      {!completed ? (
        <div>
          {/* Top Status */}
          <div className="flex items-center justify-between border-b-2 border-amber-100 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
                题目 {soundIndex + 1} / {questions.length}
              </span>
              <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                充分利用你的口语听力直觉！
              </span>
              <button
                onClick={() => {
                  sound.playTap();
                  speakChinese('请听标准普通话读音，选出对应的汉字字形。');
                }}
                className="p-1 rounded-full hover:bg-amber-100 text-amber-800 cursor-pointer"
                title="朗读规则"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 px-3 py-1 rounded-full">
              <Award className="w-4 h-4 text-amber-600" />
              <span>得分: {score}</span>
            </div>
          </div>

          {/* Central Audio Prompt Card */}
          <div className="bg-gradient-to-br from-amber-100 via-orange-50 to-red-50 border-2 border-amber-300 rounded-3xl p-6 text-center shadow-md mb-6 relative overflow-hidden">
            <div className="text-xs font-extrabold text-red-700 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
              <span>请听标准普通话读音 · 选出对应的字形</span>
              <button
                onClick={() => {
                  sound.playTap();
                  speakChinese('请听读音选字');
                }}
                className="p-1 text-red-700 hover:text-red-900 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => {
                sound.playTap();
                speakChinese(currentQ.audioCue);
              }}
              className="my-3 px-6 py-3.5 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2 cursor-pointer ring-4 ring-red-200"
            >
              <Volume2 className="w-5 h-5 animate-pulse" />
              <span>点击重听标准读音</span>
            </button>

            <div className="text-stone-600 text-xs font-medium mt-1">
              提示语境：
              <span className="font-bold text-stone-800">
                “{currentQ.meaningHint}”
              </span>
            </div>
          </div>

          {/* Choices Options Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {currentQ.options.map((opt, optIdx) => {
              let btnStyle =
                'bg-white border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50 text-stone-800 shadow-sm';

              if (selectedAnswer !== null) {
                if (opt === currentQ.correctAnswer) {
                  btnStyle =
                    'bg-emerald-100 border-2 border-emerald-500 text-emerald-950 shadow-md ring-2 ring-emerald-300';
                } else if (opt === selectedAnswer) {
                  btnStyle =
                    'bg-rose-100 border-2 border-rose-500 text-rose-950 shadow-md animate-stroke-tremor';
                } else {
                  btnStyle = 'bg-stone-100 border-stone-200 text-stone-400 opacity-60';
                }
              }

              return (
                <button
                  key={`${opt}-${optIdx}`}
                  onClick={() => handleSelectOption(opt)}
                  disabled={selectedAnswer !== null}
                  className={`p-6 rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                >
                  <div className="w-16 h-16 tianzige rounded-2xl flex items-center justify-center font-calligraphy text-4xl font-black mb-2">
                    {opt}
                  </div>
                  <span className="text-xs font-bold text-stone-500">点击选择</span>
                </button>
              );
            })}
          </div>

          {/* Feedback Card & Next Question Button */}
          {selectedAnswer && (
            <div
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-200 ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-amber-600 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <span>{isCorrect ? '回答正确！太棒了！' : '哎呀，选错了哦！'}</span>
                    <button
                      onClick={() => {
                        sound.playTap();
                        speakChinese(
                          isCorrect
                            ? `回答正确！${currentQ.explanation}`
                            : `继续加油！${currentQ.explanation}`
                        );
                      }}
                      className="p-1 rounded-md hover:bg-black/10 text-stone-700 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs mt-1 leading-relaxed">{currentQ.explanation}</p>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>下一题</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Completed all sound questions */
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-festive font-black text-red-900">
            恭喜完成所有【听音选字】挑战！
          </h3>
          <p className="text-stone-600 text-sm max-w-md mx-auto">
            你一共答对了 <span className="font-bold text-red-600 text-lg">{score}</span> /{' '}
            {questions.length} 道题目，听说直觉与字形记忆更上一层楼！
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={handleRestart}
              className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> 再玩一次
            </button>
            <button
              onClick={() => {
                sound.playTap();
                onNext();
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <span>进入第二阶段：翰墨手写测评</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================================================================
// 2. 子组件：第三阶段【偏旁积木】(RadicalBlockChallenge)
// =====================================================================
interface RadicalBlockChallengeProps {
  games: RadicalBlockGame[];
  onComplete?: () => void;
}

export const RadicalBlockChallenge: React.FC<RadicalBlockChallengeProps> = ({
  games,
  onComplete,
}) => {
  const { currentStoryId, markModuleCompleted, unlockNewWord } = useGameStore();
  const [radicalIndex, setRadicalIndex] = useState<number>(0);
  const [selectedPieces, setSelectedPieces] = useState<string[]>([]);
  const [radicalSuccess, setRadicalSuccess] = useState<boolean>(false);
  const [assembledHistory, setAssembledHistory] = useState<string[]>([]);

  const currentGame: RadicalBlockGame | undefined = games[radicalIndex] || games[0];

  useEffect(() => {
    if (currentGame) {
      speakChinese(`偏旁组字积木：请拼出读音为 ${currentGame.pinyin} 的汉字`);
    }
  }, [radicalIndex, currentGame]);

  const handleTogglePiece = (pieceId: string) => {
    if (!currentGame) return;
    sound.playCharClick();
    if (selectedPieces.includes(pieceId)) {
      setSelectedPieces(selectedPieces.filter((p) => p !== pieceId));
      setRadicalSuccess(false);
    } else {
      const newPieces = [...selectedPieces, pieceId];
      setSelectedPieces(newPieces);

      if (newPieces.length === currentGame.pieces.length) {
        sound.playSnap();
        setRadicalSuccess(true);
        sound.playFillSuccess();
        unlockNewWord();
        if (!assembledHistory.includes(currentGame.targetChar)) {
          setAssembledHistory([...assembledHistory, currentGame.targetChar]);
        }

        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (error) {
          console.warn('[UI Effect Error]:', error);
        }
      }
    }
  };

  const handleNextGame = () => {
    sound.playTap();
    if (radicalIndex + 1 < games.length) {
      setRadicalIndex((prev) => prev + 1);
      setSelectedPieces([]);
      setRadicalSuccess(false);
    } else {
      sound.playVictory();
      setRadicalSuccess(true);
      markModuleCompleted(currentStoryId, 'radical');
    }
  };

  if (!currentGame) return null;

  return (
    <div className="bg-white/95 border-2 border-amber-200 rounded-3xl p-5 sm:p-8 shadow-lg max-w-3xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b-2 border-amber-100 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
            偏旁组字关卡 {radicalIndex + 1} / {games.length}
          </span>
          <span className="text-xs text-stone-500 font-medium hidden sm:inline">
            像搭积木一样拼出汉字！
          </span>
        </div>
        <div className="text-xs font-bold text-stone-600">
          已拼成: {assembledHistory.length} 字
        </div>
      </div>

      {/* Goal Display */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2">
          <h3 className="text-xl sm:text-2xl font-bold text-stone-800">
            拼出读音为 <span className="text-red-700 font-mono">[{currentGame.pinyin}]</span> 的汉字
          </h3>
          <button
            onClick={() => {
              sound.playTap();
              speakChinese(currentGame.pinyin);
            }}
            className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full transition-colors cursor-pointer"
            title="播放发音"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-stone-500 mt-1">
          释义提示：{currentGame.meaning}
        </p>
      </div>

      {/* Target Character Assembly Workspace */}
      <div className="bg-gradient-to-b from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-8 mb-6 text-center shadow-inner relative flex flex-col items-center justify-center min-h-[220px]">
        {radicalSuccess ? (
          <div className="animate-in zoom-in-75 duration-300 flex flex-col items-center">
            <div className="w-28 h-28 tianzige rounded-3xl flex items-center justify-center font-calligraphy text-6xl font-black text-red-700 bg-amber-100/80 shadow-md border-2 border-red-500 mb-2">
              {currentGame.targetChar}
            </div>
            <div className="text-emerald-800 font-bold text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>积木组装成功！你拼成了“{currentGame.targetChar}”字！</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 tianzige rounded-3xl flex items-center justify-center font-calligraphy text-4xl font-black border-2 border-dashed border-stone-300 bg-white/70 mb-2">
              {selectedPieces.length > 0 ? (
                <div className="flex items-center gap-1 text-amber-800 font-calligraphy text-3xl font-bold">
                  {selectedPieces.map((pId) => {
                    const p = currentGame.pieces.find((x) => x.id === pId);
                    return <span key={pId}>{p?.text}</span>;
                  })}
                </div>
              ) : (
                <span className="text-stone-400 text-sm font-sans">点击下方部首</span>
              )}
            </div>
            <span className="text-xs text-stone-500">
              还需要拼入 {currentGame.pieces.length - selectedPieces.length} 个部件
            </span>
          </div>
        )}
      </div>

      {/* Pieces Selector */}
      <div className="space-y-3 mb-6 text-left">
        <div className="text-xs font-bold text-stone-600">可选部首积木卡片：</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currentGame.pieces.map((piece) => {
            const isSelected = selectedPieces.includes(piece.id);
            return (
              <button
                key={piece.id}
                onClick={() => handleTogglePiece(piece.id)}
                disabled={radicalSuccess}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'bg-red-700 text-white border-red-800 shadow-md scale-102 ring-2 ring-yellow-300'
                    : 'bg-white hover:bg-amber-50 border-amber-200 text-stone-800 shadow-sm'
                }`}
              >
                <div className="w-12 h-12 tianzige rounded-xl flex items-center justify-center font-calligraphy text-2xl font-black mb-1">
                  {piece.text}
                </div>
                <span
                  className={`text-xs font-bold ${
                    isSelected ? 'text-yellow-200' : 'text-amber-800'
                  }`}
                >
                  {piece.type === 'radical' ? '部首偏旁' : '基本字身'}
                </span>
                <span
                  className={`text-[10px] mt-0.5 ${
                    isSelected ? 'text-white/80' : 'text-stone-400'
                  }`}
                >
                  {piece.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cultural Lore Card on Success */}
      {radicalSuccess && (
        <div className="p-4 bg-amber-100/80 border border-amber-300 rounded-2xl mb-6 text-left animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950 mb-1">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>汉字偏旁文化解码：</span>
          </div>
          <p className="text-xs text-stone-700 leading-relaxed">
            {currentGame.culturalLore}
          </p>
        </div>
      )}

      {/* Bottom navigation buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={() => {
            sound.playTap();
            setSelectedPieces([]);
            setRadicalSuccess(false);
          }}
          className="w-full sm:w-auto px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> 清空重新拼装
        </button>

        {radicalIndex + 1 < games.length ? (
          <button
            onClick={handleNextGame}
            disabled={!radicalSuccess}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              radicalSuccess
                ? 'bg-red-600 hover:bg-red-700 text-white active:scale-95'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <span>下一关组字</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              sound.playVictory();
              if (onComplete) {
                onComplete();
              }
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>通关！前往作文造句工坊</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// =====================================================================
// 3. 主组件：ChallengeSection
// =====================================================================
export const ChallengeSection: React.FC<ChallengeSectionProps> = ({
  onGoToWriting,
}) => {
  const {
    currentStoryId,
    lastUnlockedWord,
    lastUnlockTimestamp,
    markModuleCompleted,
    getModuleCompletion,
  } = useGameStore();

  const canvasBurstRef = useRef<CanvasParticleBurstRef | null>(null);
  const prevUnlockTimestampRef = useRef<number>(lastUnlockTimestamp);

  // 动态获取当前选定绘本专属演武题库数据 (听音选字、翰墨范字、偏旁积木)
  const challengeData = useMemo<StoryChallengeData>(() => {
    return getStoryChallengeData(currentStoryId);
  }, [currentStoryId]);

  const {
    soundQuestions,
    radicalGames,
    storyTitle,
    storyShortTitle,
  } = challengeData;

  // 三阶段递进式关卡状态：'lobby' (大厅) | 'listening' (听音选字) | 'writing' (翰墨测评) | 'radicals' (偏旁积木)
  const [currentSubStage, setCurrentSubStage] = useState<ChallengeSubStage>('lobby');

  // 当前手写测评目标字符
  const [currentTargetChar, setCurrentTargetChar] = useState<string>(() => {
    return (
      challengeData.writingTargets?.[0]?.char ||
      challengeData.targetCharacters?.[0]?.char ||
      '春'
    );
  });

  // 同步故事切换与字符选择
  useEffect(() => {
    const firstChar =
      challengeData.writingTargets?.[0]?.char ||
      challengeData.targetCharacters?.[0]?.char ||
      '春';
    setCurrentTargetChar(firstChar);
  }, [challengeData]);

  // 监听 gameStore 解锁特效
  useEffect(() => {
    if (lastUnlockTimestamp > 0 && lastUnlockTimestamp !== prevUnlockTimestampRef.current) {
      prevUnlockTimestampRef.current = lastUnlockTimestamp;
      if (lastUnlockedWord) {
        canvasBurstRef.current?.triggerBurst({
          intensity: 'wordUnlock',
          trajectory: 'combo',
          characterGlyph: lastUnlockedWord,
          x: 0.5,
          y: 0.45,
          count: 95,
        });

        const timer = setTimeout(() => {
          canvasBurstRef.current?.triggerBurst({
            intensity: 'wordUnlock',
            trajectory: 'spiral',
            x: 0.5,
            y: 0.48,
            count: 55,
          });
        }, 140);

        return () => clearTimeout(timer);
      }
    }
  }, [lastUnlockTimestamp, lastUnlockedWord]);

  // 模块持久化状态获取
  const soundCompletion = getModuleCompletion(currentStoryId, 'sound');
  const writingCompletion =
    getModuleCompletion(currentStoryId, 'handwriting') ||
    getModuleCompletion(currentStoryId, 'writing');
  const radicalCompletion = getModuleCompletion(currentStoryId, 'radical');

  // 3D 关卡卡片配置 (三阶完整呈现)
  const challengeCards = [
    {
      id: 'listening' as const,
      tag: '第一阶 · 听说直觉',
      title: '听音选字',
      subtitle: '普通话标准读音与字形映射',
      desc: '打破“会说不会认”壁垒，聆听纯正普通话发音，在形似字与同音字中一锤定音！',
      icon: <Headphones className="w-8 h-8 text-amber-300 drop-shadow-md" />,
      themeGradient: 'from-red-800 via-rose-700 to-amber-900',
      badgeBorder: 'border-yellow-400/50',
      progress: soundCompletion?.completed
        ? '已通关 (满分)'
        : soundCompletion?.score
        ? `挑战得分: ${soundCompletion.score}分`
        : `未开始 (共${soundQuestions.length}题)`,
      actionText: '开启辨音试炼',
      bgGlow: 'rgba(220, 38, 38, 0.25)',
    },
    {
      id: 'writing' as const,
      tag: '第二阶 · 笔墨神韵',
      title: '翰墨手写测评',
      subtitle: '米字格摹写与智能间架评分',
      desc: '提笔悬腕，在米字格中真实临摹字形！通过重心、布白、笔韵与偏差多维智能测评，规范笔顺。',
      icon: <Brush className="w-8 h-8 text-yellow-300 drop-shadow-md" />,
      themeGradient: 'from-amber-800 via-yellow-700 to-stone-900',
      badgeBorder: 'border-amber-400/50',
      progress: writingCompletion?.completed
        ? `已通关 (${writingCompletion.score ?? 90}分)`
        : '待测评 (全套范字)',
      actionText: '开启翰墨测评',
      bgGlow: 'rgba(245, 158, 11, 0.25)',
    },
    {
      id: 'radicals' as const,
      tag: '第三阶 · 构字规律',
      title: '偏旁积木',
      subtitle: '形声会意与汉字结构拼装',
      desc: '像搭乐高积木一样拆解汉字！左形右声、上形下声，透彻掌握汉字骨架与部首规律。',
      icon: <Layers className="w-8 h-8 text-amber-300 drop-shadow-md" />,
      themeGradient: 'from-stone-800 via-orange-800 to-amber-950',
      badgeBorder: 'border-amber-400/50',
      progress: radicalCompletion?.completed
        ? '已通关 (全套拼合)'
        : `未开始 (共${radicalGames.length}关)`,
      actionText: '开启积木拼字',
      bgGlow: 'rgba(217, 119, 6, 0.25)',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto text-left">
      {/* LOBBY VIEW: 3 LARGE 3D RELIEF CARDS */}
      {currentSubStage === 'lobby' ? (
        <div className="space-y-6">
          {/* Lobby Hero Header */}
          <div className="bg-gradient-to-r from-red-950/90 via-amber-950/80 to-stone-950/90 border-2 border-yellow-500/40 rounded-3xl p-6 sm:p-8 text-center text-white shadow-xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-black border border-yellow-400/40 mb-3 shadow-inner">
                <Sparkles className="w-3.5 h-3.5" />
                <span>修业演武 · 《{storyShortTitle || storyTitle}》专属试炼</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-festive font-black text-amber-100 tracking-wide mb-2">
                选择你的演武试炼关卡
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed">
                听音辨形、翰墨手写、部首积木三大递进维度，循序渐进击溃识字写字难题！
              </p>
            </div>
          </div>

          {/* 3 Large 3D Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {challengeCards.map((card, idx) => (
              <motion.div
                key={card.id}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                onClick={() => {
                  sound.playCharClick();
                  setCurrentSubStage(card.id);
                }}
                className={`group relative rounded-3xl bg-gradient-to-b ${card.themeGradient} p-6 sm:p-7 text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] border-2 ${card.badgeBorder} flex flex-col justify-between cursor-pointer overflow-hidden transition-all`}
                style={{
                  boxShadow: `0 14px 35px ${card.bgGlow}`,
                }}
              >
                {/* 3D Gloss Highlight */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-t-3xl" />
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

                <div>
                  {/* Top Badge & Stage Tag */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-black/35 border border-white/20 text-yellow-300 backdrop-blur-xs">
                      {card.tag}
                    </span>
                    <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-amber-200">
                      0{idx + 1}
                    </span>
                  </div>

                  {/* Card Icon & Titles */}
                  <div className="flex items-center gap-3.5 mb-3">
                    <div className="p-3 rounded-2xl bg-black/30 border border-white/20 shadow-inner group-hover:scale-110 transition-transform">
                      {card.icon}
                    </div>
                    <div>
                      <h3 className="font-calligraphy font-black text-xl text-yellow-100 group-hover:text-yellow-200 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-[11px] text-amber-200/90 font-medium">{card.subtitle}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-stone-200/85 leading-relaxed mb-4">
                    {card.desc}
                  </p>
                </div>

                {/* Bottom Progress & Action Button */}
                <div className="space-y-3 pt-3 border-t border-white/15">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-300">当前进度:</span>
                    <span className="font-bold text-yellow-300">{card.progress}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playTap();
                      setCurrentSubStage(card.id);
                    }}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-red-950 font-black text-sm shadow-[0_6px_16px_rgba(234,179,8,0.4)] border border-yellow-200 flex items-center justify-center gap-2 group-hover:shadow-[0_8px_22px_rgba(234,179,8,0.6)] active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{card.actionText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* DETAIL CHALLENGE VIEW WITH UNIVERSAL RETURN BAR & 3 SUBSTAGES */
        <div className="space-y-5">
          {/* Universal Return to Lobby Bar */}
          <div className="bg-white/90 border-2 border-amber-200 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-sm">
            <button
              onClick={() => {
                sound.playTap();
                setCurrentSubStage('lobby');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs sm:text-sm border border-amber-300 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>返回挑战大厅</span>
            </button>

            {/* Quick Switch Tabs inside Challenge */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  sound.playTap();
                  setCurrentSubStage('listening');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentSubStage === 'listening'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-amber-100'
                }`}
              >
                1. 听音选字
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  setCurrentSubStage('writing');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentSubStage === 'writing'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-amber-100'
                }`}
              >
                2. 翰墨测评
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  setCurrentSubStage('radicals');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  currentSubStage === 'radicals'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-stone-600 hover:bg-amber-100'
                }`}
              >
                3. 偏旁积木
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 三阶段递进式关卡结构 (按照修复方案结构化嵌入)             */}
          {/* ========================================================= */}

          {currentSubStage === 'listening' && (
            <SoundMatchChallenge
              questions={challengeData.soundQuestions}
              onNext={() => setCurrentSubStage('writing')}
            />
          )}

          {currentSubStage === 'writing' && (
            <div className="space-y-4">
              {/* 演武字帖选字导航条 (绘本专属多字快速切换) */}
              {challengeData.writingTargets && challengeData.writingTargets.length > 1 && (
                <div className="bg-white/95 border-2 border-amber-200 rounded-2xl px-4 py-3 shadow-xs flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
                      <Brush className="w-3.5 h-3.5 text-red-700" />
                      <span>演武字帖范字：</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {challengeData.writingTargets.map((item) => (
                        <button
                          key={item.char}
                          onClick={() => {
                            sound.playTap();
                            setCurrentTargetChar(item.char);
                          }}
                          className={`w-9 h-9 rounded-xl font-calligraphy text-lg font-black transition-all cursor-pointer ${
                            currentTargetChar === item.char
                              ? 'bg-red-700 text-white shadow-md scale-105 border-2 border-yellow-300'
                              : 'bg-amber-50 hover:bg-amber-100 text-stone-800 border border-amber-200'
                          }`}
                          title={`临摹「${item.char}」字`}
                        >
                          {item.char}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-stone-500 font-medium">
                    规范临摹并通过智能测评，即可解锁第三阶段「偏旁积木」
                  </div>
                </div>
              )}

              {/* 第二阶段：翰墨手写测评组件 */}
              <CanvasHandwritingPad
                targetChar={currentTargetChar}
                onComplete={(score) => {
                  // 记录手写评分并解锁偏旁积木
                  markModuleCompleted(currentStoryId, 'handwriting', { score });
                  setCurrentSubStage('radicals');
                }}
              />
            </div>
          )}

          {currentSubStage === 'radicals' && (
            <RadicalBlockChallenge
              games={challengeData.radicalGames}
              onComplete={onGoToWriting}
            />
          )}
        </div>
      )}

      {/* 基于 Canvas 的粒子喷发特效组件 */}
      <CanvasParticleBurst ref={canvasBurstRef} />
    </div>
  );
};
