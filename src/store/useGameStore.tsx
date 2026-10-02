/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { HanziChar, TARGET_CHARACTERS } from '../data/level1Data';
import { STORY_LEVELS, StoryLevel } from '../data/storyLevels';
import { DailyStreakState } from '../data/dailyStreakData';
import {
  DailyLearningRecord,
  loadWeeklyLearningData,
  addWordToTodayRecord,
} from '../data/weeklyLearningData';
import {
  DailyMissionsState,
  loadDailyMissions,
  saveDailyMissions,
} from '../data/dailyMissionsData';
import { UserEquippedDecorations } from '../components/ProfileAchievementsModal';
import { AVAILABLE_DECORATIONS } from '../data/achievementData';
import { IDIOM_ALLUSIONS, IdiomAllusion } from '../data/idiomAllusionsData';
import { sound } from '../utils/audio';
import { safeGetItem, safeSetItem } from '../utils/storage';

const TOTAL_TARGET = 3500;

/**
 * 阅读研习进度状态
 */
export interface ReadingProgress {
  readChapterIds: string[]; // 已读章节/故事 ID 列表 (e.g. ['story-1', 'story-2'])
  completedArticleIds: string[]; // 兼容别名
  readingScores: Record<string, number>; // 各篇章朗读/跟读得分 (0-100), e.g. { 'story-1': 95 }
  storyScores: Record<string, number>; // 兼容别名
  scrollFragments: string[]; // 收集的故事画卷碎片 ID 列表 (e.g. ['scroll-fragment-nian-horns'])
  lastReadChapterId: string | null; // 最近朗读/阅读的章节 ID
  lastReadArticleId: string | null; // 兼容别名
  completedArticlesCount: number; // 已完成篇章数
  lastCompletedTimestamp: number; // 最近完成研习的时间戳
}

/**
 * 阅读研习结算结果结构
 */
export interface ReadingTaskResult {
  articleId: string;
  expEarned: number;
  coinsEarned: number;
  scrollFragments: string[];
  newItemsUnlocked: string[];
  readingProgress: ReadingProgress;
}

/**
 * 玩家等级与阅历进度状态
 */
export interface PlayerLevelInfo {
  level: number;
  title: string;
  badgeIcon: string;
  currentExp: number;
  minExpForLevel: number;
  nextLevelExpThreshold: number;
  expInCurrentLevel: number;
  expNeededForNextLevel: number;
  progressPercent: number; // 0 - 100
}

/**
 * 段落阅读完成经验结算结果
 */
export interface ReadingSegmentExpResult {
  segmentId: number | string;
  expGained: number;
  coinsGained: number;
  readTimeSeconds: number;
  accuracy: number;
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
  newLevelTitle: string;
  totalExp: number;
}

export const LEVEL_TIERS: Array<{ level: number; title: string; badgeIcon: string; minExp: number }> = [
  { level: 1, title: '启蒙童生', badgeIcon: '🌱', minExp: 0 },
  { level: 2, title: '敏学儒童', badgeIcon: '📖', minExp: 100 },
  { level: 3, title: '墨韵秀才', badgeIcon: '🖌️', minExp: 230 },
  { level: 4, title: '博雅举人', badgeIcon: '🐉', minExp: 400 },
  { level: 5, title: '经纶贡士', badgeIcon: '🏛️', minExp: 620 },
  { level: 6, title: '翰林宗师', badgeIcon: '👑', minExp: 900 },
  { level: 7, title: '魁星文尊', badgeIcon: '✨', minExp: 1250 },
  { level: 8, title: '文冠天下', badgeIcon: '🏆', minExp: 1700 },
];

export function getPlayerLevelInfo(totalExp: number): PlayerLevelInfo {
  const safeExp = Math.max(0, totalExp);
  let currentTierIndex = 0;

  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (safeExp >= LEVEL_TIERS[i].minExp) {
      currentTierIndex = i;
      break;
    }
  }

  const currentTier = LEVEL_TIERS[currentTierIndex];
  const nextTier = LEVEL_TIERS[currentTierIndex + 1];

  if (!nextTier) {
    return {
      level: currentTier.level,
      title: currentTier.title,
      badgeIcon: currentTier.badgeIcon,
      currentExp: safeExp,
      minExpForLevel: currentTier.minExp,
      nextLevelExpThreshold: currentTier.minExp + 500,
      expInCurrentLevel: safeExp - currentTier.minExp,
      expNeededForNextLevel: 500,
      progressPercent: 100,
    };
  }

  const minExp = currentTier.minExp;
  const maxExp = nextTier.minExp;
  const expInCurrentLevel = safeExp - minExp;
  const expNeededForNextLevel = maxExp - minExp;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((expInCurrentLevel / expNeededForNextLevel) * 100))
  );

  return {
    level: currentTier.level,
    title: currentTier.title,
    badgeIcon: currentTier.badgeIcon,
    currentExp: safeExp,
    minExpForLevel: minExp,
    nextLevelExpThreshold: maxExp,
    expInCurrentLevel,
    expNeededForNextLevel,
    progressPercent,
  };
}

export interface GameStoreState {
  // 故事与关卡
  currentStoryId: string;
  setCurrentStoryId: (id: string) => void;
  currentStory: StoryLevel;
  customStoryOrder: string[];
  orderedStories: StoryLevel[];
  updateStoryOrder: (newOrder: string[]) => void;
  resetStoryOrder: () => void;

  // 汉字收集进度 (3500字)
  collectedCount: number;
  totalTarget: number;
  setCollectedCount: (val: number | ((prev: number) => number)) => void;

  // 全局阅历值与金币（文昌通宝，严格同源复用已有积分体系）
  totalExpEarned: number;
  totalCoins: number;
  addExpAndCoins: (exp: number, coins: number) => void;

  // 玩家等级与阅历进阶体系
  playerLevelInfo: PlayerLevelInfo;
  playerLevel: number;
  recordReadingSegmentExp: (
    segmentId: number | string,
    readTimeSeconds: number,
    accuracy: number
  ) => ReadingSegmentExpResult;

  // 阅读研习全局状态与结算
  readingProgress: ReadingProgress;
  setReadingProgress: React.Dispatch<React.SetStateAction<ReadingProgress>>;
  updateReadingScore: (articleId: string, score: number) => void;
  addScrollFragment: (fragmentId: string) => void;
  completeReadingTask: (
    articleId: string,
    expReward?: number,
    itemReward?: string
  ) => ReadingTaskResult;

  // 宝库修业阁解锁状态体系
  unlockedTreasuryItems: string[];
  unlockTreasuryItem: (itemId: string) => boolean;
  isTreasuryItemUnlocked: (itemId: string) => boolean;

  // 墨宝工坊与画板笔触皮肤
  unlockedBrushSkins: string[];
  activeBrushSkin: string;
  setActiveBrushSkin: (skinId: string) => void;
  redeemBrushSkin: (skinId: string, costExp: number) => { success: boolean; message: string };
  isBrushSkinUnlocked: (skinId: string) => boolean;

  // 典藏画卷解锁判定辅助
  isScrollUnlocked: (storyId: string) => boolean;

  // 每日签到与连胜 (Streak)
  streakState: DailyStreakState;
  checkIn: () => void;
  fastForwardStreak: (targetDays: number) => void;
  resetStreak: () => void;

  // 用户称号、印章与头像框装扮
  equippedDecorations: UserEquippedDecorations;
  setEquippedDecorations: React.Dispatch<React.SetStateAction<UserEquippedDecorations>>;
  equipDecoration: (type: 'frame' | 'seal' | 'title' | 'bgTheme', id: string) => void;

  // 艾宾浩斯周成长轨迹
  weeklyRecords: DailyLearningRecord[];
  setWeeklyRecords: React.Dispatch<React.SetStateAction<DailyLearningRecord[]>>;
  addWordSample: (candidate?: string) => string;

  // 每日微任务与成就
  missionsState: DailyMissionsState;
  updateMissionsState: (newState: DailyMissionsState) => void;
  progressMission: (
    category: 'radicals' | 'idioms' | 'challenge' | 'writing' | 'culture',
    onMissionCompleted?: () => void
  ) => void;
  readyToClaimMissionsCount: number;

  // 汉字结构详情弹窗
  modalChar: HanziChar | null;
  setModalChar: (char: HanziChar | null) => void;
  selectCharacterFromChart: (char: string) => void;

  // 50 字里程碑成语典故弹窗
  milestoneModalOpen: boolean;
  setMilestoneModalOpen: (open: boolean) => void;
  milestoneIdiom: IdiomAllusion | null;
  setMilestoneIdiom: (idiom: IdiomAllusion | null) => void;
  milestoneCount: number;
  setMilestoneCount: (count: number) => void;

  // 通用汉字解锁流水线与最新解锁状态
  lastUnlockedWord: string | null;
  lastUnlockTimestamp: number;
  unlockNewWord: (candidateChar?: string) => string;

  // 绘本各练习模块本地持久化完成状态体系
  storyExerciseMap: Record<string, StoryExerciseStatus>;
  markModuleCompleted: (
    storyId: string,
    moduleType: StoryModuleType,
    options?: { score?: number; details?: string }
  ) => void;
  getStoryExerciseStatus: (storyId: string) => StoryExerciseStatus;
  getModuleCompletion: (
    storyId: string,
    moduleType: StoryModuleType
  ) => ModuleCompletionRecord | null;
  getStoryCompletionSummary: (storyId: string) => {
    totalModules: number;
    completedCount: number;
    percentage: number;
    isAllCompleted: boolean;
  };
  getGlobalExerciseStats: () => {
    totalStories: number;
    completedModulesTotal: number;
    maxModulesTotal: number;
    fullyCompletedStoriesCount: number;
  };
}

export type StoryModuleType =
  | 'reading'
  | 'sound'
  | 'radical'
  | 'handwriting'
  | 'writing'
  | 'cloze'
  | 'essay';

export interface ModuleCompletionRecord {
  completed: boolean;
  score?: number;
  completedAt: number;
  details?: string;
}

export interface StoryExerciseStatus {
  storyId: string;
  modules: Partial<Record<StoryModuleType, ModuleCompletionRecord>>;
  completedCount: number; // 0 - 6
  isAllCompleted: boolean;
  lastPracticedAt: number;
}

const GameContext = createContext<GameStoreState | null>(null);

const DEFAULT_STREAK_STATE: DailyStreakState = {
  streakDays: 2,
  totalCheckIns: 2,
  lastCheckInDate: null,
  isTodayCheckedIn: false,
  unlockedStreakRewards: ['day-1', 'day-2'],
};

export const DEFAULT_READING_PROGRESS: ReadingProgress = {
  readChapterIds: ['story-1'],
  completedArticleIds: ['story-1'],
  readingScores: { 'story-1': 95 },
  storyScores: { 'story-1': 95 },
  scrollFragments: ['scroll-fragment-nian-horns'],
  lastReadChapterId: 'story-1',
  lastReadArticleId: 'story-1',
  completedArticlesCount: 1,
  lastCompletedTimestamp: Date.now() - 3600000,
};

export const DEFAULT_UNLOCKED_TREASURY_ITEMS: string[] = [
  'frame-wood',
  'seal-none',
  'bg-warm-paper',
  'title-novice',
];

export const DEFAULT_UNLOCKED_BRUSH_SKINS: string[] = [
  'brush-ink',
  'pen-steel',
  'brush',
  'pen',
];

const DEFAULT_DECORATIONS: UserEquippedDecorations = {
  frameId: 'frame-bronze',
  sealId: 'seal-none',
  bgThemeId: 'bg-warm-paper',
  titleId: 'title-tongsheng',
  userName: '求索少年',
};

export interface GameProviderProps {
  children: React.ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  // 当前故事 (利用 localStorage 本地持久化并在重启后自动恢复)
  const [currentStoryId, setCurrentStoryIdState] = useState<string>(() => {
    const saved = safeGetItem<string>('hanzi_current_story_id', 'story-1');
    const valid = STORY_LEVELS.some((s) => s.id === saved);
    return valid ? saved : 'story-1';
  });

  const currentStory = useMemo<StoryLevel>(() => {
    return STORY_LEVELS.find((s) => s.id === currentStoryId) || STORY_LEVELS[0];
  }, [currentStoryId]);

  const setCurrentStoryId = useCallback((id: string) => {
    setCurrentStoryIdState(id);
    safeSetItem('hanzi_current_story_id', id);
  }, []);

  // 自定义故事排列顺序 (触控拖拽排序持久化)
  const [customStoryOrder, setCustomStoryOrder] = useState<string[]>(() => {
    const saved = safeGetItem<string[]>('bookshelf_custom_story_order', []);
    const allIds = STORY_LEVELS.map((s) => s.id);
    if (Array.isArray(saved) && saved.length > 0) {
      const valid = saved.filter((id) => allIds.includes(id));
      const missing = allIds.filter((id) => !valid.includes(id));
      return [...valid, ...missing];
    }
    return allIds;
  });

  const orderedStories = useMemo<StoryLevel[]>(() => {
    const map = new Map(STORY_LEVELS.map((s) => [s.id, s]));
    const result: StoryLevel[] = [];
    customStoryOrder.forEach((id) => {
      const story = map.get(id);
      if (story) {
        result.push(story);
        map.delete(id);
      }
    });
    map.forEach((story) => result.push(story));
    return result;
  }, [customStoryOrder]);

  const updateStoryOrder = useCallback((newOrder: string[]) => {
    setCustomStoryOrder(newOrder);
    safeSetItem('bookshelf_custom_story_order', newOrder);
  }, []);

  const resetStoryOrder = useCallback(() => {
    const defaultOrder = STORY_LEVELS.map((s) => s.id);
    setCustomStoryOrder(defaultOrder);
    safeSetItem('bookshelf_custom_story_order', defaultOrder);
  }, []);

  // 汉字收集计数
  const [collectedCount, setCollectedCountState] = useState<number>(() =>
    safeGetItem<number>('hanzi_collected_count', 49)
  );

  const setCollectedCount = useCallback((val: number | ((prev: number) => number)) => {
    setCollectedCountState((prev) => {
      const next = typeof val === 'function' ? val(prev) : val;
      const clamped = Math.min(TOTAL_TARGET, Math.max(0, next));
      safeSetItem('hanzi_collected_count', clamped);
      return clamped;
    });
  }, []);

  // 每日签到
  const [streakState, setStreakState] = useState<DailyStreakState>(() =>
    safeGetItem<DailyStreakState>('hanzi_daily_streak', DEFAULT_STREAK_STATE)
  );

  // 用户装扮
  const [equippedDecorations, setEquippedDecorations] = useState<UserEquippedDecorations>(() =>
    safeGetItem<UserEquippedDecorations>('hanzi_equipped_decorations', DEFAULT_DECORATIONS)
  );

  const equipDecoration = useCallback(
    (type: 'frame' | 'seal' | 'title' | 'bgTheme', id: string) => {
      if (type === 'seal') {
        sound.playSealStamp();
      } else {
        sound.playEquip();
      }
      setEquippedDecorations((prev) => {
        const next = { ...prev };
        if (type === 'frame') next.frameId = id;
        if (type === 'seal') next.sealId = id;
        if (type === 'bgTheme') next.bgThemeId = id;
        if (type === 'title') next.titleId = id;
        safeSetItem('hanzi_equipped_decorations', next);
        return next;
      });
    },
    []
  );

  // 艾宾浩斯周成长数据
  const [weeklyRecords, setWeeklyRecords] = useState<DailyLearningRecord[]>(() =>
    loadWeeklyLearningData(38)
  );

  // 每日微任务
  const [missionsState, setMissionsState] = useState<DailyMissionsState>(() =>
    loadDailyMissions()
  );

  const updateMissionsState = useCallback((newState: DailyMissionsState) => {
    setMissionsState(newState);
    saveDailyMissions(newState);
  }, []);

  const progressMission = useCallback(
    (
      category: 'radicals' | 'idioms' | 'challenge' | 'writing' | 'culture',
      onMissionCompleted?: () => void
    ) => {
      setMissionsState((prev) => {
        let changed = false;
        let justCompleted = false;
        const updated = prev.missions.map((m) => {
          if (m.category === category && m.status === 'in_progress') {
            const next = Math.min(m.targetCount, m.currentCount + 1);
            const status = next >= m.targetCount ? ('completed' as const) : ('in_progress' as const);
            if (status === 'completed') {
              justCompleted = true;
            }
            changed = true;
            return { ...m, currentCount: next, status };
          }
          return m;
        });
        if (!changed) return prev;
        if (justCompleted && onMissionCompleted) {
          onMissionCompleted();
        }
        const newState: DailyMissionsState = { ...prev, missions: updated };
        saveDailyMissions(newState);
        return newState;
      });
    },
    []
  );

  const readyToClaimMissionsCount = useMemo(() => {
    return missionsState.missions.filter((m) => m.status === 'completed').length;
  }, [missionsState.missions]);

  // 绘本各练习模块本地持久化完成状态体系 (利用 localStorage 在应用重启后自动恢复完成状态)
  const [storyExerciseMap, setStoryExerciseMap] = useState<Record<string, StoryExerciseStatus>>(() => {
    const loaded = safeGetItem<Record<string, StoryExerciseStatus>>('hanzi_story_exercise_status_map', {});
    if (loaded && typeof loaded === 'object' && Object.keys(loaded).length > 0) {
      return loaded;
    }
    // 初始引导数据：第1篇《春节与年兽》赋予初始已学模块标记，给学习者开局正向成就感
    return {
      'story-1': {
        storyId: 'story-1',
        modules: {
          reading: { completed: true, score: 98, completedAt: Date.now() - 86400000 },
          sound: { completed: true, score: 100, completedAt: Date.now() - 80000000 },
          radical: { completed: true, completedAt: Date.now() - 75000000 },
          handwriting: { completed: true, completedAt: Date.now() - 70000000 },
          cloze: { completed: true, score: 100, completedAt: Date.now() - 65000000 },
        },
        completedCount: 5,
        isAllCompleted: false,
        lastPracticedAt: Date.now() - 65000000,
      },
    };
  });

  const markModuleCompleted = useCallback(
    (
      storyId: string,
      moduleType: StoryModuleType,
      options?: { score?: number; details?: string }
    ) => {
      setStoryExerciseMap((prev) => {
        const existing = prev[storyId] || {
          storyId,
          modules: {},
          completedCount: 0,
          isAllCompleted: false,
          lastPracticedAt: Date.now(),
        };

        const updatedModules = {
          ...existing.modules,
          [moduleType]: {
            completed: true,
            score: options?.score ?? existing.modules[moduleType]?.score ?? 100,
            completedAt: Date.now(),
            details: options?.details,
          },
        };

        const completedCount = Object.values(updatedModules).filter((m) => m?.completed).length;
        const isAllCompleted = completedCount >= 6;

        const updatedStatus: StoryExerciseStatus = {
          storyId,
          modules: updatedModules,
          completedCount,
          isAllCompleted,
          lastPracticedAt: Date.now(),
        };

        const nextMap = {
          ...prev,
          [storyId]: updatedStatus,
        };

        safeSetItem('hanzi_story_exercise_status_map', nextMap);
        return nextMap;
      });

      // 自动推进对应微任务
      if (moduleType === 'sound' || moduleType === 'radical') {
        progressMission('challenge');
      } else if (moduleType === 'handwriting' || moduleType === 'cloze' || moduleType === 'essay') {
        progressMission('writing');
      } else if (moduleType === 'reading') {
        progressMission('culture');
      }
    },
    [progressMission]
  );

  const getStoryExerciseStatus = useCallback(
    (storyId: string): StoryExerciseStatus => {
      if (storyExerciseMap[storyId]) {
        return storyExerciseMap[storyId];
      }
      return {
        storyId,
        modules: {},
        completedCount: 0,
        isAllCompleted: false,
        lastPracticedAt: 0,
      };
    },
    [storyExerciseMap]
  );

  const getModuleCompletion = useCallback(
    (storyId: string, moduleType: StoryModuleType): ModuleCompletionRecord | null => {
      const status = storyExerciseMap[storyId];
      return status?.modules?.[moduleType] || null;
    },
    [storyExerciseMap]
  );

  const getStoryCompletionSummary = useCallback(
    (storyId: string) => {
      const status = storyExerciseMap[storyId];
      const completedCount = status?.completedCount || 0;
      const totalModules = 6;
      const percentage = Math.min(100, Math.round((completedCount / totalModules) * 100));
      return {
        totalModules,
        completedCount,
        percentage,
        isAllCompleted: completedCount >= totalModules,
      };
    },
    [storyExerciseMap]
  );

  const getGlobalExerciseStats = useCallback(() => {
    const totalStories = STORY_LEVELS.length;
    let completedModulesTotal = 0;
    let fullyCompletedStoriesCount = 0;
    const maxModulesTotal = totalStories * 6;

    STORY_LEVELS.forEach((story) => {
      const status = storyExerciseMap[story.id];
      if (status) {
        completedModulesTotal += status.completedCount || 0;
        if (status.isAllCompleted || status.completedCount >= 6) {
          fullyCompletedStoriesCount++;
        }
      }
    });

    return {
      totalStories,
      completedModulesTotal,
      maxModulesTotal,
      fullyCompletedStoriesCount,
    };
  }, [storyExerciseMap]);

  // 汉字模态框
  const [modalChar, setModalChar] = useState<HanziChar | null>(null);

  const selectCharacterFromChart = useCallback((char: string) => {
    const found = TARGET_CHARACTERS.find((c) => c.char === char);
    if (found) {
      setModalChar(found);
    }
  }, []);

  // 50 字里程碑成语典故弹窗
  const [milestoneModalOpen, setMilestoneModalOpen] = useState<boolean>(false);
  const [milestoneIdiom, setMilestoneIdiom] = useState<IdiomAllusion | null>(null);
  const [milestoneCount, setMilestoneCount] = useState<number>(50);

  // 最新解锁汉字与时间戳（供 ChallengeSection 等视图监听触发粒子特效，解耦 Ref）
  const [lastUnlockedWord, setLastUnlockedWord] = useState<string | null>(null);
  const [lastUnlockTimestamp, setLastUnlockTimestamp] = useState<number>(0);

  // 签到操作
  const checkIn = useCallback(() => {
    setStreakState((prev) => {
      const nextDays = prev.streakDays + 1;
      const todayStr = new Date().toISOString().split('T')[0];
      const updated: DailyStreakState = {
        ...prev,
        streakDays: nextDays,
        totalCheckIns: prev.totalCheckIns + 1,
        lastCheckInDate: todayStr,
        isTodayCheckedIn: true,
        unlockedStreakRewards: [...prev.unlockedStreakRewards, `day-${nextDays}`],
      };
      safeSetItem('hanzi_daily_streak', updated);

      if (nextDays >= 7) {
        setEquippedDecorations((d) => {
          const next = {
            ...d,
            frameId: 'frame-streak-7',
            titleId: 'title-streak-7',
          };
          safeSetItem('hanzi_equipped_decorations', next);
          return next;
        });
      } else if (nextDays >= 3) {
        setEquippedDecorations((d) => {
          const next = {
            ...d,
            sealId: 'seal-streak-3',
            titleId: 'title-streak-3',
          };
          safeSetItem('hanzi_equipped_decorations', next);
          return next;
        });
      }

      return updated;
    });
  }, []);

  const fastForwardStreak = useCallback((targetDays: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setStreakState((prev) => {
      const updated: DailyStreakState = {
        streakDays: targetDays,
        totalCheckIns: Math.max(prev.totalCheckIns, targetDays),
        lastCheckInDate: todayStr,
        isTodayCheckedIn: true,
        unlockedStreakRewards: Array.from({ length: targetDays }, (_, i) => `day-${i + 1}`),
      };
      safeSetItem('hanzi_daily_streak', updated);
      return updated;
    });
  }, []);

  const resetStreak = useCallback(() => {
    const reset: DailyStreakState = {
      streakDays: 0,
      totalCheckIns: 0,
      lastCheckInDate: null,
      isTodayCheckedIn: false,
      unlockedStreakRewards: [],
    };
    setStreakState(reset);
    safeSetItem('hanzi_daily_streak', reset);
  }, []);

  const addWordSample = useCallback((candidate?: string) => {
    const candidateChars = ['辞', '迎', '福', '寿', '康', '吉', '祥', '瑞', '禧', '昌', '盛', '辉'];
    const chosen = candidate || candidateChars[Math.floor(Math.random() * candidateChars.length)];
    setWeeklyRecords((prev) => addWordToTodayRecord(chosen, prev));
    setCollectedCountState((prev) => {
      const next = Math.min(TOTAL_TARGET, prev + 1);
      safeSetItem('hanzi_collected_count', next);
      return next;
    });
    progressMission('radicals');
    return chosen;
  }, [progressMission]);

  const unlockNewWord = useCallback(
    (candidateChar?: string) => {
      const candidateChars = [
        '福', '寿', '祥', '瑞', '吉', '春', '联', '岁',
        '夕', '迎', '辞', '智', '勇', '礼', '学', '诚'
      ];
      const chosen = candidateChar || candidateChars[Math.floor(Math.random() * candidateChars.length)];

      setWeeklyRecords((prev) => addWordToTodayRecord(chosen, prev));
      progressMission('radicals');
      progressMission('challenge');

      setCollectedCountState((prev) => {
        const next = Math.min(TOTAL_TARGET, prev + 1);
        safeSetItem('hanzi_collected_count', next);

        // 累积每 50 字触发成语典故里程碑大捷
        if (next > 0 && next % 50 === 0) {
          const randomIdiom =
            IDIOM_ALLUSIONS[Math.floor(Math.random() * IDIOM_ALLUSIONS.length)];
          setMilestoneIdiom(randomIdiom);
          setMilestoneCount(next);
          setMilestoneModalOpen(true);
          sound.playBadgeUnlock();
        } else if (next === 25 || next === 75 || next === 100) {
          sound.playBadgeUnlock();
        }

        return next;
      });

      setLastUnlockedWord(chosen);
      setLastUnlockTimestamp(Date.now());

      return chosen;
    },
    [progressMission]
  );

  // 阅读研习全局状态 (ReadingProgress: 已读章节 ID、朗读得分、收集的故事画卷碎片)
  const [readingProgress, setReadingProgressState] = useState<ReadingProgress>(() => {
    const loaded = safeGetItem<ReadingProgress>('hanzi_reading_progress', DEFAULT_READING_PROGRESS);
    const readIds = loaded.readChapterIds || loaded.completedArticleIds || ['story-1'];
    const scores = loaded.readingScores || loaded.storyScores || { 'story-1': 95 };
    const fragments = loaded.scrollFragments || ['scroll-fragment-nian-horns'];
    const lastId = loaded.lastReadChapterId || loaded.lastReadArticleId || 'story-1';
    return {
      readChapterIds: readIds,
      completedArticleIds: readIds,
      readingScores: scores,
      storyScores: scores,
      scrollFragments: fragments,
      lastReadChapterId: lastId,
      lastReadArticleId: lastId,
      completedArticlesCount: readIds.length,
      lastCompletedTimestamp: loaded.lastCompletedTimestamp || Date.now(),
    };
  });

  const setReadingProgress = useCallback((action: React.SetStateAction<ReadingProgress>) => {
    setReadingProgressState((prev) => {
      const next = typeof action === 'function' ? action(prev) : action;
      const readIds = next.readChapterIds || next.completedArticleIds || [];
      const scores = next.readingScores || next.storyScores || {};
      const fragments = next.scrollFragments || [];
      const lastId = next.lastReadChapterId || next.lastReadArticleId || null;
      const normalized: ReadingProgress = {
        ...next,
        readChapterIds: readIds,
        completedArticleIds: readIds,
        readingScores: scores,
        storyScores: scores,
        scrollFragments: fragments,
        lastReadChapterId: lastId,
        lastReadArticleId: lastId,
        completedArticlesCount: readIds.length,
      };
      safeSetItem('hanzi_reading_progress', normalized);
      return normalized;
    });
  }, []);

  const updateReadingScore = useCallback(
    (articleId: string, score: number) => {
      setReadingProgress((prev) => {
        const existing = prev.readingScores[articleId] || 0;
        const bestScore = Math.max(existing, score);
        const updatedScores = { ...prev.readingScores, [articleId]: bestScore };
        return {
          ...prev,
          readingScores: updatedScores,
          storyScores: updatedScores,
          lastReadChapterId: articleId,
          lastReadArticleId: articleId,
        };
      });
    },
    [setReadingProgress]
  );

  const addScrollFragment = useCallback(
    (fragmentId: string) => {
      if (!fragmentId) return;
      setReadingProgress((prev) => {
        if (prev.scrollFragments.includes(fragmentId)) return prev;
        return {
          ...prev,
          scrollFragments: [...prev.scrollFragments, fragmentId],
        };
      });
    },
    [setReadingProgress]
  );

  // 宝库修业阁解锁状态体系
  const [unlockedTreasuryItems, setUnlockedTreasuryItems] = useState<string[]>(() =>
    safeGetItem<string[]>('hanzi_unlocked_treasury_items', DEFAULT_UNLOCKED_TREASURY_ITEMS)
  );

  const unlockTreasuryItem = useCallback((itemId: string) => {
    if (!itemId) return false;
    let newlyUnlocked = false;
    setUnlockedTreasuryItems((prev) => {
      if (prev.includes(itemId)) return prev;
      newlyUnlocked = true;
      const next = [...prev, itemId];
      safeSetItem('hanzi_unlocked_treasury_items', next);
      return next;
    });
    if (newlyUnlocked) {
      sound.playBadgeUnlock();
    }
    return newlyUnlocked;
  }, []);

  const isTreasuryItemUnlocked = useCallback(
    (itemId: string) => {
      if (DEFAULT_UNLOCKED_TREASURY_ITEMS.includes(itemId)) return true;
      if (unlockedTreasuryItems.includes(itemId)) return true;
      const frame = AVAILABLE_DECORATIONS.frames.find((f) => f.id === itemId);
      const seal = AVAILABLE_DECORATIONS.seals.find((s) => s.id === itemId);
      const theme = AVAILABLE_DECORATIONS.bgThemes.find((t) => t.id === itemId);
      const title = AVAILABLE_DECORATIONS.titles.find((t) => t.id === itemId);
      const target = frame || seal || theme || title;
      if (target) {
        if (target.requiredChars > 0 && collectedCount >= target.requiredChars) return true;
        if (target.requiredStreakDays && streakState.streakDays >= target.requiredStreakDays) return true;
      }
      return false;
    },
    [unlockedTreasuryItems, collectedCount, streakState.streakDays]
  );

  // 墨宝工坊与画板笔触皮肤体系 (持久化与全局响应)
  const [unlockedBrushSkins, setUnlockedBrushSkins] = useState<string[]>(() =>
    safeGetItem<string[]>('hanzi_unlocked_brush_skins', DEFAULT_UNLOCKED_BRUSH_SKINS)
  );

  const [activeBrushSkin, setActiveBrushSkinState] = useState<string>(() =>
    safeGetItem<string>('hanzi_active_brush_skin', 'brush-ink')
  );

  const setActiveBrushSkin = useCallback((skinId: string) => {
    setActiveBrushSkinState(skinId);
    safeSetItem('hanzi_active_brush_skin', skinId);
    sound.playTap();
  }, []);

  const isBrushSkinUnlocked = useCallback(
    (skinId: string) => {
      if (DEFAULT_UNLOCKED_BRUSH_SKINS.includes(skinId)) return true;
      return unlockedBrushSkins.includes(skinId);
    },
    [unlockedBrushSkins]
  );

  const redeemBrushSkin = useCallback(
    (skinId: string, costExp: number): { success: boolean; message: string } => {
      if (isBrushSkinUnlocked(skinId)) {
        return { success: false, message: '该笔触皮肤已在墨宝工坊研制，无需重复兑换！' };
      }
      if (missionsState.totalExpEarned < costExp) {
        return {
          success: false,
          message: `阅历值不足（当前拥有 ${missionsState.totalExpEarned} / 需 ${costExp} 点），研读故事篇章可快速获取！`,
        };
      }

      // 1. 扣除阅历值（同源存储在 missionsState.totalExpEarned）
      setMissionsState((prev) => {
        const nextState = {
          ...prev,
          totalExpEarned: Math.max(0, prev.totalExpEarned - costExp),
        };
        saveDailyMissions(nextState);
        return nextState;
      });

      // 2. 存入已解锁笔触皮肤清单
      setUnlockedBrushSkins((prev) => {
        const next = prev.includes(skinId) ? prev : [...prev, skinId];
        safeSetItem('hanzi_unlocked_brush_skins', next);
        return next;
      });

      // 3. 自动将新兑换的笔触设为当前激活笔触
      setActiveBrushSkinState(skinId);
      safeSetItem('hanzi_active_brush_skin', skinId);

      sound.playBadgeUnlock();
      return { success: true, message: '恭贺大捷！笔触皮肤研制成功，已自动装配至书写画板！' };
    },
    [isBrushSkinUnlocked, missionsState.totalExpEarned]
  );

  // 典藏画卷解锁判定辅助
  const isScrollUnlocked = useCallback(
    (storyId: string) => {
      if (readingProgress.readChapterIds?.includes(storyId)) return true;
      if (readingProgress.completedArticleIds?.includes(storyId)) return true;
      if (readingProgress.scrollFragments?.some((f) => f.includes(storyId))) return true;
      return false;
    },
    [readingProgress]
  );

  // 全局阅历值与金币增量方法（严格同源复用 missionsState）
  const addExpAndCoins = useCallback((exp: number, coins: number) => {
    setMissionsState((prev) => {
      const newState: DailyMissionsState = {
        ...prev,
        totalExpEarned: Math.max(0, prev.totalExpEarned + exp),
        totalCoins: Math.max(0, prev.totalCoins + coins),
      };
      saveDailyMissions(newState);
      return newState;
    });
  }, []);

  // 统一阅读任务结算 action：completeReadingTask(articleId, expReward, itemReward)
  // 调用时自动增加全局的‘阅历值/金币’，推进微任务，收集故事画卷碎片，并触发解锁宝库逻辑
  const completeReadingTask = useCallback(
    (articleId: string, expReward?: number, itemReward?: string): ReadingTaskResult => {
      const finalExp = expReward && expReward > 0 ? expReward : 50;
      const finalCoins = Math.max(15, Math.round(finalExp * 0.6));

      // 1. 自动增加全局‘阅历值/金币’，严格同源复用已有积分体系
      setMissionsState((prev) => {
        const nextExp = prev.totalExpEarned + finalExp;
        const nextCoins = prev.totalCoins + finalCoins;
        const newState: DailyMissionsState = {
          ...prev,
          totalExpEarned: nextExp,
          totalCoins: nextCoins,
        };
        saveDailyMissions(newState);
        return newState;
      });

      // 推进每日文化微任务
      progressMission('culture');

      // 2. 更新已读章节与故事画卷碎片
      const newItemsUnlocked: string[] = [];
      let updatedFragments: string[] = [];
      let nextProgressSnapshot: ReadingProgress = readingProgress;

      setReadingProgress((prev) => {
        const isAlreadyRead = prev.readChapterIds.includes(articleId);
        const nextReadIds = isAlreadyRead ? prev.readChapterIds : [...prev.readChapterIds, articleId];

        updatedFragments = [...prev.scrollFragments];
        if (itemReward && !updatedFragments.includes(itemReward)) {
          updatedFragments.push(itemReward);
        }
        const defaultFragment = `scroll-fragment-${articleId}`;
        if (!itemReward && !updatedFragments.includes(defaultFragment)) {
          updatedFragments.push(defaultFragment);
        }

        const nextProgress: ReadingProgress = {
          ...prev,
          readChapterIds: nextReadIds,
          completedArticleIds: nextReadIds,
          readingScores: prev.readingScores,
          storyScores: prev.storyScores,
          scrollFragments: updatedFragments,
          lastReadChapterId: articleId,
          lastReadArticleId: articleId,
          completedArticlesCount: nextReadIds.length,
          lastCompletedTimestamp: Date.now(),
        };
        nextProgressSnapshot = nextProgress;
        safeSetItem('hanzi_reading_progress', nextProgress);
        return nextProgress;
      });

      // 联动持久化模块完成状态：标记当前篇章阅读研习已通关
      markModuleCompleted(articleId, 'reading', { score: 100 });

      // 3. 触发解锁宝库逻辑 (解锁专属卡套、印章、头衔或徽章)
      setUnlockedTreasuryItems((prev) => {
        const next = [...prev];
        const attemptUnlock = (id: string) => {
          if (!next.includes(id)) {
            next.push(id);
            newItemsUnlocked.push(id);
          }
        };

        if (itemReward) {
          attemptUnlock(itemReward);
        }

        if (articleId === 'story-1' || articleId === 'story-nian') {
          attemptUnlock('ach-nian-tamer');
          attemptUnlock('bg-spring-festival');
          attemptUnlock('title-tongsheng');
        } else if (articleId === 'story-2' || articleId === 'story-duanwu') {
          attemptUnlock('seal-learn-25');
          attemptUnlock('title-xiucai');
        }

        if (nextProgressSnapshot.completedArticlesCount >= 3) {
          attemptUnlock('seal-streak-3');
        }
        if (nextProgressSnapshot.completedArticlesCount >= 5) {
          attemptUnlock('frame-gold-50');
        }

        if (next.length > prev.length) {
          safeSetItem('hanzi_unlocked_treasury_items', next);
        }
        return next;
      });

      // 4. 音效与全局解锁标记
      if (newItemsUnlocked.length > 0) {
        sound.playBadgeUnlock();
      } else {
        sound.playReward();
      }
      setLastUnlockTimestamp(Date.now());

      return {
        articleId,
        expEarned: finalExp,
        coinsEarned: finalCoins,
        scrollFragments: updatedFragments.length > 0 ? updatedFragments : readingProgress.scrollFragments,
        newItemsUnlocked,
        readingProgress: nextProgressSnapshot,
      };
    },
    [progressMission, readingProgress, setReadingProgress]
  );

  // 玩家等级与阅历进阶信息 (严格同源于 missionsState.totalExpEarned)
  const playerLevelInfo = useMemo<PlayerLevelInfo>(() => {
    return getPlayerLevelInfo(missionsState.totalExpEarned);
  }, [missionsState.totalExpEarned]);

  // 完成段落研习结算：根据朗读时长与准确率计算经验并更新全局等级
  const recordReadingSegmentExp = useCallback(
    (
      segmentId: number | string,
      readTimeSeconds: number,
      accuracy: number
    ): ReadingSegmentExpResult => {
      const safeTime = Math.max(1, Math.round(readTimeSeconds));
      const safeAccuracy = Math.min(100, Math.max(30, Math.round(accuracy)));

      // 准确率基准 EXP (12 ~ 25 EXP)
      const accuracyScore = Math.round((safeAccuracy / 100) * 22);
      // 朗读浸润时长系数 (4 ~ 12 EXP)
      const timeScore = Math.min(12, Math.max(4, Math.round(safeTime * 0.8)));
      // 高准确率 (>=90%) 额外卓越奖励
      const perfectBonus = safeAccuracy >= 90 ? 6 : safeAccuracy >= 80 ? 3 : 0;

      const expGained = Math.max(16, accuracyScore + timeScore + perfectBonus);
      const coinsGained = Math.max(6, Math.round(expGained * 0.5));

      const oldLevel = getPlayerLevelInfo(missionsState.totalExpEarned).level;
      const newTotalExp = missionsState.totalExpEarned + expGained;
      const newLevelInfo = getPlayerLevelInfo(newTotalExp);
      const leveledUp = newLevelInfo.level > oldLevel;

      // 1. 同步增加全局阅历值/金币
      setMissionsState((prev) => {
        const nextState: DailyMissionsState = {
          ...prev,
          totalExpEarned: newTotalExp,
          totalCoins: prev.totalCoins + coinsGained,
        };
        saveDailyMissions(nextState);
        return nextState;
      });

      // 2. 推进微任务与文化研习
      progressMission('challenge');

      // 3. 升级或获得奖励音效
      if (leveledUp) {
        sound.playBadgeUnlock();
        setLastUnlockTimestamp(Date.now());
      } else {
        sound.playReward();
      }

      return {
        segmentId,
        expGained,
        coinsGained,
        readTimeSeconds: safeTime,
        accuracy: safeAccuracy,
        leveledUp,
        oldLevel,
        newLevel: newLevelInfo.level,
        newLevelTitle: newLevelInfo.title,
        totalExp: newTotalExp,
      };
    },
    [missionsState.totalExpEarned, progressMission]
  );

  const value = useMemo<GameStoreState>(
    () => ({
      currentStoryId,
      setCurrentStoryId,
      currentStory,
      customStoryOrder,
      orderedStories,
      updateStoryOrder,
      resetStoryOrder,
      collectedCount,
      totalTarget: TOTAL_TARGET,
      setCollectedCount,
      totalExpEarned: missionsState.totalExpEarned,
      totalCoins: missionsState.totalCoins,
      addExpAndCoins,
      playerLevelInfo,
      playerLevel: playerLevelInfo.level,
      recordReadingSegmentExp,
      readingProgress,
      setReadingProgress,
      updateReadingScore,
      addScrollFragment,
      completeReadingTask,
      unlockedTreasuryItems,
      unlockTreasuryItem,
      isTreasuryItemUnlocked,
      unlockedBrushSkins,
      activeBrushSkin,
      setActiveBrushSkin,
      redeemBrushSkin,
      isBrushSkinUnlocked,
      isScrollUnlocked,
      streakState,
      checkIn,
      fastForwardStreak,
      resetStreak,
      equippedDecorations,
      setEquippedDecorations,
      equipDecoration,
      weeklyRecords,
      setWeeklyRecords,
      addWordSample,
      missionsState,
      updateMissionsState,
      progressMission,
      readyToClaimMissionsCount,
      modalChar,
      setModalChar,
      selectCharacterFromChart,
      milestoneModalOpen,
      setMilestoneModalOpen,
      milestoneIdiom,
      setMilestoneIdiom,
      milestoneCount,
      setMilestoneCount,
      lastUnlockedWord,
      lastUnlockTimestamp,
      unlockNewWord,
      storyExerciseMap,
      markModuleCompleted,
      getStoryExerciseStatus,
      getModuleCompletion,
      getStoryCompletionSummary,
      getGlobalExerciseStats,
    }),
    [
      currentStoryId,
      setCurrentStoryId,
      currentStory,
      customStoryOrder,
      orderedStories,
      updateStoryOrder,
      resetStoryOrder,
      collectedCount,
      setCollectedCount,
      missionsState,
      addExpAndCoins,
      playerLevelInfo,
      recordReadingSegmentExp,
      readingProgress,
      setReadingProgress,
      updateReadingScore,
      addScrollFragment,
      completeReadingTask,
      unlockedTreasuryItems,
      unlockTreasuryItem,
      isTreasuryItemUnlocked,
      unlockedBrushSkins,
      activeBrushSkin,
      setActiveBrushSkin,
      redeemBrushSkin,
      isBrushSkinUnlocked,
      isScrollUnlocked,
      streakState,
      checkIn,
      fastForwardStreak,
      resetStreak,
      equippedDecorations,
      equipDecoration,
      weeklyRecords,
      addWordSample,
      updateMissionsState,
      progressMission,
      readyToClaimMissionsCount,
      modalChar,
      selectCharacterFromChart,
      milestoneModalOpen,
      milestoneIdiom,
      milestoneCount,
      lastUnlockedWord,
      lastUnlockTimestamp,
      unlockNewWord,
      storyExerciseMap,
      markModuleCompleted,
      getStoryExerciseStatus,
      getModuleCompletion,
      getStoryCompletionSummary,
      getGlobalExerciseStats,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

/**
 * 访问核心游戏化数据与进度 Hook
 */
export function useGameStore(): GameStoreState {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameStore 必须在 <GameProvider> 内使用');
  }
  return context;
}
