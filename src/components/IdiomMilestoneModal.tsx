import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Scroll,
  BookOpen,
  Award,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { IdiomAllusion } from '../data/idiomAllusionsData';
import { speakChinese, stopChineseSpeech, sound } from '../utils/audio';

interface IdiomMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestoneCount: number;
  idiom: IdiomAllusion | null;
  onRetriggerBurst?: () => void;
}

export const IdiomMilestoneModal: React.FC<IdiomMilestoneModalProps> = ({
  isOpen,
  onClose,
  milestoneCount,
  idiom,
  onRetriggerBurst,
}) => {
  const [isPlayingTTS, setIsPlayingTTS] = useState<boolean>(false);

  // Stop speech when modal closes or unmounts
  useEffect(() => {
    if (!isOpen) {
      stopChineseSpeech();
      setIsPlayingTTS(false);
    }
  }, [isOpen]);

  if (!isOpen || !idiom) return null;

  const handleTogglePlaySpeech = async () => {
    sound.playTap();
    if (isPlayingTTS) {
      stopChineseSpeech();
      setIsPlayingTTS(false);
      return;
    }

    setIsPlayingTTS(true);
    const speechText = `成语：${idiom.idiom}。${idiom.pinyin}。出处：${idiom.dynasticSource}。故事讲述的是：${idiom.story}。这个成语告诉我们：${idiom.takeaway}`;

    try {
      await speakChinese(speechText, 0.9);
    } finally {
      setIsPlayingTTS(false);
    }
  };

  const handleRetriggerFireworks = () => {
    sound.playReward();
    onRetriggerBurst?.();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-red-950/70 backdrop-blur-sm"
        />

        {/* Modal Scroll Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 25 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-amber-50 via-orange-50/90 to-amber-100 rounded-3xl shadow-2xl border-4 border-amber-300/80 overflow-hidden my-auto"
        >
          {/* Top Decorative Cloud Ribbon Header */}
          <div className="relative bg-gradient-to-r from-red-700 via-red-600 to-amber-700 text-white px-5 py-4 shadow-md flex items-center justify-between border-b-2 border-amber-400">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/30 border border-amber-300/60 flex items-center justify-center text-amber-200 shadow-inner">
                <Scroll className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-amber-200 uppercase tracking-widest bg-red-900/50 px-2 py-0.5 rounded-full border border-amber-300/30">
                    50字里程碑庆典
                  </span>
                  <span className="flex items-center gap-0.5 text-xs text-amber-300 font-bold">
                    <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    累积突破
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black font-serif text-amber-100 tracking-wide mt-0.5">
                  文渊华章 · 成语锦囊
                </h2>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="p-2 rounded-xl bg-red-800/60 hover:bg-red-800 text-amber-200 hover:text-white border border-red-400/40 transition-colors"
              aria-label="关闭锦囊"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scroll Content */}
          <div className="p-4 sm:p-6 space-y-4 max-h-[78vh] overflow-y-auto custom-scrollbar">
            {/* Achievement Milestone Celebration Banner */}
            <div className="relative bg-gradient-to-br from-amber-200/90 via-orange-100 to-amber-50 rounded-2xl p-3.5 sm:p-4 border-2 border-amber-300 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 border-2 border-white shadow-md flex items-center justify-center text-red-950 font-black text-xl">
                  <Award className="w-7 h-7 text-amber-950" />
                </div>
                <div>
                  <div className="text-xs text-amber-800 font-bold">功不唐捐 · 积步千里</div>
                  <div className="text-base sm:text-lg font-black text-red-950 font-serif">
                    已累计点亮{' '}
                    <span className="text-2xl font-black text-red-600 px-1 font-mono">
                      {milestoneCount}
                    </span>{' '}
                    个汉字！
                  </div>
                </div>
              </div>

              {/* Seal Stamp */}
              <div className="w-14 h-14 rounded-xl border-2 border-red-700/60 bg-red-600/10 rotate-6 flex flex-col items-center justify-center text-red-800 font-serif shadow-inner shrink-0">
                <span className="text-[10px] font-black leading-none">甲等</span>
                <span className="text-xs font-black leading-none mt-0.5">进阶</span>
              </div>
            </div>

            {/* Idiom Showcase Board */}
            <div className="bg-white/80 rounded-2xl p-4 sm:p-5 border-2 border-amber-200/90 shadow-sm text-center relative overflow-hidden">
              <div className="text-xs font-bold tracking-widest text-amber-700 mb-1">
                {idiom.levelMilestoneTag}
              </div>

              {/* Pinyin */}
              <div className="text-amber-800 text-sm sm:text-base font-serif tracking-widest">
                {idiom.pinyin}
              </div>

              {/* Grand Idiom Characters */}
              <div className="my-2 flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
                {idiom.idiom.split('').map((char, idx) => (
                  <div
                    key={idx}
                    className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-amber-50 to-orange-100 border-2 border-amber-300 flex items-center justify-center shadow-sm"
                  >
                    <span className="text-2xl sm:text-3xl font-black font-serif text-red-900">
                      {char}
                    </span>
                  </div>
                ))}
              </div>

              {/* Source & Figure Badge */}
              <div className="inline-flex items-center gap-2 bg-amber-100/90 text-amber-900 border border-amber-300 text-xs px-3 py-1 rounded-full font-serif font-medium mt-1">
                <span>🏛️ {idiom.dynasticSource}</span>
                <span>•</span>
                <span>👤 {idiom.historicalFigure}</span>
              </div>
            </div>

            {/* Story Paragraph Box */}
            <div className="bg-gradient-to-br from-orange-50/80 to-amber-50/80 rounded-2xl p-4 border border-amber-200/90 text-slate-800 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-800 flex items-center gap-1.5 font-serif">
                  <BookOpen className="w-4 h-4 text-red-600" />
                  典故秘史
                </span>
                <button
                  onClick={handleTogglePlaySpeech}
                  className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-bold transition-all ${
                    isPlayingTTS
                      ? 'bg-red-600 text-white border-red-700 animate-pulse'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                  }`}
                >
                  {isPlayingTTS ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      停止朗读
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      朗读典故
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed indent-5 font-serif">
                {idiom.story}
              </p>
            </div>

            {/* Takeaway & Wisdom Box */}
            <div className="bg-emerald-50/90 rounded-2xl p-3.5 border border-emerald-300/80 text-left flex items-start gap-3 shadow-inner">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 text-xs sm:text-sm text-emerald-950">
                <div className="font-bold text-emerald-900">少侠启示录：</div>
                <div className="text-emerald-800 leading-normal">{idiom.takeaway}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <button
                onClick={handleRetriggerFireworks}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-amber-950 font-black text-sm sm:text-base border-2 border-amber-500/80 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-900" />
                再赏一次礼花
              </button>

              <button
                onClick={() => {
                  sound.playReward();
                  onClose();
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-sm sm:text-base border-2 border-red-800 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                收下锦囊，继续探险
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
