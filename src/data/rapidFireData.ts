import { getStoryChallengeData, getStoryById } from './storyLevels';
import { HanziChar } from './level1Data';

export interface RapidFireQuestion {
  id: string;
  char: string;
  pinyin: string;
  audioPrompt: string;
  options: string[];
  correctAnswer: string;
  hint: string;
  category: '音近' | '形近' | '高频' | '民俗';
}

export interface PriorityPoolOptions {
  currentStoryId?: string;
  unlockedStoryIds?: string[];
  studiedWords?: string[];
  targetPoolSize?: number;
  readChapterIdsCount?: number;
  weeklyRecordsCount?: number;
}

export interface GeneratedPoolResult {
  questions: RapidFireQuestion[];
  stats: {
    currentCount: number;
    reviewCount: number;
    fallbackCount: number;
    total: number;
  };
}

export const RAPID_FIRE_QUESTIONS: RapidFireQuestion[] = [
  {
    id: 'rf-1',
    char: '春',
    pinyin: 'chūn',
    audioPrompt: 'chūn · 春暖花开的春',
    options: ['春', '舂', '奉', '泰'],
    correctAnswer: '春',
    hint: '三横长短有致，下有日字居中',
    category: '形近',
  },
  {
    id: 'rf-2',
    char: '节',
    pinyin: 'jié',
    audioPrompt: 'jié · 佳节良辰的节',
    options: ['节', '爷', '卫', '疖'],
    correctAnswer: '节',
    hint: '草字头下悬针竖垂直挺拔',
    category: '高频',
  },
  {
    id: 'rf-3',
    char: '年',
    pinyin: 'nián',
    audioPrompt: 'nián · 延年益寿的年',
    options: ['午', '年', '丰', '竿'],
    correctAnswer: '年',
    hint: '首撇较平，三横悬针竖中流砥柱',
    category: '形近',
  },
  {
    id: 'rf-4',
    char: '福',
    pinyin: 'fú',
    audioPrompt: 'fú · 福星高照的福',
    options: ['幅', '福', '蝠', '辐'],
    correctAnswer: '福',
    hint: '示字旁单点，右侧一口田',
    category: '形近',
  },
  {
    id: 'rf-5',
    char: '夕',
    pinyin: 'xī',
    audioPrompt: 'xī · 朝夕相伴的夕',
    options: ['歹', '夕', '多', '汐'],
    correctAnswer: '夕',
    hint: '撇画自然弧展，心内一点悬空',
    category: '形近',
  },
  {
    id: 'rf-6',
    char: '除',
    pinyin: 'chú',
    audioPrompt: 'chú · 斩草除根的除',
    options: ['徐', '叙', '除', '涂'],
    correctAnswer: '除',
    hint: '左耳旁紧窄，右侧余部人字头舒展',
    category: '形近',
  },
  {
    id: 'rf-7',
    char: '迎',
    pinyin: 'yíng',
    audioPrompt: 'yíng · 迎春接福的迎',
    options: ['仰', '迎', '彻', '柳'],
    correctAnswer: '迎',
    hint: '走之底平稳舒展，托举内部卬部',
    category: '高频',
  },
  {
    id: 'rf-8',
    char: '兽',
    pinyin: 'shòu',
    audioPrompt: 'shòu · 年兽传说的兽',
    options: ['首', '善', '鲁', '兽'],
    correctAnswer: '兽',
    hint: '上部两耳并立，下部四足矫健',
    category: '民俗',
  },
  {
    id: 'rf-9',
    char: '岁',
    pinyin: 'suì',
    audioPrompt: 'suì · 岁岁平安的岁',
    options: ['祟', '岁', '岌', '岸'],
    correctAnswer: '岁',
    hint: '山字头下出夕部，辞旧岁迎新春',
    category: '形近',
  },
  {
    id: 'rf-10',
    char: '联',
    pinyin: 'lián',
    audioPrompt: 'lián · 春联大吉的联',
    options: ['连', '联', '莲', '廉'],
    correctAnswer: '联',
    hint: '耳字旁与关字右部结合',
    category: '音近',
  },
  {
    id: 'rf-11',
    char: '爆',
    pinyin: 'bào',
    audioPrompt: 'bào · 爆竹声脆的爆',
    options: ['暴', '爆', '瀑', '曝'],
    correctAnswer: '爆',
    hint: '火字旁加暴，遇火而鸣',
    category: '形近',
  },
  {
    id: 'rf-12',
    char: '竹',
    pinyin: 'zhú',
    audioPrompt: 'zhú · 势如破竹的竹',
    options: ['符', '竹', '笃', '笋'],
    correctAnswer: '竹',
    hint: '双枝并立，象形叶片下垂',
    category: '高频',
  },
  {
    id: 'rf-13',
    char: '换',
    pinyin: 'huàn',
    audioPrompt: 'huàn · 换然一新的换',
    options: ['唤', '换', '焕', '涣'],
    correctAnswer: '换',
    hint: '提手旁加奂，动手置换',
    category: '音近',
  },
  {
    id: 'rf-14',
    char: '符',
    pinyin: 'fú',
    audioPrompt: 'fú · 桃符辟邪的符',
    options: ['府', '符', '付', '附'],
    correctAnswer: '符',
    hint: '竹字头下加付，古人竹制符节',
    category: '民俗',
  },
  {
    id: 'rf-15',
    char: '屠',
    pinyin: 'tú',
    audioPrompt: 'tú · 屠苏美酒的屠',
    options: ['著', '署', '暑', '屠'],
    correctAnswer: '屠',
    hint: '尸字头下加者，草药辟恶酒',
    category: '民俗',
  },
  {
    id: 'rf-16',
    char: '暖',
    pinyin: 'nuǎn',
    audioPrompt: 'nuǎn · 春风和暖的暖',
    options: ['暖', '援', '缓', '媛'],
    correctAnswer: '暖',
    hint: '日字旁带来阳光温暖',
    category: '形近',
  },
  {
    id: 'rf-17',
    char: '瞳',
    pinyin: 'tóng',
    audioPrompt: 'tóng · 曈曈晓日的曈',
    options: ['童', '瞳', '撞', '憧'],
    correctAnswer: '瞳',
    hint: '目字旁或日字旁，晨曦万丈',
    category: '形近',
  },
  {
    id: 'rf-18',
    char: '辞',
    pinyin: 'cí',
    audioPrompt: 'cí · 辞旧迎新的辞',
    options: ['乱', '辞', '舌', '敌'],
    correctAnswer: '辞',
    hint: '舌字部与辛字结合，告别过去',
    category: '高频',
  },
  {
    id: 'rf-19',
    char: '祥',
    pinyin: 'xiáng',
    audioPrompt: 'xiáng · 吉祥如意的祥',
    options: ['详', '祥', '样', '洋'],
    correctAnswer: '祥',
    hint: '示字旁求神赐福，右加羊为善',
    category: '形近',
  },
  {
    id: 'rf-20',
    char: '瑞',
    pinyin: 'ruì',
    audioPrompt: 'ruì · 瑞雪丰年的瑞',
    options: ['端', '揣', '喘', '瑞'],
    correctAnswer: '瑞',
    hint: '王（玉）字旁，象征祥瑞玉器',
    category: '形近',
  },
  {
    id: 'rf-21',
    char: '贺',
    pinyin: 'hè',
    audioPrompt: 'hè · 祝贺新春的贺',
    options: ['贺', '架', '驾', '货'],
    correctAnswer: '贺',
    hint: '加字下加贝，送贝以表庆贺',
    category: '高频',
  },
  {
    id: 'rf-22',
    char: '喜',
    pinyin: 'xǐ',
    audioPrompt: 'xǐ · 欢喜雀跃的喜',
    options: ['喜', '善', '嘉', '吉'],
    correctAnswer: '喜',
    hint: '上鼓下口，奏乐欢歌',
    category: '高频',
  },
  {
    id: 'rf-23',
    char: '庆',
    pinyin: 'qìng',
    audioPrompt: 'qìng · 普天同庆的庆',
    options: ['厌', '庆', '庄', '度'],
    correctAnswer: '庆',
    hint: '广字头下心部变体与大',
    category: '形近',
  },
  {
    id: 'rf-24',
    char: '照',
    pinyin: 'zhào',
    audioPrompt: 'zhào · 阳光普照的照',
    options: ['煦', '照', '烈', '蒸'],
    correctAnswer: '照',
    hint: '昭字下加四点底（火），光明闪耀',
    category: '形近',
  },
  {
    id: 'rf-25',
    char: '更',
    pinyin: 'gēng',
    audioPrompt: 'gēng · 万象更新的更',
    options: ['便', '更', '曳', '吏'],
    correctAnswer: '更',
    hint: '日昜初更，改旧从新',
    category: '形近',
  },
];

function makeFourOptions(correctChar: string, distractors?: string[]): string[] {
  const defaults = ['正', '大', '天', '春', '同', '华', '光', '明', '方', '元', '福', '吉'];
  const opts = [correctChar];
  if (distractors) {
    for (const d of distractors) {
      if (opts.length < 4 && d !== correctChar && !opts.includes(d)) {
        opts.push(d);
      }
    }
  }
  for (const def of defaults) {
    if (opts.length < 4 && def !== correctChar && !opts.includes(def)) {
      opts.push(def);
    }
  }
  for (let i = opts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return opts;
}

function shuffleQuestionOptions(q: RapidFireQuestion): RapidFireQuestion {
  const options = [...q.options];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { ...q, options };
}

/**
 * 第四阶段 60 秒极速对决：多层级优先级动态混合题库生成算法
 *
 * 1. 第一优先级（核心占比）：当前阅读文章关联生字/词汇 (currentStoryId)
 * 2. 第二优先级（复习占比）：历史已解锁/已读文章及生字记录 (unlockedStoryIds, studiedWords)
 * 3. 兜底策略（补足储备）：当生字词汇不足以支撑 60 秒极速对决时，由基础字库补足至预设规模 (默认35题)
 */
export function generatePriorityWordPool(options: PriorityPoolOptions = {}): GeneratedPoolResult {
  const {
    currentStoryId,
    unlockedStoryIds = [],
    studiedWords = [],
    targetPoolSize = 36,
  } = options;

  const priorityPool: RapidFireQuestion[] = [];
  const currentQuestions: RapidFireQuestion[] = [];
  const seenQuestionIds = new Set<string>();

  // 1. 第一优先级：当前文章关联字库 (核心生字)，动态生成变体题（听音 / 选字 / 组词），确保高密度覆盖
  if (currentStoryId) {
    try {
      const challengeData = getStoryChallengeData(currentStoryId);

      // (1) 提取本篇专属听音题目
      if (challengeData.soundQuestions && challengeData.soundQuestions.length > 0) {
        for (const sq of challengeData.soundQuestions) {
          const qId = `cur-${currentStoryId}-sq-${sq.id}`;
          if (!seenQuestionIds.has(qId)) {
            seenQuestionIds.add(qId);
            currentQuestions.push({
              id: qId,
              char: sq.correctAnswer,
              pinyin: sq.options.find((o) => o === sq.correctAnswer) || sq.pinyinPrompt || '',
              audioPrompt: `听音选字：${sq.audioCue} · 释义：“${sq.meaningHint}”`,
              options: [...sq.options],
              correctAnswer: sq.correctAnswer,
              hint: sq.meaningHint,
              category: '音近',
            });
          }
        }
      }

      // (2) 为绘本核心生字生成三重变体题（变体 1: 听音选字；变体 2: 选字辨形；变体 3: 词汇组词）
      const coreCharacters = [
        ...(challengeData.targetCharacters || []),
        ...(challengeData.writingTargets?.map((wt) => ({
          id: wt.char,
          char: wt.char,
          pinyin: wt.pinyin,
          radical: wt.radical,
          radicalName: wt.radical,
          components: [wt.radical],
          etymology: '',
          meaning: wt.keyTips?.[0] || '核心汉字',
          mnemonic: wt.commonMistakes || '',
          strokeCount: wt.strokeCount,
          examWords: [`${wt.char}之典范`, `${wt.char}光溢彩`],
          exampleSentence: '',
          unlocked: true,
        })) || []),
      ];

      const processedChars = new Set<string>();

      for (const tc of coreCharacters) {
        if (!processedChars.has(tc.char)) {
          processedChars.add(tc.char);

          // 变体 1：标准声韵听音辨字
          const qIdListen = `cur-${currentStoryId}-listen-${tc.char}`;
          if (!seenQuestionIds.has(qIdListen)) {
            seenQuestionIds.add(qIdListen);
            currentQuestions.push({
              id: qIdListen,
              char: tc.char,
              pinyin: tc.pinyin,
              audioPrompt: `听音辨字：读音为【${tc.pinyin}】，请选出对应的“${tc.char}”字`,
              options: makeFourOptions(tc.char, tc.components),
              correctAnswer: tc.char,
              hint: tc.meaning || tc.mnemonic || '标准读音与字形映射',
              category: '音近',
            });
          }

          // 变体 2：间架结构与字形辨析
          const qIdShape = `cur-${currentStoryId}-shape-${tc.char}`;
          if (!seenQuestionIds.has(qIdShape)) {
            seenQuestionIds.add(qIdShape);
            currentQuestions.push({
              id: qIdShape,
              char: tc.char,
              pinyin: tc.pinyin,
              audioPrompt: `选字辨形：释义为“${(tc.meaning || '规范汉字').slice(0, 18)}”，应选哪个字？`,
              options: makeFourOptions(tc.char, tc.components),
              correctAnswer: tc.char,
              hint: tc.mnemonic || tc.meaning || '汉字骨架与偏旁部首',
              category: '形近',
            });
          }

          // 变体 3：生活词汇与组词运用
          const examPhrase = tc.examWords?.[0] || (tc.exampleSentence ? tc.exampleSentence.slice(0, 8) + '...' : `${tc.char}年`);
          const qIdWord = `cur-${currentStoryId}-word-${tc.char}`;
          if (!seenQuestionIds.has(qIdWord)) {
            seenQuestionIds.add(qIdWord);
            currentQuestions.push({
              id: qIdWord,
              char: tc.char,
              pinyin: tc.pinyin,
              audioPrompt: `词汇组词：在词语“【${examPhrase}】”中，应填入哪个汉字？`,
              options: makeFourOptions(tc.char, tc.components),
              correctAnswer: tc.char,
              hint: `常考词组：${tc.examWords?.join('、') || examPhrase}`,
              category: '高频',
            });
          }
        }
      }
    } catch (e) {
      console.warn('[RapidFirePool] Failed to extract current story questions:', e);
    }
  }

  const currentCount = currentQuestions.length;

  // 将第一阶段当前故事的所有变体题加入主池
  priorityPool.push(...currentQuestions);

  // =========================================================================
  // 核心配比约束：确保第一阶当前生字占比不低于 40% (currentCount / total >= 0.40)
  // 由此推导: otherCount <= Math.floor(currentCount * 1.45)
  // =========================================================================
  const maxOtherAllowed = Math.max(0, Math.floor(currentCount * 1.45));
  const desiredTotal = Math.max(24, targetPoolSize);
  const otherQuota = Math.min(maxOtherAllowed, Math.max(0, desiredTotal - currentCount));

  // 2. 第二优先级：历史已解锁/已读文章及生字库 (复习词汇)
  const reviewCandidates: RapidFireQuestion[] = [];
  const historyStories = unlockedStoryIds.filter((id) => id && id !== currentStoryId);

  for (const histId of historyStories) {
    try {
      const histData = getStoryChallengeData(histId);
      if (histData.soundQuestions) {
        for (const sq of histData.soundQuestions) {
          const qId = `hist-${histId}-sq-${sq.id}`;
          if (!seenQuestionIds.has(qId)) {
            seenQuestionIds.add(qId);
            reviewCandidates.push({
              id: qId,
              char: sq.correctAnswer,
              pinyin: sq.options.find((o) => o === sq.correctAnswer) || sq.pinyinPrompt || '',
              audioPrompt: `复习巩固：${sq.audioCue} · “${sq.meaningHint}”`,
              options: [...sq.options],
              correctAnswer: sq.correctAnswer,
              hint: `温故知新：${sq.meaningHint}`,
              category: '形近',
            });
          }
        }
      }

      if (histData.targetCharacters) {
        for (const tc of histData.targetCharacters) {
          const qId = `hist-${histId}-tc-${tc.char}`;
          if (!seenQuestionIds.has(qId)) {
            seenQuestionIds.add(qId);
            reviewCandidates.push({
              id: qId,
              char: tc.char,
              pinyin: tc.pinyin,
              audioPrompt: `温故知新：请听读音【${tc.pinyin}】，找出“${tc.meaning || tc.examWords?.[0] || '生字'}”的“${tc.char}”`,
              options: makeFourOptions(tc.char, tc.components),
              correctAnswer: tc.char,
              hint: `温故知新：${tc.meaning || tc.mnemonic || ''}`,
              category: '高频',
            });
          }
        }
      }
    } catch (e) {
      console.warn(`[RapidFirePool] Failed to extract review questions for ${histId}:`, e);
    }
  }

  // 随机洗牌复习候选池
  for (let i = reviewCandidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [reviewCandidates[i], reviewCandidates[j]] = [reviewCandidates[j], reviewCandidates[i]];
  }

  let reviewCount = 0;
  const maxReviewToTake = Math.min(otherQuota, 12);
  for (const rq of reviewCandidates) {
    if (reviewCount >= maxReviewToTake) break;
    priorityPool.push(rq);
    reviewCount++;
  }

  // 3. 兜底策略：由基础预置字库适量补足，严格受限在 otherQuota 允许的配额内
  let fallbackCount = 0;
  const remainingQuota = Math.max(0, otherQuota - reviewCount);

  if (remainingQuota > 0) {
    const fallbackAvailable = RAPID_FIRE_QUESTIONS.filter((fq) => !seenQuestionIds.has(fq.id));
    for (let i = fallbackAvailable.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fallbackAvailable[i], fallbackAvailable[j]] = [fallbackAvailable[j], fallbackAvailable[i]];
    }

    for (const fq of fallbackAvailable) {
      if (fallbackCount >= remainingQuota) break;
      priorityPool.push(fq);
      fallbackCount++;
    }
  }

  // 洗牌整个题库使当前生字变体题与复习/兜底题均匀错落分布
  for (let i = priorityPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [priorityPool[i], priorityPool[j]] = [priorityPool[j], priorityPool[i]];
  }

  // 所有题目内部 4 个选项做随机洗牌
  const finalQuestions = priorityPool.map(shuffleQuestionOptions);

  return {
    questions: finalQuestions,
    stats: {
      currentCount,
      reviewCount,
      fallbackCount,
      total: finalQuestions.length,
    },
  };
}

export function getRandomizedQuestions(storyId?: string): RapidFireQuestion[] {
  const result = generatePriorityWordPool({ currentStoryId: storyId });
  return result.questions;
}
