import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  Calendar, Check, Lock, Sparkles, Flame, Volume2, 
  X, Gift, Crown, ArrowRight, Zap, RefreshCw, Star 
} from 'lucide-react';
import { 
  STREAK_REWARDS, 
  DAILY_CULTURAL_QUOTES, 
  DailyReward, 
  DayQuote, 
  DailyStreakState 
} from '../data/dailyStreakData';
import { sound, speakChinese, stopChineseSpeech } from '../utils/audio';
import { UserEquippedDecorations } from './ProfileAchievementsModal';
import { useGameStore } from '../store/useGameStore';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  streakState?: DailyStreakState;
  onCheckIn?: () => void;
  onFastForwardStreak?: (targetDays: number) => void;
  onResetStreak?: () => void;
  equipped?: UserEquippedDecorations;
  onEquipDecoration?: (type: 'frame' | 'seal' | 'title' | 'bgTheme', id: string) => void;
}

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  streakState: propStreakState,
  onCheckIn: propOnCheckIn,
  onFastForwardStreak: propOnFastForwardStreak,
  onResetStreak: propOnResetStreak,
  equipped: propEquipped,
  onEquipDecoration: propOnEquipDecoration,
}) => {
  const gameStore = useGameStore();

  const streakState = propStreakState ?? gameStore.streakState;
  const onCheckIn = propOnCheckIn ?? gameStore.checkIn;
  const onFastForwardStreak = propOnFastForwardStreak ?? gameStore.fastForwardStreak;
  const onResetStreak = propOnResetStreak ?? gameStore.resetStreak;
  const equipped = propEquipped ?? gameStore.equippedDecorations;
  const onEquipDecoration = propOnEquipDecoration ?? gameStore.equipDecoration;
  const [justCelebrated, setJustCelebrated] = useState<string | null>(null);
  const celebrateTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up any timers and running speech when modal is closed or unmounts
  useEffect(() => {
    return () => {
      if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current);
      stopChineseSpeech();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentDayInCycle = ((streakState.streakDays - 1) % 7) + 1;
  const currentQuote: DayQuote =
    DAILY_CULTURAL_QUOTES[(streakState.streakDays > 0 ? (streakState.streakDays - 1) % 7 : 0)];

  const handlePerformCheckIn = () => {
    if (streakState.isTodayCheckedIn) return;
    const nextStreak = streakState.streakDays + 1;
    if (nextStreak === 3 || nextStreak === 7 || nextStreak === 14 || nextStreak === 30) {
      sound.playBadgeUnlock();
    } else {
      sound.playStreak();
    }
    onCheckIn();

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (error) {
      console.warn('[UI Effect Error]:', error);
    }

    let message = `🎉 今日打卡成功！连续学习达成 ${nextStreak} 天！`;
    if (nextStreak === 3) {
      message = '🏮 连续 3 天！解锁限定朱砂印【日拱一卒】！';
    } else if (nextStreak === 7) {
      message = '👑 连续 7 天大圆满！解锁限定头像框【北斗星辉框】！';
    }
    setJustCelebrated(message);
    if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current);
    celebrateTimerRef.current = setTimeout(() => setJustCelebrated(null), 4000);
  };

  const handleSpeakQuote = () => {
    sound.playTap();
    speakChinese(`${currentQuote.quote}。出自${currentQuote.source}。${currentQuote.meaning}`);
  };

  const handleFastTrack = (days: number, rewardName?: string) => {
    sound.playBadgeUnlock();
    onFastForwardStreak(days);
    try {
      confetti({ particleCount: 80, spread: 70 });
    } catch (error) {
      console.warn('[UI Effect Error]:', error);
    }
    setJustCelebrated(`✨ 已为您模拟连续研习 ${days} 天！${rewardName || ''}`);
    if (celebrateTimerRef.current) clearTimeout(celebrateTimerRef.current);
    celebrateTimerRef.current = setTimeout(() => setJustCelebrated(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-gradient-to-b from-amber-50 to-orange-50 border-4 border-amber-300 rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-7 text-slate-800 my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 text-white flex items-center justify-center shadow-md border border-yellow-200">
              <Calendar className="w-5 h-5 text-yellow-200" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2 className="font-festive text-xl sm:text-2xl font-black text-red-950">
                  每日学习签到 · 晨诵笃行
                </h2>
                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <Flame className="w-3 h-3 text-yellow-300" /> 连签 {streakState.streakDays} 天
                </span>
              </div>
              <p className="text-xs text-stone-500">
                坚持每日研习汉字，解锁限定专属头像框、文人私印与修业装扮！
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-amber-100 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Floating Celebratory Banner */}
        <AnimatePresence>
          {justCelebrated && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white rounded-2xl p-3 mb-4 shadow-lg text-center flex items-center justify-center gap-2 border border-yellow-300 shrink-0"
            >
              <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
              <span className="font-bold text-xs sm:text-sm tracking-wide">{justCelebrated}</span>
              <Sparkles className="w-5 h-5 text-yellow-300 animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {/* Main Hero Check-In Banner */}
          <div className="bg-gradient-to-r from-red-800 via-amber-700 to-red-900 rounded-3xl p-5 text-white shadow-lg border-2 border-amber-400 text-left relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-amber-400 text-red-950 font-black text-xs px-2 py-0.5 rounded-md">
                    第 {Math.floor((streakState.streakDays - 1) / 7) + 1} 周修业期
                  </span>
                  <span className="text-amber-200 text-xs font-semibold">
                    累计研习打卡 {streakState.totalCheckIns} 次
                  </span>
                </div>
                <h3 className="font-festive text-xl sm:text-2xl font-black text-amber-100 mb-1">
                  {streakState.isTodayCheckedIn
                    ? '今日研习已达标 · 恒心可鉴！'
                    : '一日之计在于晨 · 今日尚未签到'}
                </h3>
                <p className="text-xs text-amber-100/80">
                  {streakState.isTodayCheckedIn
                    ? `已连续研习 ${streakState.streakDays} 天，明日继续保持即可赢取更多限定赏赐！`
                    : '立即完成今日签到，点亮连续学习天数，领取文币与限定装扮！'}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={handlePerformCheckIn}
                disabled={streakState.isTodayCheckedIn}
                className={`px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-md flex items-center gap-2 shrink-0 ${
                  streakState.isTodayCheckedIn
                    ? 'bg-emerald-600 text-white cursor-default opacity-95'
                    : 'bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-red-950 hover:scale-105 active:scale-95 shadow-yellow-500/40 cursor-pointer animate-pulse'
                }`}
              >
                {streakState.isTodayCheckedIn ? (
                  <>
                    <Check className="w-5 h-5 text-white" />
                    <span>今日已签到</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-red-900" />
                    <span>立即学习签到</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 7-Day Cycle Visual Calendar */}
          <div className="bg-white/80 border border-amber-200 rounded-2xl p-4 text-left shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-900">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>7 天连续学习奖励跑道</span>
              </div>
              <span className="text-[11px] text-stone-500">
                周循环奖励 · 连签 3 天与 7 天享独家装扮
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {STREAK_REWARDS.map((reward) => {
                const isClaimed = streakState.streakDays >= reward.day;
                const isToday =
                  streakState.isTodayCheckedIn
                    ? streakState.streakDays === reward.day
                    : streakState.streakDays + 1 === reward.day;

                return (
                  <div
                    key={reward.day}
                    className={`relative rounded-2xl p-2.5 text-center flex flex-col justify-between border-2 transition-all ${
                      reward.isMajor
                        ? isClaimed
                          ? 'bg-amber-100/90 border-amber-400 shadow-sm'
                          : 'bg-gradient-to-b from-amber-50 to-orange-100 border-amber-400 ring-2 ring-amber-300/60'
                        : isClaimed
                        ? 'bg-stone-100 border-stone-300'
                        : 'bg-white border-amber-200/80'
                    }`}
                  >
                    {/* Top tag */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-stone-600">
                        第 {reward.day} 天
                      </span>
                      {reward.isMajor && (
                        <span className="text-[9px] font-black text-red-700 bg-red-100 px-1 rounded">
                          限定
                        </span>
                      )}
                    </div>

                    {/* Icon */}
                    <div className="text-2xl my-1 relative flex items-center justify-center">
                      <span>{reward.icon}</span>
                      {isClaimed && (
                        <div className="absolute inset-0 bg-stone-900/30 backdrop-blur-2xs rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-emerald-300 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <div className="text-[10px] font-bold text-stone-800 line-clamp-1 mb-1">
                      {reward.name}
                    </div>

                    {/* Status Pill */}
                    <div className="mt-auto">
                      {isClaimed ? (
                        <span className="block text-[9px] font-bold text-emerald-700 bg-emerald-100 rounded-md py-0.5">
                          已达成
                        </span>
                      ) : isToday ? (
                        <span className="block text-[9px] font-bold text-red-700 bg-red-100 rounded-md py-0.5 animate-pulse">
                          今日领
                        </span>
                      ) : (
                        <span className="block text-[9px] font-medium text-stone-400 bg-stone-100 rounded-md py-0.5 flex items-center justify-center gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> 待解锁
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Equip for Streak Rewards if unlocked */}
            {streakState.streakDays >= 3 && (
              <div className="mt-4 pt-3 border-t border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-stone-600 font-medium">已解锁限定签到装扮：</span>
                <div className="flex items-center gap-2">
                  {streakState.streakDays >= 3 && (
                    <button
                      onClick={() => {
                        sound.playSealStamp();
                        onEquipDecoration('seal', 'seal-streak-3');
                        setJustCelebrated('已为您佩戴限定朱砂印【日拱一卒】！');
                        setTimeout(() => setJustCelebrated(null), 3000);
                      }}
                      className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      佩戴【日拱一卒】印
                    </button>
                  )}
                  {streakState.streakDays >= 7 && (
                    <button
                      onClick={() => {
                        sound.playEquip();
                        onEquipDecoration('frame', 'frame-streak-7');
                        setJustCelebrated('已为您佩戴限定头像框【北斗星辉框】！');
                        setTimeout(() => setJustCelebrated(null), 3000);
                      }}
                      className="px-2.5 py-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 font-bold rounded-lg text-xs cursor-pointer"
                    >
                      佩戴【北斗星辉框】
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Today's Cultural Motivation Quote */}
          <div className="bg-amber-100/70 border border-amber-300 rounded-2xl p-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-950">
                <Star className="w-4 h-4 text-amber-600" />
                <span>每日国学晨诵金句</span>
              </div>
              <button
                onClick={handleSpeakQuote}
                className="px-2.5 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                title="朗读晨诵金句"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>朗读金句</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="font-calligraphy font-black text-base text-red-900">
                “{currentQuote.quote}”
              </div>
              <div className="text-xs text-stone-500 font-medium">
                —— 出自 {currentQuote.source}
              </div>
              <p className="text-xs text-stone-700 pt-1 leading-relaxed">
                <span className="font-bold text-amber-900">学海寄语：</span>
                {currentQuote.meaning}
              </p>
            </div>
          </div>

          {/* Fast-forward Testing Station */}
          <div className="bg-white/80 border border-stone-200 rounded-2xl p-3.5 text-left text-xs">
            <div className="flex items-center gap-1 font-bold text-stone-700 mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>快速测试站 (供您即时体验不同连续签到天数与装扮解锁)</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleFastTrack(3, '解锁了【日拱一卒】限定朱砂印！')}
                className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-xl cursor-pointer"
              >
                模拟连续 3 天
              </button>
              <button
                onClick={() => handleFastTrack(7, '解锁了【北斗星辉头像框】与【笃志力行】学士称号！')}
                className="px-3 py-1 bg-cyan-100 hover:bg-cyan-200 text-cyan-900 font-bold rounded-xl cursor-pointer"
              >
                模拟连续 7 天 (满签大奖)
              </button>
              <button
                onClick={() => handleFastTrack(14, '解锁了【星汉灿烂 · 文曲当空】星空卡套！')}
                className="px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 font-bold rounded-xl cursor-pointer"
              >
                模拟连续 14 天
              </button>
              <button
                onClick={() => handleFastTrack(30, '解锁了传说级【日月同辉30天满勤框】与【水滴石穿】印！')}
                className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold rounded-xl cursor-pointer"
              >
                模拟连续 30 天满勤
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  onResetStreak();
                  setJustCelebrated('已重置为首日未签到状态');
                  setTimeout(() => setJustCelebrated(null), 2500);
                }}
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> 重置为首日
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Close */}
        <div className="mt-4 pt-3 border-t border-amber-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-stone-500">
            每日 00:00 刷新签到状态，保持连续研习不间断
          </span>
          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="px-5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            完成打卡并返回
          </button>
        </div>
      </motion.div>
    </div>
  );
};
