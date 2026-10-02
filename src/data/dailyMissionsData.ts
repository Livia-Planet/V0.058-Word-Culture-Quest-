import { safeGetItem, safeSetItem } from '../utils/storage';

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  currentCount: number;
  category: 'radicals' | 'idioms' | 'challenge' | 'writing' | 'culture';
  reward: {
    exp: number; // 研习经验值
    coins: number; // 文昌通宝
    bonusWords?: number; // 词汇收集加成
    tag?: string; // 勋章徽记
  };
  targetTab: 'story' | 'challenge' | 'writing' | 'cards';
  status: 'in_progress' | 'completed' | 'claimed';
  icon: string;
  details?: string[]; // 具体的任务要素，如示例部首或成语
}

export interface DailyMissionsState {
  date: string;
  missions: DailyMission[];
  totalExpEarned: number;
  totalCoins: number;
  chestClaimed: boolean;
}

const STORAGE_KEY = 'hanzi_daily_missions_state_v1';

export const DEFAULT_MISSIONS: DailyMission[] = [
  {
    id: 'mission-radicals',
    title: '偏旁通关：复习 5 个核心部首',
    description: '探索并辨析火(灬)、夕、示(礻)、竹(⺮)、禾等 5 个高频部首，掌握形旁表意规律。',
    targetCount: 5,
    currentCount: 3, // 3/5 in progress
    category: 'radicals',
    reward: { exp: 35, coins: 20, tag: '部首精进' },
    targetTab: 'challenge',
    status: 'in_progress',
    icon: 'Puzzle',
    details: ['灬 (火)', '夕 (夕部)', '礻 (示部)', '⺮ (竹部)', '禾 (禾木)'],
  },
  {
    id: 'mission-idioms',
    title: '词采斐然：在小作文练写 2 个成语',
    description: '在 400 字小作文实验室中运用「辞旧迎新」、「万象更新」或「普天同庆」等经典成语。',
    targetCount: 2,
    currentCount: 1, // 1/2 in progress
    category: 'idioms',
    reward: { exp: 40, coins: 25, tag: '妙笔生花' },
    targetTab: 'writing',
    status: 'in_progress',
    icon: 'PenTool',
    details: ['辞旧迎新', '万象更新', '普天同庆', '喜气洋洋'],
  },
  {
    id: 'mission-challenge',
    title: '声韵铿锵：完成 1 次听说拼字挑战',
    description: '在听说挑战区完成「除」字或「夕」字的部首组装与语音跟读，提升字形辨识敏锐度。',
    targetCount: 1,
    currentCount: 1, // 1/1 completed, ready to claim
    category: 'challenge',
    reward: { exp: 30, coins: 15 },
    targetTab: 'challenge',
    status: 'completed',
    icon: 'Gamepad2',
    details: ['拼字：⻖ + 余 = 除', '拼字：夕 + 口 = 名'],
  },
  {
    id: 'mission-culture',
    title: '寻根溯源：查阅 1 张文化渊源典故卡',
    description: '在文化卡片库中研读《元日》王安石名篇或年兽传说，探索民俗汉字背后的文化基因。',
    targetCount: 1,
    currentCount: 0,
    category: 'culture',
    reward: { exp: 25, coins: 15 },
    targetTab: 'cards',
    status: 'in_progress',
    icon: 'BookOpen',
    details: ['王安石《元日》爆竹声', '年兽除夕守岁民俗'],
  },
];

export function loadDailyMissions(): DailyMissionsState {
  const today = new Date().toISOString().split('T')[0];
  const parsed = safeGetItem<DailyMissionsState | null>(STORAGE_KEY, null);
  if (parsed && parsed.date === today && Array.isArray(parsed.missions) && parsed.missions.length > 0) {
    return parsed;
  }

  const newState: DailyMissionsState = {
    date: today,
    missions: DEFAULT_MISSIONS,
    totalExpEarned: 120,
    totalCoins: 85,
    chestClaimed: false,
  };
  saveDailyMissions(newState);
  return newState;
}

export function saveDailyMissions(state: DailyMissionsState): void {
  safeSetItem(STORAGE_KEY, state);
}
