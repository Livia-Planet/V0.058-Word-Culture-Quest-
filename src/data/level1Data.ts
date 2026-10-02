export interface HanziChar {
  id: string;
  char: string;
  pinyin: string;
  radical: string;
  radicalName: string;
  components: string[];
  etymology: string;
  meaning: string;
  mnemonic: string; // 记忆口诀 / 趣记
  strokeCount: number;
  examWords: string[]; // 高频考试词汇
  exampleSentence: string;
  unlocked: boolean;
}

export interface StorySentence {
  id: number;
  audioPrompt: string;
  tokens: {
    char: string;
    pinyin: string;
    isTarget?: boolean;
    charId?: string;
  }[];
}

export interface SoundMatchQuestion {
  id: number;
  pinyinPrompt: string;
  charToGuess: string;
  audioCue: string;
  meaningHint: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface RadicalBlockGame {
  id: number;
  targetChar: string;
  pinyin: string;
  meaning: string;
  pieces: { id: string; text: string; type: 'radical' | 'body' }[];
  correctOrder: string[]; // IDs in order or combination
  formula: string;
  culturalLore: string;
}

export interface CulturalCard {
  id: string;
  title: string;
  badge: string;
  tag: string;
  quote: string;
  description: string;
  essayPhrases: string[]; // 作文高分好词好句
  iconName: string;
  unlocked: boolean;
}

export const TARGET_CHARACTERS: HanziChar[] = [
  {
    id: 'nian',
    char: '年',
    pinyin: 'nián',
    radical: '禾 / 𠂉',
    radicalName: '禾字部 (象征五谷丰登)',
    components: ['𠂉', '午'],
    etymology: '甲骨文如人背负成熟的谷禾，本义为谷熟、收成。传说中也是除夕出没的凶猛年兽。',
    meaning: '时间单位（一年四季）；节日（过年、春节）；传说中的怪兽。',
    mnemonic: '人背谷穗迎丰收，家家户户过大年！',
    strokeCount: 6,
    examWords: ['新年', '年兽', '年夜饭', '延年益寿', '风调雨顺年丰'],
    exampleSentence: '每逢过年，无论离家多远，人们都要回家团聚。',
    unlocked: true,
  },
  {
    id: 'shou',
    char: '兽',
    pinyin: 'shòu',
    radical: '犬 / 丷',
    radicalName: '犬字底 (猛兽与猎犬)',
    components: ['丷', '一', '口', '口', '十', '犬'],
    etymology: '象形兼会意，上面是捕兽之网，下面是奔跑追逐的猛犬。',
    meaning: '四足哺乳动物；凶残野生怪兽。',
    mnemonic: '两只圆眼张大口，捕网落下困猎犬。',
    strokeCount: 11,
    examWords: ['野兽', '猛兽', '珍禽异兽', '困兽犹斗'],
    exampleSentence: '年兽虽凶猛，但只要掌握了它的弱点就能制服它。',
    unlocked: true,
  },
  {
    id: 'chun',
    char: '春',
    pinyin: 'chūn',
    radical: '日',
    radicalName: '日字底 (日光普照)',
    components: ['三', '人', '日'],
    etymology: '会意字。阳光之下，三生万物，草木破土萌生，万象更新。',
    meaning: '一年的第一季，万物复苏之时；生机与活力。',
    mnemonic: '三人同日去踏青，大地回春草木新。',
    strokeCount: 9,
    examWords: ['春节', '春联', '阳春三月', '春华秋实', '妙手回春'],
    exampleSentence: '春风吹拂着大地，迎春花悄悄绽开了笑脸。',
    unlocked: true,
  },
  {
    id: 'hong',
    char: '红',
    pinyin: 'hóng',
    radical: '纟',
    radicalName: '绞丝旁 (与丝帛织物有关)',
    components: ['纟', '工'],
    etymology: '形声字。从糸（丝线），工声。本义为织染出的粉红色，后演变为热烈喜庆的朱红。',
    meaning: '像鲜血一样的火热颜色；象征喜庆、顺利、成功。',
    mnemonic: '细丝染上红颜料，巧夺天工彩绸飘。',
    strokeCount: 6,
    examWords: ['红火', '红旗', '万紫千红', '满面红光', '走红'],
    exampleSentence: '红红的灯笼高高挂起，给节日增添了浓浓的喜气。',
    unlocked: true,
  },
  {
    id: 'huo',
    char: '火',
    pinyin: 'huǒ',
    radical: '火',
    radicalName: '火字旁 (燃烧与光明)',
    components: ['火'],
    etymology: '象形字。甲骨文像物体燃烧时向上窜动的烈焰火苗。',
    meaning: '燃烧发光发热的自然现象；红火喜庆；热烈。',
    mnemonic: '中间高高两边斜，熊熊烈火映晚霞。',
    strokeCount: 4,
    examWords: ['红火', '火光', '如火如荼', '薪火相传', '万家灯火'],
    exampleSentence: '壁炉里的柴火噼啪作响，照亮了孩子们的欢声笑语。',
    unlocked: true,
  },
  {
    id: 'fu',
    char: '福',
    pinyin: 'fú',
    radical: '礻',
    radicalName: '示字旁 (祈福祭祀天地神灵)',
    components: ['礻', '一', '口', '田'],
    etymology: '会意字。“礻”表示祭神祈祐，“一口田”代表全家有田可耕、丰衣足食的生活理想。',
    meaning: '幸福、福祉、吉祥如意。',
    mnemonic: '示字祈神佑一家，一口田地福满家。',
    strokeCount: 13,
    examWords: ['幸福', '福气', '福如东海', '大饱眼福', '造福一方'],
    exampleSentence: '大门上的“福”字倒着贴，寓意“福到了”！',
    unlocked: true,
  },
  {
    id: 'tie',
    char: '贴',
    pinyin: 'tiē',
    radical: '贝',
    radicalName: '贝字旁 (与财富典当有关)',
    components: ['贝', '占'],
    etymology: '形声字。从贝，占声。古代以贝物典质，引申为紧贴、附着在上面。',
    meaning: '粘附，粘合；紧靠；春联贴在大门两侧。',
    mnemonic: '宝贝占居好位置，红红春联门上贴。',
    strokeCount: 9,
    examWords: ['贴春联', '贴心', '妥贴', '俯首贴耳'],
    exampleSentence: '爸爸踩上凳子，认真地在大门两旁贴上新春联。',
    unlocked: false,
  },
  {
    id: 'pao',
    char: '炮',
    pinyin: 'pào',
    radical: '火',
    radicalName: '火字旁',
    components: ['火', '包'],
    etymology: '形声字。从火，包声。本义为用火烧烤包裹之物，后引申为爆竹、火炮。',
    meaning: '爆竹；武器大炮；爆破声响。',
    mnemonic: '火包相碰轰隆响，爆竹驱兽除旧岁。',
    strokeCount: 9,
    examWords: ['鞭炮', '爆竹', '放炮', '炮竹齐鸣'],
    exampleSentence: '五彩斑斓的礼花和清脆的鞭炮声划破了除夕的夜空。',
    unlocked: false,
  },
  {
    id: 'xi',
    char: '喜',
    pinyin: 'xǐ',
    radical: '口',
    radicalName: '口字底',
    components: ['壴', '口'],
    etymology: '会意字。上部为鼓形击乐，下部为张口大笑，表示击鼓欢唱，欢喜快乐。',
    meaning: '高兴、快乐；可庆贺的事。',
    mnemonic: '击鼓奏乐张开嘴，欢欢喜喜迎新春。',
    strokeCount: 12,
    examWords: ['喜庆', '欢喜', '欣喜若狂', '喜气洋洋', '双喜临门'],
    exampleSentence: '大街小巷张灯结彩，到处是一片喜气洋洋的景象。',
    unlocked: false,
  },
  {
    id: 'qing',
    char: '庆',
    pinyin: 'qìng',
    radical: '广',
    radicalName: '广字头',
    components: ['广', '大'],
    etymology: '从广从大，繁体从鹿，古代持鹿皮相庆贺，今简化为广大屋宇下举行庆典。',
    meaning: '祝贺、庆祝、吉庆。',
    mnemonic: '大屋广厦聚高朋，击掌相庆贺团圆。',
    strokeCount: 6,
    examWords: ['庆祝', '喜庆', '国庆', '额手称庆', '普天同庆'],
    exampleSentence: '千家万户共同庆祝这个辞旧迎新的美好时刻。',
    unlocked: false,
  },
];

// Story breakdown for Chapter 1
export const STORY_PARAGRAPHS: StorySentence[] = [
  {
    id: 1,
    audioPrompt: '很久很久以前，深山里住着一只凶猛的怪兽，名叫“年”。它每到除夕夜就会闯进村庄，村民们都很害怕。',
    tokens: [
      { char: '很', pinyin: 'hěn' },
      { char: '久', pinyin: 'jiǔ' },
      { char: '很', pinyin: 'hěn' },
      { char: '久', pinyin: 'jiǔ' },
      { char: '以', pinyin: 'yǐ' },
      { char: '前', pinyin: 'qián' },
      { char: '，', pinyin: '' },
      { char: '深', pinyin: 'shēn' },
      { char: '山', pinyin: 'shān' },
      { char: '里', pinyin: 'lǐ' },
      { char: '住', pinyin: 'zhù' },
      { char: '着', pinyin: 'zhe' },
      { char: '一', pinyin: 'yì' },
      { char: '只', pinyin: 'zhī' },
      { char: '凶', pinyin: 'xiōng' },
      { char: '猛', pinyin: 'měng' },
      { char: '的', pinyin: 'de' },
      { char: '怪', pinyin: 'guài' },
      { char: '兽', pinyin: 'shòu', isTarget: true, charId: 'shou' },
      { char: '，', pinyin: '' },
      { char: '名', pinyin: 'míng' },
      { char: '叫', pinyin: 'jiào' },
      { char: '“', pinyin: '' },
      { char: '年', pinyin: 'nián', isTarget: true, charId: 'nian' },
      { char: '”', pinyin: '' },
      { char: '。', pinyin: '' },
      { char: '它', pinyin: 'tā' },
      { char: '每', pinyin: 'měi' },
      { char: '到', pinyin: 'dào' },
      { char: '除', pinyin: 'chú' },
      { char: '夕', pinyin: 'xī' },
      { char: '夜', pinyin: 'yè' },
      { char: '就', pinyin: 'jiù' },
      { char: '会', pinyin: 'huì' },
      { char: '闯', pinyin: 'chuǎng' },
      { char: '进', pinyin: 'jìn' },
      { char: '村', pinyin: 'cūn' },
      { char: '庄', pinyin: 'zhuāng' },
      { char: '，', pinyin: '' },
      { char: '村', pinyin: 'cūn' },
      { char: '民', pinyin: 'mín' },
      { char: '们', pinyin: 'men' },
      { char: '都', pinyin: 'dōu' },
      { char: '很', pinyin: 'hěn' },
      { char: '害', pinyin: 'hài' },
      { char: '怕', pinyin: 'pà' },
      { char: '。', pinyin: '' },
    ],
  },
  {
    id: 2,
    audioPrompt: '后来，一位聪慧的老人发现：“年”兽最怕三样宝物——红色的衣裳、明亮的火光，还有响亮的鞭炮声！',
    tokens: [
      { char: '后', pinyin: 'hòu' },
      { char: '来', pinyin: 'lái' },
      { char: '，', pinyin: '' },
      { char: '一', pinyin: 'yí' },
      { char: '位', pinyin: 'wèi' },
      { char: '聪', pinyin: 'cōng' },
      { char: '慧', pinyin: 'huì' },
      { char: '的', pinyin: 'de' },
      { char: '老', pinyin: 'lǎo' },
      { char: '人', pinyin: 'rén' },
      { char: '发', pinyin: 'fā' },
      { char: '现', pinyin: 'xiàn' },
      { char: '：', pinyin: '' },
      { char: '“', pinyin: '' },
      { char: '年', pinyin: 'nián', isTarget: true, charId: 'nian' },
      { char: '”', pinyin: '' },
      { char: '兽', pinyin: 'shòu', isTarget: true, charId: 'shou' },
      { char: '最', pinyin: 'zuì' },
      { char: '怕', pinyin: 'pà' },
      { char: '三', pinyin: 'sān' },
      { char: '样', pinyin: 'yàng' },
      { char: '宝', pinyin: 'bǎo' },
      { char: '物', pinyin: 'wù' },
      { char: '——', pinyin: '' },
      { char: '红', pinyin: 'hóng', isTarget: true, charId: 'hong' },
      { char: '色', pinyin: 'sè' },
      { char: '的', pinyin: 'de' },
      { char: '衣', pinyin: 'yī' },
      { char: '裳', pinyin: 'shang' },
      { char: '、', pinyin: '' },
      { char: '明', pinyin: 'míng' },
      { char: '亮', pinyin: 'liàng' },
      { char: '的', pinyin: 'de' },
      { char: '火', pinyin: 'huǒ', isTarget: true, charId: 'huo' },
      { char: '光', pinyin: 'guāng' },
      { char: '，', pinyin: '' },
      { char: '还', pinyin: 'hái' },
      { char: '有', pinyin: 'yǒu' },
      { char: '响', pinyin: 'xiǎng' },
      { char: '亮', pinyin: 'liàng' },
      { char: '的', pinyin: 'de' },
      { char: '鞭', pinyin: 'biān' },
      { char: '炮', pinyin: 'pào', isTarget: true, charId: 'pao' },
      { char: '声', pinyin: 'shēng' },
      { char: '！', pinyin: '' },
    ],
  },
  {
    id: 3,
    audioPrompt: '于是，每当新春来到，家家户户贴上红彤彤的春联，倒贴着大大的“福”字。从此这一天叫做“过年”，四处喜气洋洋，普天同庆！',
    tokens: [
      { char: '于', pinyin: 'yú' },
      { char: '是', pinyin: 'shì' },
      { char: '，', pinyin: '' },
      { char: '每', pinyin: 'měi' },
      { char: '当', pinyin: 'dāng' },
      { char: '新', pinyin: 'xīn' },
      { char: '春', pinyin: 'chūn', isTarget: true, charId: 'chun' },
      { char: '来', pinyin: 'lái' },
      { char: '到', pinyin: 'dào' },
      { char: '，', pinyin: '' },
      { char: '家', pinyin: 'jiā' },
      { char: '家', pinyin: 'jiā' },
      { char: '户', pinyin: 'hù' },
      { char: '户', pinyin: 'hù' },
      { char: '贴', pinyin: 'tiē', isTarget: true, charId: 'tie' },
      { char: '上', pinyin: 'shàng' },
      { char: '红', pinyin: 'hóng', isTarget: true, charId: 'hong' },
      { char: '彤', pinyin: 'tóng' },
      { char: '彤', pinyin: 'tóng' },
      { char: '的', pinyin: 'de' },
      { char: '春', pinyin: 'chūn', isTarget: true, charId: 'chun' },
      { char: '联', pinyin: 'lián' },
      { char: '，', pinyin: '' },
      { char: '倒', pinyin: 'dào' },
      { char: '贴', pinyin: 'tiē', isTarget: true, charId: 'tie' },
      { char: '着', pinyin: 'zhe' },
      { char: '大', pinyin: 'dà' },
      { char: '大', pinyin: 'dà' },
      { char: '的', pinyin: 'de' },
      { char: '“', pinyin: '' },
      { char: '福', pinyin: 'fú', isTarget: true, charId: 'fu' },
      { char: '”', pinyin: '' },
      { char: '字', pinyin: 'zì' },
      { char: '。', pinyin: '' },
      { char: '从', pinyin: 'cóng' },
      { char: '此', pinyin: 'cǐ' },
      { char: '这', pinyin: 'zhè' },
      { char: '一', pinyin: 'yì' },
      { char: '天', pinyin: 'tiān' },
      { char: '叫', pinyin: 'jiào' },
      { char: '做', pinyin: 'zuò' },
      { char: '“', pinyin: '' },
      { char: '过', pinyin: 'guò' },
      { char: '年', pinyin: 'nián', isTarget: true, charId: 'nian' },
      { char: '”', pinyin: '' },
      { char: '，', pinyin: '' },
      { char: '四', pinyin: 'sì' },
      { char: '处', pinyin: 'chù' },
      { char: '喜', pinyin: 'xǐ', isTarget: true, charId: 'xi' },
      { char: '气', pinyin: 'qì' },
      { char: '洋', pinyin: 'yáng' },
      { char: '洋', pinyin: 'yáng' },
      { char: '，', pinyin: '' },
      { char: '普', pinyin: 'pǔ' },
      { char: '天', pinyin: 'tiān' },
      { char: '同', pinyin: 'tóng' },
      { char: '庆', pinyin: 'qìng', isTarget: true, charId: 'qing' },
      { char: '！', pinyin: '' },
    ],
  },
];

// Sound-to-Sight Challenges (听说反向匹配)
export const SOUND_QUESTIONS: SoundMatchQuestion[] = [
  {
    id: 1,
    pinyinPrompt: 'nián',
    charToGuess: '年',
    audioCue: '年',
    meaningHint: '上古时期的凶兽，后来成为四季岁时更新的代称。',
    options: ['年', '午', '牛', '生'],
    correctAnswer: '年',
    explanation: '“年”字音 nián，禾谷成熟大丰收，除夕夜家家户户过大年！',
  },
  {
    id: 2,
    pinyinPrompt: 'chūn',
    charToGuess: '春',
    audioCue: '春',
    meaningHint: '万物复苏、生机勃勃的第一季，阳光下百草破土萌芽。',
    options: ['日', '春', '香', '青'],
    correctAnswer: '春',
    explanation: '“春”字音 chūn，三人同日游春景，草木萌芽新气象。',
  },
  {
    id: 3,
    pinyinPrompt: 'fú',
    charToGuess: '福',
    audioCue: '福',
    meaningHint: '祈求神灵保佑，全家丰衣足食、美满吉祥。',
    options: ['畐', '富', '福', '田'],
    correctAnswer: '福',
    explanation: '“福”字音 fú，左边示字旁求神佑，右边一口田保丰衣足食！',
  },
  {
    id: 4,
    pinyinPrompt: 'hóng',
    charToGuess: '红',
    audioCue: '红',
    meaningHint: '年兽最惧怕的鲜艳色彩，中国传统吉祥吉利的象征。',
    options: ['虹', '红', '工', '细'],
    correctAnswer: '红',
    explanation: '“红”字音 hóng，绞丝旁加上工，象征喜庆火红的彩绸。',
  },
  {
    id: 5,
    pinyinPrompt: 'shòu',
    charToGuess: '兽',
    audioCue: '兽',
    meaningHint: '山林里长着尖角四足的凶恶动物或传说怪兽。',
    options: ['犬', '首', '兽', '单'],
    correctAnswer: '兽',
    explanation: '“兽”字音 shòu，捕网扣住凶犬，代表凶猛的年兽。',
  },
  {
    id: 6,
    pinyinPrompt: 'pào',
    charToGuess: '炮',
    audioCue: '炮',
    meaningHint: '遇到火光轰鸣炸响的爆竹，用来驱吓除夕怪兽。',
    options: ['包', '泡', '跑', '炮'],
    correctAnswer: '炮',
    explanation: '“炮”字音 pào，火字旁配上包，火光四射噼啪作响！',
  },
];

// Radical Assembly Blocks (偏旁积木组字)
export const RADICAL_GAMES: RadicalBlockGame[] = [
  {
    id: 1,
    targetChar: '福',
    pinyin: 'fú',
    meaning: '幸福、福祉。倒贴福字寓意“福气到家”。',
    pieces: [
      { id: 'p1', text: '礻', type: 'radical' },
      { id: 'p2', text: '一口田', type: 'body' },
    ],
    correctOrder: ['p1', 'p2'],
    formula: '福 = 礻(示字旁，祈神降福) + 一口田(丰衣足食)',
    culturalLore: '民间习俗将“福”字倒过来贴在门窗上，取“福倒”谐音“福到了”的吉祥寓意。',
  },
  {
    id: 2,
    targetChar: '红',
    pinyin: 'hóng',
    meaning: '中国红，辟邪吉祥之色。年兽最怕此颜色。',
    pieces: [
      { id: 'p1', text: '纟', type: 'radical' },
      { id: 'p2', text: '工', type: 'body' },
    ],
    correctOrder: ['p1', 'p2'],
    formula: '红 = 纟(绞丝旁，红丝彩带) + 工(声旁兼意)',
    culturalLore: '春节穿红衣、贴红春联、挂红灯笼，用浓烈的红色驱散寒冷与凶兽，迎接好运！',
  },
  {
    id: 3,
    targetChar: '春',
    pinyin: 'chūn',
    meaning: '新春、春天。一年之计在于春。',
    pieces: [
      { id: 'p1', text: '三人', type: 'radical' },
      { id: 'p2', text: '日', type: 'body' },
    ],
    correctOrder: ['p1', 'p2'],
    formula: '春 = 三人(草木萌动同游) + 日(温暖阳光)',
    culturalLore: '立春是二十四节气之首，古人有“咬春”、“打春牛”的习俗，祈愿五谷丰登。',
  },
  {
    id: 4,
    targetChar: '炮',
    pinyin: 'pào',
    meaning: '鞭炮、炮竹。爆竹声中一岁除。',
    pieces: [
      { id: 'p1', text: '火', type: 'radical' },
      { id: 'p2', text: '包', type: 'body' },
    ],
    correctOrder: ['p1', 'p2'],
    formula: '炮 = 火(火焰热力) + 包(火药包裹爆开)',
    culturalLore: '古人最早用火烧竹节，发出“噼啪”爆炸声驱逐山精鬼怪，后来演变成节日的鞭炮烟花。',
  },
  {
    id: 5,
    targetChar: '贴',
    pinyin: 'tiē',
    meaning: '紧靠粘贴。家家户户贴红联。',
    pieces: [
      { id: 'p1', text: '贝', type: 'radical' },
      { id: 'p2', text: '占', type: 'body' },
    ],
    correctOrder: ['p1', 'p2'],
    formula: '贴 = 贝(古代贝币贵重) + 占(占据固定)',
    culturalLore: '春节贴春联要讲究平仄对仗，右边上联、左边下联，正中横批，表达对新年的期盼。',
  },
];

// Cultural Collectible Cards
export const CULTURAL_CARDS: CulturalCard[] = [
  {
    id: 'card-chunlian',
    title: '贴红春联与门神',
    badge: '民俗瑰宝',
    tag: '除夕习俗',
    quote: '千门万户曈曈日，总把新桃换旧符。',
    description: '春联起源于古代的“桃符”。古人用桃木辟邪，后来在红纸上写下吉祥对联贴于大门两侧，辞旧迎新，文质彬彬。',
    essayPhrases: [
      '家家户户张贴大红春联',
      '龙飞凤舞的金字洋溢着浓浓年味',
      '辞旧迎新，吉祥如意',
      '门前一抹亮丽的中国红',
    ],
    iconName: 'Scroll',
    unlocked: true,
  },
  {
    id: 'card-bianpao',
    title: '燃放爆竹驱年兽',
    badge: '非遗文化',
    tag: '迎春欢庆',
    quote: '爆竹声中一岁除，春风送暖入屠苏。',
    description: '爆竹的清脆声响既震慑了传说中害怕巨响的年兽，也象征着轰散一整年的不顺与晦气，迎来充满生机的新春岁月。',
    essayPhrases: [
      '噼里啪啦的鞭炮声此起彼伏',
      '绚烂的烟花在墨染的夜空中绽放',
      '响彻云霄的欢声笑语',
      '驱邪避害，万象更新',
    ],
    iconName: 'Sparkles',
    unlocked: true,
  },
  {
    id: 'card-nianyefan',
    title: '除夕阖家年夜饭',
    badge: '舌尖传统',
    tag: '亲情团圆',
    quote: '围炉守岁话桑麻，万家灯火照华堂。',
    description: '年夜饭是一年中最重要的团聚时刻。餐桌上必定有鱼（年年有余）、水饺（形如元宝，招财进宝）和年糕（年年高升）。',
    essayPhrases: [
      '热气腾腾的年夜饭香气四溢',
      '全家人围坐在圆桌旁互道祝福',
      '餐桌上摆满了寓意年年有余的佳肴',
      '暖融融的灯火照亮了一张张笑脸',
    ],
    iconName: 'Utensils',
    unlocked: false,
  },
  {
    id: 'card-daotiefu',
    title: '倒贴“福”字迎好运',
    badge: '民间趣味',
    tag: '巧思谐音',
    quote: '福星高照迎新岁，喜气盈门纳百祥。',
    description: '“福”字寄托了人们对美好生活的向往。将“福”字倒过来贴，取“福倒”与“福到”的巧妙谐音，充满中华文化的风趣哲理。',
    essayPhrases: [
      '大红金底的“福”字倒着贴在门楣上',
      '福到运到，财源滚滚',
      '寄托着对幸福美满生活的美好祝愿',
      '老少皆欢，喜上眉梢',
    ],
    iconName: 'HeartHandshake',
    unlocked: false,
  },
];

// Fill in the blanks practice (汉字挖空训练)
export interface ClozeExercise {
  id: number;
  title: string;
  contextSentence: string; // 口述故事片段
  blanks: {
    index: number;
    charId: string;
    correctChar: string;
    pinyinHint: string;
    options: string[];
  }[];
  referenceAudio: string;
}

export const CLOZE_EXERCISES: ClozeExercise[] = [
  {
    id: 1,
    title: '第一段：年兽的弱点 (口述转文字填空)',
    contextSentence: '除夕夜，凶恶的怪[兽]又来了！爷爷穿上了[红]色的长袍，燃起了明亮的[火]堆，吓得[年]兽落荒而逃。',
    referenceAudio: '除夕夜，凶恶的怪兽又来了！爷爷穿上了红色的长袍，燃起了明亮的火堆，吓得年兽落荒而逃。',
    blanks: [
      {
        index: 0,
        charId: 'shou',
        correctChar: '兽',
        pinyinHint: 'shòu',
        options: ['兽', '首', '犬'],
      },
      {
        index: 1,
        charId: 'hong',
        correctChar: '红',
        pinyinHint: 'hóng',
        options: ['红', '虹', '绿'],
      },
      {
        index: 2,
        charId: 'huo',
        correctChar: '火',
        pinyinHint: 'huǒ',
        options: ['火', '灭', '水'],
      },
      {
        index: 3,
        charId: 'nian',
        correctChar: '年',
        pinyinHint: 'nián',
        options: ['年', '午', '平'],
      },
    ],
  },
  {
    id: 2,
    title: '第二段：新春的喜庆 (口述转文字填空)',
    contextSentence: '新[春]佳节到，我和爸爸在大门两旁[贴]上春联，又贴上了红底金字的倒[福]，到处洋溢着[喜]庆的气息。',
    referenceAudio: '新春佳节到，我和爸爸在大门两旁贴上春联，又贴上了红底金字的倒福，到处洋溢着喜庆的气息。',
    blanks: [
      {
        index: 0,
        charId: 'chun',
        correctChar: '春',
        pinyinHint: 'chūn',
        options: ['春', '日', '香'],
      },
      {
        index: 1,
        charId: 'tie',
        correctChar: '贴',
        pinyinHint: 'tiē',
        options: ['贴', '占', '帖'],
      },
      {
        index: 2,
        charId: 'fu',
        correctChar: '福',
        pinyinHint: 'fú',
        options: ['福', '富', '幅'],
      },
      {
        index: 3,
        charId: 'xi',
        correctChar: '喜',
        pinyinHint: 'xǐ',
        options: ['喜', '嘉', '嘻'],
      },
    ],
  },
];

// Standard 400-word 3-part composition scaffolding template
export interface EssayTemplate {
  title: string;
  theme: string;
  sections: {
    key: 'beginning' | 'middle' | 'ending';
    title: string;
    targetWordCount: string;
    guideline: string;
    starterPrompts: string[];
    recommendedPhrases: string[];
    defaultText: string;
  }[];
}

export const SPRING_FESTIVAL_ESSAY_TEMPLATE: EssayTemplate = {
  title: '《难忘的除夕夜》—— 400字小作文积木',
  theme: '传统节日 · 春节与年兽的文化记忆',
  sections: [
    {
      key: 'beginning',
      title: '一、 开头：引出背景与节日气氛 (约50字)',
      targetWordCount: '40 - 60字',
      guideline: '点明时间（除夕之夜）、地点（温馨家中）、人物及浓厚的节日氛围。',
      starterPrompts: [
        '“千门万户曈曈日，总把新桃换旧符。”一年一度的除夕夜又在欢声笑语中到来了。',
        '夜幕降临，万家灯火，窗外不时传来阵阵清脆的爆竹声，空气中弥漫着浓浓的年味。',
      ],
      recommendedPhrases: ['一年一度', '万家灯火', '年味浓浓', '喜气洋洋'],
      defaultText: '“爆竹声中一岁除，春风送暖入屠苏。”一年一度的除夕夜在欢声笑语中悄然降临，大街小巷张灯结彩，到处洋溢着浓浓的年味。',
    },
    {
      key: 'middle',
      title: '二、 中间：生动叙述细节与文化风俗 (约300字)',
      targetWordCount: '280 - 320字',
      guideline: '按时间或活动顺序，详细描写贴春联、吃年夜饭、讲年兽传说、放烟花等场景，运用学到的好词好句。',
      starterPrompts: [
        '下午，我和爸爸一起在朱红的大门上贴春联和倒立的“福”字，寓意“福气到家”。',
        '餐桌上热气腾腾的年夜饭散发着诱人的香气，有寓意年年有余的清蒸鱼和象征团圆的水饺。',
        '爷爷摸着胡子为我们讲述了年兽害怕红衣、火光和鞭炮的传说故事。',
      ],
      recommendedPhrases: [
        '家家户户贴春联',
        '倒贴红福',
        '年夜饭香气四溢',
        '年年有余',
        '噼里啪啦的鞭炮',
        '红红火火',
        '年兽落荒而逃',
      ],
      defaultText: '下午，我和爸爸踩在小板凳上，小心翼翼地把红彤彤的春联贴在门两侧，又在大门正中央倒贴了一个金光闪闪的大“福”字。我好奇地问爸爸：“为什么要把福字倒过来贴呢？”爸爸笑着摸摸我的头说：“这叫‘福倒了，福到了’呀！”\n\n傍晚，餐桌上摆满了丰盛诱人的年夜饭。热气腾腾的清蒸鱼寓意着“年年有余”，皮薄馅大的饺子像一个个饱满的金元宝。一家人围坐在一起，暖融融的灯光照亮了每张幸福的笑脸。\n\n饭后，爷爷给我们讲述了“年兽”的古老传说。原来凶猛的年兽最怕三样法宝：大红色的衣裳、噼里啪啦的鞭炮声，还有熊熊燃烧的火光！难怪每到除夕夜，大家都要穿红衣、燃爆竹，驱赶怪兽，迎接新一年的吉祥与平安。',
    },
    {
      key: 'ending',
      title: '三、 结尾：总结感受与美好期盼 (约50字)',
      targetWordCount: '40 - 60字',
      guideline: '抒发对传统文化的热爱、对新一年的祝福与成长感悟。',
      starterPrompts: [
        '看着夜空中绚丽的烟花，我心中充满了温暖与力量，期待新的一年健康快乐、学业进步！',
        '这个除夕夜不仅充满欢乐，更让我感受到了中华传统文化的博大精深与家庭团聚的温暖。',
      ],
      recommendedPhrases: ['辞旧迎新', '吉祥安康', '回味无穷', '温暖常在'],
      defaultText: '绚丽多彩的礼花在夜空中璀璨绽放，照亮了崭新的春天。这个除夕夜不仅让我大饱口福，更让我感受到了中华传统文化的无穷魅力！',
    },
  ],
};

export const DEFAULT_CLOZE_EXERCISES: ClozeExercise[] = CLOZE_EXERCISES;
export const DEFAULT_ESSAY_TEMPLATE: EssayTemplate = SPRING_FESTIVAL_ESSAY_TEMPLATE;
