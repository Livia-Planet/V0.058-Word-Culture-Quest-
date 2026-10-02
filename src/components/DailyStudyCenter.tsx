import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Flame,
  Award,
  CheckCircle2,
  BookOpen,
  Swords,
  Volume2,
  RotateCcw,
  ChevronRight,
  X,
  ExternalLink,
  Sparkles,
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  PieChart,
  Target,
  ArrowUpRight,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { HanziChar, TARGET_CHARACTERS } from '../data/level1Data';
import { ALL_STORIES, StoryLevel } from '../data/storyLevels';
import { STREAK_REWARDS } from '../data/dailyStreakData';
import { DailyMissions } from './DailyMissions';
import { sound, speakChinese } from '../utils/audio';
import { DailyLearningRecord } from '../data/weeklyLearningData';

export type DailyStudyCenterTab = 'martial' | 'reading' | 'report';

export interface DailyStudyCenterProps {
  initialSubTab?: 'martial' | 'reading' | 'report' | 'writing' | 'checkin' | 'missions' | 'growth';
  onNavigateToTab?: (tab: string) => void;
  streakState?: any;
  onCheckIn?: () => void;
  onFastForwardStreak?: (days: number) => void;
  onResetStreak?: () => void;
  missionsState?: any;
  onUpdateMissionsState?: (newState: any) => void;
  weeklyRecords?: any;
  onAddWordSample?: () => void;
  onSelectCharacterFromChart?: (char: string) => void;
}

export const DailyStudyCenter: React.FC<DailyStudyCenterProps> = ({
  initialSubTab = 'martial',
  onNavigateToTab,
}) => {
  const gameStore = useGameStore();

  const resolveInitialTab = (tabStr: string): DailyStudyCenterTab => {
    if (tabStr === 'report' || tabStr === 'growth') return 'report';
    if (tabStr === 'reading') return 'reading';
    return 'martial';
  };

  const [activeTab, setActiveTab] = useState<DailyStudyCenterTab>(() =>
    resolveInitialTab(initialSubTab)
  );

  const [readingDrawerStory, setReadingDrawerStory] = useState<StoryLevel | null>(null);
  const [selectedStoryCategory, setSelectedStoryCategory] = useState<string>('all');
  const [hasCompletedCurrentArticleRead, setHasCompletedCurrentArticleRead] = useState<boolean>(false);
  const [selectedHeatmapDayIndex, setSelectedHeatmapDayIndex] = useState<number | null>(6);

  const filteredStories = useMemo(() => {
    if (selectedStoryCategory === 'all') return ALL_STORIES;
    return ALL_STORIES.filter((s) => s.category === selectedStoryCategory);
  }, [selectedStoryCategory]);

  const readingProgress = gameStore.readingProgress;
  const completedStoriesCount =
    readingProgress?.completedArticlesCount ?? readingProgress?.readChapterIds?.length ?? 1;
  const averageReadingScore = useMemo(() => {
    const scores = Object.values(readingProgress?.readingScores || {});
    if (scores.length === 0) return 92;
    const sum = scores.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / scores.length);
  }, [readingProgress?.readingScores]);

  const weeklyRecords: DailyLearningRecord[] = useMemo(() => {
    return gameStore.weeklyRecords && gameStore.weeklyRecords.length === 7
      ? gameStore.weeklyRecords
      : [];
  }, [gameStore.weeklyRecords]);

  const totalWeeklyMinutes = useMemo(() => {
    return weeklyRecords.reduce((sum, r) => sum + (r.studyMinutes || 0), 0);
  }, [weeklyRecords]);

  const totalWeeklyWords = useMemo(() => {
    return weeklyRecords.reduce((sum, r) => sum + (r.newWordsCount || 0), 0);
  }, [weeklyRecords]);

  const avgWeeklyAccuracy = useMemo(() => {
    if (weeklyRecords.length === 0) return 94;
    const sum = weeklyRecords.reduce((acc, r) => acc + (r.accuracy || 90), 0);
    return Math.round((sum / weeklyRecords.length) * 10) / 10;
  }, [weeklyRecords]);

  const allWeeklyLearnedWords = useMemo(() => {
    const set = new Set<string>();
    weeklyRecords.forEach((r) => {
      r.charactersLearned?.forEach((w) => set.add(w));
    });
    return Array.from(set);
  }, [weeklyRecords]);

  const getHeatmapColorClass = (minutes: number) => {
    if (minutes <= 0) {
      return {
        bg: 'bg-stone-100 hover:bg-stone-200 text-stone-500 border-stone-300/80',
        tier: '未打卡',
      };
    }
    if (minutes <= 15) {
      return {
        bg: 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 shadow-2xs',
        tier: '启蒙轻练 (1-15分)',
      };
    }
    if (minutes <= 25) {
      return {
        bg: 'bg-amber-300 hover:bg-amber-400 text-amber-950 border-amber-500/80 shadow-xs font-bold',
        tier: '达标研习 (16-25分)',
      };
    }
    if (minutes <= 35) {
      return {
        bg: 'bg-orange-500 hover:bg-orange-600 text-white border-orange-600 shadow-sm font-black',
        tier: '勤勉笃行 (26-35分)',
      };
    }
    return {
      bg: 'bg-orange-700 hover:bg-orange-800 text-yellow-100 border-orange-800 shadow-md font-black ring-2 ring-yellow-400/50',
      tier: '沉浸精进 (36分+)',
    };
  };

  const handleCheckIn = () => {
    sound.playBadgeUnlock();
    gameStore.checkIn();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.warn('[Confetti Error]:', e);
    }
  };

  const handleOpenReadingDrawer = (story: StoryLevel) => {
    sound.playTap();
    setReadingDrawerStory(story);
    setHasCompletedCurrentArticleRead(
      readingProgress?.readChapterIds?.includes(story.id) ?? false
    );
  };

  const handleCompleteArticleReading = (storyId: string) => {
    sound.playReward();
    gameStore.completeReadingTask(storyId, 60, 'scroll-fragment-read');
    gameStore.updateReadingScore(storyId, 98);
    setHasCompletedCurrentArticleRead(true);
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.55 },
      });
    } catch (e) {
      console.warn('[Confetti Error]:', e);
    }
  };

  const handleKeyCharacterClick = (e: React.MouseEvent, charObj: HanziChar) => {
    e.stopPropagation();
    sound.playTap();
    gameStore.setModalChar(charObj);
  };

  const handleQuickCharClick = (char: string) => {
    sound.playTap();
    const foundInStory =
      readingDrawerStory?.targetCharacters?.find((c) => c.char === char) ||
      gameStore.currentStory?.targetCharacters?.find((c) => c.char === char) ||
      ALL_STORIES.flatMap((s) => s.targetCharacters).find((c) => c.char === char) ||
      TARGET_CHARACTERS.find((c) => c.char === char);

    const fullChar = foundInStory || {
      id: char,
      char,
      pinyin: 'zì',
      radical: '部',
      radicalName: '偏旁部首',
      components: [char],
      etymology: '典籍核心重点生字',
      meaning: '经史美文典故要字',
      mnemonic: '字形规正，音义贯通',
      strokeCount: 6,
      examWords: [char],
      exampleSentence: `研习【${char}】字，掌握结体规律与造字渊源。`,
      unlocked: true,
    };
    gameStore.setModalChar(fullChar);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 max-w-5xl mx-auto text-left">
      {/* 1. 主选项卡 (Tabs): 【每日演武】、【美文阅读】、【学业周报】 */}
      <div className="bg-amber-100/90 border-2 border-amber-300 p-2 rounded-3xl shadow-sm flex items-center justify-between gap-2">
        <button
          onClick={() => {
            sound.playTap();
            setActiveTab('martial');
          }}
          className={`min-h-[48px] flex-1 px-3 sm:px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${
            activeTab === 'martial'
              ? 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white shadow-md ring-2 ring-yellow-300'
              : 'bg-white/80 hover:bg-white text-stone-700'
          }`}
        >
          <Swords
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              activeTab === 'martial' ? 'text-yellow-200' : 'text-amber-600'
            }`}
          />
          <span>每日演武</span>
          <span className="hidden sm:inline-block text-[10px] bg-red-950/40 text-yellow-200 px-2 py-0.5 rounded-full font-sans">
            {gameStore.streakState?.streakDays ?? 2}天连签
          </span>
        </button>

        <button
          onClick={() => {
            sound.playTap();
            setActiveTab('reading');
          }}
          className={`min-h-[48px] flex-1 px-3 sm:px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 relative ${
            activeTab === 'reading'
              ? 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white shadow-md ring-2 ring-yellow-300'
              : 'bg-white/80 hover:bg-white text-stone-700'
          }`}
        >
          <BookOpen
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              activeTab === 'reading' ? 'text-yellow-200' : 'text-amber-600'
            }`}
          />
          <span>美文阅读</span>
          <span className="hidden sm:inline-block text-[10px] bg-red-950/40 text-yellow-200 px-2 py-0.5 rounded-full font-sans">
            {completedStoriesCount}/{ALL_STORIES.length}篇
          </span>
        </button>

        <button
          onClick={() => {
            sound.playTap();
            setActiveTab('report');
          }}
          className={`min-h-[48px] flex-1 px-3 sm:px-4 py-2.5 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${
            activeTab === 'report'
              ? 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white shadow-md ring-2 ring-yellow-300'
              : 'bg-white/80 hover:bg-white text-stone-700'
          }`}
        >
          <BarChart3
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              activeTab === 'report' ? 'text-yellow-200' : 'text-amber-600'
            }`}
          />
          <span>学业周报</span>
          <span className="hidden sm:inline-block text-[10px] bg-red-950/40 text-yellow-200 px-2 py-0.5 rounded-full font-sans">
            +{totalWeeklyWords}新词
          </span>
        </button>
      </div>

      {/* 2. TAB 1: 【每日演武】 (每日签到火苗、7日打卡热力图、擂台、微任务) */}
      {activeTab === 'martial' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Flame Hero Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center shadow-inner shrink-0 relative">
                <Flame
                  className={`w-10 h-10 sm:w-12 sm:h-12 ${
                    gameStore.streakState?.isTodayCheckedIn
                      ? 'text-yellow-200'
                      : 'text-yellow-300 animate-pulse'
                  }`}
                />
                {gameStore.streakState?.isTodayCheckedIn && (
                  <span className="absolute -top-2 -right-2 bg-yellow-300 text-red-950 font-black text-xs px-2 py-0.5 rounded-full shadow-md">
                    ✓
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
                    日拱一卒 · 功不唐捐
                  </span>
                  <span className="text-yellow-200 text-xs font-bold">
                    已累计签到 {gameStore.streakState?.totalCheckIns ?? 2} 次
                  </span>
                </div>
                <h3 className="font-calligraphy text-2xl sm:text-3xl font-black mt-1">
                  连续研习火苗：
                  <span className="text-yellow-300 underline underline-offset-4">
                    {gameStore.streakState?.streakDays ?? 2}
                  </span>{' '}
                  天
                </h3>
                <p className="text-xs sm:text-sm text-yellow-100/90 mt-0.5 max-w-md">
                  {gameStore.streakState?.isTodayCheckedIn
                    ? '太棒了！今日研习任务已完成打卡，保持连续学习可点亮更璀璨的国风限定装扮！'
                    : '今日尚未打卡，点击右侧按钮完成今日晨读，为你的汉字探险守护火苗！'}
                </p>
              </div>
            </div>

            {/* Check-In Action Button */}
            <div className="shrink-0 w-full md:w-auto">
              {gameStore.streakState?.isTodayCheckedIn ? (
                <div className="min-h-[48px] px-6 py-3 bg-white/25 border-2 border-white/40 rounded-2xl flex items-center justify-center gap-2 text-white font-black text-sm">
                  <CheckCircle2 className="w-5 h-5 text-yellow-200" />
                  <span>今日已打卡完毕</span>
                </div>
              ) : (
                <button
                  onClick={handleCheckIn}
                  className="min-h-[48px] w-full md:w-auto px-7 py-3 bg-yellow-300 hover:bg-yellow-200 text-red-950 font-black text-sm sm:text-base rounded-2xl shadow-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span>立即打卡 (+1天连签)</span>
                </button>
              )}
            </div>
          </div>

          {/* 基于过去7天学习频次的打卡热力图 */}
          <div className="bg-white/95 border-2 border-amber-300/80 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-calligraphy text-lg font-black text-stone-900 flex items-center gap-2">
                    <span>过去7天研习频次 · 打卡热力图</span>
                    <span className="text-[11px] bg-orange-100 text-orange-900 font-sans font-bold px-2 py-0.5 rounded-full border border-orange-200">
                      习惯激励
                    </span>
                  </h4>
                  <p className="text-xs text-stone-500">
                    深浅橙色块代表每日专注学习时长，色块越深表示练字与阅读越持久
                  </p>
                </div>
              </div>

              {/* Color Intensity Legend */}
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-600 bg-amber-50/80 p-1.5 rounded-xl border border-amber-200/60 self-start sm:self-auto">
                <span className="text-stone-400 mr-0.5">图例:</span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-stone-100 border border-stone-300" />
                  0分
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-amber-100 border border-amber-300" />
                  &lt;15分
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-amber-300 border border-amber-400" />
                  15-25分
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-orange-500 border border-orange-600" />
                  26-35分
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-xs bg-orange-700 border border-orange-800" />
                  36分+
                </span>
              </div>
            </div>

            {/* 7-Day Heatmap Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
              {weeklyRecords.map((record, idx) => {
                const colorMeta = getHeatmapColorClass(record.studyMinutes);
                const isSelected = selectedHeatmapDayIndex === idx;
                const isToday = idx === 6;

                return (
                  <button
                    key={record.fullDate || idx}
                    onClick={() => {
                      sound.playTap();
                      setSelectedHeatmapDayIndex(idx);
                    }}
                    className={`relative p-2 sm:p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-between text-center cursor-pointer min-h-[92px] sm:min-h-[110px] active:scale-95 ${
                      colorMeta.bg
                    } ${
                      isSelected
                        ? 'ring-3 ring-amber-500 scale-102 sm:scale-105 z-10 shadow-md'
                        : 'opacity-95'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs font-bold truncate">
                        {record.dayName.replace(/\s*\(.*\)/, '')}
                      </span>
                      {isToday && (
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                      )}
                    </div>

                    <span className="text-[10px] opacity-75 font-mono">
                      {record.date}
                    </span>

                    <div className="my-1 text-center">
                      <span className="text-xs sm:text-base font-black font-mono block leading-none">
                        {record.studyMinutes}
                      </span>
                      <span className="text-[9px] sm:text-[10px] opacity-90 block leading-tight">
                        分钟
                      </span>
                    </div>

                    <div className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md bg-black/10 font-bold truncate w-full">
                      +{record.newWordsCount}字
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Day Expanded Detail Card */}
            {selectedHeatmapDayIndex !== null && weeklyRecords[selectedHeatmapDayIndex] && (
              <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-3.5 sm:p-4 text-xs space-y-2.5 transition-all animate-in fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-calligraphy font-black text-sm sm:text-base text-red-950">
                      📅 {weeklyRecords[selectedHeatmapDayIndex].dayName} ({weeklyRecords[selectedHeatmapDayIndex].date}) 研学详情
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        getHeatmapColorClass(weeklyRecords[selectedHeatmapDayIndex].studyMinutes).bg
                      }`}
                    >
                      {getHeatmapColorClass(weeklyRecords[selectedHeatmapDayIndex].studyMinutes).tier}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-stone-600">
                    <span>
                      ⏱️ 专注时长: <b className="text-stone-900 font-mono">{weeklyRecords[selectedHeatmapDayIndex].studyMinutes}分钟</b>
                    </span>
                    <span>
                      🎯 听说准确率: <b className="text-emerald-700 font-mono">{weeklyRecords[selectedHeatmapDayIndex].accuracy}%</b>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-amber-950 text-[11px] shrink-0">
                    当天突破核心字 (点击溯源音形义):
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {weeklyRecords[selectedHeatmapDayIndex].charactersLearned?.map((char, charIdx) => (
                      <button
                        key={`${char}-${charIdx}`}
                        onClick={() => handleQuickCharClick(char)}
                        className="px-2 py-1 rounded-xl bg-white border border-amber-300 font-calligraphy font-black text-sm text-red-950 shadow-2xs hover:scale-110 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                        title={`点击研读【${char}】字理音形义`}
                      >
                        <span>{char}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Motivational Habit Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-stone-700">
                  过去7天累计专注 <span className="text-red-700 font-bold font-mono">{totalWeeklyMinutes}</span> 分钟 · 连续打卡率 100%
                </span>
              </div>
              <span className="text-amber-800 font-bold">
                🌟 橙色色块越厚重，汉字根基越扎实，坚持就是胜利！
              </span>
            </div>
          </div>

          {/* 演武场入口矩阵 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="font-calligraphy font-black text-base sm:text-lg text-red-950 flex items-center gap-2">
                <span>⚔️ 每日演武擂台</span>
                <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full">
                  闯关挑战
                </span>
              </h4>
              <span className="text-xs text-stone-500">完成演武微任务提升战力阅历</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                onClick={() => onNavigateToTab && onNavigateToTab('challenge')}
                className="bg-white/95 border-2 border-amber-300/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95 flex flex-col justify-between gap-3 text-left"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center text-xl mb-2 font-black">
                    👂
                  </div>
                  <h5 className="font-bold text-sm text-stone-900">声韵演武 · 听音辨字</h5>
                  <p className="text-xs text-stone-600 mt-1">
                    聆听字音与声调，锤炼听说金耳，辨析阴阳上去四声律动。
                  </p>
                </div>
                <div className="text-[11px] font-bold text-red-700 flex items-center gap-1">
                  <span>进入挑战</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => onNavigateToTab && onNavigateToTab('challenge')}
                className="bg-white/95 border-2 border-amber-300/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95 flex flex-col justify-between gap-3 text-left"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl mb-2 font-black">
                    🧩
                  </div>
                  <h5 className="font-bold text-sm text-stone-900">部首拆解 · 偏旁拼装</h5>
                  <p className="text-xs text-stone-600 mt-1">
                    偏旁积木巧组合，探查六书造字智慧与汉字形体流变。
                  </p>
                </div>
                <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                  <span>进入挑战</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              <div
                onClick={() => onNavigateToTab && onNavigateToTab('rapid')}
                className="bg-white/95 border-2 border-amber-300/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-95 flex flex-col justify-between gap-3 text-left"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center text-xl mb-2 font-black">
                    ⚡
                  </div>
                  <h5 className="font-bold text-sm text-stone-900">极速决斗 · 诗词飞花令</h5>
                  <p className="text-xs text-stone-600 mt-1">
                    限时快问快答秒速反应，挑战连续全对赢取通宝与限定勋章。
                  </p>
                </div>
                <div className="text-[11px] font-bold text-orange-700 flex items-center gap-1">
                  <span>进入演武</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* 每日微任务组件嵌入 */}
          <div className="mt-2">
            <DailyMissions
              missionsState={gameStore.missionsState}
              onUpdateMissionsState={gameStore.updateMissionsState}
              onNavigateToTab={onNavigateToTab || (() => {})}
            />
          </div>

          {/* 连续签到奖励进度里程碑 */}
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between px-1">
              <h4 className="font-calligraphy font-black text-base sm:text-lg text-red-950 flex items-center gap-2">
                <span>🏮 连续研习专属特赏</span>
                <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full">
                  持续累积
                </span>
              </h4>
              <span className="text-xs text-stone-500">达到天数自动解锁对应装扮</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {STREAK_REWARDS.map((m) => {
                const isUnlocked = (gameStore.streakState?.streakDays ?? 0) >= m.day;
                return (
                  <div
                    key={m.day}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                      isUnlocked
                        ? 'bg-amber-50/90 border-amber-400 shadow-sm'
                        : 'bg-stone-50 border-stone-200 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-black text-xs px-2 py-0.5 rounded-full bg-amber-200 text-red-950">
                          {m.day} 天连签
                        </span>
                        {isUnlocked ? (
                          <span className="text-emerald-700 text-xs font-black flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 已解锁
                          </span>
                        ) : (
                          <span className="text-stone-400 text-xs">
                            还差 {Math.max(0, m.day - (gameStore.streakState?.streakDays ?? 0))} 天
                          </span>
                        )}
                      </div>
                      <div className="text-2xl mb-1">{m.icon}</div>
                      <h5 className="font-bold text-sm text-stone-900">{m.name}</h5>
                      <p className="text-xs text-stone-600 mt-0.5 line-clamp-2">{m.description}</p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-amber-200/60 text-[11px] font-bold text-amber-800">
                      🎁 奖励：{m.rewardValue}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Simulation Bar */}
          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-stone-500 font-bold">
              🛠️ 快捷模拟连签进度 (方便体验各阶段特效):
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[3, 7, 14, 30].map((days) => (
                <button
                  key={days}
                  onClick={() => {
                    sound.playTap();
                    gameStore.fastForwardStreak(days);
                  }}
                  className="min-h-[36px] px-2.5 py-1 bg-white hover:bg-amber-100 border border-stone-300 rounded-xl font-bold text-stone-700 cursor-pointer active:scale-95"
                >
                  直达 {days} 天
                </button>
              ))}
              <button
                onClick={() => {
                  sound.playTap();
                  gameStore.resetStreak();
                }}
                className="min-h-[36px] px-2.5 py-1 bg-stone-200 hover:bg-red-100 hover:text-red-700 border border-stone-300 rounded-xl font-bold text-stone-600 cursor-pointer active:scale-95 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                重置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB 2: 【美文阅读】 */}
      {activeTab === 'reading' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
                📜
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-white/20 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
                    书香雅集 · 美文品鉴
                  </span>
                  <span className="text-yellow-200 text-xs font-bold">
                    朗读均分：{averageReadingScore}分
                  </span>
                </div>
                <h3 className="font-calligraphy text-2xl sm:text-3xl font-black mt-1">
                  美文研读进度：
                  <span className="text-yellow-300 underline underline-offset-4">
                    {completedStoriesCount}
                  </span>{' '}
                  / {ALL_STORIES.length} 篇
                </h3>
                <p className="text-xs sm:text-sm text-yellow-100/90 mt-0.5 max-w-lg">
                  精选典籍神话、童话科普与时事篇章。列表重点字词自带金光微澜，点击直接调取字词音形义弹窗！
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/30 px-4 py-2 rounded-2xl text-xs font-bold shrink-0">
              <Award className="w-4 h-4 text-yellow-300" />
              <span>画卷碎片: {readingProgress?.scrollFragments?.length ?? 1}枚</span>
            </div>
          </div>

          {/* 篇章分类筛选栏 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {[
              { id: 'all', name: '全部篇章' },
              { id: 'myth', name: '🏮 神话典故' },
              { id: 'history', name: '🏛️ 历史人文' },
              { id: 'fairy', name: '🦄 实践寓言' },
              { id: 'news', name: '🚀 时代探索' },
              { id: 'science', name: '🔬 科学解谜' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playTap();
                  setSelectedStoryCategory(cat.id);
                }}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-bold cursor-pointer whitespace-nowrap transition-all active:scale-95 ${
                  selectedStoryCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-sm ring-1 ring-amber-400'
                    : 'bg-white/80 hover:bg-white text-stone-700 border border-amber-200/80'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 美文阅读列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredStories.map((story) => {
              const isRead = readingProgress?.readChapterIds?.includes(story.id);
              const score = readingProgress?.readingScores?.[story.id] ?? (isRead ? 95 : 0);

              return (
                <div
                  key={story.id}
                  className="bg-white/95 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-3 text-left relative overflow-hidden group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-calligraphy text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-red-950 font-bold border border-amber-300/70">
                        第 {story.chapterNumber} 回 · {story.icon}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                          {story.gradeLevel}
                        </span>
                        {isRead ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> 已研读 {score}分
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                            待精读
                          </span>
                        )}
                      </div>
                    </div>

                    <h4 className="font-calligraphy text-xl font-black text-stone-900 group-hover:text-red-900 transition-colors">
                      {story.title}
                    </h4>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                      {story.summary}
                    </p>
                  </div>

                  <div className="bg-amber-50/70 rounded-xl p-2.5 border border-amber-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-amber-900 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                        重点核心生字 (点击字理溯源)：
                      </span>
                      <span className="text-[10px] text-amber-700/80">微光浮耀 · 点触即查</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {story.targetCharacters.map((charObj, charIdx) => (
                        <button
                          key={`${charObj.id || charObj.char}-${charIdx}`}
                          onClick={(e) => handleKeyCharacterClick(e, charObj)}
                          title={`点击查看【${charObj.char}】字理音形义`}
                          className="relative group/char overflow-hidden px-2 py-1 rounded-xl bg-gradient-to-b from-amber-50 to-orange-100/90 text-amber-950 font-black text-xs border border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.35)] hover:shadow-[0_0_15px_rgba(245,158,11,0.65)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span className="absolute inset-0 -translate-x-full group-hover/char:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-yellow-200/50 to-transparent pointer-events-none" />
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping group-hover/char:opacity-100 opacity-75 shrink-0" />
                          <span className="font-calligraphy text-sm font-black leading-none">
                            {charObj.char}
                          </span>
                          <span className="text-[9px] font-mono text-amber-800 opacity-90">
                            {charObj.pinyin}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-amber-100">
                    <button
                      onClick={() => handleOpenReadingDrawer(story)}
                      className="min-h-[40px] flex-1 px-3 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>启卷研读 (抽屉弹窗)</span>
                    </button>

                    {onNavigateToTab && (
                      <button
                        onClick={() => {
                          sound.playTap();
                          gameStore.setCurrentStoryId(story.id);
                          onNavigateToTab('story');
                        }}
                        title="跳转至全屏沉浸朗读模式"
                        className="min-h-[40px] px-3 py-1.5 bg-white hover:bg-amber-50 text-stone-700 border border-stone-300 rounded-xl font-bold text-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3 text-stone-500" />
                        <span>主线伴读</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TAB 3: 【学业周报】 (字词掌握趋势与练习时长分布图表可视化) */}
      {activeTab === 'report' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* 周报 Hero 总评卡片 */}
          <div className="bg-gradient-to-r from-red-700 via-orange-600 to-amber-600 rounded-3xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center shadow-inner shrink-0 relative">
                <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-200" />
                <span className="absolute -top-2 -right-2 bg-yellow-300 text-red-950 font-black text-[11px] px-2 py-0.5 rounded-full shadow-md">
                  第38周
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-white/20 text-white text-xs font-black px-2.5 py-0.5 rounded-full">
                    学业总评 · 甲等上 (博雅之士)
                  </span>
                  <span className="text-yellow-200 text-xs font-bold">
                    段位：{gameStore.playerLevelInfo?.title ?? '文思秀才'}
                  </span>
                </div>
                <h3 className="font-calligraphy text-2xl sm:text-3xl font-black mt-1">
                  学业周报：本周突破 <span className="text-yellow-300 underline underline-offset-4">+{totalWeeklyWords}</span> 个核心字词
                </h3>
                <p className="text-xs sm:text-sm text-yellow-100/90 mt-0.5 max-w-lg">
                  循艾宾浩斯记忆与间架结构规律，本周累计学习 {totalWeeklyMinutes} 分钟，听说字形综合准确率达 {avgWeeklyAccuracy}%！
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full md:w-auto shrink-0 text-center">
              <div className="bg-white/15 backdrop-blur-md border border-white/30 px-3.5 py-2 rounded-2xl">
                <span className="text-[10px] text-yellow-200 block">本周总学时</span>
                <span className="text-base sm:text-lg font-black font-mono text-white">
                  {(totalWeeklyMinutes / 60).toFixed(1)} 小时
                </span>
              </div>
              <div className="bg-white/15 backdrop-blur-md border border-white/30 px-3.5 py-2 rounded-2xl">
                <span className="text-[10px] text-yellow-200 block">连续达标率</span>
                <span className="text-base sm:text-lg font-black font-mono text-white">
                  100% (7/7天)
                </span>
              </div>
            </div>
          </div>

          {/* 图表可视化 1: 每周字词掌握趋势 */}
          <div className="bg-white/95 border-2 border-amber-300/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-calligraphy font-black text-lg text-stone-900">
                    每周字词掌握趋势 (词汇量稳步爬升曲线)
                  </h4>
                  <p className="text-xs text-stone-500">
                    对比每日实际掌握词数与目标基准线，直观呈现识字认知飞跃
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-red-700 font-bold">
                  <span className="w-3 h-1 bg-red-600 rounded-full inline-block" />
                  累计字词
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  每日新增
                </span>
                <span className="flex items-center gap-1.5 text-stone-400 font-medium">
                  <span className="w-3 h-0.5 border-t border-dashed border-stone-400 inline-block" />
                  每日目标 (5字)
                </span>
              </div>
            </div>

            {/* SVG Visual Area Chart */}
            <div className="relative w-full h-56 sm:h-64 pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 650 200">
                <defs>
                  <linearGradient id="wordTrendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity="0.32" />
                    <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.14" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {[0, 50, 100, 150].map((yVal, gIdx) => (
                  <g key={gIdx}>
                    <line
                      x1="40"
                      y1={yVal + 20}
                      x2="630"
                      y2={yVal + 20}
                      stroke="#f3f4f6"
                      strokeWidth="1"
                    />
                  </g>
                ))}

                <line
                  x1="40"
                  y1="130"
                  x2="630"
                  y2="130"
                  stroke="#fbbf24"
                  strokeDasharray="4,4"
                  strokeWidth="1.5"
                />
                <text x="635" y="133" fontSize="10" fill="#d97706" fontWeight="bold">
                  目标线
                </text>

                {(() => {
                  if (weeklyRecords.length === 0) return null;
                  const points = weeklyRecords.map((r, i) => {
                    const x = 55 + i * 90;
                    const y = 170 - (r.cumulativeCount / 50) * 120;
                    return { x, y: Math.max(25, Math.min(170, y)), record: r };
                  });

                  const pathD = points.reduce((acc, curr, idx) => {
                    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
                  }, '');

                  const areaD = `${pathD} L ${points[points.length - 1].x} 180 L ${points[0].x} 180 Z`;

                  return (
                    <>
                      <path d={areaD} fill="url(#wordTrendGradient)" />
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#dc2626"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {points.map((pt, pIdx) => (
                        <g key={pIdx} className="group/pt cursor-pointer">
                          <rect
                            x={pt.x - 7}
                            y={180 - pt.record.newWordsCount * 5}
                            width="14"
                            height={pt.record.newWordsCount * 5}
                            rx="3"
                            fill="#fbbf24"
                            opacity="0.85"
                          />
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="6"
                            fill="#ffffff"
                            stroke="#dc2626"
                            strokeWidth="2.5"
                          />
                          <circle cx={pt.x} cy={pt.y} r="2.5" fill="#dc2626" />
                          <text
                            x={pt.x}
                            y={pt.y - 10}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="bold"
                            fill="#991b1b"
                          >
                            {pt.record.cumulativeCount}字
                          </text>
                          <text
                            x={pt.x}
                            y="196"
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="600"
                            fill="#57534e"
                          >
                            {pt.record.dayName.replace(/\s*\(.*\)/, '')}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>

            <div className="bg-amber-50/80 rounded-2xl p-3 border border-amber-200/80 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-amber-900 flex items-center gap-1.5 font-bold">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                词汇增长势头：环比往期增长 +24.5%，日均掌握 {(totalWeeklyWords / 7).toFixed(1)} 字，字词掌握达成率 100%！
              </span>
              <span className="text-stone-500">记忆牢固度：96.2% 保持在高位</span>
            </div>
          </div>

          {/* 图表可视化 2: 练习时长分布 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 bg-white/95 border-2 border-amber-300/80 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b border-amber-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-calligraphy font-black text-lg text-stone-900">
                    练习时长结构分布 (学时四维占比)
                  </h4>
                  <p className="text-xs text-stone-500">
                    涵盖伴读精读、演武拆字、语感造句与飞花令竞技
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="h-4 sm:h-5 rounded-full overflow-hidden flex shadow-inner bg-stone-100 p-0.5">
                  <div
                    style={{ width: '36%' }}
                    className="h-full bg-red-600 rounded-l-full transition-all"
                    title="美文精读与伴读 (36%)"
                  />
                  <div
                    style={{ width: '28%' }}
                    className="h-full bg-amber-500 transition-all"
                    title="汉字演武与偏旁拼装 (28%)"
                  />
                  <div
                    style={{ width: '20%' }}
                    className="h-full bg-orange-400 transition-all"
                    title="语感造句与短句拼接 (20%)"
                  />
                  <div
                    style={{ width: '16%' }}
                    className="h-full bg-emerald-500 rounded-r-full transition-all"
                    title="极速飞花令与诗词速答 (16%)"
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                  <span>0%</span>
                  <span>总学时 {totalWeeklyMinutes} 分钟</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-950 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      美文精读
                    </span>
                    <span className="font-mono font-black text-red-700">36% · 58分</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    启卷研读历史与神话典故，锻炼语境语感。
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      汉字演武
                    </span>
                    <span className="font-mono font-black text-amber-700">28% · 46分</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    偏旁部首搭积木与听音辨字，夯实基础。
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-orange-950 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-orange-400" />
                      语感造句
                    </span>
                    <span className="font-mono font-black text-orange-700">20% · 33分</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    情境短句拼接与字形挖空，学以致用。
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      诗词飞花
                    </span>
                    <span className="font-mono font-black text-emerald-700">16% · 26分</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    限时快答与对仗识别，点燃敏捷思维。
                  </p>
                </div>
              </div>
            </div>

            {/* Right 5 cols: 每日专注时长对比柱状图 */}
            <div className="lg:col-span-5 bg-white/95 border-2 border-amber-300/80 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="flex items-center gap-2.5 border-b border-amber-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-calligraphy font-black text-lg text-stone-900">
                    每日研学时长柱状对比
                  </h4>
                  <p className="text-xs text-stone-500">
                    每日平均专注 23.3 分钟
                  </p>
                </div>
              </div>

              <div className="h-44 flex items-end justify-between gap-1.5 px-2 pt-4">
                {weeklyRecords.map((r, i) => {
                  const maxMin = 40;
                  const heightPercent = Math.min(100, Math.round((r.studyMinutes / maxMin) * 100));
                  const isPeak = r.studyMinutes >= 35;

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] font-mono font-bold text-stone-700">
                        {r.studyMinutes}m
                      </span>
                      <div className="w-full max-w-[28px] h-32 bg-stone-100 rounded-t-xl overflow-hidden flex items-end p-0.5">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-lg transition-all ${
                            isPeak
                              ? 'bg-gradient-to-t from-orange-600 to-amber-400 shadow-sm'
                              : 'bg-gradient-to-t from-amber-400 to-yellow-300'
                          }`}
                        />
                      </div>
                      <span className="text-[10px] text-stone-500 font-bold truncate">
                        {r.dayName.replace(/\s*\(.*\)/, '').replace('周', '')}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-center text-xs text-stone-600 font-bold">
                💡 节奏合理：周六与周日研习较为集中，工作日保持稳步连贯。
              </div>
            </div>
          </div>

          {/* 本周突破生字词总汇 */}
          <div className="bg-white/95 border-2 border-amber-300/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  字
                </span>
                <div>
                  <h4 className="font-calligraphy font-black text-lg text-stone-900">
                    本周突破汉字百宝箱 (共掌握 {allWeeklyLearnedWords.length} 核心字)
                  </h4>
                  <p className="text-xs text-stone-500">
                    点击任意字砖即可调取字理音形义与米字格笔顺拆解
                  </p>
                </div>
              </div>
              <span className="text-xs text-amber-800 font-bold bg-amber-100 px-3 py-1 rounded-full">
                点击字砖 · 溯源字理
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              {allWeeklyLearnedWords.map((wordChar, wIdx) => (
                <button
                  key={`${wordChar}-${wIdx}`}
                  onClick={() => handleQuickCharClick(wordChar)}
                  className="px-3 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 shadow-xs hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                  title={`点击查看【${wordChar}】音形义`}
                >
                  <span className="font-calligraphy text-lg font-black text-red-950">
                    {wordChar}
                  </span>
                  <span className="text-[10px] text-amber-800 font-mono">
                    已掌握
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 名师综合学业诊断建议与下周成长指引 */}
          <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3.5">
            <h4 className="font-calligraphy font-black text-lg text-red-950 flex items-center gap-2">
              <span>📜 名师学业诊断与下周研习指引</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-white/90 p-3.5 rounded-2xl border border-amber-200 shadow-2xs space-y-1">
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  本周优长亮点：
                </span>
                <p className="text-stone-700 leading-relaxed pl-5">
                  连续 7 天无中断打卡，神话故事段落跟读音准调正，偏旁部首拆解正确率达 95% 以上，形声规律领悟敏捷。
                </p>
              </div>

              <div className="bg-white/90 p-3.5 rounded-2xl border border-amber-200 shadow-2xs space-y-1">
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <Target className="w-4 h-4 text-amber-600" />
                  下周进阶建议：
                </span>
                <p className="text-stone-700 leading-relaxed pl-5">
                  建议在保持每日美文阅读的同时，适当增加生活情境短句拼接练习，将所学字词向日常口语与小作文表达迁移转化。
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-amber-200/80 text-xs">
              <span className="text-stone-600 font-bold">
                🎯 下周目标：新学 35 字 · 研读 2 篇经典故事 · 守护连续打卡火苗
              </span>
              <button
                onClick={() => {
                  sound.playReward();
                  try {
                    confetti({ particleCount: 70, spread: 60 });
                  } catch (e) {
                    console.warn(e);
                  }
                }}
                className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-xl font-bold cursor-pointer hover:from-red-700 active:scale-95 shadow-sm"
              >
                点赞本周成长 ✨
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. 美文阅读详情抽屉弹窗 */}
      {readingDrawerStory && (
        <div
          className="fixed inset-0 z-[65] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={() => setReadingDrawerStory(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-gradient-to-b from-amber-50 via-orange-50/40 to-amber-50 border-4 border-amber-300 rounded-3xl shadow-2xl p-4 sm:p-6 text-stone-900 my-auto max-h-[92vh] flex flex-col overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-amber-200/80 pb-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center text-lg shadow-sm">
                  {readingDrawerStory.icon}
                </span>
                <div>
                  <h3 className="font-calligraphy text-xl sm:text-2xl font-black text-red-950 flex items-center gap-2">
                    <span>{readingDrawerStory.title}</span>
                    <span className="text-xs bg-amber-200 text-red-950 px-2 py-0.5 rounded-full font-bold font-sans">
                      第{readingDrawerStory.chapterNumber}回
                    </span>
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    {readingDrawerStory.subtitle} · {readingDrawerStory.difficulty}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playTap();
                  setReadingDrawerStory(null);
                }}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
              <div className="bg-amber-100/70 border border-amber-300/80 rounded-2xl p-3 text-xs text-amber-900 leading-relaxed">
                💡 <span className="font-bold">文化引言：</span>
                {readingDrawerStory.culturalLore}
              </div>

              <div className="space-y-3">
                {readingDrawerStory.storyParagraphs.map((para, idx) => {
                  const paraText =
                    para.audioPrompt || para.tokens.map((t) => t.char).join('');
                  return (
                    <div
                      key={para.id || idx}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white/90 border border-amber-200 shadow-sm relative group hover:border-amber-400 transition-all text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          第 {idx + 1} 段
                        </span>
                        <button
                          onClick={() => {
                            sound.playTap();
                            speakChinese(paraText);
                          }}
                          className="min-h-[32px] px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                          <span>朗读本段</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap items-baseline gap-x-0.5 gap-y-1 font-calligraphy text-base sm:text-lg leading-relaxed text-stone-800">
                        {para.tokens.map((token, tIdx) => {
                          if (token.isTarget) {
                            const targetChar = TARGET_CHARACTERS.find(
                              (c) => c.char === token.char
                            ) || {
                              id: token.charId || token.char,
                              char: token.char,
                              pinyin: token.pinyin,
                              radical: '部',
                              radicalName: '常用偏旁',
                              components: [token.char],
                              etymology: '典籍核心重点生字',
                              meaning: '典故美文重点字词',
                              mnemonic: '字形优美，笔顺严谨',
                              strokeCount: 6,
                              examWords: [token.char],
                              exampleSentence: paraText,
                              unlocked: true,
                            };
                            return (
                              <button
                                key={tIdx}
                                onClick={(e) => handleKeyCharacterClick(e, targetChar)}
                                title={`点击研习【${token.char}】字理音形义`}
                                className="inline-flex flex-col items-center px-1 rounded-md bg-amber-100/90 text-red-950 font-black border border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)] hover:scale-110 active:scale-95 transition-all cursor-pointer mx-0.5"
                              >
                                <span className="text-[10px] text-amber-700 font-sans font-medium leading-none">
                                  {token.pinyin}
                                </span>
                                <span className="leading-none">{token.char}</span>
                              </button>
                            );
                          }
                          return (
                            <span key={tIdx} className="inline-flex flex-col items-center">
                              <span className="text-[9px] text-stone-400 font-sans font-normal leading-none opacity-80">
                                {token.pinyin}
                              </span>
                              <span className="leading-none">{token.char}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-amber-100/50 rounded-2xl p-3.5 border border-amber-300/70 space-y-2">
                <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                  本篇重点生字词点兵 (点击直接调用 CharacterModal)：
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {readingDrawerStory.targetCharacters.map((charObj, charIdx) => (
                    <button
                      key={`${charObj.id || charObj.char}-${charIdx}`}
                      onClick={(e) => handleKeyCharacterClick(e, charObj)}
                      className="px-2.5 py-1 rounded-xl bg-white border border-amber-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="font-calligraphy text-base font-black text-red-950">
                        {charObj.char}
                      </span>
                      <span className="text-[10px] text-amber-800 font-mono">
                        {charObj.pinyin}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t-2 border-amber-200/80 pt-3 flex items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-stone-500">
                {hasCompletedCurrentArticleRead
                  ? '✨ 本篇已成功完成研读打卡'
                  : '📖 完整阅览本篇，点击打卡结算阅历'}
              </div>

              <div className="flex items-center gap-2">
                {onNavigateToTab && (
                  <button
                    onClick={() => {
                      sound.playTap();
                      gameStore.setCurrentStoryId(readingDrawerStory.id);
                      setReadingDrawerStory(null);
                      onNavigateToTab('story');
                    }}
                    className="min-h-[42px] px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold text-xs cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>跳转主线沉浸伴读</span>
                  </button>
                )}

                <button
                  onClick={() => handleCompleteArticleReading(readingDrawerStory.id)}
                  disabled={hasCompletedCurrentArticleRead}
                  className={`min-h-[42px] px-5 py-2 rounded-xl font-black text-xs sm:text-sm cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-md ${
                    hasCompletedCurrentArticleRead
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {hasCompletedCurrentArticleRead
                      ? '已打卡 (+60阅历)'
                      : '完成研读打卡 (+60阅历)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
