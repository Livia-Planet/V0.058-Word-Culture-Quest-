/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MobileLayoutContainer,
  MainlineSubTab,
  SheetRealm,
} from './components/MobileLayoutContainer';
import { StoryReader } from './components/StoryReader';
import { ChallengeSection } from './components/ChallengeSection';
import { RapidFireQuiz } from './components/RapidFireQuiz';
import { WritingLab } from './components/WritingLab';
import { DailyStudyCenter } from './components/DailyStudyCenter';
import { TreasuryPavilion, TreasurySubTab } from './components/TreasuryPavilion';
import { CharacterModal } from './components/CharacterModal';
import { ProfileAchievementsModal } from './components/ProfileAchievementsModal';
import { DailyCheckInModal } from './components/DailyCheckInModal';
import { BookshelfHome } from './components/BookshelfHome';
import { ParentConsoleModal } from './components/ParentConsoleModal';
import { CanvasParticleBurst, CanvasParticleBurstRef } from './components/CanvasParticleBurst';
import { IdiomMilestoneModal } from './components/IdiomMilestoneModal';
import { sound } from './utils/audio';
import { Flame, Crown } from 'lucide-react';

// Context & Global Stores (解决 Prop Drilling 与状态过载)
import { SettingsProvider, useSettingsStore } from './store/useSettingsStore';
import { GameProvider, useGameStore } from './store/useGameStore';

function AppContent() {
  const settingsStore = useSettingsStore();
  const gameStore = useGameStore();

  // Mobile Layout Container & Navigation State
  const [activeMainlineTab, setActiveMainlineTab] = useState<MainlineSubTab>('bookshelf');
  const [activeSheet, setActiveSheet] = useState<SheetRealm>(null);
  const [dailySubTab, setDailySubTab] = useState<'writing' | 'reading' | 'martial' | 'checkin' | 'missions' | 'growth'>('writing');
  const [treasurySubTab, setTreasurySubTab] = useState<TreasurySubTab>('scrolls');

  // Canvas-based Particle Eruption Ref
  const canvasBurstRef = useRef<CanvasParticleBurstRef | null>(null);

  // Profile & CheckIn Modals (UI toggles)
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isDailyCheckInOpen, setIsDailyCheckInOpen] = useState<boolean>(false);

  // Framer Motion Celebration State: Floating Clouds & Falling Gold Coins
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [celebrationCoins, setCelebrationCoins] = useState<
    Array<{ id: number; x: number; delay: number; duration: number; size: number }>
  >([]);

  // 触发通关庆典：播放金币碰撞音效并在屏幕上方渲染 framer-motion 动效
  const triggerChallengeCelebration = useCallback(() => {
    sound.playReward();

    const coins = Array.from({ length: 18 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.floor(Math.random() * 88) + 6, // 6% to 94% across viewport
      delay: Math.random() * 0.5,
      duration: 1.5 + Math.random() * 0.7,
      size: 24 + Math.floor(Math.random() * 12),
    }));
    setCelebrationCoins(coins);
    setShowCelebration(true);

    setTimeout(() => {
      setShowCelebration(false);
    }, 3200);
  }, []);

  // 监听全局汉字解锁时间戳变化，彻底解耦 UI 特效与 Prop 透传
  const prevUnlockTimestampRef = useRef<number>(gameStore.lastUnlockTimestamp);
  useEffect(() => {
    if (gameStore.lastUnlockTimestamp > 0 && gameStore.lastUnlockTimestamp !== prevUnlockTimestampRef.current) {
      prevUnlockTimestampRef.current = gameStore.lastUnlockTimestamp;
      triggerChallengeCelebration();
      if (gameStore.collectedCount > 0 && gameStore.collectedCount % 50 === 0) {
        canvasBurstRef.current?.triggerBurst({
          intensity: 'grand',
          trajectory: 'combo',
          count: 240,
        });
      }
    }
  }, [gameStore.lastUnlockTimestamp, gameStore.collectedCount, triggerChallengeCelebration]);

  // Mainline Fullscreen Content View
  const mainlineContent = (
    <div className={activeMainlineTab === 'bookshelf' ? '' : 'space-y-4'}>
      {activeMainlineTab === 'bookshelf' && (
        <BookshelfHome
          onSelectAndStartStory={(storyId) => {
            gameStore.setCurrentStoryId(storyId);
            setActiveMainlineTab('story');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onOpenDailyCenter={() => {
            setDailySubTab('martial');
            setActiveSheet('daily');
          }}
          onOpenTreasury={() => {
            setTreasurySubTab('scrolls');
            setActiveSheet('treasury');
          }}
        />
      )}

      {activeMainlineTab === 'story' && (
        <StoryReader
          onGoToChallenge={() => {
            setActiveMainlineTab('challenge');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {activeMainlineTab === 'challenge' && (
        <ChallengeSection
          onGoToWriting={() => {
            setActiveMainlineTab('writing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {activeMainlineTab === 'rapid' && (
        <div className="max-w-3xl mx-auto py-2">
          <RapidFireQuiz
            onGoToWriting={() => {
              setActiveMainlineTab('writing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}

      {activeMainlineTab === 'writing' && (
        <WritingLab />
      )}
    </div>
  );

  // Bottom Sheet Content View (Daily Study Center or Treasury Pavilion)
  let sheetContent: React.ReactNode = null;
  let sheetTitle = '';
  let sheetSubtitle = '';
  let sheetIcon: React.ReactNode = null;

  if (activeSheet === 'daily') {
    sheetTitle = '【日常：研习中心】';
    sheetSubtitle = '每日演武 · 美文阅读 · 学业周报';
    sheetIcon = <Flame className="w-5 h-5 text-yellow-300" />;
    sheetContent = (
      <DailyStudyCenter
        initialSubTab={dailySubTab}
        onNavigateToTab={(tab) => {
          setActiveSheet(null);
          if (tab === 'story' || tab === 'challenge' || tab === 'writing' || tab === 'rapid' || tab === 'bookshelf') {
            setActiveMainlineTab(tab);
          }
        }}
      />
    );
  } else if (activeSheet === 'treasury') {
    sheetTitle = '【宝库：修业阁】';
    sheetSubtitle = '典藏故事画卷 · 墨宝工坊 · 四阶文位勋章 · 档案装扮阁';
    sheetIcon = <Crown className="w-5 h-5 text-yellow-300" />;
    sheetContent = (
      <TreasuryPavilion
        initialSubTab={treasurySubTab}
        onNavigateToWriting={() => {
          setActiveSheet(null);
          setActiveMainlineTab('writing');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <>
      {/* 基于 Canvas 的小型/盛大粒子喷发特效组件 */}
      <CanvasParticleBurst ref={canvasBurstRef} />

      {/* 50字累积突破 · 成语典故知识锦囊庆典弹窗 */}
      <IdiomMilestoneModal
        isOpen={gameStore.milestoneModalOpen}
        onClose={() => gameStore.setMilestoneModalOpen(false)}
        milestoneCount={gameStore.milestoneCount}
        idiom={gameStore.milestoneIdiom}
        onRetriggerBurst={() => canvasBurstRef.current?.triggerBurst({ intensity: 'grand' })}
      />

      {/* 基于 framer-motion 的金币掉落与祥云漂浮动画 */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
          >
            {/* 顶部祥云漂浮动画 (Floating Auspicious Clouds via framer-motion) */}
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute top-0 inset-x-0 h-40 flex justify-between items-start px-3 sm:px-12 pointer-events-none pt-2"
            >
              {/* Left Floating Cloud */}
              <motion.div
                animate={{ x: [0, 18, 0], y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-44 sm:w-64 h-24 sm:h-32 text-amber-300 drop-shadow-[0_8px_16px_rgba(245,158,11,0.4)]"
              >
                <svg viewBox="0 0 200 90" fill="none" className="w-full h-full">
                  <path
                    d="M20 55C15 35 35 25 55 30C65 10 95 10 115 25C130 15 155 20 165 35C185 35 200 50 195 65C190 80 170 85 150 82C130 85 105 82 85 82C60 82 35 82 20 70C15 65 15 60 20 55Z"
                    fill="#fef08a"
                    fillOpacity="0.85"
                  />
                  <path
                    d="M40 55C40 42 55 36 70 40C80 25 105 25 120 38C132 30 150 35 158 48C170 48 180 58 178 70C170 78 150 78 135 76C115 78 95 76 75 76C55 76 40 70 40 55Z"
                    fill="#fbbf24"
                    fillOpacity="0.95"
                  />
                  <circle cx="88" cy="46" r="8" stroke="#ca8a04" strokeWidth="2.5" fill="none" />
                  <circle cx="122" cy="50" r="6" stroke="#ca8a04" strokeWidth="2" fill="none" />
                </svg>
              </motion.div>

              {/* Center Imperial Banner */}
              <motion.div
                initial={{ scale: 0.7, y: -20, opacity: 0 }}
                animate={{ scale: 1, y: 8, opacity: 1 }}
                exit={{ scale: 0.8, y: -20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                className="flex flex-col items-center bg-gradient-to-r from-red-950 via-red-900 to-amber-950 border-2 border-yellow-400 rounded-2xl px-4 sm:px-6 py-2 shadow-2xl mt-1"
              >
                <div className="flex items-center gap-1.5 font-festive text-yellow-300 font-black text-sm sm:text-base">
                  <span>🐉</span>
                  <span>通关大捷 · 龙腾祥瑞 · 财禄双至</span>
                  <span>🪙</span>
                </div>
                <span className="text-[10px] text-amber-200 font-bold">
                  完成挑战任务 · 聚宝金币倾洒福佑
                </span>
              </motion.div>

              {/* Right Floating Cloud */}
              <motion.div
                animate={{ x: [0, -18, 0], y: [0, -8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-44 sm:w-64 h-24 sm:h-32 text-yellow-300 drop-shadow-[0_8px_16px_rgba(234,179,8,0.4)]"
              >
                <svg viewBox="0 0 200 90" fill="none" className="w-full h-full">
                  <path
                    d="M20 55C15 35 35 25 55 30C65 10 95 10 115 25C130 15 155 20 165 35C185 35 200 50 195 65C190 80 170 85 150 82C130 85 105 82 85 82C60 82 35 82 20 70C15 65 15 60 20 55Z"
                    fill="#fef08a"
                    fillOpacity="0.85"
                  />
                  <path
                    d="M40 55C40 42 55 36 70 40C80 25 105 25 120 38C132 30 150 35 158 48C170 48 180 58 178 70C170 78 150 78 135 76C115 78 95 76 75 76C55 76 40 70 40 55Z"
                    fill="#eab308"
                    fillOpacity="0.9"
                  />
                  <circle cx="95" cy="48" r="7" stroke="#b45309" strokeWidth="2" fill="none" />
                </svg>
              </motion.div>
            </motion.div>

            {/* 金币掉落动画 (Falling Gold Coins via framer-motion) */}
            {celebrationCoins.map((coin) => (
              <motion.div
                key={coin.id}
                initial={{
                  y: -50,
                  x: `${coin.x}vw`,
                  rotate: 0,
                  opacity: 0,
                  scale: 0.6,
                }}
                animate={{
                  y: ['-5vh', '30vh', '70vh', '105vh'],
                  rotate: [0, 180, 360, 540],
                  opacity: [0, 1, 1, 0],
                  scale: [0.6, 1.15, 1, 0.7],
                }}
                transition={{
                  duration: coin.duration,
                  delay: coin.delay,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="absolute top-0 pointer-events-none"
              >
                {/* Traditional Chinese Square-Hole Gold Coin */}
                <div
                  className="rounded-full bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-600 border-2 border-yellow-100 shadow-2xl flex items-center justify-center ring-2 ring-yellow-300/60"
                  style={{ width: `${coin.size}px`, height: `${coin.size}px` }}
                >
                  <div className="w-2 h-2 bg-red-950 border border-yellow-200" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 核心移动端容器布局 (无需逐层传递 10+ props，内部直调 Store) */}
      <MobileLayoutContainer
        activeMainlineTab={activeMainlineTab}
        onSelectMainlineTab={setActiveMainlineTab}
        mainlineContent={mainlineContent}
        activeSheet={activeSheet}
        onOpenSheet={(sheet) => {
          if (sheet === 'daily') setDailySubTab('writing');
          if (sheet === 'treasury') setTreasurySubTab('badges');
          setActiveSheet(sheet);
        }}
        onCloseSheet={() => setActiveSheet(null)}
        sheetContent={sheetContent}
        sheetTitle={sheetTitle}
        sheetSubtitle={sheetSubtitle}
        sheetIcon={sheetIcon}
        onBackToBookshelf={() => setActiveMainlineTab('bookshelf')}
        onTriggerCelebration={triggerChallengeCelebration}
      />

      {/* 家长与教师辅导设置弹窗 (内部直调 useSettingsStore & useGameStore) */}
      <ParentConsoleModal />

      {/* 汉字字理结构与笔顺动画详情弹窗 */}
      <AnimatePresence>
        {gameStore.modalChar && (
          <CharacterModal
            key={gameStore.modalChar.id || gameStore.modalChar.char}
            charData={gameStore.modalChar}
            onClose={() => gameStore.setModalChar(null)}
          />
        )}
      </AnimatePresence>

      {/* 个人成就与装扮阁弹窗 */}
      <ProfileAchievementsModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* 每日学习签到弹窗 */}
      <DailyCheckInModal
        isOpen={isDailyCheckInOpen}
        onClose={() => setIsDailyCheckInOpen(false)}
      />
    </>
  );
}

// 全局错误边界组件：防止偶发图形/Canvas渲染或低端设备内存溢出导致整屏白屏
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Applet ErrorBoundary caught error]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 border-4 border-amber-300 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-3xl">
              🐰
            </div>
            <h2 className="font-festive font-black text-xl text-amber-950">
              哎呀，探险画卷稍作休息~
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed font-sans">
              小兔子 Bobu 正在整理知识宝库中的古籍与星际线索。请点击下方按钮重新打开书卷。
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all active:scale-98 cursor-pointer"
            >
              重新打开书卷
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <GameProvider>
          <AppContent />
        </GameProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}
