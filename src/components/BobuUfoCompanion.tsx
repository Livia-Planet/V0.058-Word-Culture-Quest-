import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Volume2,
  RotateCcw,
  Lightbulb,
  ChevronRight,
  Flame,
  Award,
  Flag,
  BookOpen,
  Eye,
  Smile,
} from 'lucide-react';
import { sound, speakChinese, stopChineseSpeech } from '../utils/audio';
import {
  HANZI_CULTURAL_TRIVIA_LIST,
  HanziCulturalTriviaItem,
  getTriviaForStory,
} from '../data/hanziCulturalTrivia';

import bobuUfoImg from '../assets/images/bobu_ufo_real_1790328209338.jpg';

// Authentic Bobu in UFO asset bundled via Vite with fallback
const BOBU_UFO_IMG = bobuUfoImg || '/assets/images/bobu_ufo_real_1790328209338.jpg';

export interface GuoxueWisdomItem {
  id: string;
  quote: string;
  source: string;
  meaning: string;
  praise: string;
}

export const GUOXUE_WISDOM_QUOTES: GuoxueWisdomItem[] = [
  {
    id: 'gx-1',
    quote: '敏而好学，不耻下问。',
    source: '《论语·公冶长》',
    meaning: '天资聪敏又勤奋好学，不以向他人请教为羞耻。',
    praise: '哇！你眼疾手快抓到我啦！带着这份聪敏与好奇去读古籍，一定能成为汉字小状元！🌟',
  },
  {
    id: 'gx-2',
    quote: '学而时习之，不亦说乎？',
    source: '《论语·学而》',
    meaning: '学到的知识经常温习实践，岂不是非常令人愉悦吗？',
    praise: '被你发现啦！今天找到了我，也别忘了翻开一篇典籍复习学过的字词哦！📖✨',
  },
  {
    id: 'gx-3',
    quote: '千里之行，始于足下。',
    source: '《老子·道德经》',
    meaning: '千里的远行，也是从迈出脚下的第一步开始累积的。',
    praise: '捉迷藏第一名！每天多掌握一个常用字，就是向着博学迈出一大步！👣💖',
  },
  {
    id: 'gx-4',
    quote: '长风破浪会有时，直挂云帆济沧海。',
    source: '唐·李白《行路难》',
    meaning: '坚信总有一天能乘长风破万里浪，高挂云帆勇渡浩瀚大海。',
    praise: '哈哈被抓到啦！你就像破浪的小船长一样机灵，快选一本故事扬帆起航吧！⛵🎉',
  },
  {
    id: 'gx-5',
    quote: '读书破万卷，下笔如有神。',
    source: '唐·杜甫《奉赠韦左丞丈》',
    meaning: '博览群书、融会贯通，写起文章来就能如有神助。',
    praise: '抓到我啦！给你一朵来自宇宙深处的墨香灵气！多读好书，脑海里灵光闪烁！🎨💫',
  },
  {
    id: 'gx-6',
    quote: '知之者不如好之者，好之者不如乐之者。',
    source: '《论语·雍也》',
    meaning: '懂得它的人不如爱好它的人，爱好它的人不如以此为乐的人。',
    praise: '找得太准啦！带着快乐的心情去阅读探索，每一页都充满奇妙魔法！🏮🐰',
  },
  {
    id: 'gx-7',
    quote: '博学之，审问之，慎思之，明辨之，笃行之。',
    source: '《礼记·中庸》',
    meaning: '广泛学习，详细询问，周密思考，明晰辨别，切实实行。',
    praise: '捉迷藏眼神真亮！学习汉字就像闯关寻宝，一步步扎实前行最棒啦！🏆✨',
  },
  {
    id: 'gx-8',
    quote: '天行健，君子以自强不息。',
    source: '《周易·乾卦》',
    meaning: '天道运行刚健强盛，有志向的人也应当发愤图强、永不停息。',
    praise: '捉迷藏太机智啦！像小飞碟一样元气满满，每天坚持识字打卡，你是最棒的小君子！☀️🛸',
  },
  {
    id: 'gx-9',
    quote: '非学无以广才，非志无以成学。',
    source: '三国·诸葛亮《诫子书》',
    meaning: '不勤奋学习就无法增长才干，没有坚定的志向就无法成就学业。',
    praise: '哇！找到我啦！立下宏大的探索志向，一本本好故事都将成为你的智囊宝库！📜💡',
  },
  {
    id: 'gx-10',
    quote: '业精于勤，荒于嬉；行成于思，毁于随。',
    source: '唐·韩愈《进学解》',
    meaning: '学业靠勤奋才能精深，因玩乐而荒废；德行靠深思才能形成，因随波逐流而败坏。',
    praise: '哈哈你太敏锐啦！把玩乐的好奇心用在探索汉字上，你就是今日的博学大赢家！🏅✨',
  },
  {
    id: 'gx-11',
    quote: '问渠那得清如许？为有源头活水来。',
    source: '宋·朱熹《观书有感》',
    meaning: '要问那池塘水为何如此清澈明净？因为源头有源源不断的清甜活水流来。',
    praise: '被你抓个正着！每天阅读新故事、认识新汉字，就是在给聪明小脑袋注入源头活水！🌊💧',
  },
  {
    id: 'gx-12',
    quote: '少年易老学难成，一寸光阴不可轻。',
    source: '宋·朱熹《偶成》',
    meaning: '青春时光容易流逝而学问难以一蹴而就，每一寸光阴都极其宝贵不可轻忽。',
    praise: '眼神真好！珍惜每一次翻开书卷的时光，汉字王国的金钥匙已经在你手里啦！🔑⌛',
  },
];

interface BobuUfoCompanionProps {
  className?: string;
  currentStoryId?: string;
  streakDays?: number;
  collectedCount?: number;
  totalTarget?: number;
  isTodayCheckedIn?: boolean;
}

export const BobuUfoCompanion: React.FC<BobuUfoCompanionProps> = ({
  className = '',
  currentStoryId = 'story-1',
  streakDays = 3,
  collectedCount = 18,
  totalTarget = 85,
  isTodayCheckedIn = true,
}) => {
  const [tapCount, setTapCount] = useState<number>(0);
  const [showBubble, setShowBubble] = useState<boolean>(false);
  const [bubbleMode, setBubbleMode] = useState<'trivia' | 'encouragement' | 'guoxue'>('trivia');
  const [currentEncouragement, setCurrentEncouragement] = useState<string>('');
  const [activeGuoxue, setActiveGuoxue] = useState<GuoxueWisdomItem>(GUOXUE_WISDOM_QUOTES[0]);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [isSurprised, setIsSurprised] = useState<boolean>(false);
  const [isCloaked, setIsCloaked] = useState<boolean>(false);
  const [hasImageLoaded, setHasImageLoaded] = useState<boolean>(true);

  // Requirement: Bobu 捉迷藏 (Hide & Seek) logic
  // 当用户一段时间未点击屏幕时，Bobu 会自动飘到屏幕边缘尝试藏起身体
  const [isHiding, setIsHiding] = useState<boolean>(false);
  const idleHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hanzi Cultural Trivia state
  const triviaList = getTriviaForStory(currentStoryId);
  const [activeTriviaIndex, setActiveTriviaIndex] = useState<number>(0);
  const activeTrivia: HanziCulturalTriviaItem =
    triviaList[activeTriviaIndex % triviaList.length] || triviaList[0];

  // Typewriter effect state
  const [typedText, setTypedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Read aloud & Auto-fade timer state
  // Requirement: 冷知识在朗读完后消失；如果不被朗读，则随时间渐隐
  const [isReadingAloud, setIsReadingAloud] = useState<boolean>(false);
  const [fadeCountdown, setFadeCountdown] = useState<number>(18); // 18s relaxed reading auto-fade
  const [isUserHovering, setIsUserHovering] = useState<boolean>(false);
  const [isPinned, setIsPinned] = useState<boolean>(false); // Allow user to pin bubble so it doesn't auto-fade
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset auto-fade countdown to 18s
  const resetAutoFade = () => {
    setFadeCountdown(18);
  };

  // Reset hide-and-seek inactivity timer (14s without screen touch/click)
  const resetIdleHideTimer = () => {
    if (idleHideTimerRef.current) clearTimeout(idleHideTimerRef.current);
    if (!isHiding) {
      idleHideTimerRef.current = setTimeout(() => {
        setIsHiding(true);
        sound.playSnap();
      }, 14000);
    }
  };

  // Monitor screen clicks/touches to reset hide timer
  useEffect(() => {
    resetIdleHideTimer();
    const handleScreenActivity = () => {
      resetIdleHideTimer();
    };

    window.addEventListener('pointerdown', handleScreenActivity);
    window.addEventListener('keydown', handleScreenActivity);
    return () => {
      if (idleHideTimerRef.current) clearTimeout(idleHideTimerRef.current);
      window.removeEventListener('pointerdown', handleScreenActivity);
      window.removeEventListener('keydown', handleScreenActivity);
    };
  }, [isHiding]);

  // Generate dynamic encouragement quote based on learner's achievements
  const getEncouragementQuote = (streak: number, count: number): string => {
    if (streak >= 7) {
      const quotes = [
        `哇！连续研读${streak}天啦！七星连珠，小旗子为你用力挥舞，真是最棒的汉字小状元！🌟`,
        `太神啦！${streak}天连胜达成！魔法书院的星光都为你点亮啦，继续保持冲刺吧！🚀`,
      ];
      return quotes[tapCount % quotes.length];
    }
    if (streak >= 3) {
      const quotes = [
        `连胜${streak}天达成！你坚持阅读的样子比天上的北斗星还要耀眼！加油！🚩`,
        `真棒！已经坚持${streak}天啦！小飞碟接收到了满满的智慧灵气，咻——！✨`,
      ];
      return quotes[tapCount % quotes.length];
    }
    if (streak >= 1) {
      const quotes = [
        `太好啦！连续${streak}天学习，连胜小旗帜为你高高飘扬！今天也超有元气哦！🚩`,
        `为你点赞！坚持就是超级大超能力，我们一起把整座魔法书架读完吧！🎉`,
      ];
      return quotes[tapCount % quotes.length];
    }
    if (count >= 20) {
      const quotes = [
        `天哪！你已经掌握了${count}个高频汉字啦！满腹诗书气自华，快抽一本故事继续冒险吧！📚`,
        `太厉害啦！收集了这么多汉字法宝，今天也来点亮新的金勋章吧！🏅`,
      ];
      return quotes[tapCount % quotes.length];
    }
    const defaultQuotes = [
      `嗨！我是乘着魔法飞碟的Bobu！今天准备好开启新的汉字奇妙之旅了吗？我们一起出发！🐰🛸`,
      `一寸光阴一寸金，今天读一本小故事，就能点燃闪亮亮的连胜小火苗哦！🔥`,
    ];
    return defaultQuotes[tapCount % defaultQuotes.length];
  };

  // Typewriter animation trigger (Crisp 16ms typing speed with immediate full text available)
  useEffect(() => {
    if (!showBubble || bubbleMode !== 'trivia') {
      if (typeTimerRef.current) clearInterval(typeTimerRef.current);
      return;
    }

    const fullTrivia = activeTrivia.trivia;
    setTypedText('');
    setIsTyping(true);
    resetAutoFade();

    if (typeTimerRef.current) clearInterval(typeTimerRef.current);

    let charIdx = 0;
    typeTimerRef.current = setInterval(() => {
      charIdx++;
      if (charIdx <= fullTrivia.length) {
        setTypedText(fullTrivia.slice(0, charIdx));
        if (charIdx % 8 === 0) {
          sound.playSnap();
        }
      } else {
        setIsTyping(false);
        if (typeTimerRef.current) clearInterval(typeTimerRef.current);
      }
    }, 16);

    return () => {
      if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    };
  }, [activeTriviaIndex, showBubble, bubbleMode, currentStoryId]);

  // Auto-fade timer effect:
  // Runs when trivia bubble is open, not typing, not reading aloud, user is not hovering, and not pinned
  useEffect(() => {
    if (!showBubble || bubbleMode !== 'trivia' || isReadingAloud || isTyping || isUserHovering || isPinned) {
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
      return;
    }

    fadeTimerRef.current = setInterval(() => {
      setFadeCountdown((prev) => {
        if (prev <= 1) {
          if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
          setShowBubble(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
    };
  }, [showBubble, bubbleMode, isReadingAloud, isTyping, isUserHovering, isPinned]);

  // Click to reveal all typed text instantly
  const handleSkipTyping = () => {
    resetAutoFade();
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    setTypedText(activeTrivia.trivia);
    setIsTyping(false);
  };

  // Replay typewriter animation
  const handleReplayTypewriter = () => {
    sound.playTap();
    resetAutoFade();
    const fullTrivia = activeTrivia.trivia;
    setTypedText('');
    setIsTyping(true);
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);

    let charIdx = 0;
    typeTimerRef.current = setInterval(() => {
      charIdx++;
      if (charIdx <= fullTrivia.length) {
        setTypedText(fullTrivia.slice(0, charIdx));
        if (charIdx % 6 === 0) sound.playSnap();
      } else {
        setIsTyping(false);
        if (typeTimerRef.current) clearInterval(typeTimerRef.current);
      }
    }, 26);
  };

  // Requirement: 冷知识在朗读完后消失 (Auto-dismiss upon finishing read aloud)
  const handleReadAloud = async () => {
    sound.playReward();
    setIsReadingAloud(true);
    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);

    const speechText = `${activeTrivia.title}。${activeTrivia.trivia}`;
    try {
      await speakChinese(speechText, 0.98);
      // Wait a gentle moment (750ms) after speech ends, then auto-dismiss the trivia bubble!
      setTimeout(() => {
        sound.playTap();
        setShowBubble(false);
        setIsReadingAloud(false);
      }, 750);
    } catch (error) {
      console.warn('[UI Effect Error]:', error);
      setIsReadingAloud(false);
    }
  };

  // Next trivia item
  const handleNextTrivia = () => {
    sound.playTap();
    stopChineseSpeech();
    resetAutoFade();
    setActiveTriviaIndex((prev) => (prev + 1) % triviaList.length);
  };

  // Requirement: 点击她后会以惊喜表情弹出一段今日随机的国学鼓励语 (When hiding and found, or clicked)
  const handleTapBobu = () => {
    sound.playReward();
    const nextCount = tapCount + 1;
    setTapCount(nextCount);

    // If was hiding, trigger surprise celebration & Guoxue quote
    if (isHiding) {
      setIsHiding(false);
      setIsSurprised(true);
      setIsSpinning(true);

      const randomIdx = Math.floor(Math.random() * GUOXUE_WISDOM_QUOTES.length);
      const selectedGuoxue = GUOXUE_WISDOM_QUOTES[randomIdx];
      setActiveGuoxue(selectedGuoxue);
      setBubbleMode('guoxue');
      setShowBubble(true);

      // Vocalize surprise and classical encouragement quote
      const speech = `哇！被你找到啦！${selectedGuoxue.quote}。${selectedGuoxue.meaning}。${selectedGuoxue.praise}`;
      speakChinese(speech, 1.02);

      setTimeout(() => {
        setIsSpinning(false);
        setIsSurprised(false);
      }, 1000);
      return;
    }

    // Normal tap: encourage quote or spin
    setIsSpinning(true);
    const quote = getEncouragementQuote(streakDays, collectedCount);
    setCurrentEncouragement(quote);
    setBubbleMode('encouragement');
    setShowBubble(true);

    // Speak Bobu's encouraging motivational quote
    speakChinese(quote, 1.05);

    setTimeout(() => {
      setIsSpinning(false);
    }, 850);
  };

  // Switch to next random Guoxue wisdom quote
  const handleNextGuoxueQuote = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playTap();
    stopChineseSpeech();
    let nextIdx = Math.floor(Math.random() * GUOXUE_WISDOM_QUOTES.length);
    if (GUOXUE_WISDOM_QUOTES[nextIdx]?.id === activeGuoxue.id) {
      nextIdx = (nextIdx + 1) % GUOXUE_WISDOM_QUOTES.length;
    }
    const nextQuote = GUOXUE_WISDOM_QUOTES[nextIdx];
    setActiveGuoxue(nextQuote);
    const speech = `${nextQuote.quote}。${nextQuote.meaning}。${nextQuote.praise}`;
    speakChinese(speech, 1.02);
  };

  // Manual Trigger for Hide & Seek (捉迷藏快捷开关)
  const handleToggleHideAndSeek = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playTap();
    setIsHiding((prev) => !prev);
    setShowBubble(false);
    stopChineseSpeech();
  };

  // Switch to Hanzi Trivia from other modes
  const handleOpenTrivia = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playTap();
    stopChineseSpeech();
    setBubbleMode('trivia');
    setShowBubble(true);
    resetAutoFade();
  };

  // Calculate bubble opacity based on fade countdown
  const bubbleFadeOpacity =
    bubbleMode === 'trivia' && !isReadingAloud && !isTyping && !isUserHovering && !isPinned
      ? fadeCountdown <= 4
        ? Math.max(0.4, fadeCountdown / 4)
        : 1
      : 1;

  return (
    <div className={`relative z-40 select-none ${className}`}>
      {/* Bobu 随笔 & 鼓励语录 & 国学惊喜浮动气泡 */}
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.92 }}
            animate={{ opacity: bubbleFadeOpacity, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 24 }}
            style={{ opacity: bubbleFadeOpacity }}
            onMouseEnter={() => {
              setIsUserHovering(true);
              resetAutoFade();
            }}
            onMouseLeave={() => setIsUserHovering(false)}
            onTouchStart={() => {
              setIsUserHovering(true);
              resetAutoFade();
            }}
            onTouchEnd={() => {
              setTimeout(() => setIsUserHovering(false), 2000);
            }}
            className="absolute top-full mt-2.5 right-0 sm:right-1 w-[335px] sm:w-[410px] max-w-[calc(100vw-24px)] bg-gradient-to-br from-amber-50/98 via-yellow-50/98 to-orange-50/98 text-red-950 p-3.5 sm:p-4 rounded-3xl border-3 border-amber-400 shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-50 text-left pointer-events-auto backdrop-blur-md transition-opacity duration-300 max-h-[82vh] overflow-y-auto"
          >
            {/* Header: Mode Switcher & Close */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-amber-300/60 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-red-950 flex items-center justify-center text-xs font-black shadow-xs">
                  {bubbleMode === 'guoxue' ? '🎉' : '🛸'}
                </span>
                <span className="font-festive font-black text-xs sm:text-sm text-amber-950 tracking-wide">
                  {bubbleMode === 'guoxue'
                    ? '捉迷藏发现！今日国学格言'
                    : bubbleMode === 'encouragement'
                    ? 'Bobu 连胜勉励'
                    : 'Bobu 随笔 · 汉字文化冷知识'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {bubbleMode !== 'trivia' ? (
                  <button
                    onClick={handleOpenTrivia}
                    className="flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-950 text-[10px] font-bold border border-amber-400/60 cursor-pointer active:scale-95 transition-all"
                    title="探索当前汉字文化冷知识"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-700" />
                    <span>看冷知识</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-amber-800 font-bold bg-amber-200/60 px-1.5 py-0.5 rounded-md truncate max-w-[130px]">
                    {activeTrivia.funTag}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    stopChineseSpeech();
                    setShowBubble(false);
                  }}
                  className="text-stone-400 hover:text-red-700 hover:bg-red-50 p-1 rounded-full cursor-pointer transition-colors"
                  title="收起气泡"
                  aria-label="关闭气泡"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mode 1: Guoxue Wisdom Surprise (捉迷藏成功后弹出的国学鼓励语) */}
            {bubbleMode === 'guoxue' && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 p-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-yellow-100 shadow-md">
                  <span className="text-2xl animate-bounce">🎊</span>
                  <div>
                    <span className="text-xs font-festive font-black flex items-center gap-1">
                      <span>哇！抓到我啦！神眼小状元！</span>
                      <Sparkles className="w-3 h-3 text-yellow-200 animate-spin" />
                    </span>
                    <p className="text-[10px] opacity-90">
                      今日国学启蒙 · 藏在书架里的智慧箴言
                    </p>
                  </div>
                </div>

                {/* Calligraphic Quote Card */}
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-amber-100/90 to-yellow-50/90 border-2 border-amber-400/80 shadow-inner">
                  <div className="flex items-center justify-between text-[10px] text-amber-800 font-bold mb-1 border-b border-amber-300/50 pb-1">
                    <span className="flex items-center gap-1">
                      <span>📜</span>
                      <span>经典格言</span>
                    </span>
                    <span className="text-red-900 font-festive">{activeGuoxue.source}</span>
                  </div>
                  <h4 className="font-festive font-black text-base sm:text-lg text-red-950 tracking-wider text-center py-1">
                    “{activeGuoxue.quote}”
                  </h4>
                  <p className="text-[11px] text-stone-700 leading-relaxed font-medium mt-1">
                    <strong className="text-amber-900 font-bold">释义：</strong>
                    {activeGuoxue.meaning}
                  </p>
                  <div className="mt-2 pt-1.5 border-t border-amber-300/60 text-xs font-bold text-red-900 font-festive leading-snug">
                    🐰 Bobu说：{activeGuoxue.praise}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-1 flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        speakChinese(
                          `哇！被你找到啦！${activeGuoxue.quote}。${activeGuoxue.meaning}。${activeGuoxue.praise}`,
                          1.02
                        )
                      }
                      className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-red-950 text-xs font-black font-festive shadow-xs active:scale-95 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>再听一次</span>
                    </button>
                    <button
                      onClick={handleNextGuoxueQuote}
                      className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-950 text-xs font-bold border border-amber-400/60 shadow-xs active:scale-95 cursor-pointer"
                      title="随机换下一句国学箴言"
                    >
                      <span>🎲</span>
                      <span>换一句</span>
                    </button>
                  </div>
                  <button
                    onClick={handleOpenTrivia}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-900 text-amber-200 hover:bg-stone-800 text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                  >
                    <span>看字词冷知识</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Mode 2: Encouragement Quote (日常点击触发的鼓励语录) */}
            {bubbleMode === 'encouragement' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-amber-100/70 border border-amber-300/70">
                  <span className="text-xl animate-bounce">🚩</span>
                  <div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-red-900">
                      <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      <span>连续打卡 {streakDays} 天 · 小旗帜为你飘扬</span>
                    </div>
                    <p className="text-[10px] text-stone-600 font-medium">
                      已掌握 {collectedCount} / {totalTarget} 个核心字 · 飞碟满载智慧能量
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-100/80 border border-amber-300/80 shadow-inner">
                  <p className="text-xs sm:text-sm font-bold leading-relaxed text-red-950 font-festive tracking-wide">
                    “{currentEncouragement}”
                  </p>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <button
                    onClick={() => speakChinese(currentEncouragement, 1.05)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-red-950 text-xs font-black font-festive shadow-xs active:scale-95 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>再听一次</span>
                  </button>
                  <button
                    onClick={handleOpenTrivia}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-900 text-amber-200 hover:bg-stone-800 text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                  >
                    <span>学习汉字冷知识</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Mode 3: Hanzi Cultural Trivia (打字机冷知识：朗读完消失，未朗读随时间渐隐) */}
            {bubbleMode === 'trivia' && (
              <div>
                {/* Character Tabs: 当前故事关联汉字快捷标签 */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 mb-2 scrollbar-none">
                  <span className="text-[10px] text-amber-800 font-bold shrink-0 flex items-center gap-0.5">
                    <Lightbulb className="w-3 h-3 text-amber-600" />
                    <span>当前所学:</span>
                  </span>
                  {triviaList.map((item, idx) => {
                    const isActive = idx === activeTriviaIndex % triviaList.length;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          sound.playTap();
                          stopChineseSpeech();
                          resetAutoFade();
                          setActiveTriviaIndex(idx);
                        }}
                        className={`px-2 py-0.5 rounded-full text-xs font-black font-festive transition-all shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-red-600 to-amber-600 text-yellow-100 shadow-sm scale-105 ring-1.5 ring-yellow-400'
                            : 'bg-amber-100/80 text-amber-900 hover:bg-amber-200 border border-amber-300/50'
                        }`}
                      >
                        <span>【{item.char}】</span>
                        <span className="text-[9px] font-normal ml-0.5 opacity-90">{item.pinyin}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Title & Glyph */}
                <div className="mb-2">
                  <h4 className="font-festive font-black text-xs sm:text-sm text-red-950 leading-snug">
                    {activeTrivia.title}
                  </h4>
                  {activeTrivia.oracleGlyphDesc && (
                    <span className="text-[10px] text-amber-700 font-medium">
                      {activeTrivia.oracleGlyphDesc}
                    </span>
                  )}
                </div>

                {/* Typewriter Core Content Card */}
                <div
                  onClick={handleSkipTyping}
                  className="relative p-3 rounded-2xl bg-amber-100/70 border border-amber-300/90 shadow-inner cursor-pointer group hover:bg-amber-100/90 transition-colors"
                  title={isTyping ? '点击立即显示全部文字' : '完整冷知识已呈现'}
                >
                  <p className="text-xs sm:text-[13px] font-bold leading-relaxed text-stone-800 tracking-wide select-text whitespace-pre-wrap break-words min-h-[4.5rem]">
                    {typedText}
                    {isTyping && (
                      <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-amber-600 animate-pulse align-middle" />
                    )}
                  </p>

                  {/* Status Hint & Fast Full-text action */}
                  <div className="mt-2 flex items-center justify-between text-[10px] text-amber-800/80 border-t border-amber-300/40 pt-1.5">
                    <span className="flex items-center gap-1 font-medium truncate max-w-[200px]">
                      <span>💡</span>
                      <span>{activeTrivia.ancientMeaning}</span>
                    </span>
                    {isTyping ? (
                      <span className="text-[9px] text-amber-800 font-bold bg-amber-200/90 px-1.5 py-0.5 rounded-sm animate-pulse shrink-0 ml-1">
                        点击跳过打字 · 显示全文 ⚡
                      </span>
                    ) : (
                      <span className="text-[9px] text-emerald-800 font-bold shrink-0 ml-1">
                        ✓ 完整冷知识已呈现
                      </span>
                    )}
                  </div>
                </div>

                {/* Requirement: 未被朗读则随时间渐隐进度指示 (可常显固定) */}
                {!isReadingAloud && !isTyping && !isPinned && (
                  <div className="mt-1.5 px-1 flex items-center justify-between text-[9px] text-amber-700/80">
                    <span className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>未朗读随时间渐隐 ({fadeCountdown}s) · 触碰暂停</span>
                    </span>
                    <div className="w-18 h-1.5 bg-amber-200/80 rounded-full overflow-hidden border border-amber-300/70">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-1000"
                        style={{ width: `${(fadeCountdown / 18) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                {isPinned && (
                  <div className="mt-1.5 px-1 text-[9px] text-amber-900 font-bold flex items-center gap-1">
                    <span>📌</span>
                    <span>已锁定常显 · 随心研读不限时</span>
                  </div>
                )}

                {/* Footer Actions: 语音朗读 (读完自动消失) / 全文 / 重新打字 / 下一字 */}
                <div className="mt-2.5 pt-2 border-t border-amber-300/60 flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleReadAloud}
                      disabled={isReadingAloud}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black font-festive shadow-xs active:scale-95 transition-all cursor-pointer ${
                        isReadingAloud
                          ? 'bg-amber-300 text-stone-700 opacity-80 cursor-wait'
                          : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 text-red-950'
                      }`}
                      title="朗读这段汉字冷知识（朗读完后气泡将自动收起）"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${isReadingAloud ? 'animate-bounce text-red-700' : ''}`} />
                      <span>{isReadingAloud ? '朗读中...' : '朗读'}</span>
                    </button>
                    {isTyping && (
                      <button
                        onClick={handleSkipTyping}
                        className="px-2 py-1 rounded-xl bg-amber-200/80 hover:bg-amber-300 text-amber-950 text-xs font-bold border border-amber-400/50 shadow-xs active:scale-95 transition-all cursor-pointer"
                        title="立即完整呈现全部冷知识文字"
                      >
                        <span>✨ 全文</span>
                      </button>
                    )}
                    <button
                      onClick={handleReplayTypewriter}
                      className="p-1 rounded-xl text-amber-800 hover:bg-amber-200/60 active:scale-95 transition-all cursor-pointer"
                      title="重新打字播放"
                      aria-label="重新打字"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        sound.playTap();
                        setIsPinned((prev) => !prev);
                      }}
                      className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold border shadow-xs active:scale-95 transition-all cursor-pointer ${
                        isPinned
                          ? 'bg-amber-400 text-red-950 border-amber-500'
                          : 'bg-amber-100/70 text-amber-800 hover:bg-amber-200 border-amber-300/50'
                      }`}
                      title={isPinned ? '已固定常显（点击解除）' : '点击固定常显（不自动渐隐）'}
                    >
                      <span>{isPinned ? '📌 已常显' : '📌 固定'}</span>
                    </button>
                  </div>

                  <button
                    onClick={handleNextTrivia}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-900 text-amber-200 hover:text-yellow-100 hover:bg-stone-800 text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                    title="探索下一个汉字背后的冷知识"
                  >
                    <span>下一字</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Bubble Beak pointing UP to Bobu */}
            <div className="absolute bottom-full right-8 sm:right-12 -mb-1 w-3.5 h-3.5 bg-amber-50 border-t-3 border-l-3 border-amber-400 rotate-45 z-20 pointer-events-none" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating UFO Entity with Hide & Seek Edge Drift + Surprise Pop-out + Achievement Micro-Actions */}
      <motion.div
        drag={!isHiding}
        dragConstraints={{ left: -280, right: 280, top: -120, bottom: 220 }}
        dragElastic={0.15}
        whileDrag={{ scale: 1.14, cursor: 'grabbing', opacity: 1 }}
        whileHover={{ scale: 1.08, opacity: 1 }}
        animate={
          isSpinning
            ? {
                rotate: [0, 360],
                y: [-4, -22, -4],
                scale: [1, 1.18, 1],
                opacity: 1,
                transition: { duration: 0.85, ease: 'easeOut', type: 'tween' },
              }
            : isSurprised
            ? {
                scale: [0.85, 1.35, 1],
                rotate: [0, -22, 22, -10, 10, 0],
                y: [0, -32, 0],
                x: [0, -8, 8, 0],
                opacity: 1,
                transition: { duration: 0.85, ease: 'easeOut', type: 'tween' },
              }
            : isHiding
            ? {
                // Requirement: 自动飘到屏幕边缘尝试藏起身体 (Peek-a-boo Hiding Motion at Edge)
                x: [55, 88, 58],
                y: [-24, -36, -24],
                rotate: [15, 22, 15],
                opacity: [0.55, 0.88, 0.55],
                transition: {
                  duration: 3.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  type: 'tween',
                },
              }
            : isCloaked
            ? {
                y: [0, -14, 4, -10, 0],
                x: [0, 18, -12, 10, 0],
                rotate: [0, 3, -3, 2, 0],
                opacity: [0.2, 0.45, 0.15, 0.35, 0.2],
                transition: { duration: 7, repeat: Infinity, ease: 'easeInOut', type: 'tween' },
              }
            : streakDays >= 1
            ? {
                // 连胜欢庆闲置微动作：轻快微浮沉与欢欣摇摆 (Celebratory Rhythmic Bobbing & Sway)
                y: [0, -18, 6, -12, 0],
                x: [0, 20, -16, 12, 0],
                rotate: [0, 5, -5, 3, 0],
                opacity: [0.45, 0.98, 0.72, 0.38, 0.95, 0.45],
                transition: {
                  duration: 8.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  type: 'tween',
                },
              }
            : {
                y: [0, -16, 4, -10, 0],
                x: [0, 22, -18, 14, 0],
                rotate: [0, 3, -3, 2, 0],
                opacity: [0.38, 0.96, 0.62, 0.28, 0.92, 0.38],
                transition: {
                  duration: 9.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  type: 'tween',
                },
              }
        }
        onClick={handleTapBobu}
        className="group relative cursor-pointer touch-none flex flex-col items-center"
        title={
          isHiding
            ? '🤫 Bobu 藏在边缘躲猫猫中！快快点击发现惊喜国学鼓励！✨'
            : `外星小兔 Bobu 乘飞碟巡航中！连续打卡${streakDays}天，点击听励志语录与汉字冷知识 🛸🚩✨`
        }
      >
        {/* Requirement: 连胜时她会挥舞小旗子 (Animated Victory Pennant Flag on Streak) */}
        {streakDays >= 1 && (
          <motion.div
            className="absolute -top-6 -right-6 sm:-right-8 z-30 pointer-events-none origin-bottom-left flex items-start"
            animate={{
              rotate: [-16, 22, -16],
              y: [0, -4, 0],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: 'easeInOut',
              type: 'tween',
            }}
          >
            {/* Golden Flagstaff */}
            <div className="w-1 h-12 bg-gradient-to-t from-amber-700 via-yellow-400 to-amber-200 rounded-full shadow-md relative">
              {/* Star Finial */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-yellow-300 border border-amber-500 shadow-[0_0_8px_rgba(250,204,21,0.9)] flex items-center justify-center text-[8px]">
                ⭐
              </div>
            </div>

            {/* Silk Pennant Flag Cloth with Ripple Animation */}
            <motion.div
              animate={{
                skewY: [-4, 5, -4],
                scaleX: [1, 0.95, 1],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeInOut',
                type: 'tween',
              }}
              className="relative -ml-0.5 mt-1 px-2 py-0.5 rounded-r-lg bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-yellow-100 font-festive font-black text-[9px] shadow-[0_4px_12px_rgba(220,38,38,0.6)] border-y border-r border-yellow-300 flex items-center gap-0.5 whitespace-nowrap"
            >
              <span>🚩</span>
              <span>{streakDays}天连胜</span>
              <Sparkles className="w-2.5 h-2.5 text-yellow-200 animate-pulse ml-0.5" />
              {/* Swallowtail cut-out effect */}
              <div className="absolute -right-1 top-0 bottom-0 w-2 bg-transparent border-l-2 border-yellow-200/40" />
            </motion.div>
          </motion.div>
        )}

        {/* Hide & Seek Peek-a-boo Decorative Barrier (躲猫猫时遮挡隐蔽效果) */}
        {isHiding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -left-6 top-2 z-30 pointer-events-none flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-950/90 border border-yellow-400 text-yellow-200 text-[10px] font-festive font-bold shadow-[0_0_12px_rgba(250,204,21,0.7)] whitespace-nowrap animate-bounce"
          >
            <span>🤫</span>
            <span>捉迷藏中 · 快点我！</span>
          </motion.div>
        )}

        {/* Antigravity Propulsion Beam (底部反重力粒子光锥) */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-14 h-12 bg-gradient-to-b from-cyan-400/40 via-amber-300/20 to-transparent blur-md rounded-b-full pointer-events-none group-hover:from-yellow-400/60 transition-colors" />

        {/* Stardust Aura Ring (飞碟环绕星环：高连胜时绽放绚烂金芒) */}
        <div
          className={`absolute -inset-2 rounded-full pointer-events-none transition-all ${
            streakDays >= 3
              ? 'bg-gradient-to-r from-yellow-400/45 via-red-500/35 to-amber-400/45 blur-md animate-pulse'
              : 'bg-gradient-to-r from-amber-400/30 via-cyan-400/30 to-yellow-400/30 blur-sm animate-pulse'
          }`}
        />

        {/* UFO Saucer Vessel (灵光飞碟机体) */}
        <div className="relative flex flex-col items-center">
          {/* Glass Canopy Dome (透明座舱罩) */}
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-yellow-200/90 bg-gradient-to-b from-amber-100/70 via-yellow-50/50 to-cyan-50/30 backdrop-blur-xs shadow-[inset_0_4px_10px_rgba(255,255,255,0.8),0_4px_16px_rgba(0,0,0,0.5)] flex items-center justify-center z-10">
            {/* Real Bobu Character Rendering */}
            {hasImageLoaded ? (
              <img
                src={BOBU_UFO_IMG}
                alt="Bobu the Alien Bunny"
                onError={() => setHasImageLoaded(false)}
                className="w-full h-full object-cover object-center scale-110 drop-shadow-md group-hover:scale-115 transition-transform"
              />
            ) : (
              <svg viewBox="0 0 100 100" className="w-16 h-16 drop-shadow-md">
                <ellipse cx="36" cy="22" rx="7" ry="18" fill="#F87171" stroke="#1C1917" strokeWidth="4" />
                <ellipse cx="64" cy="22" rx="7" ry="18" fill="#F87171" stroke="#1C1917" strokeWidth="4" />
                <ellipse cx="50" cy="58" rx="28" ry="24" fill="#FDBA74" stroke="#1C1917" strokeWidth="4" />
                <path
                  d="M24,42 Q28,26 38,30 Q46,24 54,28 Q64,24 72,32 Q78,40 76,48 Q70,42 64,46 Q54,38 44,46 Q34,42 24,42 Z"
                  fill="#FACC15"
                  stroke="#1C1917"
                  strokeWidth="3.5"
                />
                <circle cx="25" cy="46" r="3.5" fill="#EF4444" stroke="#1C1917" strokeWidth="1.5" />
                <circle cx="75" cy="46" r="3.5" fill="#EF4444" stroke="#1C1917" strokeWidth="1.5" />
                <circle cx="42" cy="48" r="2.8" fill="#1C1917" />
                <circle cx="58" cy="48" r="2.8" fill="#1C1917" />
                <path d="M40,56 Q50,66 60,56 Z" fill="#EF4444" stroke="#1C1917" strokeWidth="2.5" />
                <rect x="46" y="56" width="3.5" height="4" fill="#FFFFFF" stroke="#1C1917" strokeWidth="1" />
                <rect x="50.5" y="56" width="3.5" height="4" fill="#FFFFFF" stroke="#1C1917" strokeWidth="1" />
                <path d="M30,70 Q50,68 70,70 L68,82 Q50,86 32,82 Z" fill="#DC2626" stroke="#1C1917" strokeWidth="3" />
                <polygon points="50,72 51.5,75 54.5,75 52,77 53,80 50,78 47,80 48,77 45.5,75 48.5,75" fill="#FDE047" />
              </svg>
            )}

            {/* Specular Light Reflection on Glass */}
            <div className="absolute top-1 left-2 w-8 h-4 rounded-full bg-white/40 blur-2xs rotate-[-25deg] pointer-events-none" />

            {/* Surprise Expression Overlay upon being discovered in Hide & Seek */}
            {isSurprised && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.25, 1], opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 bg-yellow-400/40 backdrop-blur-2xs flex flex-col items-center justify-center z-30 pointer-events-none"
              >
                <span className="text-2xl animate-bounce">🤩</span>
                <span className="text-[9px] font-black font-festive text-red-950 bg-yellow-300 px-1.5 py-0.5 rounded-full shadow-xs mt-0.5 border border-yellow-500 whitespace-nowrap">
                  🎉 被你发现啦!
                </span>
              </motion.div>
            )}
          </div>

          {/* Saucer Rim Plate (飞碟外环金属飞盘底座) */}
          <div className="relative -mt-4 w-22 sm:w-26 h-7 sm:h-8 rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-600 border-2 border-yellow-100 shadow-[0_6px_14px_rgba(0,0,0,0.65)] flex items-center justify-around px-2 z-20">
            {/* Blinking jewel thrusters / LEDs */}
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_rgba(34,211,238,0.9)] animate-ping" />
            <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]" />
            <span className="w-2 h-2 rounded-full bg-yellow-100 shadow-[0_0_8px_rgba(254,240,138,0.9)] animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.9)] animate-ping" />
          </div>
        </div>

        {/* Status Pill: Achievement badge & Micro-action indicator */}
        <div className="mt-1 flex items-center gap-1 bg-black/80 backdrop-blur-md text-yellow-200 px-2.5 py-0.5 rounded-full border border-yellow-400/50 text-[10px] font-festive font-black shadow-lg group-hover:border-yellow-300 transition-colors">
          {isHiding ? (
            <>
              <span className="text-yellow-300 animate-pulse">🤫 捉迷藏</span>
              <span className="text-[9px] text-amber-200 font-normal">· 点击找我</span>
            </>
          ) : streakDays >= 1 ? (
            <>
              <span className="text-red-400">🚩</span>
              <span className="text-yellow-300">{streakDays}连胜</span>
              <span className="text-[9px] text-amber-200 font-normal">· 点击鼓励</span>
            </>
          ) : (
            <>
              <span className="text-xs">🛸</span>
              <span>Bobu 伴读</span>
              <span className="text-[9px] text-amber-300 font-normal">· 点击鼓励</span>
            </>
          )}
          <Sparkles className="w-2.5 h-2.5 text-yellow-300 animate-pulse ml-0.5" />
        </div>
      </motion.div>
    </div>
  );
};
