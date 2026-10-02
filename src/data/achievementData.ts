export type DecorationType = 'frame' | 'seal' | 'title' | 'bgTheme';

export interface AchievementBadge {
  id: string;
  name: string;
  wenwei: string; // 经典文位: 识字童生 / 文思秀才 / 举人及第 / 翰林宗师
  headTitle: string; // 专属头衔: 🌱 启蒙文苗 / 🖌️ 妙笔生花 / 🐉 跃鲤化龙 / 👑 魁星点斗
  category: 'character_count' | 'skill_mastery' | 'cultural_quest';
  requiredCount: number; // 10, 25, 50, 100
  icon: string;
  badgeVisual: string; // 【竹林青翠铜章】 / 【朱砂文胆银章】 / 【紫金祥龙金章】 / 【凤羽霓裳仙章】
  badgeVisualDesc: string;
  visualTheme: 'bronze' | 'silver' | 'gold' | 'phoenix';
  description: string;
  decreeTitle: string; // 奉天承运 · 授勋诏书
  decreeText: string; // 诏书正文
  decreeAudio: string; // TTS 朗读文本
  rewardType: DecorationType;
  rewardName: string;
  rewardPreview: string;
  decorationsUnlocked: string[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ProfileDecoration {
  id: string;
  type: DecorationType;
  name: string;
  requiredChars: number;
  requiredStreakDays?: number;
  description: string;
  frameClass?: string;
  tasselColor?: string;
  sealText?: string;
  bgGradient?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const ACHIEVEMENTS: AchievementBadge[] = [
  {
    id: 'ach-10',
    name: '初试锋芒 · 启蒙文苗',
    wenwei: '识字童生',
    headTitle: '🌱 启蒙文苗',
    category: 'character_count',
    requiredCount: 10,
    icon: '🌱',
    badgeVisual: '【竹林青翠铜章】',
    badgeVisualDesc: '竹节环绕，青铜质感，镶嵌碧玉',
    visualTheme: 'bronze',
    description: '识字量突破 10 字，虚怀若竹，初窥汉字天地奥秘！',
    decreeTitle: '奉天承运 · 授勋诏书',
    decreeText:
      '尔于岁次丙午年，初入文坛，识字破十，虚怀若竹，特赐【识字童生】文位，授竹林青翠铜章！钦此！',
    decreeAudio:
      '奉天承运，文曲昭彰：尔初入文坛，识字破十，虚怀若竹，特赐识字童生文位，授竹林青翠铜章！钦此！',
    rewardType: 'frame',
    rewardName: '「青铜云纹头像框」+ 墨香宣纸卡套',
    rewardPreview: 'ring-4 ring-emerald-700 border-2 border-emerald-300 shadow-md',
    decorationsUnlocked: ['青铜云纹头像框', '墨香宣纸卡套', '识字童生称号'],
    rarity: 'common',
  },
  {
    id: 'ach-25',
    name: '文思初萌 · 妙笔生花',
    wenwei: '文思秀才',
    headTitle: '🖌️ 妙笔生花',
    category: 'character_count',
    requiredCount: 25,
    icon: '🖌️',
    badgeVisual: '【朱砂文胆银章】',
    badgeVisualDesc: '银质祥云，中心镶嵌鲜红朱砂印',
    visualTheme: 'silver',
    description: '识字量突破 25 字，掌握偏旁积木规律，下笔如有神助。',
    decreeTitle: '奉天承运 · 授勋诏书',
    decreeText:
      '尔于岁次丙午年，研习汉字廿有五，文思初萌，笔墨凝香，特赐【文思秀才】文位，授朱砂文胆银章！钦此！',
    decreeAudio:
      '奉天承运，文曲昭彰：尔研习汉字廿有五，文思初萌，笔墨凝香，特赐文思秀才文位，授朱砂文胆银章！钦此！',
    rewardType: 'seal',
    rewardName: '「“博学慎思”朱砂私印」+ 欢庆新春红卡套',
    rewardPreview: '博学慎思',
    decorationsUnlocked: ['“博学慎思”朱砂私印', '欢庆新春红卡套', '文思秀才称号'],
    rarity: 'rare',
  },
  {
    id: 'ach-50',
    name: '博闻强识 · 跃鲤化龙',
    wenwei: '举人及第',
    headTitle: '🐉 跃鲤化龙',
    category: 'character_count',
    requiredCount: 50,
    icon: '🐉',
    badgeVisual: '【紫金祥龙金章】',
    badgeVisualDesc: '立体金龙盘旋，配悬垂金色丝绦与闪光效果',
    visualTheme: 'gold',
    description: '【重大里程碑】识字量突破 50 字！金榜有名，如跃龙门腾飞天际。',
    decreeTitle: '奉天承运 · 授勋诏书',
    decreeText:
      '尔于岁次丙午年，通晓五十汉字，文采斐然，如鱼跃龙门，特赐【举人及第】文位，授紫金祥龙金章！钦此！',
    decreeAudio:
      '奉天承运，文曲昭彰：尔通晓五十汉字，文采斐然，如鱼跃龙门，特赐举人及第文位，授紫金祥龙金章！钦此！',
    rewardType: 'frame',
    rewardName: '「紫金祥龙环绕框」+「锦绣山河金卡套」+ 全屏金彩礼花',
    rewardPreview: 'ring-4 ring-amber-300 border-4 border-yellow-400 shadow-lg shadow-amber-500/50',
    decorationsUnlocked: ['紫金祥龙环绕框', '锦绣山河金卡套', '“金榜题名”御赏印', '举人及第称号'],
    rarity: 'epic',
  },
  {
    id: 'ach-100',
    name: '才华横溢 · 魁星点斗',
    wenwei: '翰林宗师',
    headTitle: '👑 魁星点斗',
    category: 'character_count',
    requiredCount: 100,
    icon: '👑',
    badgeVisual: '【凤羽霓裳仙章】',
    badgeVisualDesc: '传说级皇家凤羽，带有流光动态光晕',
    visualTheme: 'phoenix',
    description: '【至尊里程碑】识字量突破 100 字！独占鳌头，魁星点斗，天下文宗！',
    decreeTitle: '奉天承运 · 授勋诏书',
    decreeText:
      '尔于岁次丙午年，百字融通，魁星点斗，名动京华，特赐【翰林宗师】文位，授凤羽霓裳仙章！钦此！',
    decreeAudio:
      '奉天承运，文曲昭彰：尔百字融通，魁星点斗，名动京华，特赐翰林宗师文位，授凤羽霓裳仙章！钦此！',
    rewardType: 'bgTheme',
    rewardName: '「皇家凤羽流光框」+「紫禁龙腾云霄卡套」+ 金榜鸣钟音效',
    rewardPreview: 'from-amber-900 via-red-900 to-amber-950',
    decorationsUnlocked: ['皇家凤羽流光框', '紫禁龙腾云霄卡套', '“文冠天下”传国印', '翰林宗师称号'],
    rarity: 'legendary',
  },
  {
    id: 'ach-nian-tamer',
    name: '民俗通达 · 迎春祥瑞',
    wenwei: '祥瑞文士',
    headTitle: '🏮 迎春祥瑞官',
    category: 'cultural_quest',
    requiredCount: 15,
    icon: '🏮',
    badgeVisual: '【吉庆红烛宝章】',
    badgeVisualDesc: '红莲祥云双鱼佩，除夕传统文化精髓',
    visualTheme: 'silver',
    description: '通关第一章《春节与年兽》，彻底掌握除夕文化法宝与辟邪楹联！',
    decreeTitle: '奉天承运 · 授勋诏书',
    decreeText:
      '尔于岁次丙午年，深研民俗典故，驯服年兽，书写桃符迎新春，特赐【迎春祥瑞官】称号！钦此！',
    decreeAudio:
      '奉天承运，文曲昭彰：尔深研民俗典故，驯服年兽，书写桃符迎新春，特赐迎春祥瑞官称号！钦此！',
    rewardType: 'title',
    rewardName: '称号：迎春祥瑞官 + 祥瑞除夕红卡套',
    rewardPreview: 'text-red-700 bg-red-100 border-red-300',
    decorationsUnlocked: ['迎春祥瑞官称号', '欢庆新春红卡套'],
    rarity: 'rare',
  },
];

export const AVAILABLE_DECORATIONS: {
  frames: ProfileDecoration[];
  seals: ProfileDecoration[];
  bgThemes: ProfileDecoration[];
  titles: ProfileDecoration[];
} = {
  frames: [
    {
      id: 'frame-wood',
      type: 'frame',
      name: '原木雅韵框',
      requiredChars: 0,
      description: '初入文坛的书童朴素木质头像框',
      frameClass: 'ring-4 ring-amber-800/80 border-2 border-amber-600',
      rarity: 'common',
    },
    {
      id: 'frame-bronze',
      type: 'frame',
      name: '青铜云纹框',
      requiredChars: 10,
      description: '【突破10字解锁】竹林青翠铜章特赏，青铜古鼎回纹镶嵌碧玉',
      frameClass: 'ring-4 ring-emerald-700 border-2 border-emerald-300 shadow-md',
      tasselColor: '#059669',
      rarity: 'common',
    },
    {
      id: 'frame-gold-50',
      type: 'frame',
      name: '紫金祥龙环绕框',
      requiredChars: 50,
      description: '【突破50字解锁】立体金龙盘旋，配金色丝绦与华贵光晕',
      frameClass: 'ring-4 ring-amber-300 border-4 border-yellow-400 shadow-lg shadow-amber-500/50 animate-pulse',
      tasselColor: '#d97706',
      rarity: 'epic',
    },
    {
      id: 'frame-phoenix-100',
      type: 'frame',
      name: '皇家凤羽流光框',
      requiredChars: 100,
      description: '【突破100字解锁】传说级凤羽霓裳，带有流光动态光晕与鸣钟加冕',
      frameClass: 'ring-4 ring-rose-500 border-4 border-amber-300 shadow-xl shadow-rose-600/60 ring-offset-2 ring-offset-amber-200',
      tasselColor: '#e11d48',
      rarity: 'legendary',
    },
    {
      id: 'frame-streak-7',
      type: 'frame',
      name: '北斗星辉框',
      requiredChars: 0,
      requiredStreakDays: 7,
      description: '【7天连签特赏】连续 7 天晨读打卡解锁，北斗七星破晓璀璨光晕！',
      frameClass: 'ring-4 ring-cyan-400 border-2 border-yellow-200 shadow-lg shadow-cyan-400/60 animate-pulse',
      tasselColor: '#06b6d4',
      rarity: 'epic',
    },
    {
      id: 'frame-streak-30',
      type: 'frame',
      name: '日月同辉 · 满勤宗师框',
      requiredChars: 0,
      requiredStreakDays: 30,
      description: '【30天连签殿堂】坚持一个月每日研习，旷古未有之治学毅力！',
      frameClass: 'ring-4 ring-purple-400 border-4 border-yellow-300 shadow-2xl shadow-purple-500/70',
      tasselColor: '#a855f7',
      rarity: 'legendary',
    },
  ],

  seals: [
    {
      id: 'seal-none',
      type: 'seal',
      name: '暂不盖印',
      requiredChars: 0,
      description: '未加盖任何金石私印',
      rarity: 'common',
    },
    {
      id: 'seal-learn-25',
      type: 'seal',
      name: '“博学慎思”朱砂私印',
      requiredChars: 25,
      description: '【突破25字解锁】朱砂文胆银章配赏，勉励学子博学笃行',
      sealText: '博学慎思',
      rarity: 'rare',
    },
    {
      id: 'seal-streak-3',
      type: 'seal',
      name: '“日拱一卒”限定印 (3天连签)',
      requiredChars: 0,
      requiredStreakDays: 3,
      description: '【3天连签特赏】日拱一卒，功不唐捐。',
      sealText: '日拱一卒',
      rarity: 'rare',
    },
    {
      id: 'seal-champion-50',
      type: 'seal',
      name: '“金榜题名”御赏印',
      requiredChars: 50,
      description: '【突破50字解锁】举人及第金印，名列前茅荣耀加冕',
      sealText: '金榜题名',
      rarity: 'epic',
    },
    {
      id: 'seal-imperial-100',
      type: 'seal',
      name: '“文冠天下”传国印',
      requiredChars: 100,
      description: '【突破100字解锁】翰林宗师旷世宝印，一代名家传世墨宝',
      sealText: '文冠天下',
      rarity: 'legendary',
    },
    {
      id: 'seal-streak-30',
      type: 'seal',
      name: '“水滴石穿”宗师印 (30天满勤)',
      requiredChars: 0,
      requiredStreakDays: 30,
      description: '【30天连签特赏】恒心如铁，百炼成钢。',
      sealText: '水滴石穿',
      rarity: 'legendary',
    },
  ],

  bgThemes: [
    {
      id: 'bg-warm-paper',
      type: 'bgTheme',
      name: '墨香宣纸卡套',
      requiredChars: 0,
      description: '仿宋代手工澄心堂纸，古朴温润墨韵',
      bgGradient: 'from-amber-50 via-orange-50 to-amber-100',
      rarity: 'common',
    },
    {
      id: 'bg-spring-festival',
      type: 'bgTheme',
      name: '欢庆新春红卡套',
      requiredChars: 15,
      description: '【突破25字/春节民俗解锁】除夕红火金边祥云，吉祥如意',
      bgGradient: 'from-red-900 via-rose-800 to-amber-900 text-white',
      rarity: 'rare',
    },
    {
      id: 'bg-dragon-50',
      type: 'bgTheme',
      name: '锦绣山河金卡套',
      requiredChars: 50,
      description: '【突破50字解锁】江山如画金丝织锦，气象万千',
      bgGradient: 'from-amber-800 via-yellow-700 to-amber-900 text-yellow-50',
      rarity: 'epic',
    },
    {
      id: 'bg-imperial-100',
      type: 'bgTheme',
      name: '紫禁龙腾云霄卡套',
      requiredChars: 100,
      description: '【突破100字解锁】皇家金銮殿金龙腾飞云霄，至尊非凡',
      bgGradient: 'from-purple-950 via-red-950 to-amber-950 text-amber-100',
      rarity: 'legendary',
    },
    {
      id: 'bg-streak-14',
      type: 'bgTheme',
      name: '星汉灿烂 · 文曲当空 (14天连签)',
      requiredChars: 0,
      requiredStreakDays: 14,
      description: '【14天连签限定】两周恒心守护，漫天星辰辉映浩瀚文思',
      bgGradient: 'from-blue-950 via-indigo-900 to-purple-950 text-cyan-100',
      rarity: 'epic',
    },
  ],

  titles: [
    {
      id: 'title-novice',
      type: 'title',
      name: '求知书童',
      requiredChars: 0,
      description: '初踏汉字修业之路的谦逊少年',
      rarity: 'common',
    },
    {
      id: 'title-tongsheng',
      type: 'title',
      name: '识字童生 · 🌱 启蒙文苗',
      requiredChars: 10,
      description: '达到 10 字里程碑获得，竹林初萌，虚怀若竹',
      rarity: 'common',
    },
    {
      id: 'title-xiucai',
      type: 'title',
      name: '文思秀才 · 🖌️ 妙笔生花',
      requiredChars: 25,
      description: '达到 25 字里程碑获得，熟识偏旁，下笔成章',
      rarity: 'rare',
    },
    {
      id: 'title-juren',
      type: 'title',
      name: '举人及第 · 🐉 跃鲤化龙',
      requiredChars: 50,
      description: '达到 50 字里程碑获得，金榜有名，如跃龙门',
      rarity: 'epic',
    },
    {
      id: 'title-jinshi',
      type: 'title',
      name: '翰林宗师 · 👑 魁星点斗',
      requiredChars: 100,
      description: '达到 100 字里程碑获得，独占鳌头，天下文宗！',
      rarity: 'legendary',
    },
    {
      id: 'title-streak-3',
      type: 'title',
      name: '晨读敏学童 (3天连签)',
      requiredChars: 0,
      requiredStreakDays: 3,
      description: '连续签到 3 天获得，三省吾身敏而好学',
      rarity: 'rare',
    },
    {
      id: 'title-streak-7',
      type: 'title',
      name: '笃志力行 · 恒心学士 (7天连签)',
      requiredChars: 0,
      requiredStreakDays: 7,
      description: '连续签到 7 天获得，持之以恒，文不加点！',
      rarity: 'epic',
    },
    {
      id: 'title-streak-30',
      type: 'title',
      name: '持之以恒 · 笔耕宗师 (30天满勤)',
      requiredChars: 0,
      requiredStreakDays: 30,
      description: '连续签到 30 天满勤获得，治学楷模，名垂青史！',
      rarity: 'legendary',
    },
  ],
};
