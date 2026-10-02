import React from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  Library,
  Settings,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { UserEquippedDecorations } from './ProfileAchievementsModal';
import { DailyLearningRecord } from '../data/weeklyLearningData';
import { DailyMissionsState } from '../data/dailyMissionsData';

export type PinyinMode = 'full' | 'faded' | 'hidden';
export type AppRealm = 'mainline' | 'daily' | 'treasury';
export type MainlineSubTab = 'bookshelf' | 'story' | 'challenge' | 'rapid' | 'writing';
export type NavTab = 'story' | 'challenge' | 'writing' | 'cards';

export interface HeaderDashboardProps {
  currentStoryTitle?: string;
  onBackToBookshelf?: () => void;
  collectedCount?: number;
  totalTarget?: number;
  pinyinMode?: PinyinMode;
  onChangePinyinMode?: (mode: PinyinMode) => void;
  activeRealm?: AppRealm;
  onSelectRealm?: (realm: AppRealm) => void;
  activeMainlineTab?: MainlineSubTab;
  onSelectMainlineTab?: (tab: MainlineSubTab) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  equipped?: UserEquippedDecorations;
  onOpenProfile?: () => void;
  streakDays?: number;
  isTodayCheckedIn?: boolean;
  onOpenDailyCheckIn?: () => void;
  weeklyRecords?: DailyLearningRecord[];
  onAddWordSample?: () => void;
  missionsState?: DailyMissionsState;
  onTriggerCelebration?: () => void;
  onOpenParentConsole?: () => void;
}

export const HeaderDashboard: React.FC<HeaderDashboardProps> = ({
  currentStoryTitle = '《春节与年兽》',
  onBackToBookshelf,
  isMuted,
  onToggleMute,
  onTriggerCelebration,
  onOpenParentConsole,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-white shadow-lg border-b-2 border-amber-400">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Interactive Easter-Egg Logo + [📚 返回书架] 纯图标极简按键 */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* 汉字 Logo 彩蛋：点击触发通关金币庆典 */}
          <button
            onClick={() => {
              sound.playReward();
              onTriggerCelebration?.();
            }}
            className="group relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 text-red-950 font-festive font-black text-sm sm:text-base shadow-md border-2 border-yellow-200 flex items-center justify-center shrink-0 cursor-pointer transition-all duration-300 hover:scale-115 hover:rotate-6 hover:shadow-[0_0_18px_rgba(250,204,21,0.9)] active:scale-90"
            title="点击汉字印章，触发通关庆典彩蛋！✨"
            aria-label="触发通关庆典彩蛋"
          >
            <span>汉</span>
            <Sparkles className="w-2.5 h-2.5 text-red-900 absolute -top-1 -right-1 animate-pulse" />
          </button>

          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <h1 className="font-festive text-base sm:text-lg font-black text-yellow-100 tracking-wide whitespace-nowrap">
                汉字大冒险
              </h1>
              <span className="bg-amber-400/25 border border-amber-300/40 text-yellow-200 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap hidden xs:inline">
                甲辰龙年
              </span>
            </div>
          </div>

          {/* 📚 返回书架 纯图标按钮 (释放水平空间，保留 Tooltip 与清晰无障碍支持) */}
          <button
            onClick={() => {
              sound.playTap();
              onBackToBookshelf?.();
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-400 hover:bg-yellow-300 text-red-950 flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-md border border-yellow-200 ring-2 ring-yellow-200/50 shrink-0"
            title="返回魔法书架挑选新绘本"
            aria-label="返回魔法书架"
          >
            <Library className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-red-950" />
          </button>
        </div>

        {/* Center: Current Story Title (取消狭窄 max-w 截断，自适应拓宽完整展示) */}
        <div
          className="flex-1 min-w-0 max-w-xl mx-1 sm:mx-3 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-yellow-100 font-bold shadow-inner select-none text-center"
          title={`当前正在阅读：${currentStoryTitle}`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="truncate tracking-wide">{currentStoryTitle}</span>
        </div>

        {/* Right: Parent Console & Global Volume Control (精简掉独立庆典按钮，已作为 Logo 彩蛋) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 家长与教师辅导控制台 */}
          {onOpenParentConsole && (
            <button
              onClick={() => {
                sound.playTap();
                onOpenParentConsole();
              }}
              className="p-1.5 rounded-xl bg-red-950/60 hover:bg-red-950 border border-amber-400/40 text-amber-200 active:scale-95 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer shrink-0 transition-colors"
              title="家长与教师设置（调整拼音与语速）"
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
      </div>
    </header>
  );
};
