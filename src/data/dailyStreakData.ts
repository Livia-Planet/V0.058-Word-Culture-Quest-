export interface DailyReward {
  day: number;
  name: string;
  type: 'coins' | 'decoration' | 'title' | 'seal';
  description: string;
  icon: string;
  rewardValue: string; // item id or coins amount
  isMajor?: boolean;
}

export interface DailyStreakState {
  streakDays: number;
  totalCheckIns: number;
  lastCheckInDate: string | null; // 'YYYY-MM-DD'
  isTodayCheckedIn: boolean;
  unlockedStreakRewards: string[]; // reward ids
}

export interface DayQuote {
  day: number;
  quote: string;
  source: string;
  meaning: string;
}

export const DAILY_CULTURAL_QUOTES: DayQuote[] = [
  { day: 1, quote: '千里之行，始于足下。', source: '《老子》', meaning: '两年的 3500 字征途，从每日识得一字开启！' },
  { day: 2, quote: '温故而知新，可以为师矣。', source: '《论语》', meaning: '每日复习艾宾浩斯渐隐字，旧知识生出新智慧。' },
  { day: 3, quote: '日拱一卒，功不唐捐。', source: '传统训诫', meaning: '每天前进一小步，时光从不辜负默默耕耘者。' },
  { day: 4, quote: '读书破万卷，下笔如有神。', source: '杜甫', meaning: '多积累高频词汇与佳句，写400字小作文如有神助。' },
  { day: 5, quote: '学如逆水行舟，不进则退。', source: '《增广贤文》', meaning: '坚持连续打卡，让好习惯化为每日自觉。' },
  { day: 6, quote: '敏而好学，不耻下问。', source: '《论语》', meaning: '遇到生字大胆拆解偏旁，探求造字源流奥妙。' },
  { day: 7, quote: '博学之，审问之，慎思之，明辨之，笃行之。', source: '《礼记》', meaning: '满签一周！北斗星辉耀文心，七日恒心成学士！' },
];

export const STREAK_REWARDS: DailyReward[] = [
  {
    day: 1,
    name: '开卷初捷 · 修业文币',
    type: 'coins',
    description: '首日破晓打卡，赠送 50 文币',
    icon: '🪙',
    rewardValue: '50 文币',
  },
  {
    day: 2,
    name: '温故知新 · 笔墨锦囊',
    type: 'coins',
    description: '连续 2 天学习，获得 80 文币',
    icon: '🎁',
    rewardValue: '80 文币',
  },
  {
    day: 3,
    name: '“日拱一卒”限定朱砂印',
    type: 'seal',
    description: '连续 3 天打卡解锁【日拱一卒】篆刻私印',
    icon: '🏮',
    rewardValue: 'seal-streak-3',
    isMajor: true,
  },
  {
    day: 4,
    name: '四海文思 · 妙笔生花',
    type: 'coins',
    description: '连续 4 天学习，获得 120 文币',
    icon: '✨',
    rewardValue: '120 文币',
  },
  {
    day: 5,
    name: '五车博雅 · 敏思泉涌',
    type: 'coins',
    description: '连续 5 天学习，获得 150 文币',
    icon: '📜',
    rewardValue: '150 文币',
  },
  {
    day: 6,
    name: '六合朗照 · 渐入佳境',
    type: 'coins',
    description: '连续 6 天学习，获得 200 文币',
    icon: '🎋',
    rewardValue: '200 文币',
  },
  {
    day: 7,
    name: '北斗星辉框 (7天连续限定)',
    type: 'decoration',
    description: '【满签大奖】解锁专属限定头像框【北斗星辉框】与【笃志力行】称号！',
    icon: '👑',
    rewardValue: 'frame-streak-7',
    isMajor: true,
  },
];
