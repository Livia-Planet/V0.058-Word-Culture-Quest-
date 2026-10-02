import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Volume2,
  RefreshCw,
  HelpCircle,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen,
  Compass,
} from 'lucide-react';
import { DailyLoreItem, fetchDailyLore } from '../data/dailyLoreData';
import { sound, speakChinese, stopChineseSpeech } from '../utils/audio';

interface DailyLoreProps {
  className?: string;
}

export const DailyLore: React.FC<DailyLoreProps> = ({ className = '' }) => {
  const [lore, setLore] = useState<DailyLoreItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  // Fetch lore on initial mount
  useEffect(() => {
    let isMounted = true;
    fetchDailyLore(false).then((data) => {
      if (isMounted) {
        setLore(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
      stopChineseSpeech();
    };
  }, []);

  // Shuffle to another lore fact
  const handleShuffle = async () => {
    sound.playTap();
    stopChineseSpeech();
    setIsSpeaking(false);
    setShowAnswer(false);
    setLoading(true);

    const nextLore = await fetchDailyLore(true);
    setLore(nextLore);
    setLoading(false);
    sound.playCorrect();
  };

  // Speak aloud
  const handleSpeak = () => {
    if (!lore) return;
    sound.playTap();
    if (isSpeaking) {
      stopChineseSpeech();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const speechText = `今日文化锦囊：${lore.title}。${lore.fact}`;
    speakChinese(speechText, 0.95).then(() => {
      setIsSpeaking(false);
    });
  };

  if (loading && !lore) {
    return (
      <div className={`w-full p-4 rounded-3xl bg-amber-950/40 border-2 border-amber-400/30 animate-pulse text-center text-amber-200 text-xs ${className}`}>
        <Sparkles className="w-5 h-5 mx-auto mb-1 animate-spin text-amber-300" />
        正在开启今日文化藏经阁……
      </div>
    );
  }

  if (!lore) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative w-full rounded-3xl bg-gradient-to-r from-[#2c1a10] via-[#3a2014] to-[#25150d] border-3 border-amber-400/80 shadow-[0_12px_36px_rgba(0,0,0,0.65)] overflow-hidden text-left ${className}`}
    >
      {/* Decorative Traditional Silk Scroll Ledges (上下仿古锦绫镶边) */}
      <div className="h-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 border-b border-amber-300/40 shadow-xs" />

      {/* Background Watermark Pattern */}
      <div className="absolute right-2 -bottom-6 text-7xl opacity-5 pointer-events-none select-none">
        {lore.categoryIcon}
      </div>

      <div className="p-4 sm:p-5 relative z-10 space-y-3">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/30 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/20 border border-yellow-300/40 text-yellow-300 shadow-inner">
              <Sparkles className="w-4 h-4 animate-spin text-yellow-300" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-festive font-black text-amber-100 text-sm sm:text-base tracking-wide">
                  今日典籍新知 · 文化锦囊
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${lore.badgeColor}`}>
                  {lore.categoryIcon} {lore.categoryLabel}
                </span>
              </div>
              <p className="text-[10px] text-amber-200/70 hidden sm:block">
                每日一则中国历史神话妙趣常识，积累小作文素材
              </p>
            </div>
          </div>

          {/* Action Buttons: Listen & Shuffle */}
          <div className="flex items-center gap-1.5">
            {/* Listen button */}
            <button
              onClick={handleSpeak}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-amber-400 text-red-950 font-black shadow-md animate-pulse ring-2 ring-yellow-200'
                  : 'bg-black/35 hover:bg-black/55 text-amber-200 border border-amber-400/40'
              }`}
              title="语音朗读今日新知"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{isSpeaking ? '朗读中' : '听听看'}</span>
            </button>

            {/* Shuffle button */}
            <button
              onClick={handleShuffle}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/35 hover:bg-black/55 text-amber-200 border border-amber-400/40 text-xs font-bold transition-all cursor-pointer active:scale-95"
              title="换一条文化趣闻"
            >
              <RefreshCw className="w-3.5 h-3.5 text-yellow-300" />
              <span className="hidden xs:inline">换一换</span>
            </button>

            {/* Toggle collapse */}
            <button
              onClick={() => {
                sound.playTap();
                setIsExpanded((prev) => !prev);
              }}
              className="p-1 rounded-xl bg-black/35 hover:bg-black/55 text-amber-300 border border-amber-400/40 cursor-pointer"
              title={isExpanded ? '收起详情' : '展开详情'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-2.5">
          <div
            onClick={() => {
              sound.playTap();
              setIsExpanded((prev) => !prev);
            }}
            className="flex items-center justify-between gap-2 cursor-pointer group select-none"
            title={isExpanded ? '点击收起文化锦囊详情' : '点击展开文化锦囊详情'}
          >
            <div className="flex items-center gap-2">
              <h3 className="font-festive font-black text-base sm:text-lg text-yellow-200 tracking-wide group-hover:text-yellow-100 transition-colors">
                {lore.title}
              </h3>
              <span className="text-[11px] text-amber-300/80 font-medium italic hidden md:inline">
                —— {lore.subtitle}
              </span>
            </div>
            {!isExpanded && (
              <span className="text-[10px] text-amber-300/70 group-hover:text-yellow-200 flex items-center gap-0.5 font-bold shrink-0 transition-colors">
                <span>展开</span>
                <ChevronDown className="w-3 h-3" />
              </span>
            )}
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-2.5 overflow-hidden"
              >
                {/* Fact body */}
                <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed font-sans bg-black/25 p-3 rounded-2xl border border-amber-500/20 shadow-inner">
                  {lore.fact}
                </p>

                {/* Curious trivia question */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-xs text-amber-200">
                  <div className="flex items-center gap-1.5 font-bold">
                    <HelpCircle className="w-4 h-4 text-yellow-300 shrink-0" />
                    <span>趣味小思考：{lore.curiousQuestion.split('（')[0]}</span>
                  </div>

                  <button
                    onClick={() => {
                      sound.playCharClick();
                      setShowAnswer((prev) => !prev);
                    }}
                    className="text-[11px] text-yellow-300 hover:text-yellow-100 font-bold underline cursor-pointer shrink-0"
                  >
                    {showAnswer ? '隐藏答案' : '查看答案 💡'}
                  </button>
                </div>

                {showAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-amber-300/90 bg-black/40 px-3 py-1.5 rounded-lg border border-amber-500/30"
                  >
                    💡 {lore.curiousQuestion}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Decorative Bottom Silk Scroll Ledges */}
      <div className="h-1.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 border-t border-amber-300/30" />
    </motion.section>
  );
};
