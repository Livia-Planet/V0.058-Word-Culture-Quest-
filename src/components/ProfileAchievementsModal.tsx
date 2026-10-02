import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Award,
  X,
  Check,
  Lock,
  Sparkles,
  Crown,
  Shield,
  Palette,
  Stamp,
  RefreshCw,
  Zap,
  Volume2,
  VolumeX,
  Scroll,
  RotateCw,
  ChevronRight,
  Flame,
} from 'lucide-react';
import {
  ACHIEVEMENTS,
  AVAILABLE_DECORATIONS,
  DecorationType,
  ProfileDecoration,
  AchievementBadge,
} from '../data/achievementData';
import { sound, speakChinese, stopChineseSpeech } from '../utils/audio';
import { useGameStore } from '../store/useGameStore';

export interface UserEquippedDecorations {
  frameId: string;
  sealId: string;
  bgThemeId: string;
  titleId: string;
  userName: string;
}

interface ProfileAchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  collectedCount?: number;
  onUpdateCollectedCount?: (newCount: number) => void;
  equipped?: UserEquippedDecorations;
  onSaveEquipped?: (newEquipped: UserEquippedDecorations) => void;
  streakDays?: number;
}

export const ProfileAchievementsModal: React.FC<ProfileAchievementsModalProps> = ({
  isOpen,
  onClose,
  collectedCount: propCollectedCount,
  onUpdateCollectedCount: propOnUpdateCollectedCount,
  equipped: propEquipped,
  onSaveEquipped: propOnSaveEquipped,
  streakDays: propStreakDays,
}) => {
  const gameStore = useGameStore();

  const collectedCount = propCollectedCount ?? gameStore.collectedCount;
  const onUpdateCollectedCount = propOnUpdateCollectedCount ?? gameStore.setCollectedCount;
  const equipped = propEquipped ?? gameStore.equippedDecorations;
  const onSaveEquipped = propOnSaveEquipped ?? gameStore.setEquippedDecorations;
  const streakDays = propStreakDays ?? gameStore.streakState.streakDays;
  const [activeTab, setActiveTab] = useState<'badges_wall' | 'decorations' | 'preview'>('badges_wall');
  const [decoCategory, setDecoCategory] = useState<DecorationType>('frame');
  const [justUnlocked, setJustUnlocked] = useState<string | null>(null);
  const [flippedBadgeIds, setFlippedBadgeIds] = useState<Record<string, boolean>>({});
  const [isPlayingDecreeId, setIsPlayingDecreeId] = useState<string | null>(null);

  // Stop any speech on modal close or unmount
  useEffect(() => {
    return () => {
      stopChineseSpeech();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Resolve current active visual decorations
  const currentFrame =
    AVAILABLE_DECORATIONS.frames.find((f) => f.id === equipped.frameId) ||
    AVAILABLE_DECORATIONS.frames[0];

  const currentSeal =
    AVAILABLE_DECORATIONS.seals.find((s) => s.id === equipped.sealId) ||
    AVAILABLE_DECORATIONS.seals[0];

  const currentTheme =
    AVAILABLE_DECORATIONS.bgThemes.find((t) => t.id === equipped.bgThemeId) ||
    AVAILABLE_DECORATIONS.bgThemes[0];

  const currentTitle =
    AVAILABLE_DECORATIONS.titles.find((t) => t.id === equipped.titleId) ||
    AVAILABLE_DECORATIONS.titles[0];

  const handleEquip = (type: DecorationType, id: string) => {
    if (type === 'seal') {
      sound.playSealStamp();
      onSaveEquipped({ ...equipped, sealId: id });
    } else {
      sound.playEquip();
      if (type === 'frame') {
        onSaveEquipped({ ...equipped, frameId: id });
      } else if (type === 'bgTheme') {
        onSaveEquipped({ ...equipped, bgThemeId: id });
      } else if (type === 'title') {
        onSaveEquipped({ ...equipped, titleId: id });
      }
    }
  };

  // 3D Flip Badge Toggle
  const handleToggleFlipBadge = (achId: string) => {
    sound.playTap();
    setFlippedBadgeIds((prev) => ({
      ...prev,
      [achId]: !prev[achId],
    }));
  };

  // Speak Imperial Decree Audio
  const handleSpeakDecree = (ach: AchievementBadge, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    stopChineseSpeech();
    sound.playImperialBell();
    setIsPlayingDecreeId(ach.id);
    speakChinese(ach.decreeAudio);
    setTimeout(() => {
      setIsPlayingDecreeId(null);
    }, 9000);
  };

  // Milestone fast-jump helper for testing & demonstrations
  const handleFastTrack = (targetCount: number, message: string) => {
    sound.playBadgeUnlock();
    onUpdateCollectedCount(targetCount);
    setJustUnlocked(message);
    try {
      confetti({
        particleCount: 140,
        spread: 100,
        origin: { y: 0.5 },
      });
    } catch (error) {
      console.warn('[UI Effect Error]:', error);
    }
    setTimeout(() => {
      setJustUnlocked(null);
    }, 4500);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-gradient-to-b from-amber-50 via-orange-50/50 to-amber-100 border-4 border-amber-300 rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-7 text-slate-800 my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 text-white flex items-center justify-center shadow-md border-2 border-yellow-200 shrink-0">
              <Crown className="w-6 h-6 text-yellow-200 animate-pulse" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2 className="font-festive text-xl sm:text-2xl font-black text-red-950">
                  科举文位榜与修业宝阁
                </h2>
                <span className="bg-amber-400 text-red-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  国风典籍体系
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                汉字突破 10/25/50/100 字受封科举文位，点击勋章 3D 翻转恭读御赐授勋诏书！
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              stopChineseSpeech();
              onClose();
            }}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center text-stone-400 hover:text-stone-800 p-2 rounded-2xl hover:bg-amber-200/60 transition-colors cursor-pointer active:scale-95"
            title="关闭窗口"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Milestone Celebration Banner */}
        <AnimatePresence>
          {justUnlocked && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -10 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -10 }}
              className="mb-4 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 text-white p-3 rounded-2xl shadow-lg border border-yellow-300 flex items-center justify-between text-xs sm:text-sm font-bold shrink-0 overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-200 shrink-0 animate-spin" />
                <span>{justUnlocked}</span>
              </div>
              <button
                onClick={() => setJustUnlocked(null)}
                className="text-white/80 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top 3 Navigation Tabs (Kid-Friendly Large Buttons) */}
        <div className="flex items-center gap-2 bg-amber-200/60 p-1.5 rounded-2xl mb-4 shrink-0 overflow-x-auto">
          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('badges_wall');
            }}
            className={`min-h-[48px] flex-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap ${
              activeTab === 'badges_wall'
                ? 'bg-red-700 text-yellow-100 shadow-md ring-2 ring-yellow-300'
                : 'text-stone-700 hover:bg-amber-300/50 hover:text-stone-900'
            }`}
          >
            <Award className="w-4 h-4 text-amber-300" />
            <span>1. 四阶文位打卡墙 (3D翻转诏书)</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('decorations');
            }}
            className={`min-h-[48px] flex-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap ${
              activeTab === 'decorations'
                ? 'bg-red-700 text-yellow-100 shadow-md ring-2 ring-yellow-300'
                : 'text-stone-700 hover:bg-amber-300/50 hover:text-stone-900'
            }`}
          >
            <Palette className="w-4 h-4 text-amber-300" />
            <span>2. 档案卡装扮阁 (换框·盖印·换套)</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setActiveTab('preview');
            }}
            className={`min-h-[48px] flex-1 px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap ${
              activeTab === 'preview'
                ? 'bg-red-700 text-yellow-100 shadow-md ring-2 ring-yellow-300'
                : 'text-stone-700 hover:bg-amber-300/50 hover:text-stone-900'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-300" />
            <span>3. 我的修业名帖预览</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* TAB 1: 3D FLIP BADGE WALL (四阶文位进阶体系) */}
          {activeTab === 'badges_wall' && (
            <div className="space-y-4 text-left">
              {/* Top Banner Guide */}
              <div className="bg-white/80 p-3.5 rounded-2xl border-2 border-amber-300 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-lg border border-red-300 shrink-0">
                    📜
                  </div>
                  <div>
                    <div className="text-sm font-black text-red-950 flex items-center gap-2">
                      <span>科举四阶文位晋升殿堂</span>
                      <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-md">
                        当前掌握：{collectedCount} / 3500 字
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-0.5">
                      💡 提示：点击已解锁的勋章，卡片将触发 3D 翻转展示专属【授勋诏书】，并可恭听皇朝宣旨音频！
                    </p>
                  </div>
                </div>

                {/* Fast-jump sandbox buttons for children to explore badges */}
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleFastTrack(10, '恭喜达成 10 字！晋升【识字童生】文位！')}
                    className="min-h-[44px] px-2.5 py-1 text-xs font-bold bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all cursor-pointer active:scale-95"
                    title="模拟识字 10 个"
                  >
                    10字
                  </button>
                  <button
                    onClick={() => handleFastTrack(25, '恭喜达成 25 字！晋升【文思秀才】文位！')}
                    className="min-h-[44px] px-2.5 py-1 text-xs font-bold bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all cursor-pointer active:scale-95"
                    title="模拟识字 25 个"
                  >
                    25字
                  </button>
                  <button
                    onClick={() => handleFastTrack(50, '🎉 恭喜突破 50 字！金榜及第，晋升【举人及第】文位！')}
                    className="min-h-[44px] px-2.5 py-1 text-xs font-bold bg-yellow-200 hover:bg-yellow-300 border border-amber-400 text-amber-950 rounded-xl transition-all cursor-pointer active:scale-95"
                    title="模拟识字 50 个"
                  >
                    50字
                  </button>
                  <button
                    onClick={() => handleFastTrack(100, '👑 旷世盛事！突破 100 字！独占鳌头，受封【翰林宗师】！')}
                    className="min-h-[44px] px-2.5 py-1 text-xs font-bold bg-purple-200 hover:bg-purple-300 border border-purple-400 text-purple-950 rounded-xl transition-all cursor-pointer active:scale-95"
                    title="模拟识字 100 个"
                  >
                    100字
                  </button>
                </div>
              </div>

              {/* 3D Flip Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ACHIEVEMENTS.map((ach) => {
                  const isAchieved = collectedCount >= ach.requiredCount;
                  const isFlipped = flippedBadgeIds[ach.id] || false;
                  const progressPct = Math.min(
                    100,
                    Math.round((collectedCount / ach.requiredCount) * 100)
                  );

                  return (
                    <div
                      key={ach.id}
                      className="relative h-72 sm:h-80 w-full [perspective:1000px] select-none"
                    >
                      <motion.div
                        className="relative w-full h-full rounded-3xl transition-transform duration-500 [transform-style:preserve-3d] shadow-lg"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                      >
                        {/* ================= FRONT SIDE ( Glorious Badge Design ) ================= */}
                        <div
                          onClick={() => {
                            if (isAchieved) handleToggleFlipBadge(ach.id);
                          }}
                          className={`absolute inset-0 w-full h-full rounded-3xl p-5 border-3 [backface-visibility:hidden] flex flex-col justify-between ${
                            !isAchieved
                              ? 'bg-stone-100/90 border-stone-300 opacity-75'
                              : ach.visualTheme === 'phoenix'
                              ? 'bg-gradient-to-br from-rose-950 via-purple-950 to-amber-950 border-amber-400 text-amber-100 ring-2 ring-rose-400 cursor-pointer shadow-rose-950/40'
                              : ach.visualTheme === 'gold'
                              ? 'bg-gradient-to-br from-amber-900 via-yellow-900 to-amber-950 border-yellow-300 text-yellow-100 ring-2 ring-yellow-400 cursor-pointer shadow-amber-950/40'
                              : ach.visualTheme === 'silver'
                              ? 'bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 border-indigo-300 text-white cursor-pointer'
                              : 'bg-gradient-to-br from-emerald-950 via-teal-950 to-amber-950 border-emerald-400 text-emerald-100 cursor-pointer'
                          }`}
                        >
                          {/* Top Tag Row */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                                  !isAchieved
                                    ? 'bg-stone-200 text-stone-600 border-stone-300'
                                    : 'bg-white/20 text-white border-white/30 backdrop-blur-xs'
                                }`}
                              >
                                {ach.wenwei}
                              </span>
                              <span className="text-xs font-bold opacity-90">
                                {ach.headTitle}
                              </span>
                            </div>

                            {isAchieved ? (
                              <span className="flex items-center gap-1 bg-yellow-400 text-red-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs">
                                <Check className="w-3.5 h-3.5" /> 已授勋
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 bg-stone-300 text-stone-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                <Lock className="w-3 h-3" /> 待解锁
                              </span>
                            )}
                          </div>

                          {/* Center: Badge Visual Emblem */}
                          <div className="flex items-center gap-4 my-auto">
                            <div
                              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shrink-0 border-3 shadow-md relative group transition-transform ${
                                !isAchieved
                                  ? 'bg-stone-200 border-stone-300 grayscale'
                                  : ach.visualTheme === 'phoenix'
                                  ? 'bg-gradient-to-br from-rose-600 to-amber-500 border-yellow-300 shadow-rose-500/50 animate-pulse'
                                  : ach.visualTheme === 'gold'
                                  ? 'bg-gradient-to-br from-yellow-500 to-amber-600 border-yellow-200 shadow-yellow-500/50'
                                  : ach.visualTheme === 'silver'
                                  ? 'bg-gradient-to-br from-indigo-500 to-slate-400 border-white'
                                  : 'bg-gradient-to-br from-emerald-600 to-teal-500 border-emerald-300'
                              }`}
                            >
                              {ach.icon}
                              {isAchieved && (
                                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-yellow-400 rounded-full border-2 border-red-900 flex items-center justify-center text-[10px] text-red-950 font-black">
                                  ★
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <h3 className="font-calligraphy text-lg sm:text-xl font-black tracking-wide leading-tight">
                                {ach.badgeVisual}
                              </h3>
                              <p className="text-xs opacity-85 mt-1 font-medium line-clamp-2">
                                {ach.badgeVisualDesc}
                              </p>
                              <div className="mt-2 text-xs font-bold text-yellow-300 flex items-center gap-1">
                                <span>🎁 获赐：</span>
                                <span className="underline decoration-yellow-400/60 truncate">
                                  {ach.rewardName}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Bottom Action / Flip hint */}
                          <div className="pt-2 border-t border-white/15 flex items-center justify-between">
                            {isAchieved ? (
                              <>
                                <span className="text-[11px] text-yellow-200 font-bold flex items-center gap-1">
                                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                                  点击卡片 3D 翻转看诏书
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFlipBadge(ach.id);
                                  }}
                                  className="min-h-[44px] px-3.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-red-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                                >
                                  <span>查看诏书</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <div className="w-full space-y-1">
                                <div className="text-[11px] text-stone-500 flex justify-between font-bold">
                                  <span>达成进度</span>
                                  <span>{collectedCount} / {ach.requiredCount} 字</span>
                                </div>
                                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-amber-500 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPct}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* ================= BACK SIDE ( Imperial Decree Scroll 圣旨 ) ================= */}
                        <div
                          className="absolute inset-0 w-full h-full rounded-3xl p-5 border-4 border-yellow-500 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-b from-[#fdf6e2] via-[#faeed0] to-[#f4deb3] text-stone-900 shadow-2xl flex flex-col justify-between relative overflow-hidden"
                        >
                          {/* Imperial Scroll Cloud Watermarks */}
                          <div className="absolute top-2 left-3 text-2xl opacity-20 pointer-events-none">
                            🐉
                          </div>
                          <div className="absolute bottom-2 right-3 text-2xl opacity-20 pointer-events-none">
                            祥云
                          </div>

                          {/* Imperial Decree Header */}
                          <div className="text-center border-b-2 border-amber-300/80 pb-2">
                            <span className="font-calligraphy text-xs font-bold text-red-800 tracking-widest block">
                              皇帝御赐 · 天命昭告
                            </span>
                            <h4 className="font-calligraphy text-xl sm:text-2xl font-black text-red-900 tracking-wider">
                              {ach.decreeTitle}
                            </h4>
                          </div>

                          {/* Decree Text (Scroll Style) */}
                          <div className="my-auto px-3 py-2 bg-white/60 border border-amber-200/80 rounded-2xl shadow-inner relative">
                            <p className="font-calligraphy text-sm sm:text-base leading-relaxed text-stone-800 font-bold indent-6 text-justify">
                              “{ach.decreeText}”
                            </p>

                            {/* Cinnabar Seal on Decree */}
                            <div className="mt-2 flex justify-end">
                              <div className="w-14 h-14 border-2 border-red-700 bg-red-50 text-red-700 rounded-xl p-1 flex items-center justify-center font-calligraphy text-xs font-black shadow-xs rotate-6">
                                文曲御玺
                              </div>
                            </div>
                          </div>

                          {/* Bottom Controls: Speak Imperial Decree + Flip Back */}
                          <div className="pt-2 border-t border-amber-300/60 flex items-center justify-between gap-2">
                            <button
                              onClick={(e) => handleSpeakDecree(ach, e)}
                              className={`min-h-[48px] px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer ${
                                isPlayingDecreeId === ach.id
                                  ? 'bg-red-800 text-yellow-200 animate-pulse ring-2 ring-yellow-400'
                                  : 'bg-gradient-to-r from-red-700 to-amber-700 hover:from-red-800 hover:to-amber-800 text-white'
                              }`}
                            >
                              <Volume2 className="w-4 h-4 text-yellow-300" />
                              <span>{isPlayingDecreeId === ach.id ? '正在宣旨...' : '🔊 恭听皇朝旨意'}</span>
                            </button>

                            <button
                              onClick={() => handleToggleFlipBadge(ach.id)}
                              className="min-h-[48px] px-3.5 py-2 bg-white hover:bg-amber-100 border border-amber-300 text-stone-700 font-bold text-xs rounded-2xl transition-all active:scale-95 cursor-pointer flex items-center gap-1 shadow-xs"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                              <span>翻回正面</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: DECORATIONS WARDROBE (档案卡装扮阁) */}
          {activeTab === 'decorations' && (
            <div className="space-y-4 text-left">
              {/* Category Filter Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => {
                    sound.playTap();
                    setDecoCategory('frame');
                  }}
                  className={`min-h-[48px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                    decoCategory === 'frame'
                      ? 'bg-red-700 text-white shadow-md'
                      : 'bg-amber-100 text-stone-700 hover:bg-amber-200'
                  }`}
                >
                  <span>👑 头像边框</span>
                  <span className="text-xs opacity-75">({AVAILABLE_DECORATIONS.frames.length})</span>
                </button>
                <button
                  onClick={() => {
                    sound.playTap();
                    setDecoCategory('seal');
                  }}
                  className={`min-h-[48px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                    decoCategory === 'seal'
                      ? 'bg-red-700 text-white shadow-md'
                      : 'bg-amber-100 text-stone-700 hover:bg-amber-200'
                  }`}
                >
                  <span>🈴 朱砂私印</span>
                  <span className="text-xs opacity-75">({AVAILABLE_DECORATIONS.seals.length})</span>
                </button>
                <button
                  onClick={() => {
                    sound.playTap();
                    setDecoCategory('bgTheme');
                  }}
                  className={`min-h-[48px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                    decoCategory === 'bgTheme'
                      ? 'bg-red-700 text-white shadow-md'
                      : 'bg-amber-100 text-stone-700 hover:bg-amber-200'
                  }`}
                >
                  <span>📜 档案卡套</span>
                  <span className="text-xs opacity-75">({AVAILABLE_DECORATIONS.bgThemes.length})</span>
                </button>
                <button
                  onClick={() => {
                    sound.playTap();
                    setDecoCategory('title');
                  }}
                  className={`min-h-[48px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 ${
                    decoCategory === 'title'
                      ? 'bg-red-700 text-white shadow-md'
                      : 'bg-amber-100 text-stone-700 hover:bg-amber-200'
                  }`}
                >
                  <span>🎖️ 荣誉称号</span>
                  <span className="text-xs opacity-75">({AVAILABLE_DECORATIONS.titles.length})</span>
                </button>
              </div>

              {/* Items Grid for active category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {(decoCategory === 'frame'
                  ? AVAILABLE_DECORATIONS.frames
                  : decoCategory === 'seal'
                  ? AVAILABLE_DECORATIONS.seals
                  : decoCategory === 'bgTheme'
                  ? AVAILABLE_DECORATIONS.bgThemes
                  : AVAILABLE_DECORATIONS.titles
                ).map((item) => {
                  const isUnlocked =
                    (item.requiredChars > 0 ? collectedCount >= item.requiredChars : true) &&
                    (item.requiredStreakDays ? streakDays >= item.requiredStreakDays : true);
                  const isEquipped =
                    (decoCategory === 'frame' && equipped.frameId === item.id) ||
                    (decoCategory === 'seal' && equipped.sealId === item.id) ||
                    (decoCategory === 'bgTheme' && equipped.bgThemeId === item.id) ||
                    (decoCategory === 'title' && equipped.titleId === item.id);

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                        isEquipped
                          ? 'bg-amber-100/90 border-red-500 shadow-md ring-2 ring-red-300'
                          : isUnlocked
                          ? 'bg-white border-amber-200 hover:border-amber-400 shadow-xs'
                          : 'bg-stone-100/90 border-stone-200 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-stone-900">
                              {item.name}
                            </span>
                            {item.rarity === 'legendary' && (
                              <span className="bg-purple-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-md">
                                传说
                              </span>
                            )}
                            {item.rarity === 'epic' && (
                              <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-md">
                                史诗
                              </span>
                            )}
                          </div>

                          {isEquipped ? (
                            <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> 佩戴中
                            </span>
                          ) : !isUnlocked ? (
                            <span className="text-xs font-medium text-stone-500 flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              {item.requiredStreakDays
                                ? `需连签${item.requiredStreakDays}天`
                                : `需${item.requiredChars}字`}
                            </span>
                          ) : null}
                        </div>

                        <p className="text-xs text-stone-600 mb-3">
                          {item.description}
                        </p>
                      </div>

                      {/* Action Button */}
                      <div>
                        {isUnlocked ? (
                          <button
                            onClick={() => handleEquip(decoCategory, item.id)}
                            disabled={isEquipped}
                            className={`w-full min-h-[48px] rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              isEquipped
                                ? 'bg-red-700 text-white cursor-default'
                                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white active:scale-95 shadow-md'
                            }`}
                          >
                            {isEquipped ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>当前正在佩戴</span>
                              </>
                            ) : (
                              <span>立即佩戴此装扮</span>
                            )}
                          </button>
                        ) : (
                          <div className="w-full min-h-[48px] flex items-center justify-center bg-stone-200 text-stone-500 text-xs font-semibold rounded-2xl">
                            {item.requiredStreakDays
                              ? `尚未解锁 (还需连签 ${Math.max(0, item.requiredStreakDays - streakDays)} 天)`
                              : `尚未解锁 (还差 ${Math.max(0, item.requiredChars - collectedCount)} 字)`}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: PROFILE CARD PREVIEW (我的修业名帖预览) */}
          {activeTab === 'preview' && (
            <div className="space-y-4 text-center max-w-lg mx-auto">
              <div
                className={`p-6 sm:p-8 rounded-3xl border-4 border-amber-400 shadow-2xl relative overflow-hidden bg-gradient-to-br ${currentTheme.bgGradient}`}
              >
                {/* Decorative border corners */}
                <div className="absolute top-2 left-2 text-amber-500 text-lg">╔</div>
                <div className="absolute top-2 right-2 text-amber-500 text-lg">╗</div>
                <div className="absolute bottom-2 left-2 text-amber-500 text-lg">╚</div>
                <div className="absolute bottom-2 right-2 text-amber-500 text-lg">╝</div>

                {/* Avatar with equipped frame */}
                <div className="relative inline-block my-2">
                  <div
                    className={`w-24 h-24 rounded-3xl bg-amber-50 text-red-900 flex items-center justify-center font-calligraphy text-4xl font-black shadow-lg ${
                      currentFrame.frameClass || 'ring-4 ring-amber-400'
                    }`}
                  >
                    学
                  </div>
                  {collectedCount >= 50 && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-400 rounded-full border-2 border-red-900 flex items-center justify-center text-xs text-red-950 font-black shadow-md">
                      ★
                    </div>
                  )}
                </div>

                {/* Name & Title */}
                <h3 className="font-calligraphy text-2xl sm:text-3xl font-black mt-2 tracking-wider">
                  {equipped.userName}
                </h3>
                <div className="inline-block mt-1 bg-amber-400/90 text-red-950 text-xs font-black px-3 py-1 rounded-full shadow-xs">
                  {currentTitle.name}
                </div>

                {/* Stats summary */}
                <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-2xl bg-white/20 backdrop-blur-xs border border-white/20 text-xs">
                  <div>
                    <span className="block opacity-75">已通晓汉字</span>
                    <span className="font-black text-base">{collectedCount} 字</span>
                  </div>
                  <div>
                    <span className="block opacity-75">连续研习</span>
                    <span className="font-black text-base">{streakDays} 天</span>
                  </div>
                  <div>
                    <span className="block opacity-75">通关进度</span>
                    <span className="font-black text-base">
                      {Math.round((collectedCount / 3500) * 100 * 10) / 10}%
                    </span>
                  </div>
                </div>

                {/* Seal Stamp */}
                {currentSeal.sealText && (
                  <div className="mt-4 flex justify-end">
                    <div className="w-16 h-16 border-2 border-red-600 bg-red-50 text-red-700 rounded-2xl p-1 flex items-center justify-center font-calligraphy text-xs font-black shadow-md rotate-6">
                      {currentSeal.sealText}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-xs text-stone-500">
                名片装扮已实时同步保存，在主页面和排行榜上均会显示此荣耀风貌。
              </div>
            </div>
          )}
        </div>

        {/* Bottom Close / Save Action */}
        <div className="mt-4 pt-3 border-t-2 border-amber-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-stone-600">
            已掌握 <span className="text-red-700 font-bold">{collectedCount}</span> 个高频汉字
          </div>
          <button
            onClick={() => {
              sound.playTap();
              stopChineseSpeech();
              onClose();
            }}
            className="min-h-[48px] px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-sm rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            保存并返回探险
          </button>
        </div>
      </motion.div>
    </div>
  );
};
