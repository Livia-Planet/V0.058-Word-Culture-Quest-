/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ScrollFragmentPiece {
  id: string;
  name: string;
  desc: string;
  icon: string;
}

export interface StoryScrollArt {
  id: string;
  storyId: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  category: 'myth' | 'history' | 'fairy' | 'news' | 'science';
  categoryName: string;
  icon: string;
  themeGradient: string;
  borderTheme: string;
  glowColor: string;
  unlockCondition: string;
  readingScoreRequired: number;
  fragments: ScrollFragmentPiece[];
  coreCharacters: string[];
  summary: string;
  loreAppreciation: string;
  aestheticType: 'gongbi' | 'qinglv' | 'shuimo' | 'danqing' | 'keji';
  chapterNumber: number;
}

export const STORY_SCROLL_COLLECTIONS: StoryScrollArt[] = [
  {
    id: 'scroll-story-1',
    storyId: 'story-1',
    chapterNumber: 1,
    title: '《除夕年兽图卷》· 爆竹辞岁',
    shortTitle: '爆竹辞岁卷',
    subtitle: '岁首破煞 · 桃符纳吉 · 千家万户迎新春',
    category: 'myth',
    categoryName: '神话传说',
    icon: '🏮',
    themeGradient: 'from-red-950 via-rose-900 to-amber-950',
    borderTheme: 'border-red-400/80',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    unlockCondition: '完成《除夕年兽与爆竹红联》朗读研习',
    readingScoreRequired: 60,
    fragments: [
      { id: 'f-1-1', name: '年兽赤角', desc: '相传年兽头生独角，目露凶光，畏惧赤红火光。', icon: '👹' },
      { id: 'f-1-2', name: '桃符红联', desc: '千门万户曈曈日，总把新桃换旧符。红纸正气驱煞。', icon: '📜' },
      { id: 'f-1-3', name: '爆竹金硝', desc: '劈啪金火腾空起，惊散妖氛万象新。', icon: '🧨' },
      { id: 'f-1-4', name: '守岁迎春', desc: '除夕围炉守岁，辞旧迎新，祈愿福寿安康。', icon: '🍲' },
    ],
    coreCharacters: ['除', '夕', '岁', '春', '迎', '联'],
    summary: '远古时期除夕之夜，恶兽年自深海而出侵扰村落。智者以红绸、爆竹与灯火逼退年兽，由此开启了中华民族贴春联、放爆竹、辞旧迎新的千古除夕民俗。',
    loreAppreciation: '红联是华夏民族对光明与新生的礼赞。每一个方块字中，都流淌着驱邪纳祥的古老信仰与家国团圆的诗性温情。',
    aestheticType: 'gongbi',
  },
  {
    id: 'scroll-story-2',
    storyId: 'story-2',
    chapterNumber: 2,
    title: '《端午龙舟图卷》· 汨罗清波',
    shortTitle: '汨罗竞渡卷',
    subtitle: '千帆竞渡 · 粽香楚江 · 爱国赤子千秋颂',
    category: 'history',
    categoryName: '历史风华',
    icon: '🐉',
    themeGradient: 'from-emerald-950 via-teal-900 to-amber-950',
    borderTheme: 'border-emerald-400/80',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    unlockCondition: '完成《端午屈原与赛龙舟》朗读研习',
    readingScoreRequired: 60,
    fragments: [
      { id: 'f-2-1', name: '百舸争流', desc: '锣鼓喧天，彩旗烈烈，龙舟破浪争分夺秒。', icon: '🛶' },
      { id: 'f-2-2', name: '五彩香粽', desc: '青青箬叶裹香糯，投江祭贤缅怀高风。', icon: '🍙' },
      { id: 'f-2-3', name: '离骚风骨', desc: '路漫漫其修远兮，吾将上下而求索。', icon: '🪶' },
      { id: 'f-2-4', name: '菖蒲艾香', desc: '门悬艾草祈安康，五彩丝线系长命。', icon: '🌿' },
    ],
    coreCharacters: ['舟', '粽', '龙', '江', '屈', '艾'],
    summary: '战国时期楚国爱国诗人屈原忧国忧民。五月初五沿江百姓划轻舟争相营救并投粽护贤，千百年来演化为同舟共济、赛龙舟、品香粽的端午盛事。',
    loreAppreciation: '龙舟竞渡不仅是力量与速度的激荡，更凝聚着中华儿女保家卫国、百折不挠的爱国浩然气魄。',
    aestheticType: 'qinglv',
  },
  {
    id: 'scroll-story-3',
    storyId: 'story-3',
    chapterNumber: 3,
    title: '《广寒冰轮图卷》· 蟾宫折桂',
    shortTitle: '广寒折桂卷',
    subtitle: '但愿人长久 · 千里共婵娟 · 亲情美满月常圆',
    category: 'myth',
    categoryName: '神话传说',
    icon: '🌕',
    themeGradient: 'from-indigo-950 via-purple-900 to-amber-950',
    borderTheme: 'border-indigo-400/80',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    unlockCondition: '完成《中秋明月与嫦娥》朗读研习',
    readingScoreRequired: 60,
    fragments: [
      { id: 'f-3-1', name: '广寒月宫', desc: '琼楼玉宇，高处不胜寒，嫦娥素袖起舞。', icon: '🏰' },
      { id: 'f-3-2', name: '玉兔捣药', desc: '玉兔执杵捣灵药，月华如水照人间。', icon: '🐇' },
      { id: 'f-3-3', name: '丹桂飘香', desc: '吴刚伐桂酿仙酒，桂子月中落，天香云外飘。', icon: '🌸' },
      { id: 'f-3-4', name: '冰轮团圆', desc: '万家灯火共赏秋月，分尝月饼祈阖家安泰。', icon: '🥮' },
    ],
    coreCharacters: ['月', '圆', '饼', '秋', '桂', '兔'],
    summary: '八月十五月儿圆。嫦娥奔月飞入广寒宫，人间中秋共赏圆月。苏轼“但愿人长久，千里共婵娟”的千古名句传唱至今，道尽人间温情。',
    loreAppreciation: '中秋圆月寓意团圆美满，体现了中国人注重家庭眷恋与天下同心的深厚人文底色。',
    aestheticType: 'shuimo',
  },
  {
    id: 'scroll-story-4',
    storyId: 'story-4',
    chapterNumber: 4,
    title: '《躬行求真图卷》· 碧林涉川',
    shortTitle: '碧林涉川卷',
    subtitle: '实践出真知 · 莫信人言 · 勇涉深浅明事理',
    category: 'fairy',
    categoryName: '童话寓言',
    icon: '🐴',
    themeGradient: 'from-amber-950 via-lime-950 to-stone-950',
    borderTheme: 'border-lime-400/80',
    glowColor: 'rgba(132, 204, 22, 0.4)',
    unlockCondition: '完成《小马过河与大森林》朗读研习',
    readingScoreRequired: 60,
    fragments: [
      { id: 'f-4-1', name: '老牛止步', desc: '牛伯伯说水很浅，刚没小腿能趟过。', icon: '🐂' },
      { id: 'f-4-2', name: '松鼠示警', desc: '松鼠急喊水太深，昨天淹死了小伙伴。', icon: '🐿️' },
      { id: 'f-4-3', name: '躬身试水', desc: '既不像老牛说的浅，也不像松鼠说的深。', icon: '🌊' },
      { id: 'f-4-4', name: '真知顿悟', desc: '凡事亲自去试一试，独立思考方解谜。', icon: '💡' },
    ],
    coreCharacters: ['深', '浅', '试', '跑', '牛', '松'],
    summary: '小马背着麦子过河，老牛说浅，松鼠说深。小马不轻信盲从，亲自小心趟下河水，终于领悟实践出真知的真谛。',
    loreAppreciation: '“绝知此事要躬行”。不盲信盲从，坚持躬行实践，是中华传统辩证哲学的生动写照。',
    aestheticType: 'danqing',
  },
  {
    id: 'scroll-story-5',
    storyId: 'story-5',
    chapterNumber: 5,
    title: '《天宫揽月图卷》· 问鼎苍穹',
    shortTitle: '天宫揽月卷',
    subtitle: '神舟裂长空 · 天宫驻星汉 · 跨越千年的飞天梦',
    category: 'news',
    categoryName: '太空强国',
    icon: '🚀',
    themeGradient: 'from-sky-950 via-blue-900 to-indigo-950',
    borderTheme: 'border-cyan-400/80',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    unlockCondition: '完成《神舟飞天筑梦苍穹》朗读研习',
    readingScoreRequired: 60,
    fragments: [
      { id: 'f-5-1', name: '烈焰裂霄', desc: '长征火箭划破苍穹，托举神舟冲入浩瀚星海。', icon: '🔥' },
      { id: 'f-5-2', name: '天宫筑梦', desc: '中国空间站遨游寰宇，机械臂精准捕获舱段。', icon: '🛰️' },
      { id: 'f-5-3', name: '出舱漫步', desc: '航天员身披银甲出舱，俯瞰蔚蓝地球母亲。', icon: '👨‍🚀' },
      { id: 'f-5-4', name: '星汉凯歌', desc: '九天揽月化为现实，科技强国谱写壮美篇章。', icon: '🌌' },
    ],
    coreCharacters: ['天', '航', '宙', '星', '舟', '站'],
    summary: '神舟飞天，天宫驻留。当代中国航天员在太空中开展前沿微重力科学实验，跨越千年的飞天揽月神话在今天成为雄浑现实。',
    loreAppreciation: '从敦煌壁画中飘逸的飞天，到当代空间站巡天，体现了中华民族百折不挠、敢上九天揽月的探索精神。',
    aestheticType: 'keji',
  },
  {
    id: 'scroll-story-6',
    storyId: 'story-6',
    chapterNumber: 6,
    title: '《金石物性图卷》· 热胀冷缩',
    shortTitle: '铜球金石卷',
    subtitle: 'Bobu外星兔探案 · 铜环锁球 · 微观分子的热舞',
    category: 'science',
    categoryName: '星际科考',
    icon: '🔬',
    themeGradient: 'from-amber-950 via-orange-950 to-stone-950',
    borderTheme: 'border-amber-400/80',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    unlockCondition: '完成《铜球热胀冷缩之谜》朗读或探案',
    readingScoreRequired: 60,
    fragments: [
      { id: 'f-6-1', name: '常温穿环', desc: '未受热时铜球轻盈滑过铁环。', icon: '⭕' },
      { id: 'f-6-2', name: '炽热膨胀', desc: '受热后内部分子剧烈震动，分子间隙扩大。', icon: '♨️' },
      { id: 'f-6-3', name: '卡环受阻', desc: '膨胀的铜球被紧紧卡在环口无法通过。', icon: '⛔' },
      { id: 'f-6-4', name: '冰水骤缩', desc: '冷水浸泡后分子平复，体积迅速缩小顺利脱困。', icon: '🧊' },
    ],
    coreCharacters: ['铜', '胀', '缩', '热', '冷', '球'],
    summary: '外星兔侦探 Bobu 在古遗迹破解金属机关。受热铜球膨胀卡环，浸入冰水迅速收缩滑落，直观揭示物质分子受热膨胀与遇冷收缩规律。',
    loreAppreciation: '汉字“胀”、“缩”、“热”精准凝练了物理现象的形义精髓，科学求知与汉字造字智慧在此完美交融。',
    aestheticType: 'keji',
  },
  {
    id: 'scroll-story-7',
    storyId: 'story-7',
    chapterNumber: 7,
    title: '《七彩虹影图卷》· 光之折射',
    shortTitle: '七彩虹影卷',
    subtitle: '棱镜分光 · 水滴成霓 · 星际光学的折射探案',
    category: 'science',
    categoryName: '星际科考',
    icon: '🌈',
    themeGradient: 'from-violet-950 via-pink-900 to-sky-950',
    borderTheme: 'border-pink-400/80',
    glowColor: 'rgba(236, 72, 153, 0.4)',
    unlockCondition: '完成《镜影折射与彩虹密码》朗读或探案',
    readingScoreRequired: 60,
    fragments: [
      { id: 'f-7-1', name: '白光如练', desc: '看似纯白的太阳光，由七色绚丽色光复合而成。', icon: '☀️' },
      { id: 'f-7-2', name: '斜入偏折', desc: '光线穿透不同介质界面时速度骤变发生偏折。', icon: '📐' },
      { id: 'f-7-3', name: '水滴分色', desc: '悬浮微小水滴如天然三棱镜，折射出色散光谱。', icon: '💧' },
      { id: 'f-7-4', name: '彩虹贯天', desc: '赤橙黄绿青蓝紫，拱桥光弧点亮星空密码。', icon: '✨' },
    ],
    coreCharacters: ['镜', '折', '虹', '光', '影', '彩'],
    summary: '遗迹石室暗藏彩虹密码。Bobu利用三棱镜与清水分离白光，折射出绚烂七彩光谱，解开光的色散与折射物理奥秘。',
    loreAppreciation: '“虹”字带虫字旁源于先民对天象神兽的敬畏，现代光学揭示色散本质，见证了人类求真探索的文明足迹。',
    aestheticType: 'danqing',
  },
  {
    id: 'scroll-story-8',
    storyId: 'story-8',
    chapterNumber: 8,
    title: '《寂籁弦音图卷》· 声波介质',
    shortTitle: '寂籁弦音卷',
    subtitle: '震颤波澜 · 介质传音 · 太空真空中的永恒寂静',
    category: 'science',
    categoryName: '星际科考',
    icon: '🪐',
    themeGradient: 'from-slate-950 via-indigo-950 to-cyan-950',
    borderTheme: 'border-cyan-400/80',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    unlockCondition: '完成《声波真空与太空回音》朗读或探案',
    readingScoreRequired: 60,
    fragments: [
      { id: 'f-8-1', name: '物体震颤', desc: '声音由物体机械振动产生，振动停则发声止。', icon: '🔔' },
      { id: 'f-8-2', name: '介质接力', desc: '空气、水与固体分子是声波扩散的必要桥梁。', icon: '〰️' },
      { id: 'f-8-3', name: '真空无声', desc: '太空中缺乏物质粒子，声波无法在真空中传递。', icon: '🌌' },
      { id: 'f-8-4', name: '无线电波', desc: '宇航员在宇宙中借助电磁波实现清晰即时对话。', icon: '📻' },
    ],
    coreCharacters: ['声', '音', '波', '震', '空', '响'],
    summary: 'Bobu在太空站外维修飞船，陨石划过却悄无声息。因为真空缺乏传声介质，只能借助无线电电磁波进行通讯。',
    loreAppreciation: '“大音希声”。古老东方哲思在现代天体物理学中得到了奇妙印证，声波传递着知识与文明的共鸣。',
    aestheticType: 'keji',
  },
];

export function getStoryScrollByStoryId(storyId: string): StoryScrollArt | undefined {
  return STORY_SCROLL_COLLECTIONS.find((s) => s.storyId === storyId);
}
