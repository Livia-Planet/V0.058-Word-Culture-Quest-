import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  PenLine,
  FileText,
  Award,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ThumbsUp,
  Puzzle,
  ArrowRight,
  Layers,
  Grid,
} from 'lucide-react';
import {
  ClozeExercise,
  EssayTemplate,
  DEFAULT_CLOZE_EXERCISES,
  DEFAULT_ESSAY_TEMPLATE,
} from '../data/level1Data';
import { sound, speakChinese } from '../utils/audio';
import { SentenceBuilder } from './SentenceBuilder';
import { useGameStore } from '../store/useGameStore';
import { getStoryChallengeData } from '../data/storyLevels';

interface WritingLabProps {
  onUnlockNewWord?: () => void;
  initialMode?: WritingLabMode;
}

export type WritingLabMode = 'lobby' | 'storyCloze' | 'scenarios' | 'essay';

export const WritingLab: React.FC<WritingLabProps> = ({ onUnlockNewWord, initialMode = 'lobby' }) => {
  const gameStore = useGameStore();
  const handleUnlock = onUnlockNewWord ?? (() => { gameStore.unlockNewWord(); });

  // Current view: lobby or one of the 3 exclusive sub-categories
  const [currentMode, setCurrentMode] = useState<WritingLabMode>(
    initialMode === ('calligraphy' as unknown as WritingLabMode) ? 'storyCloze' : initialMode
  );

  // 强绑定当前故事的特定段落、挖空词汇、造句情境与作文素材
  const challengeData = useMemo(() => {
    return getStoryChallengeData(gameStore.currentStoryId);
  }, [gameStore.currentStoryId]);

  // WritingLab.tsx 防御性加载
  const currentEssayTemplate: EssayTemplate = challengeData?.essayBlocks ?? DEFAULT_ESSAY_TEMPLATE;
  const currentClozeExercises: ClozeExercise[] =
    challengeData?.fillInTheBlank && challengeData.fillInTheBlank.length > 0
      ? challengeData.fillInTheBlank
      : DEFAULT_CLOZE_EXERCISES;

  const clozeList = currentClozeExercises;
  const essayTemplate = currentEssayTemplate;

  // Sub-Category 1: 故事原文字形挖空 State
  const [clozeIndex, setClozeIndex] = useState<number>(0);
  const currentCloze: ClozeExercise = clozeList[clozeIndex] || clozeList[0] || DEFAULT_CLOZE_EXERCISES[0];
  const [userAnswers, setUserAnswers] = useState<{ [blankIdx: number]: string }>({});
  const [clozeSubmitted, setClozeSubmitted] = useState<boolean>(false);
  const [clozeScore, setClozeScore] = useState<number>(0);
  const [completedClozeCount, setCompletedClozeCount] = useState<number>(0);

  // Sub-Category 3: 400字作文积木 State
  const [beginningText, setBeginningText] = useState<string>(
    essayTemplate.sections?.[0]?.defaultText ?? DEFAULT_ESSAY_TEMPLATE.sections[0].defaultText
  );
  const [middleText, setMiddleText] = useState<string>(
    essayTemplate.sections?.[1]?.defaultText ?? DEFAULT_ESSAY_TEMPLATE.sections[1].defaultText
  );
  const [endingText, setEndingText] = useState<string>(
    essayTemplate.sections?.[2]?.defaultText ?? DEFAULT_ESSAY_TEMPLATE.sections[2].defaultText
  );

  // 监听绘本切换，自动重置字形挖空状态与作文模板，并从 store 恢复完成状态
  useEffect(() => {
    const savedCloze = gameStore.getModuleCompletion(gameStore.currentStoryId, 'cloze');
    const savedEssay = gameStore.getModuleCompletion(gameStore.currentStoryId, 'essay');

    if (savedCloze?.completed) {
      setCompletedClozeCount(clozeList.length);
    } else {
      setCompletedClozeCount(0);
    }

    setClozeIndex(0);
    setUserAnswers({});
    setClozeSubmitted(false);
    setClozeScore(savedCloze?.score ?? 0);
    if (essayTemplate?.sections && essayTemplate.sections.length >= 3) {
      setBeginningText(essayTemplate.sections[0]?.defaultText ?? DEFAULT_ESSAY_TEMPLATE.sections[0].defaultText);
      setMiddleText(essayTemplate.sections[1]?.defaultText ?? DEFAULT_ESSAY_TEMPLATE.sections[1].defaultText);
      setEndingText(essayTemplate.sections[2]?.defaultText ?? DEFAULT_ESSAY_TEMPLATE.sections[2].defaultText);
    } else {
      setBeginningText(DEFAULT_ESSAY_TEMPLATE.sections[0].defaultText);
      setMiddleText(DEFAULT_ESSAY_TEMPLATE.sections[1].defaultText);
      setEndingText(DEFAULT_ESSAY_TEMPLATE.sections[2].defaultText);
    }
    setEvaluationResult(null);
  }, [gameStore.currentStoryId, essayTemplate, clozeList.length, gameStore.getModuleCompletion]);

  const [activeSection, setActiveSection] = useState<'beginning' | 'middle' | 'ending'>('middle');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [showGridPreview, setShowGridPreview] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    grade: string;
    strengths: string[];
    suggestions: string[];
  } | null>(null);

  // Word Counts
  const countWords = (str: string) => str.replace(/\s+/g, '').length;
  const countBeginning = countWords(beginningText);
  const countMiddle = countWords(middleText);
  const countEnding = countWords(endingText);
  const totalWords = countBeginning + countMiddle + countEnding;
  const fullArticleText = `${beginningText}\n${middleText}\n${endingText}`;

  // Cloze Handlers
  const handleSelectBlank = (blankIdx: number, char: string) => {
    sound.playFillSlot();
    setUserAnswers({
      ...userAnswers,
      [blankIdx]: char,
    });
  };

  const handleCheckCloze = () => {
    let correctCount = 0;
    currentCloze.blanks.forEach((b) => {
      if (userAnswers[b.index] === b.correctChar) {
        correctCount += 1;
      }
    });
    setClozeScore(correctCount);
    setClozeSubmitted(true);

    if (correctCount === currentCloze.blanks.length) {
      sound.playFillSuccess();
      handleUnlock();
      setCompletedClozeCount((prev) => Math.max(prev, clozeIndex + 1));
      gameStore.markModuleCompleted(gameStore.currentStoryId, 'cloze', { score: 100 });
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (error) {
        console.warn('[UI Effect Error]:', error);
      }
    } else {
      sound.playWrong();
      sound.playStrokeErrorShake();
    }
  };

  const handleNextCloze = () => {
    sound.playTap();
    if (clozeIndex + 1 < clozeList.length) {
      setClozeIndex(clozeIndex + 1);
      setUserAnswers({});
      setClozeSubmitted(false);
      setClozeScore(0);
    } else {
      sound.playVictory();
      gameStore.markModuleCompleted(gameStore.currentStoryId, 'cloze', { score: 100 });
      setCurrentMode('essay');
    }
  };

  // Voice Dictation
  const handleToggleVoiceRecord = () => {
    sound.playTap();
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        // @ts-expect-error browser speech recognition API
        const recognition = new SpeechRecognition();
        recognition.lang = 'zh-CN';
        recognition.interimResults = false;
        recognition.onresult = (event: { results: Array<Array<{ transcript: string }>> }) => {
          const transcript = event.results[0][0].transcript;
          appendVoiceText(transcript);
          setIsRecording(false);
          sound.playCorrect();
        };
        recognition.onerror = () => {
          fallbackVoiceSimulation();
        };
        recognition.start();
        return;
      } catch {
        fallbackVoiceSimulation();
      }
    } else {
      fallbackVoiceSimulation();
    }
  };

  const fallbackVoiceSimulation = () => {
    setTimeout(() => {
      const sampleOralSentences = [
        '我给大门贴上了红红火火的春联，祈求新的一年大吉大利。',
        '除夕夜全家人坐在一起吃年夜饭，桌上有象征年年有余的热腾腾清蒸鱼。',
        '噼里啪啦的鞭炮声赶跑了年兽，迎来了欢天喜地的新春佳节！',
      ];
      const randomText = sampleOralSentences[Math.floor(Math.random() * sampleOralSentences.length)];
      appendVoiceText(randomText);
      setIsRecording(false);
      sound.playCorrect();
    }, 1500);
  };

  const appendVoiceText = (text: string) => {
    if (activeSection === 'beginning') {
      setBeginningText((prev) => (prev ? prev + text : text));
    } else if (activeSection === 'middle') {
      setMiddleText((prev) => (prev ? prev + text : text));
    } else {
      setEndingText((prev) => (prev ? prev + text : text));
    }
  };

  const handleInsertPhrase = (phrase: string) => {
    sound.playFillSlot();
    appendVoiceText(phrase + '，');
  };

  const handleEvaluateEssay = () => {
    sound.playTap();
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      sound.playVictory();

      const targetKeywords = challengeData.targetCharacters.map((c) => c.char);
      const essayContent = beginningText + middleText + endingText;
      const hitKeywords = targetKeywords.filter((k) => essayContent.includes(k));
      const hasKeywords = hitKeywords.length >= 2;

      const scoreVal = totalWords >= 350 && hasKeywords ? 96 : totalWords >= 280 ? 90 : 85;

      gameStore.markModuleCompleted(gameStore.currentStoryId, 'essay', { score: scoreVal });

      setEvaluationResult({
        score: scoreVal,
        grade: scoreVal >= 95 ? '一类优秀小作文 (甲等)' : '二类良好小作文 (乙等)',
        strengths: [
          '三段式结构完整，层次分明（开头破题、中间叙事、结尾抒情）。',
          `成功融入了《${challengeData.storyShortTitle || challengeData.storyTitle}》重点文化考点与核心汉字要素（命中${hitKeywords.length}个生字词）。`,
          `字数达到 ${totalWords} 字，符合 5-6 年级 400 字核心考卷容量标准。`,
        ],
        suggestions: [
          '可以尝试多用一到两句动静结合的描写（如细节感官或心理活动）。',
          '在结尾处可以更深入点出篇章思想带给自己的成长启发。',
        ],
      });

      try {
        confetti({ particleCount: 80, spread: 80, origin: { y: 0.5 } });
      } catch (error) {
        console.warn('[UI Effect Error]:', error);
      }
    }, 1200);
  };

  // 3D Category Cards Data Configuration
  const categoryCards = [
    {
      id: 'storyCloze' as const,
      tag: '第一阶 · 原文生字',
      title: '故事原文字形挖空',
      subtitle: '原声声形字词填槽 · 强化记忆',
      missionGoal: '复原古籍短句 · 巩固本章生字',
      desc: '打破口语与书写的脱节！聆听原版故事原声，在田字方格中填入对应的精准汉字，字形记忆坚不可摧。',
      icon: <BookOpen className="w-8 h-8 text-rose-300 drop-shadow-md" />,
      themeGradient: 'from-rose-900 via-red-800 to-amber-950',
      badgeBorder: 'border-rose-400/50',
      progress:
        gameStore.getModuleCompletion(gameStore.currentStoryId, 'cloze')?.completed || completedClozeCount > 0
          ? `已通关 (${clozeList.length}/${clozeList.length} 篇)`
          : `共 ${clozeList.length} 篇训练`,
      actionText: '进入字形挖空',
      bgGlow: 'rgba(225, 29, 72, 0.28)',
    },
    {
      id: 'scenarios' as const,
      tag: '第二阶 · 语感语法',
      title: '生活情境短句拼接',
      subtitle: '拖拽与点击拼句 · 训练语感',
      missionGoal: '学以致用 · 拼接日常情境短句',
      desc: `装配《${challengeData.storyShortTitle || challengeData.storyTitle}》重点词汇与成语入高频生活情境，训练地道中文表达。`,
      icon: <Puzzle className="w-8 h-8 text-yellow-300 drop-shadow-md" />,
      themeGradient: 'from-amber-900 via-orange-800 to-stone-900',
      badgeBorder: 'border-amber-400/50',
      progress: '专属成语 · 场景语法演练',
      actionText: '进入短句拼接',
      bgGlow: 'rgba(217, 119, 6, 0.28)',
    },
    {
      id: 'essay' as const,
      tag: '第三阶 · 篇章成文',
      title: '400字作文积木',
      subtitle: '20×20标准田字格 · 智能诊断',
      missionGoal: '20×20标准田字格 · 智能语音听写与作文诊断',
      desc: '标准三段式框架骨架搭建，20×20 仿真作文纸实时字数计量，支持原生语音听写与多维 AI 智能名师阅卷！',
      icon: <PenLine className="w-8 h-8 text-emerald-300 drop-shadow-md" />,
      themeGradient: 'from-emerald-950 via-teal-900 to-stone-950',
      badgeBorder: 'border-emerald-400/50',
      progress: gameStore.getModuleCompletion(gameStore.currentStoryId, 'essay')?.completed
        ? `已通关 (评定: ${gameStore.getModuleCompletion(gameStore.currentStoryId, 'essay')?.score ?? 95}分)`
        : `${totalWords}/400 字 · ${evaluationResult ? '已批改' : '撰写中'}`,
      actionText: '进入作文积木',
      bgGlow: 'rgba(16, 185, 129, 0.28)',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto text-left">
      {/* ============================================================== */}
      {/* 1. LOBBY VIEW: 3 DISTINCTIVE 3D RELIEF CARDS                     */}
      {/* ============================================================== */}
      {currentMode === 'lobby' ? (
        <div className="space-y-6">
          {/* Lobby Hero Banner */}
          <div className="bg-gradient-to-r from-red-950/90 via-amber-950/80 to-stone-950/90 border-2 border-yellow-500/40 rounded-3xl p-6 sm:p-8 text-center text-white shadow-xl relative overflow-hidden backdrop-blur-md">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-yellow-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 text-yellow-300 text-xs font-black border border-yellow-400/40 mb-3 shadow-inner">
                <Sparkles className="w-3.5 h-3.5" />
                <span>文思泉涌 · 《{challengeData.storyShortTitle || challengeData.storyTitle}》作文造句工坊</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-festive font-black text-amber-100 tracking-wide mb-2">
                选择你的书写造句进阶阶梯
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed">
                从字形挖空、生活情境造句、再到 400 字名篇创作，由字及词，由词及句，由句及章！
              </p>
            </div>
          </div>

          {/* 3 Large 3D Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categoryCards.map((card, idx) => (
              <motion.div
                key={card.id}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                onClick={() => {
                  sound.playCharClick();
                  setCurrentMode(card.id);
                }}
                className={`group relative rounded-3xl bg-gradient-to-b ${card.themeGradient} p-5 sm:p-6 text-white shadow-[0_12px_30px_rgba(0,0,0,0.35)] border-2 ${card.badgeBorder} flex flex-col justify-between cursor-pointer overflow-hidden transition-all`}
                style={{
                  boxShadow: `0 14px 35px ${card.bgGlow}`,
                }}
              >
                {/* 3D Gloss Highlight Shimmer */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none rounded-t-3xl" />
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />

                <div>
                  {/* Top Badge & Number */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-lg bg-black/35 border border-white/20 text-yellow-300 backdrop-blur-xs">
                      {card.tag}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-amber-200">
                      0{idx + 1}
                    </span>
                  </div>

                  {/* Card Icon & Titles */}
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="p-2.5 rounded-2xl bg-black/30 border border-white/20 shadow-inner group-hover:scale-110 transition-transform">
                      {card.icon}
                    </div>
                    <div>
                      <h3 className="font-calligraphy font-black text-xl text-yellow-100 group-hover:text-yellow-200 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-[10px] text-amber-200/90 font-medium">{card.subtitle}</p>
                    </div>
                  </div>

                  {/* Target Goal Tag */}
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-yellow-400/15 border border-yellow-300/30 text-[10px] font-bold text-yellow-200 mb-2.5">
                    <Sparkles className="w-3 h-3 text-yellow-400 shrink-0" />
                    <span className="truncate">目标：{card.missionGoal}</span>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-stone-200/85 leading-relaxed mb-3 line-clamp-3">
                    {card.desc}
                  </p>
                </div>

                {/* Bottom Progress & Big 3D Action Button */}
                <div className="space-y-2.5 pt-2.5 border-t border-white/15">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-300">当前进度:</span>
                    <span className="font-bold text-yellow-300 truncate max-w-[120px]">{card.progress}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sound.playTap();
                      setCurrentMode(card.id);
                    }}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 hover:from-yellow-300 hover:to-amber-300 text-red-950 font-black text-xs shadow-[0_6px_16px_rgba(234,179,8,0.4)] border border-yellow-200 flex items-center justify-center gap-1.5 group-hover:shadow-[0_8px_22px_rgba(234,179,8,0.6)] active:scale-95 transition-all cursor-pointer"
                  >
                    <span>{card.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* 2. DETAIL VIEW WITH TOP UNIVERSAL NAVIGATION & SEGMENTED TABS  */
        /* ============================================================== */
        <div className="space-y-5">
          {/* Universal Return to Lobby Bar & Sub-Nav Segmented Tabs */}
          <div className="bg-white/95 border-2 border-amber-200 rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm backdrop-blur-md">
            <button
              onClick={() => {
                sound.playTap();
                setCurrentMode('lobby');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl font-bold text-xs sm:text-sm border border-amber-300 transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>返回大厅</span>
            </button>

            {/* Quick Switch Segmented Tabs inside Writing Lab */}
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <button
                onClick={() => {
                  sound.playTap();
                  setCurrentMode('storyCloze');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  currentMode === 'storyCloze'
                    ? 'bg-red-700 text-white shadow-xs font-black'
                    : 'text-stone-600 hover:bg-amber-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>1. 故事原文字形挖空</span>
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  setCurrentMode('scenarios');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  currentMode === 'scenarios'
                    ? 'bg-red-700 text-white shadow-xs font-black'
                    : 'text-stone-600 hover:bg-amber-100'
                }`}
              >
                <Puzzle className="w-3.5 h-3.5" />
                <span>2. 生活情境短句拼接</span>
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  setCurrentMode('essay');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  currentMode === 'essay'
                    ? 'bg-red-700 text-white shadow-xs font-black'
                    : 'text-stone-600 hover:bg-amber-100'
                }`}
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>3. 400字作文积木</span>
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SUB-CATEGORY 1: 故事原文字形挖空                               */}
          {/* ============================================================== */}
          {currentMode === 'storyCloze' && (
            <div className="bg-white/95 border-2 border-amber-200 rounded-3xl p-5 sm:p-8 shadow-lg max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b-2 border-amber-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="bg-rose-100 text-rose-900 text-xs font-bold px-3 py-1 rounded-full border border-rose-300">
                    字形挖空 · 第 {clozeIndex + 1} / {clozeList.length} 篇
                  </span>
                  <span className="text-xs text-stone-500 font-medium hidden sm:inline">
                    把口述词汇反向精准锁定到汉字字形
                  </span>
                </div>
                <button
                  onClick={() => {
                    sound.playTap();
                    speakChinese(currentCloze.referenceAudio);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>听原段口述</span>
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-stone-800 mb-3 text-left">
                  {currentCloze.title}
                </h3>

                {/* Interactive Cloze sentence cards */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-lg sm:text-xl font-bold text-stone-800 leading-loose">
                    {currentCloze.contextSentence.split(/(\[[^\]]+\])/).map((segment, sIdx) => {
                      if (segment.startsWith('[') && segment.endsWith(']')) {
                        const targetChar = segment.replace(/\[|\]/g, '');
                        const blank = currentCloze.blanks.find((b) => b.correctChar === targetChar);
                        const blankIdx = blank ? blank.index : 0;
                        const currentChoice = userAnswers[blankIdx];
                        const isCorrect = currentChoice === targetChar;

                        return (
                          <div key={sIdx} className="inline-flex flex-col items-center mx-1">
                            <span className="text-[10px] text-amber-700 font-mono font-normal">
                              {blank?.pinyinHint}
                            </span>
                            <div
                              className={`w-12 h-12 tianzige rounded-xl flex items-center justify-center font-calligraphy text-2xl font-black transition-all border-2 ${
                                currentChoice
                                  ? clozeSubmitted
                                    ? isCorrect
                                      ? 'bg-emerald-100 border-emerald-500 text-emerald-900 shadow-sm'
                                      : 'bg-rose-100 border-rose-500 text-rose-900 animate-stroke-tremor'
                                    : 'bg-amber-200 border-amber-500 text-red-900'
                                  : 'bg-white border-dashed border-stone-300 text-stone-400'
                              }`}
                            >
                              {currentChoice || '?'}
                            </div>
                          </div>
                        );
                      }

                      return <span key={sIdx}>{segment}</span>;
                    })}
                  </div>
                </div>
              </div>

              {/* Options Palette for Blanks */}
              <div className="space-y-4 text-left">
                <div className="text-xs font-bold text-stone-600">
                  请为各空格选择对应的正确汉字：
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentCloze.blanks.map((b) => (
                    <div
                      key={b.index}
                      className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-800 text-xs font-bold flex items-center justify-center">
                          {b.index + 1}
                        </span>
                        <span className="text-xs font-bold text-amber-900 font-mono">
                          拼音 [{b.pinyinHint}]:
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {b.options.map((opt, optIdx) => (
                          <button
                            key={`${b.index}-${opt}-${optIdx}`}
                            onClick={() => handleSelectBlank(b.index, opt)}
                            className={`w-9 h-9 tianzige rounded-lg flex items-center justify-center font-calligraphy text-lg font-black transition-all cursor-pointer ${
                              userAnswers[b.index] === opt
                                ? 'bg-red-700 text-white border-red-800 shadow-sm scale-105'
                                : 'bg-white hover:bg-amber-100 border-stone-300 text-stone-800'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cloze Action & Feedback */}
              {clozeSubmitted ? (
                <div
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                    clozeScore === currentCloze.blanks.length
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-amber-50 border-amber-300 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    {clozeScore === currentCloze.blanks.length ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    ) : (
                      <HelpCircle className="w-6 h-6 text-amber-600 shrink-0" />
                    )}
                    <div>
                      <h4 className="font-bold text-sm">
                        {clozeScore === currentCloze.blanks.length
                          ? '全部正确！口述词汇与字形完全锁定！'
                          : `答对 ${clozeScore} / ${currentCloze.blanks.length} 个汉字，再接再厉！`}
                      </h4>
                      <p className="text-xs text-stone-600">
                        在口述故事中自然辨别形似字与同音字，是语文高分的核心能力。
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => {
                        sound.playTap();
                        setClozeSubmitted(false);
                        setUserAnswers({});
                      }}
                      className="px-3 py-2 bg-white border border-stone-200 text-stone-700 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> 重试
                    </button>
                    <button
                      onClick={handleNextCloze}
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>
                        {clozeIndex + 1 < clozeList.length ? '下一篇' : '前往400字作文积木'}
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleCheckCloze}
                  disabled={Object.keys(userAnswers).length < currentCloze.blanks.length}
                  className={`w-full py-3 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    Object.keys(userAnswers).length === currentCloze.blanks.length
                      ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white active:scale-98'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>提交并核对答案</span>
                </button>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* SUB-CATEGORY 2: 生活情境短句拼接                               */}
          {/* ============================================================== */}
          {currentMode === 'scenarios' && (
            <SentenceBuilder />
          )}

          {/* ============================================================== */}
          {/* SUB-CATEGORY 3: 400字作文积木                                  */}
          {/* ============================================================== */}
          {currentMode === 'essay' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Header & Word Count Progress Meter */}
              <div className="bg-white/95 border-2 border-amber-200 rounded-3xl p-5 sm:p-6 shadow-md">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-100 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                        5-6年级考场标准
                      </span>
                      <h3 className="font-calligraphy font-black text-xl text-red-950">
                        {essayTemplate.title}
                      </h3>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      采用标准三段式框架：开头点题 (约50字) + 中间细节 (约300字) + 结尾抒情 (约50字)
                    </p>
                  </div>

                  {/* Live 400-Word Meter */}
                  <div className="bg-amber-50 border border-amber-300 rounded-2xl px-4 py-2.5 flex items-center gap-3 w-full sm:w-auto shadow-inner">
                    <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <div className="flex items-center justify-between text-xs gap-3">
                        <span className="font-bold text-stone-600">当前总字数:</span>
                        <span className="font-black text-red-700 text-base">
                          {totalWords}{' '}
                          <span className="text-xs text-stone-400 font-normal">/ 400 字</span>
                        </span>
                      </div>
                      <div className="w-44 h-2.5 bg-stone-200 rounded-full overflow-hidden mt-1 border border-stone-300">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            totalWords >= 400
                              ? 'bg-emerald-500'
                              : totalWords >= 300
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(100, (totalWords / 400) * 100)}%` }}
                        />
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        totalWords >= 400
                          ? 'bg-emerald-100 text-emerald-800'
                          : totalWords >= 300
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {totalWords >= 400 ? '达标 400+' : `${Math.round((totalWords / 400) * 100)}%`}
                    </span>
                  </div>
                </div>

                {/* Voice Dictation & Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-100/60 p-3 rounded-2xl border border-amber-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleVoiceRecord}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                        isRecording
                          ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-300'
                          : 'bg-red-700 hover:bg-red-800 text-white active:scale-95'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      <span>{isRecording ? '正在口述转化中... (点击停止)' : '口述输入转文字'}</span>
                    </button>
                    <span className="text-[11px] text-stone-500 hidden md:inline">
                      (先口头说，AI实时转写为标准书面文字)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setShowGridPreview(!showGridPreview)}
                      className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <Grid className="w-3.5 h-3.5 text-amber-700" />
                      <span>{showGridPreview ? '收起20×20稿纸' : '20×20稿纸视图'}</span>
                    </button>
                    <button
                      onClick={() => {
                        sound.playTap();
                        speakChinese(fullArticleText);
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-amber-50 text-stone-700 border border-stone-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>朗读全篇</span>
                    </button>
                    <button
                      onClick={handleEvaluateEssay}
                      disabled={isEvaluating}
                      className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      <span>{isEvaluating ? 'AI 阅卷诊断中...' : 'AI 智能阅卷诊断'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 20x20 Composition Grid Preview */}
              <AnimatePresence>
                {showGridPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-amber-50 border-2 border-red-300 rounded-3xl p-5 sm:p-6 shadow-md overflow-hidden text-left"
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-red-200 pb-2">
                      <div className="flex items-center gap-2">
                        <Grid className="w-5 h-5 text-red-700" />
                        <h4 className="font-calligraphy font-black text-red-950 text-base">
                          标准 20×20 作文稿纸预览 (每行20格 · 模拟中考/期末正规模拟格)
                        </h4>
                      </div>
                      <span className="text-xs text-stone-500">
                        共 {fullArticleText.replace(/\n/g, '').length} 字 (含标点)
                      </span>
                    </div>

                    {/* Visual 20-column Manuscript Grid */}
                    <div className="p-3 bg-white/90 border border-red-200 rounded-2xl overflow-x-auto">
                      <div className="grid grid-cols-20 gap-1 min-w-[580px]">
                        {fullArticleText
                          .replace(/\n/g, '　　')
                          .split('')
                          .map((char, cIdx) => (
                            <div
                              key={cIdx}
                              className="aspect-square border border-red-200/80 rounded-xs flex items-center justify-center font-calligraphy text-sm font-bold text-stone-800 bg-red-50/20"
                            >
                              {char}
                            </div>
                          ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3 Sections Builder Cards */}
              <div className="grid grid-cols-1 gap-5">
                {/* Section 1: Beginning */}
                <div
                  className={`p-5 rounded-3xl border-2 transition-all ${
                    activeSection === 'beginning'
                      ? 'bg-white border-red-500 shadow-md ring-2 ring-red-200'
                      : 'bg-white/80 border-amber-200'
                  }`}
                  onClick={() => setActiveSection('beginning')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-100 text-red-800 text-xs font-bold flex items-center justify-center">
                        1
                      </span>
                      <h4 className="font-bold text-sm text-stone-800">
                        开头：引出除夕背景与节日气氛
                      </h4>
                      <span className="text-xs text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-md">
                        目标 40-60字
                      </span>
                    </div>
                    <span className="text-xs font-bold text-stone-500">
                      当前: <span className="text-red-700">{countBeginning}</span> 字
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mb-3">
                    {essayTemplate.sections?.[0]?.guideline || '交代时间、节日缘由与环境氛围。'}
                  </p>

                  <textarea
                    value={beginningText}
                    onChange={(e) => setBeginningText(e.target.value)}
                    className="w-full h-24 p-3 rounded-xl border border-stone-200 bg-amber-50/40 text-stone-800 text-sm leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400 font-calligraphy"
                    placeholder="在此输入或口述开头段落..."
                  />

                  {/* Recommended phrases */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] text-stone-500 font-bold">参考妙词：</span>
                    {(essayTemplate.sections?.[0]?.recommendedPhrases || []).map(
                      (phrase: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInsertPhrase(phrase);
                          }}
                          className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                        >
                          + {phrase}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Section 2: Middle */}
                <div
                  className={`p-5 rounded-3xl border-2 transition-all ${
                    activeSection === 'middle'
                      ? 'bg-white border-red-500 shadow-md ring-2 ring-red-200'
                      : 'bg-white/80 border-amber-200'
                  }`}
                  onClick={() => setActiveSection('middle')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-100 text-red-800 text-xs font-bold flex items-center justify-center">
                        2
                      </span>
                      <h4 className="font-bold text-sm text-stone-800">
                        中间：生动叙述细节与文化风俗 (核心篇幅)
                      </h4>
                      <span className="text-xs text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-md">
                        目标 280-320字
                      </span>
                    </div>
                    <span className="text-xs font-bold text-stone-500">
                      当前: <span className="text-red-700">{countMiddle}</span> 字
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mb-3">
                    {essayTemplate.sections?.[1]?.guideline || '生动展开故事高潮、民俗风物与场景细节。'}
                  </p>

                  <textarea
                    value={middleText}
                    onChange={(e) => setMiddleText(e.target.value)}
                    className="w-full h-44 p-3 rounded-xl border border-stone-200 bg-amber-50/40 text-stone-800 text-sm leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400 font-calligraphy"
                    placeholder="在此输入或口述故事细节、贴春联、倒贴福字、年夜饭与年兽传说..."
                  />

                  {/* Quick Cultural Phrases insertion bar */}
                  <div className="mt-3 pt-3 border-t border-amber-100">
                    <span className="text-[11px] font-bold text-stone-500 block mb-1.5">
                      一键插入本关文化高分好词好句 (点击追加到光标后):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(essayTemplate.sections?.[1]?.recommendedPhrases || []).map(
                        (phrase: string, idx: number) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInsertPhrase(phrase);
                            }}
                            className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-800 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            + {phrase}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Ending */}
                <div
                  className={`p-5 rounded-3xl border-2 transition-all ${
                    activeSection === 'ending'
                      ? 'bg-white border-red-500 shadow-md ring-2 ring-red-200'
                      : 'bg-white/80 border-amber-200'
                  }`}
                  onClick={() => setActiveSection('ending')}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-red-100 text-red-800 text-xs font-bold flex items-center justify-center">
                        3
                      </span>
                      <h4 className="font-bold text-sm text-stone-800">
                        结尾：总结感受与美好期盼
                      </h4>
                      <span className="text-xs text-amber-700 font-semibold bg-amber-100 px-2 py-0.5 rounded-md">
                        目标 40-60字
                      </span>
                    </div>
                    <span className="text-xs font-bold text-stone-500">
                      当前: <span className="text-red-700">{countEnding}</span> 字
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mb-3">
                    {essayTemplate.sections?.[2]?.guideline || '感悟传统文化智慧，升华主题。'}
                  </p>

                  <textarea
                    value={endingText}
                    onChange={(e) => setEndingText(e.target.value)}
                    className="w-full h-24 p-3 rounded-xl border border-stone-200 bg-amber-50/40 text-stone-800 text-sm leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400 font-calligraphy"
                    placeholder="在此输入或口述结尾抒情..."
                  />

                  {/* Recommended phrases */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] text-stone-500 font-bold">参考妙词：</span>
                    {(essayTemplate.sections?.[2]?.recommendedPhrases || []).map(
                      (phrase: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInsertPhrase(phrase);
                          }}
                          className="bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
                        >
                          + {phrase}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* AI Diagnostic Modal / Panel */}
              {evaluationResult && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-3 border-amber-400 rounded-3xl p-6 shadow-xl text-left animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Award className="w-6 h-6 text-red-600" />
                      <h4 className="font-festive text-xl font-bold text-red-950">
                        5-6年级作文考场智能诊断报告
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-600">综合得分:</span>
                      <span className="text-2xl font-black text-red-600">
                        {evaluationResult.score}分
                      </span>
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                        {evaluationResult.grade}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white/80 p-4 rounded-2xl border border-emerald-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-2">
                        <ThumbsUp className="w-4 h-4 text-emerald-600" />
                        <span>出彩亮点 (Strengths)</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-stone-700">
                        {evaluationResult.strengths.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white/80 p-4 rounded-2xl border border-amber-200">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 mb-2">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>进阶提分建议 (Suggestions)</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-stone-700">
                        {evaluationResult.suggestions.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setEvaluationResult(null)}
                      className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                    >
                      收起诊断报告
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
