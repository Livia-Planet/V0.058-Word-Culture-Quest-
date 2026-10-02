import { safeGetItem, safeSetItem } from '../utils/storage';

export interface DailyLearningRecord {
  date: string; // e.g. '09/16'
  dayName: string; // e.g. '周三', '昨日', '今日'
  fullDate: string; // e.g. '2026-09-16'
  newWordsCount: number; // 当日新学汉字数
  cumulativeCount: number; // 累计词汇量
  targetCount: number; // 每日目标（默认5字）
  charactersLearned: string[]; // 当天掌握的核心字
  accuracy: number; // 听说及拼字挑战正确率
  studyMinutes: number; // 学习时长（分钟）
}

export interface WeeklyLearningStats {
  records: DailyLearningRecord[];
  totalThisWeek: number;
  dailyAverage: number;
  peakDay: { dayName: string; count: number };
  targetAchievedDays: number;
  growthPercentage: number;
}

const STORAGE_KEY = 'hanzi_weekly_learning_data_v1';

// Generate default 7-day learning history ending today
export function getInitialWeeklyData(currentCollectedCount = 38): DailyLearningRecord[] {
  const dayLabels = ['周三', '周四', '周五', '周六', '周日', '昨日', '今日 (周二)'];
  const sampleWordsByDay = [
    ['岁', '除', '夕', '兽'],
    ['爆', '竹', '驱', '邪', '红'],
    ['联', '帖', '门', '神'],
    ['祈', '福', '饺', '宴', '守', '夜', '辞', '旧'],
    ['迎', '新', '贺', '岁', '吉', '祥'],
    ['拜', '年', '压', '岁', '聚'],
    ['丰', '登', '团', '圆'],
  ];

  const defaultNewWords = [4, 5, 4, 8, 6, 5, 4];
  const defaultTimes = [18, 22, 16, 35, 28, 24, 20];
  const defaultAccuracies = [92, 95, 90, 98, 96, 94, 95];

  const today = new Date();
  let runningTotal = Math.max(12, currentCollectedCount - defaultNewWords.reduce((a, b) => a + b, 0));

  const records: DailyLearningRecord[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${month}/${day}`;
    const fullDate = d.toISOString().split('T')[0];

    const idx = 6 - i;
    const count = defaultNewWords[idx];
    runningTotal += count;

    records.push({
      date: dateStr,
      dayName: dayLabels[idx],
      fullDate,
      newWordsCount: count,
      cumulativeCount: runningTotal,
      targetCount: 5,
      charactersLearned: sampleWordsByDay[idx] || ['字'],
      accuracy: defaultAccuracies[idx],
      studyMinutes: defaultTimes[idx],
    });
  }

  return records;
}

export function loadWeeklyLearningData(currentCollectedCount = 38): DailyLearningRecord[] {
  const parsed = safeGetItem<DailyLearningRecord[] | null>(STORAGE_KEY, null);
  if (parsed && Array.isArray(parsed) && parsed.length === 7) {
    return parsed;
  }
  const initial = getInitialWeeklyData(currentCollectedCount);
  saveWeeklyLearningData(initial);
  return initial;
}

export function saveWeeklyLearningData(data: DailyLearningRecord[]): void {
  safeSetItem(STORAGE_KEY, data);
}

export function addWordToTodayRecord(word: string, currentRecords: DailyLearningRecord[]): DailyLearningRecord[] {
  const updated = [...currentRecords];
  const todayRecord = { ...updated[updated.length - 1] };

  todayRecord.newWordsCount += 1;
  todayRecord.cumulativeCount += 1;
  if (!todayRecord.charactersLearned.includes(word)) {
    todayRecord.charactersLearned = [...todayRecord.charactersLearned, word];
  }
  todayRecord.studyMinutes += 3;

  updated[updated.length - 1] = todayRecord;
  saveWeeklyLearningData(updated);
  return updated;
}

export function computeWeeklyStats(records: DailyLearningRecord[]): WeeklyLearningStats {
  const totalThisWeek = records.reduce((sum, r) => sum + r.newWordsCount, 0);
  const dailyAverage = Math.round((totalThisWeek / records.length) * 10) / 10;
  
  let peak = { dayName: records[0]?.dayName || '今天', count: records[0]?.newWordsCount || 0 };
  let targetAchievedDays = 0;

  records.forEach((r) => {
    if (r.newWordsCount > peak.count) {
      peak = { dayName: r.dayName, count: r.newWordsCount };
    }
    if (r.newWordsCount >= r.targetCount) {
      targetAchievedDays++;
    }
  });

  return {
    records,
    totalThisWeek,
    dailyAverage,
    peakDay: peak,
    targetAchievedDays,
    growthPercentage: 24.5, // 较上周同期增长
  };
}
