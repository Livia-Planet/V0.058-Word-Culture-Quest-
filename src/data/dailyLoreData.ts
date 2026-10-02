export interface DailyLoreItem {
  id: string;
  category: 'myth' | 'history' | 'language' | 'science';
  categoryLabel: string;
  categoryIcon: string;
  title: string;
  subtitle: string;
  fact: string;
  curiousQuestion: string;
  culturalTag: string;
  badgeColor: string;
}

export const DAILY_LORE_DATABASE: DailyLoreItem[] = [
  {
    id: 'lore-1',
    category: 'myth',
    categoryLabel: '神话秘辛',
    categoryIcon: '🏮',
    title: '年兽原来是个“胆小鬼”？',
    subtitle: '除夕守岁与爆竹红联的秘密',
    fact: '上古神兽“年”虽然生得凶猛，其实天生有三大弱点：它最害怕明晃晃的火光、鲜艳的大红色，以及竹节燃烧时“噼里啪啦”的炸响！古人掌握了这个秘密，便在每年除夕穿红衣、贴红春联、燃放爆竹，吓得年兽落荒而逃，开创了万家团圆的“过年”风俗。',
    curiousQuestion: '古时候没有火药爆竹时，人们是用什么发出噼啪声的呢？（答：把真实的青竹竿投入篝火中烧裂！）',
    culturalTag: '岁暮辞旧 · 智慧破邪',
    badgeColor: 'bg-red-500/20 text-red-200 border-red-400/40',
  },
  {
    id: 'lore-2',
    category: 'history',
    categoryLabel: '历史风云',
    categoryIcon: '🏛️',
    title: '屈原为什么常把“香草”佩在身边？',
    subtitle: '《离骚》与端午艾叶的君子之风',
    fact: '两千多年前的楚国大诗人屈原，不仅写出了千古名篇《楚辞》，还极喜欢在身上佩戴江离、辟芷、秋兰等草本植物。在古代楚国，香草不仅能清新空气、防虫辟邪，更被士大夫视为“心志纯洁、不与恶势力同流合污”的高洁象征。端午节门插艾草、挂香囊，正是传承了这一份芬芳浩气！',
    curiousQuestion: '赛龙舟为什么都在农历五月初五举行？（答：相传这一天是屈原投江殉国的日子，百姓划舟争先营救。）',
    culturalTag: '楚辞芳华 · 赤子爱国',
    badgeColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
  },
  {
    id: 'lore-3',
    category: 'myth',
    categoryLabel: '上古奇谭',
    categoryIcon: '🌕',
    title: '玉兔在月亮上到底在捣什么药？',
    subtitle: '广寒宫与明清“兔儿爷”传说',
    fact: '传说嫦娥奔月飞入广寒宫后，玉兔便在桂树下终日捣药。它捣的药可不是普通的苦药汤，而是赐予人间安康祥和的长生仙药。明清时期的北京老百姓，每逢中秋节还会给孩子们买身披金甲、骑着猛兽的彩色泥塑“兔儿爷”作为吉祥玩具，祈求来年无病无灾、聪明伶俐！',
    curiousQuestion: '你知道现代探月工程中，嫦娥探测器携带的月球车叫什么名字吗？（答：正是“玉兔号”！）',
    culturalTag: '花好月圆 · 祈祥纳福',
    badgeColor: 'bg-indigo-500/20 text-indigo-200 border-indigo-400/40',
  },
  {
    id: 'lore-4',
    category: 'language',
    categoryLabel: '汉字密码',
    categoryIcon: '📜',
    title: '为什么“家”字底下藏着一头猪？',
    subtitle: '从甲骨文看农耕文明的温暖庇护',
    fact: '在三千年前的殷商甲骨文中，“家”字上面是一顶房屋的屋顶（宀），下面则是一头大腹便便的“豕”（shǐ，猪的古称）。在远古农耕时代，野兽横行，能够将猪圈盖在坚固房舍下方圈养，不仅保障了食物财富，更象征着不必颠沛流离、定居安居的幸福。',
    curiousQuestion: '“豕”字和“豚”字有什么关系？（答：古语中大猪称“豕”，小猪仔称“豚”哦！）',
    culturalTag: '造字本义 · 阖家安居',
    badgeColor: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
  },
  {
    id: 'lore-5',
    category: 'science',
    categoryLabel: '航天浪漫',
    categoryIcon: '🚀',
    title: '中国空间站的名字为何藏满神话？',
    subtitle: '从“天宫”到“祝融”的千年飞天梦',
    fact: '中国航天人把顶级科技与古老神话浪漫相融：空间站叫“天宫”（古人向往的神仙居所），运载火箭叫“长征”，月球探测器叫“嫦娥”，中继通信卫星叫“鹊桥”，火星车叫“祝融”（华夏火神），太阳探测卫星叫“羲和”（太阳女神）。古人的浪漫遐思，今天变成了飞向星辰大海的现实！',
    curiousQuestion: '神舟飞船的“神舟”两个字还谐音哪个词？（答：神州大地，代指我们壮丽的中华祖国！）',
    culturalTag: '大国重器 · 筑梦苍穹',
    badgeColor: 'bg-sky-500/20 text-sky-200 border-sky-400/40',
  },
  {
    id: 'lore-6',
    category: 'myth',
    categoryLabel: '图腾奥秘',
    categoryIcon: '🐉',
    title: '中华神龙原来由九种动物合成？',
    subtitle: '博采众长的东方巨龙精神',
    fact: '在古代神话中，龙并不是一种单一的动物，而是中华先民将各个部族图腾融合的伟大结晶。古人称龙具有“九似”：角似鹿、头似驼、眼似兔、项似蛇、腹似蜃、鳞似鲤、爪似鹰、掌似虎、耳似牛。这象征着中华文明包容万象、自强不息的腾飞精神！',
    curiousQuestion: '古代龙生九子，喜欢趴在殿角屋脊上眺望的叫什么？（答：嘲风！）',
    culturalTag: '祥瑞图腾 · 生生不息',
    badgeColor: 'bg-yellow-500/20 text-yellow-200 border-yellow-400/40',
  },
  {
    id: 'lore-7',
    category: 'science',
    categoryLabel: '古代发明',
    categoryIcon: '🧭',
    title: '一根木棍如何测出二十四节气？',
    subtitle: '两千多年前的日影智慧“圭表”',
    fact: '古人没有现代日历，他们在一块平石（圭）上垂直立起一根八尺木表。每到正午，阳光照射在表木上，在石面上留下长短不同的影子。夏至那天太阳最高，影子最短；冬至那天太阳最低，影子最长。通过记录这一年一度的影长轮回，古人精准创立了二十四节气，指导农业耕织千年！',
    curiousQuestion: '二十四节气中的第一个节气是什么？（答：立春！）',
    culturalTag: '格物致知 · 敬授民时',
    badgeColor: 'bg-purple-500/20 text-purple-200 border-purple-400/40',
  },
];

// Helper to fetch daily lore (picks by day of year or random)
export async function fetchDailyLore(forceRandom: boolean = false): Promise<DailyLoreItem> {
  // Simulate network tick
  await new Promise((resolve) => setTimeout(resolve, 80));

  if (forceRandom) {
    const idx = Math.floor(Math.random() * DAILY_LORE_DATABASE.length);
    return DAILY_LORE_DATABASE[idx];
  }

  // Use day of year for stable daily fact
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const index = dayOfYear % DAILY_LORE_DATABASE.length;
  return DAILY_LORE_DATABASE[index];
}
