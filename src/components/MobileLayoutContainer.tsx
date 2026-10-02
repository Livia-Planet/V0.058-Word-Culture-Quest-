import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import {
  BookMarked,
  Flame,
  Crown,
  X,
  Library,
  BookOpen,
  ChevronDown,
  Volume2,
  VolumeX,
  Eye,
  Award,
  Sparkles,
  Gamepad2,
  Zap,
  PenTool,
  Target,
  Palette,
  Compass,
  Settings,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { PinyinMode } from './HeaderDashboard';
import { UserEquippedDecorations } from './ProfileAchievementsModal';
import { AVAILABLE_DECORATIONS } from '../data/achievementData';
import { FloatingNav } from './FloatingNav';
import { useSettingsStore } from '../store/useSettingsStore';
import { useGameStore } from '../store/useGameStore';

export type MainlineSubTab = 'bookshelf' | 'story' | 'challenge' | 'rapid' | 'writing';
export type SheetRealm = 'daily' | 'treasury' | null;

interface FallingCoin {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  rotate: number;
}

export interface MobileLayoutContainerProps {
  // Mainline Navigation
  activeMainlineTab: MainlineSubTab;
  onSelectMainlineTab: (tab: MainlineSubTab) => void;
  mainlineContent: React.ReactNode;

  // Auxiliary Bottom Sheet
  activeSheet: SheetRealm;
  onOpenSheet: (sheet: 'daily' | 'treasury') => void;
  onCloseSheet: () => void;
  sheetContent: React.ReactNode;
  sheetTitle: string;
  sheetSubtitle?: string;
  sheetIcon?: React.ReactNode;

  // Global Header Stats & Story Switch (Optional overrides, directly connected to Store)
  currentStoryTitle?: string;
  onBackToBookshelf?: () => void;
  onOpenParentConsole?: () => void;
  collectedCount?: number;
  totalTarget?: number;
  pinyinMode?: PinyinMode;
  onChangePinyinMode?: (mode: PinyinMode) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  equipped?: UserEquippedDecorations;

  // Notification badges
  streakDays?: number;
  isTodayCheckedIn?: boolean;
  readyToClaimMissionsCount?: number;

  // Challenge task completion celebration trigger
  onTriggerCelebration?: () => void;
}

export const MobileLayoutContainer: React.FC<MobileLayoutContainerProps> = ({
  activeMainlineTab,
  onSelectMainlineTab,
  mainlineContent,
  activeSheet,
  onOpenSheet,
  onCloseSheet,
  sheetContent,
  sheetTitle,
  sheetSubtitle,
  sheetIcon,
  currentStoryTitle: propCurrentStoryTitle,
  onBackToBookshelf,
  onOpenParentConsole: propOnOpenParentConsole,
  collectedCount: propCollectedCount,
  totalTarget: propTotalTarget,
  pinyinMode: _propPinyinMode,
  onChangePinyinMode: _propOnChangePinyinMode,
  isMuted: propIsMuted,
  onToggleMute: propOnToggleMute,
  equipped: propEquipped,
  streakDays: propStreakDays,
  isTodayCheckedIn: propIsTodayCheckedIn,
  readyToClaimMissionsCount: propReadyToClaimMissionsCount,
  onTriggerCelebration,
}) => {
  // Direct Store consumption (彻底解耦 Prop Drilling)
  const settingsStore = useSettingsStore();
  const gameStore = useGameStore();

  const isMuted = propIsMuted ?? settingsStore.isMuted;
  const onToggleMute = propOnToggleMute ?? settingsStore.toggleMute;
  const onOpenParentConsole = propOnOpenParentConsole ?? settingsStore.openParentConsole;
  const currentStoryTitle = propCurrentStoryTitle ?? gameStore.currentStory.title;
  const collectedCount = propCollectedCount ?? gameStore.collectedCount;
  const totalTarget = propTotalTarget ?? gameStore.totalTarget;
  const equipped = propEquipped ?? gameStore.equippedDecorations;
  const streakDays = propStreakDays ?? gameStore.streakState.streakDays;
  const isTodayCheckedIn = propIsTodayCheckedIn ?? gameStore.streakState.isTodayCheckedIn;
  const readyToClaimMissionsCount = propReadyToClaimMissionsCount ?? gameStore.readyToClaimMissionsCount;

  const percent = Math.min(100, Math.round((collectedCount / totalTarget) * 100 * 10) / 10);
  const currentFrame =
    AVAILABLE_DECORATIONS.frames.find((f) => f.id === equipped.frameId) ||
    AVAILABLE_DECORATIONS.frames[0];

  // Falling Gold Coins Animation State (龙年金币掉落动画)
  const [fallingCoins, setFallingCoins] = useState<FallingCoin[]>([]);
  const prevCountRef = useRef(collectedCount);

  // Trigger celebration coin rain
  const triggerCoinRain = useCallback(() => {
    sound.playReward();
    const coins: FallingCoin[] = Array.from({ length: 16 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.floor(Math.random() * 88) + 6, // 6% to 94% across viewport
      delay: Math.random() * 0.5,
      duration: 1.4 + Math.random() * 0.7,
      size: 22 + Math.floor(Math.random() * 12),
      rotate: Math.floor(Math.random() * 360),
    }));
    setFallingCoins(coins);
    setTimeout(() => {
      setFallingCoins([]);
    }, 2400);
  }, []);

  // Automatically trigger coin rain whenever user unlocks or collects words
  useEffect(() => {
    if (collectedCount > prevCountRef.current) {
      triggerCoinRain();
    }
    prevCountRef.current = collectedCount;
  }, [collectedCount, triggerCoinRain]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 350) {
      sound.playTap();
      onCloseSheet();
    }
  };

  const isBookshelfView = activeMainlineTab === 'bookshelf';

  return (
    <div className="relative min-h-screen h-screen flex flex-col bg-stone-900 overflow-hidden font-sans select-none">
      {/* 0. FALLING GOLD COINS CELEBRATION LAYER (金币掉落动效) */}
      <AnimatePresence>
        {fallingCoins.length > 0 && (
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {fallingCoins.map((coin) => (
              <div
                key={coin.id}
                className="absolute -top-10 animate-coin-drop"
                style={{
                  left: `${coin.x}%`,
                  animationDelay: `${coin.delay}s`,
                  animationDuration: `${coin.duration}s`,
                }}
              >
                {/* Traditional Chinese Square-Hole Gold Coin */}
                <div
                  className="rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 border-2 border-yellow-100 shadow-xl flex items-center justify-center transform-gpu ring-2 ring-yellow-400/40"
                  style={{
                    width: `${coin.size}px`,
                    height: `${coin.size}px`,
                    transform: `rotate(${coin.rotate}deg)`,
                  }}
                >
                  <div className="w-1.5 h-1.5 bg-red-950 border border-yellow-200" />
                </div>
                <Sparkles className="w-3.5 h-3.5 text-yellow-200 absolute -top-1 -right-1 animate-ping" />
              </div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* 1. TOP NAVIGATION: HIDE IN BOOKSHELF HOME OR IMMERSIVE READING MODE */}
      {!isBookshelfView && !settingsStore.isImmersiveReading && (
        <header className="shrink-0 z-20 relative overflow-hidden bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-white shadow-md border-b-2 border-amber-400/80 px-3 py-2 flex items-center justify-between gap-2">
          {/* Dynamic Year of the Dragon Auspicious Clouds */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-45">
            <div className="absolute -left-6 -top-3 w-40 h-16 animate-cloud-left">
              <svg viewBox="0 0 160 64" fill="none" className="w-full h-full text-amber-300 drop-shadow-sm">
                <path
                  d="M10 40C10 28 22 22 34 26C38 12 56 10 68 18C78 12 94 14 98 26C110 24 122 32 122 42C122 52 110 58 98 56C86 58 70 56 58 56C42 56 26 56 10 40Z"
                  fill="currentColor"
                  opacity="0.35"
                />
                <path
                  d="M24 42C24 33 32 29 40 31C44 21 56 19 64 25C70 21 80 23 84 31C92 29 100 35 100 41C100 49 90 51 82 49C74 51 64 49 56 49C44 49 34 49 24 42Z"
                  fill="#fef08a"
                  opacity="0.65"
                />
                <circle cx="56" cy="33" r="5" stroke="#eab308" strokeWidth="1.2" fill="none" />
                <circle cx="78" cy="36" r="3.5" stroke="#ca8a04" strokeWidth="1" fill="none" />
              </svg>
            </div>

            <div className="absolute -right-6 -bottom-3 w-44 h-16 animate-cloud-right">
              <svg viewBox="0 0 160 64" fill="none" className="w-full h-full text-yellow-300 drop-shadow-sm">
                <path
                  d="M20 38C20 26 34 20 46 24C52 10 70 8 82 16C92 10 108 12 114 24C126 22 138 30 138 40C138 50 126 56 114 54C102 56 86 54 74 54C58 54 42 54 20 38Z"
                  fill="currentColor"
                  opacity="0.35"
                />
                <path
                  d="M36 40C36 31 44 27 52 29C58 19 70 17 78 23C86 19 96 21 100 29C108 27 116 33 116 39C116 47 106 49 98 47C88 49 78 47 70 47C58 47 46 47 36 40Z"
                  fill="#fde047"
                  opacity="0.6"
                />
                <circle cx="70" cy="32" r="4.5" stroke="#ca8a04" strokeWidth="1.2" fill="none" />
              </svg>
            </div>
          </div>

          {/* Left: [📚 返回书架] 纯图标极简按键与彩蛋 Logo */}
          <div className="relative z-10 flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* 汉字 Logo 彩蛋：点击触发通关金币庆典 */}
            <button
              onClick={() => {
                sound.playReward();
                onTriggerCelebration?.();
              }}
              className="group relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 text-red-950 font-festive font-black text-sm sm:text-base shadow-sm border-2 border-yellow-200 flex items-center justify-center shrink-0 cursor-pointer transition-all duration-300 hover:scale-115 hover:rotate-6 hover:shadow-[0_0_18px_rgba(250,204,21,0.9)] active:scale-90"
              title="点击汉字印章，触发通关庆典彩蛋！✨"
              aria-label="触发通关庆典彩蛋"
            >
              <span>汉</span>
              <Sparkles className="w-2.5 h-2.5 text-red-900 absolute -top-1 -right-1 animate-pulse" />
            </button>

            {/* 📚 返回书架 纯图标按键 (释放水平空间，保留 Tooltip 与无障碍标签) */}
            <button
              onClick={() => {
                sound.playTap();
                if (onBackToBookshelf) {
                  onBackToBookshelf();
                } else {
                  onSelectMainlineTab('bookshelf');
                }
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-400 hover:bg-yellow-300 text-red-950 flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-md border border-yellow-200 ring-2 ring-yellow-200/50 shrink-0"
              title="放回故事，返回魔法书架"
              aria-label="返回魔法书架"
            >
              <Library className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-red-950" />
            </button>
          </div>

          {/* Center: Current Story Title (取消狭窄限制，居中完整展现) */}
          <div
            className="relative z-10 flex-1 min-w-0 max-w-xl mx-1 sm:mx-3 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-yellow-100 font-bold shadow-inner select-none text-center"
            title={`当前正在阅读：${currentStoryTitle || '《年兽的故事》'}`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="truncate tracking-wide">{currentStoryTitle || '《年兽的故事》'}</span>
          </div>

          {/* Right: Parent Console & Global Volume (精简掉独立庆典按钮，已合入 Logo 彩蛋) */}
          <div className="relative z-10 flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 家长辅导设置 */}
            {onOpenParentConsole && (
              <button
                onClick={() => {
                  sound.playTap();
                  onOpenParentConsole();
                }}
                className="p-1.5 rounded-xl bg-red-950/60 hover:bg-red-950 border border-amber-400/40 text-amber-200 active:scale-95 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer shrink-0 transition-colors"
                title="家长与教师辅导设置"
                aria-label="家长辅导设置"
              >
                <Settings className="w-4 h-4 text-yellow-300" />
              </button>
            )}

            {/* 全局音量控制 */}
            <button
              onClick={() => {
                onToggleMute();
                sound.playTap();
              }}
              className="p-1.5 rounded-xl bg-red-950/60 hover:bg-red-950 border border-amber-400/40 text-amber-200 active:scale-95 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer shrink-0 transition-colors"
              title={isMuted ? '开启音效' : '静音'}
              aria-label={isMuted ? '开启音效' : '静音'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-yellow-300" />}
            </button>
          </div>
        </header>
      )}

      {/* 2. FLOATING 2x2 ACTION BUTTON NAVIGATION (Only in reading/challenge modes, hidden in immersive mode) */}
      {!settingsStore.isImmersiveReading && (
        <FloatingNav activeTab={activeMainlineTab} onSelectTab={onSelectMainlineTab} />
      )}

      {/* 3. FULLSCREEN MAINLINE CONTENT CONTAINER WITH INDEPENDENT SCROLL */}
      <main
        className={`flex-1 overflow-y-auto overscroll-y-contain text-slate-800 ${
          isBookshelfView
            ? 'p-0 bg-stone-900'
            : settingsStore.isImmersiveReading
            ? 'bg-[#faf6ed] p-0'
            : 'bg-gradient-to-b from-amber-50 via-orange-50/40 to-amber-100/60 pb-28 pt-2 px-3 sm:px-4'
        }`}
      >
        <div className={isBookshelfView ? 'w-full h-full' : settingsStore.isImmersiveReading ? 'w-full h-full' : 'max-w-5xl mx-auto'}>
          {mainlineContent}
        </div>
      </main>

      {/* 4. FIXED BOTTOM DOCK (固定底栏导航，在沉浸阅读模式下隐藏) */}
      {!settingsStore.isImmersiveReading && (
        <nav className="fixed bottom-0 inset-x-0 z-30 pointer-events-none pb-2 sm:pb-3 px-3">
          <div className="max-w-md mx-auto pointer-events-auto bg-stone-900/92 backdrop-blur-md border-2 border-amber-400/70 rounded-3xl shadow-2xl p-1.5 flex items-center justify-between gap-1.5">
            {/* Bookshelf Home Dock Button */}
            <button
              onClick={() => {
                sound.playTap();
                if (activeSheet) onCloseSheet();
                onSelectMainlineTab('bookshelf');
              }}
              className={`flex-1 min-h-[48px] py-1.5 px-2 rounded-2xl transition-all cursor-pointer active:scale-95 flex flex-col items-center justify-center ${
                !activeSheet && isBookshelfView
                  ? 'bg-gradient-to-b from-amber-400 to-yellow-400 text-red-950 font-black shadow-md ring-2 ring-yellow-300'
                  : 'text-amber-200/80 hover:text-yellow-200 hover:bg-stone-800/60'
              }`}
            >
              <Library className="w-5 h-5 shrink-0" />
              <span className="text-[11px] font-bold leading-tight mt-0.5">典籍书架</span>
            </button>

            {/* Reading Quest Tab (if in reading/challenge) */}
            {!isBookshelfView && (
              <button
                onClick={() => {
                  sound.playTap();
                  if (activeSheet) onCloseSheet();
                }}
                className={`flex-1 min-h-[48px] py-1.5 px-2 rounded-2xl transition-all cursor-pointer active:scale-95 flex flex-col items-center justify-center ${
                  !activeSheet && !isBookshelfView
                    ? 'bg-gradient-to-b from-amber-400 to-yellow-400 text-red-950 font-black shadow-md ring-2 ring-yellow-300'
                    : 'text-amber-200/80 hover:text-yellow-200 hover:bg-stone-800/60'
                }`}
              >
                <BookMarked className="w-5 h-5 shrink-0" />
                <span className="text-[11px] font-bold leading-tight mt-0.5">当前修业</span>
              </button>
            )}

            {/* Daily Study Center Dock Button (研习中心抽屉) */}
            <button
              onClick={() => {
                sound.playTap();
                onOpenSheet('daily');
              }}
              className={`flex-1 min-h-[48px] py-1.5 px-2 rounded-2xl transition-all cursor-pointer active:scale-95 flex flex-col items-center justify-center relative ${
                activeSheet === 'daily'
                  ? 'bg-gradient-to-b from-amber-400 to-yellow-400 text-red-950 font-black shadow-md ring-2 ring-yellow-300'
                  : 'text-amber-200/80 hover:text-yellow-200 hover:bg-stone-800/60'
              }`}
            >
              <div className="relative">
                <Flame
                  className={`w-5 h-5 ${
                    activeSheet === 'daily'
                      ? 'text-red-950'
                      : isTodayCheckedIn
                      ? 'text-amber-400'
                      : 'text-yellow-300 animate-bounce'
                  }`}
                />
                {(!isTodayCheckedIn || readyToClaimMissionsCount > 0) && (
                  <span className="w-2.5 h-2.5 bg-yellow-300 rounded-full absolute -top-1 -right-1 ring-2 ring-stone-900 animate-ping" />
                )}
              </div>
              <span className="text-[11px] font-bold leading-tight mt-0.5 flex items-center gap-0.5">
                <span>研习中心</span>
                {!isTodayCheckedIn && (
                  <span className="text-[9px] bg-red-600 text-white font-black px-1 rounded-full">
                    待签
                  </span>
                )}
              </span>
            </button>

            {/* Treasury Pavilion Dock Button (宝库修业阁抽屉) */}
            <button
              onClick={() => {
                sound.playTap();
                onOpenSheet('treasury');
              }}
              className={`flex-1 min-h-[48px] py-1.5 px-2 rounded-2xl transition-all cursor-pointer active:scale-95 flex flex-col items-center justify-center ${
                activeSheet === 'treasury'
                  ? 'bg-gradient-to-b from-amber-400 to-yellow-400 text-red-950 font-black shadow-md ring-2 ring-yellow-300'
                  : 'text-amber-200/80 hover:text-yellow-200 hover:bg-stone-800/60'
              }`}
            >
              <Crown
                className={`w-5 h-5 ${
                  activeSheet === 'treasury' ? 'text-red-950' : 'text-amber-400'
                }`}
              />
              <span className="text-[11px] font-bold leading-tight mt-0.5">修业宝库</span>
            </button>
          </div>
        </nav>
      )}

      {/* 5. GESTURE-CONTROLLED BOTTOM SHEET */}
      <AnimatePresence>
        {activeSheet && (
          <div className="fixed inset-0 z-40 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => {
                sound.playTap();
                onCloseSheet();
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0.05, bottom: 0.6 }}
              onDragEnd={handleDragEnd}
              className="relative w-full max-h-[88vh] bg-amber-50 rounded-t-[32px] border-t-4 border-amber-400 shadow-2xl flex flex-col overflow-hidden z-50"
            >
              <div className="shrink-0 bg-gradient-to-r from-red-900 via-red-800 to-amber-900 text-white px-4 pt-3 pb-3 border-b-2 border-amber-400/50 flex flex-col items-center">
                <div className="w-12 h-1.5 bg-amber-300/80 rounded-full mb-2 cursor-grab active:cursor-grabbing hover:bg-yellow-200 transition-colors" />

                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {sheetIcon}
                    <div>
                      <h3 className="font-calligraphy font-black text-lg text-yellow-100 leading-tight">
                        {sheetTitle}
                      </h3>
                      {sheetSubtitle && (
                        <p className="text-[11px] text-amber-200/90 leading-tight">
                          {sheetSubtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sound.playTap();
                      onCloseSheet();
                    }}
                    className="p-2 rounded-2xl bg-red-950/80 hover:bg-red-950 border border-amber-400/50 text-amber-200 active:scale-95 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shadow-sm"
                    title="收起抽屉"
                  >
                    <ChevronDown className="w-5 h-5 text-yellow-300" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 pb-20 text-slate-800">
                {sheetContent}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
