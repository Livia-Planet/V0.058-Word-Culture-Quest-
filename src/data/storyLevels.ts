import {
  HanziChar,
  StorySentence,
  SoundMatchQuestion,
  RadicalBlockGame,
  CulturalCard,
  ClozeExercise,
  EssayTemplate,
  TARGET_CHARACTERS,
  STORY_PARAGRAPHS,
  SOUND_QUESTIONS,
  RADICAL_GAMES,
  CULTURAL_CARDS,
  CLOZE_EXERCISES,
  SPRING_FESTIVAL_ESSAY_TEMPLATE,
} from './level1Data';
import { BOBU_STORY_LEVELS } from './bobuStoryAdapter';

export type StoryCategory = 'history' | 'myth' | 'fairy' | 'news' | 'science';

export interface CategoryMeta {
  key: 'all' | StoryCategory;
  name: string;
  icon: string;
  desc: string;
}

export const STORY_CATEGORIES: CategoryMeta[] = [
  { key: 'all', name: '全部篇章', icon: '✨', desc: '纵览古今经典典故、童话寓言、科普探案与时事名篇' },
  { key: 'science', name: '科学解谜', icon: '🔬', desc: 'Bobu外星兔侦探 · 热胀冷缩、光的折射与声波介质' },
  { key: 'history', name: '历史文化', icon: '🏛️', desc: '楚国屈原、千古传统与文脉风华' },
  { key: 'myth', name: '神话故事', icon: '🏮', desc: '年兽降伏、嫦娥奔月、齐天大圣' },
  { key: 'fairy', name: '童话故事', icon: '🦄', desc: '小马过河、实践真知与森林智慧' },
  { key: 'news', name: '新闻时事', icon: '🚀', desc: '神舟飞天、科技强国与太空探索' },
];

export interface SentencePuzzle {
  id: number;
  storyChapterRef?: number;   // 关联绘本章节
  prefix: string;             // 句首文字（故事前半句）
  suffix: string;             // 句尾文字（故事后半句）
  correctWord: string;        // 正确生字/成语
  options: string[];          // 备选卡片
  pinyin: string;
  meaning: string;
  contextLore: string;        // 故事情节与文化拓展
  themeIcon?: string;
  audioPrompt: string;
}

export interface StoryLevel {
  id: string;
  category: StoryCategory;
  chapterNumber: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  theme: string;
  difficulty: '基础必修' | '进阶提升' | '高阶名篇';
  difficultyStars: number; // 1-5星级难度系数 (1-5)
  gradeLevel: string;
  icon: string;
  coverTheme: {
    gradient: string;
    border: string;
    glow: string;
    badgeBg: string;
    badgeText: string;
  };
  summary: string;
  culturalLore: string;
  completion: {
    reading: number;    // 0 - 100
    challenge: number;  // 0 - 100
    writing: number;    // 0 - 100
  };
  targetCharacters: HanziChar[];
  storyParagraphs: StorySentence[];
  soundQuestions: SoundMatchQuestion[];
  radicalGames: RadicalBlockGame[];
  culturalCards: CulturalCard[];
  clozeExercises: ClozeExercise[];
  fillInTheBlank?: ClozeExercise[]; // 第三阶段规范字段：原文字形挖空
  sentenceBuilding?: SentencePuzzle[]; // 第三阶段规范字段：生活情境短句拼接
  sentencePuzzles?: SentencePuzzle[]; // 兼容别名
  essayTemplate: EssayTemplate;
  essayBlocks?: EssayTemplate; // 第三阶段规范字段：400字作文积木
  unlocked: boolean;
  bobuMystery?: {
    question: string;
    options: string[];
    answer: number;
    sciencePrinciple: string;
  };
}

// -------------------------------------------------------------
// STORY 2: 端午屈原与赛龙舟 DATA
// -------------------------------------------------------------
export const STORY_2_TARGET_CHARACTERS: HanziChar[] = [
  {
    id: 'zhou',
    char: '舟',
    pinyin: 'zhōu',
    radical: '舟',
    radicalName: '舟字旁 (船只与水运)',
    components: ['舟'],
    etymology: '象形字。甲骨文像一叶扁舟飘荡在江水之中，本义是水上行进的船只。',
    meaning: '船只；水上交通工具；赛龙舟。',
    mnemonic: '长长船头两边桨，龙舟竞渡水波荡。',
    strokeCount: 6,
    examWords: ['龙舟', '同舟共济', '破釜沉舟', '轻舟已过万重山'],
    exampleSentence: '端午节那天，江面上彩旗招展，数十条彩绘龙舟如飞箭般疾驰。',
    unlocked: true,
  },
  {
    id: 'zong',
    char: '粽',
    pinyin: 'zòng',
    radical: '米',
    radicalName: '米字旁 (粮食谷物)',
    components: ['米', '宗'],
    etymology: '形声字。从米，宗声。古代将黍米用菰叶包裹，煮熟后祭祀祖宗，后演变为了纪念屈原的传统美食。',
    meaning: '粽子，中国端午节传统节庆食物。',
    mnemonic: '白白糯米青箬叶，宗庙祭祀传千秋。',
    strokeCount: 14,
    examWords: ['粽子', '粽叶飘香', '甜粽', '肉粽'],
    exampleSentence: '奶奶亲手包的五彩粽子清香四溢，咬上一口满嘴软糯。',
    unlocked: true,
  },
  {
    id: 'long',
    char: '龙',
    pinyin: 'lóng',
    radical: '龙',
    radicalName: '龙字部 (中华图腾)',
    components: ['龙'],
    etymology: '象形字。古文字形为长身有鳞、头生巨角的祥瑞神兽，是中华民族的精神象征。',
    meaning: '传说中的神灵图腾；象征刚健威武、腾飞进取。',
    mnemonic: '头角峥嵘游云端，画龙点睛展欢颜。',
    strokeCount: 5,
    examWords: ['龙舟', '龙腾虎跃', '生龙活虎', '望子成龙'],
    exampleSentence: '赛龙舟时，敲锣打鼓的划手们个个精神抖擞，如生龙活虎一般。',
    unlocked: true,
  },
  {
    id: 'jiang',
    char: '江',
    pinyin: 'jiāng',
    radical: '氵',
    radicalName: '三点水 (水流波涛)',
    components: ['氵', '工'],
    etymology: '形声字。从水，工声。古代特指长江，后泛指奔流不息的大型河流。',
    meaning: '大河、江河；浩荡流水。',
    mnemonic: '三点浪花拍河岸，百舸争流工匠还。',
    strokeCount: 6,
    examWords: ['长江', '江水', '江河日下', '大江东去'],
    exampleSentence: '碧波荡漾的汨罗江水，见证了爱国诗人屈原的浩然正气。',
    unlocked: true,
  },
  {
    id: 'qu',
    char: '屈',
    pinyin: 'qū',
    radical: '尸',
    radicalName: '尸字头 (身体姿势)',
    components: ['尸', '出'],
    etymology: '会意字。从尸，出声。身体弯折为屈，古代伟大的爱国诗人屈原以此为氏。',
    meaning: '弯曲；委屈；爱国诗人屈原名姓。',
    mnemonic: '尺蠖之屈求伸展，屈原爱国美名传。',
    strokeCount: 8,
    examWords: ['屈原', '不屈不挠', '百折不屈', '屈指可数'],
    exampleSentence: '屈原写下了千古名篇《离骚》，其不屈不挠的爱国气节令人动容。',
    unlocked: true,
  },
  {
    id: 'ai',
    char: '艾',
    pinyin: 'ài',
    radical: '艹',
    radicalName: '草字头 (药用草本)',
    components: ['艹', '乂'],
    etymology: '形声字。从草，乂声。多年生芳香草本植物，端午插艾叶象征驱病辟邪、保佑安康。',
    meaning: '艾草；艾叶；止歇；祈求安宁。',
    mnemonic: '青草剪十字，端午插艾祈安康。',
    strokeCount: 5,
    examWords: ['艾草', '艾叶', '方兴未艾', '艾香'],
    exampleSentence: '端午清晨，母亲在房门两侧插上翠绿的艾草，屋里弥漫着清新的药香。',
    unlocked: true,
  },
];

export const STORY_2_PARAGRAPHS: StorySentence[] = [
  {
    id: 1,
    audioPrompt: '两千多年前的战国时期，楚国有一位伟大的爱国诗人，名叫屈原。他一心想让国家富强，百姓安居乐业。',
    tokens: [
      { char: '两', pinyin: 'liǎng' },
      { char: '千', pinyin: 'qiān' },
      { char: '多', pinyin: 'duō' },
      { char: '年', pinyin: 'nián' },
      { char: '前', pinyin: 'qián' },
      { char: '的', pinyin: 'de' },
      { char: '战', pinyin: 'zhàn' },
      { char: '国', pinyin: 'guó' },
      { char: '时', pinyin: 'shí' },
      { char: '期', pinyin: 'qī' },
      { char: '，', pinyin: '' },
      { char: '楚', pinyin: 'chǔ' },
      { char: '国', pinyin: 'guó' },
      { char: '有', pinyin: 'yǒu' },
      { char: '一', pinyin: 'yī' },
      { char: '位', pinyin: 'wèi' },
      { char: '伟', pinyin: 'wěi' },
      { char: '大', pinyin: 'dà' },
      { char: '的', pinyin: 'de' },
      { char: '爱', pinyin: 'ài' },
      { char: '国', pinyin: 'guó' },
      { char: '诗', pinyin: 'shī' },
      { char: '人', pinyin: 'rén' },
      { char: '，', pinyin: '' },
      { char: '名', pinyin: 'míng' },
      { char: '叫', pinyin: 'jiào' },
      { char: '屈', pinyin: 'qū', isTarget: true, charId: 'qu' },
      { char: '原', pinyin: 'yuán' },
      { char: '。', pinyin: '' },
      { char: '他', pinyin: 'tā' },
      { char: '一', pinyin: 'yī' },
      { char: '心', pinyin: 'xīn' },
      { char: '想', pinyin: 'xiǎng' },
      { char: '让', pinyin: 'ràng' },
      { char: '国', pinyin: 'guó' },
      { char: '家', pinyin: 'jiā' },
      { char: '富', pinyin: 'fù' },
      { char: '强', pinyin: 'qiáng' },
      { char: '，', pinyin: '' },
      { char: '百', pinyin: 'bǎi' },
      { char: '姓', pinyin: 'xìng' },
      { char: '安', pinyin: 'ān' },
      { char: '居', pinyin: 'jū' },
      { char: '乐', pinyin: 'lè' },
      { char: '业', pinyin: 'yè' },
      { char: '。', pinyin: '' },
    ],
  },
  {
    id: 2,
    audioPrompt: '五月初五那天，沿江的百姓听闻屈原投江的消息，纷纷划着轻舟赶去营救，并在江水中投下清香的糯米粽子。',
    tokens: [
      { char: '五', pinyin: 'wǔ' },
      { char: '月', pinyin: 'yuè' },
      { char: '初', pinyin: 'chū' },
      { char: '五', pinyin: 'wǔ' },
      { char: '那', pinyin: 'nà' },
      { char: '天', pinyin: 'tiān' },
      { char: '，', pinyin: '' },
      { char: '沿', pinyin: 'yán' },
      { char: '江', pinyin: 'jiāng', isTarget: true, charId: 'jiang' },
      { char: '的', pinyin: 'de' },
      { char: '百', pinyin: 'bǎi' },
      { char: '姓', pinyin: 'xìng' },
      { char: '听', pinyin: 'tīng' },
      { char: '闻', pinyin: 'wén' },
      { char: '屈', pinyin: 'qū', isTarget: true, charId: 'qu' },
      { char: '原', pinyin: 'yuán' },
      { char: '投', pinyin: 'tóu' },
      { char: '江', pinyin: 'jiāng', isTarget: true, charId: 'jiang' },
      { char: '的', pinyin: 'de' },
      { char: '消', pinyin: 'xiāo' },
      { char: '息', pinyin: 'xī' },
      { char: '，', pinyin: '' },
      { char: '纷', pinyin: 'fēn' },
      { char: '纷', pinyin: 'fēn' },
      { char: '划', pinyin: 'huá' },
      { char: '着', pinyin: 'zhe' },
      { char: '轻', pinyin: 'qīng' },
      { char: '舟', pinyin: 'zhōu', isTarget: true, charId: 'zhou' },
      { char: '赶', pinyin: 'gǎn' },
      { char: '去', pinyin: 'qù' },
      { char: '营', pinyin: 'yíng' },
      { char: '救', pinyin: 'jiù' },
      { char: '，', pinyin: '' },
      { char: '并', pinyin: 'bìng' },
      { char: '在', pinyin: 'zài' },
      { char: '江', pinyin: 'jiāng', isTarget: true, charId: 'jiang' },
      { char: '水', pinyin: 'shuǐ' },
      { char: '中', pinyin: 'zhōng' },
      { char: '投', pinyin: 'tóu' },
      { char: '下', pinyin: 'xià' },
      { char: '清', pinyin: 'qīng' },
      { char: '香', pinyin: 'xiāng' },
      { char: '的', pinyin: 'de' },
      { char: '糯', pinyin: 'nuò' },
      { char: '米', pinyin: 'mǐ' },
      { char: '粽', pinyin: 'zòng', isTarget: true, charId: 'zong' },
      { char: '子', pinyin: 'zǐ' },
      { char: '。', pinyin: '' },
    ],
  },
  {
    id: 3,
    audioPrompt: '从此以后，每到端午佳节，人们便赛龙舟、吃粽子、插艾草，代代相传，铭记中华英雄浩然气魄！',
    tokens: [
      { char: '从', pinyin: 'cóng' },
      { char: '此', pinyin: 'cǐ' },
      { char: '以', pinyin: 'yǐ' },
      { char: '后', pinyin: 'hòu' },
      { char: '，', pinyin: '' },
      { char: '每', pinyin: 'měi' },
      { char: '到', pinyin: 'dào' },
      { char: '端', pinyin: 'duān' },
      { char: '午', pinyin: 'wǔ' },
      { char: '佳', pinyin: 'jiā' },
      { char: '节', pinyin: 'jié' },
      { char: '，', pinyin: '' },
      { char: '人', pinyin: 'rén' },
      { char: '们', pinyin: 'men' },
      { char: '便', pinyin: 'biàn' },
      { char: '赛', pinyin: 'sài' },
      { char: '龙', pinyin: 'lóng', isTarget: true, charId: 'long' },
      { char: '舟', pinyin: 'zhōu', isTarget: true, charId: 'zhou' },
      { char: '、', pinyin: '' },
      { char: '吃', pinyin: 'chī' },
      { char: '粽', pinyin: 'zòng', isTarget: true, charId: 'zong' },
      { char: '子', pinyin: 'zǐ' },
      { char: '、', pinyin: '' },
      { char: '插', pinyin: 'chā' },
      { char: '艾', pinyin: 'ài', isTarget: true, charId: 'ai' },
      { char: '草', pinyin: 'cǎo' },
      { char: '，', pinyin: '' },
      { char: '代', pinyin: 'dài' },
      { char: '代', pinyin: 'dài' },
      { char: '相', pinyin: 'xiāng' },
      { char: '传', pinyin: 'chuán' },
      { char: '，', pinyin: '' },
      { char: '铭', pinyin: 'míng' },
      { char: '记', pinyin: 'jì' },
      { char: '中', pinyin: 'zhōng' },
      { char: '华', pinyin: 'huá' },
      { char: '英', pinyin: 'yīng' },
      { char: '雄', pinyin: 'xióng' },
      { char: '浩', pinyin: 'hào' },
      { char: '然', pinyin: 'rán' },
      { char: '气', pinyin: 'qì' },
      { char: '魄', pinyin: 'pò' },
      { char: '！', pinyin: '' },
    ],
  },
];

export const STORY_2_SOUND_QUESTIONS: SoundMatchQuestion[] = [
  {
    id: 201,
    pinyinPrompt: 'zhōu',
    charToGuess: '舟',
    audioCue: 'zhōu，泛指水面上的船只，赛龙舟的“舟”。',
    meaningHint: '一叶扁舟飘荡水上，水运交通之始。',
    options: ['舟', '州', '周', '昼'],
    correctAnswer: '舟',
    explanation: '“舟”是象形字，两头尖尖像小船；“州”是神州、广州的州；“周”是周全。',
  },
  {
    id: 202,
    pinyinPrompt: 'zòng',
    charToGuess: '粽',
    audioCue: 'zòng，端午节用糯米与青箬叶包裹的节庆美食。',
    meaningHint: '米字旁，包裹香糯大米祭祖先。',
    options: ['粽', '综', '棕', '宗'],
    correctAnswer: '粽',
    explanation: '“粽”从米从宗，指米制裹叶食物；“综”是综合；“棕”是棕榈树。',
  },
  {
    id: 203,
    pinyinPrompt: 'lóng',
    charToGuess: '龙',
    audioCue: 'lóng，中华神兽图腾，龙腾虎跃的“龙”。',
    meaningHint: '头角峥嵘腾飞祥云，龙舟争先。',
    options: ['龙', '尤', '陇', '笼'],
    correctAnswer: '龙',
    explanation: '“龙”为中华图腾神兽，“尤”是尤其，“笼”是鸟笼或灯笼。',
  },
];

export const STORY_2_RADICAL_GAMES: RadicalBlockGame[] = [
  {
    id: 201,
    targetChar: '粽',
    pinyin: 'zòng',
    meaning: '端午节传统美食，香米裹粽叶',
    pieces: [
      { id: 'p1', text: '米', type: 'radical' },
      { id: 'p2', text: '宗', type: 'body' },
    ],
    correctOrder: ['p1', 'p2'],
    formula: '米 (白糯米) + 宗 (祭宗庙) = 粽 (传统五彩节粽)',
    culturalLore: '古人用菰叶裹黏米，煮熟祭祀宗庙祖先，后作为端午寄托爱国思念的文化圣品。',
  },
  {
    id: 202,
    targetChar: '江',
    pinyin: 'jiāng',
    meaning: '浩荡流水，汨罗大江',
    pieces: [
      { id: 'p1', text: '氵', type: 'radical' },
      { id: 'p2', text: '工', type: 'body' },
    ],
    correctOrder: ['p1', 'p2'],
    formula: '氵 (水流奔涌) + 工 (巧夺天工) = 江 (奔流江河)',
    culturalLore: '“江”原专指长江，三点水加上工声，象征浩瀚汹涌、一泻千里的壮丽水系。',
  },
];

export const STORY_2_CLOZE_EXERCISES: ClozeExercise[] = [
  {
    id: 201,
    title: '第一段：江畔竞渡 (口述转文字填空)',
    contextSentence: '五月初五，沿[江]两岸人山人海，数十条彩绘龙[舟]破浪前行，鼓声震天。',
    referenceAudio: '五月初五，沿江两岸人山人海，数十条彩绘龙舟破浪前行，鼓声震天。',
    blanks: [
      {
        index: 0,
        charId: 'jiang',
        correctChar: '江',
        pinyinHint: 'jiāng',
        options: ['江', '河', '水'],
      },
      {
        index: 1,
        charId: 'zhou',
        correctChar: '舟',
        pinyinHint: 'zhōu',
        options: ['舟', '船', '艇'],
      },
    ],
  },
];

export const STORY_2_ESSAY_TEMPLATE: EssayTemplate = {
  title: '《端午粽香与龙舟竞渡》—— 400字小作文积木',
  theme: '传统节日 · 端午节与屈原爱国精神',
  sections: [
    {
      key: 'beginning',
      title: '一、 开头：引出端午背景与粽香扑鼻 (约50字)',
      targetWordCount: '40 - 60字',
      guideline: '点明端午时间（农历五月初五）、家门插艾叶、厨房飘来阵阵糯米清香。',
      starterPrompts: [
        '“节分端午自谁言，万古传闻为屈原。”伴着清脆的蝉鸣，一年一度的端午节如约而至。',
        '五月初五清晨，晨曦微露，家门口早已挂上了青翠的艾草，整间屋子都弥漫着诱人的粽香。',
      ],
      recommendedPhrases: ['一年一度', '粽香扑鼻', '艾草青青', '代代相传'],
      defaultText: '“彩线轻缠红玉臂，小符斜挂绿云鬟。”五月初五清晨，家门口挂上了翠绿的艾草，厨房里飘出沁人心脾的糯米粽香，热闹的端午节到来了。',
    },
    {
      key: 'middle',
      title: '二、 中间：生动叙述赛龙舟与包粽子细节 (约300字)',
      targetWordCount: '280 - 320字',
      guideline: '描写江面龙舟竞渡的紧张激烈、鼓声喧天的场面，以及家人一起包五彩粽子的温馨互动。',
      starterPrompts: [
        '江面上，彩绘龙舟如离弦之箭破水疾驰，健儿们伴着急促的鼓点齐心划桨。',
        '奶奶教我把碧绿的箬叶卷成圆锥形，填入雪白的糯米和甜红枣，再用五色丝线紧紧绑扎。',
      ],
      recommendedPhrases: [
        '百舸争流',
        '鼓声震天',
        '离弦之箭',
        '同舟共济',
        '生龙活虎',
        '爱国情怀',
      ],
      defaultText: '吃过喷香的甜枣粽，全家人兴致勃勃地赶往江边观看龙舟锦标赛。江两岸早已挤满了观赛的百姓，人山人海，欢声雷动！\n\n“咚！咚！咚咚咚！”随着发令锣鼓铿锵敲响，数条威风凛凛的龙舟像出水蛟龙般破浪向前。划手们个个皮肤黝黑、肌肉紧绷，伴着鼓点奋力挥舞木桨，水花如珍珠般飞溅！\n\n岸上的呐喊助威声震耳欲聋，大家都在为运动健儿们加油鼓劲。爸爸为我讲述了爱国诗人屈原的感人故事，让我明白这热闹非凡的龙舟竞渡，不仅是一场力量的角逐，更是对伟大爱国先贤的崇高致敬。',
    },
    {
      key: 'ending',
      title: '三、 结尾：抒发感悟与爱国期盼 (约50字)',
      targetWordCount: '40 - 60字',
      guideline: '抒发对中华传统节日的热爱，感悟屈原矢志不渝的爱国情操。',
      starterPrompts: [
        '江水滔滔，奔流不息。端午的粽香与龙舟的呐喊，将深深烙印在我的童年记忆里。',
        '这个端午节，不仅让我品尝到了美味的粽子，更让我深刻懂得了爱国与坚守的真正含义。',
      ],
      recommendedPhrases: ['铭记历史', '浩气长存', '爱国情怀', '生生不息'],
      defaultText: '夕阳西下，江面泛着金色的波光。这个端午节不仅有清香四溢的粽子，更有屈原爷爷那浩然正气的爱国精神，深深鼓舞着我奋发向前！',
    },
  ],
};

// -------------------------------------------------------------
// STORY 3: 中秋明月与嫦娥 DATA
// -------------------------------------------------------------
export const STORY_3_TARGET_CHARACTERS: HanziChar[] = [
  {
    id: 'yue',
    char: '月',
    pinyin: 'yuè',
    radical: '月',
    radicalName: '月字旁 (月光与夜空)',
    components: ['月'],
    etymology: '象形字。古文字形为弯弯的新月之形，象征夜空中的皎洁明月与团圆。',
    meaning: '月亮、月球；月份；团圆。',
    mnemonic: '一弯新月挂夜空，洒向人间都是情。',
    strokeCount: 4,
    examWords: ['明月', '月亮', '花好月圆', '海底捞月', '日新月异'],
    exampleSentence: '中秋节的夜晚，银白色的月光洒满了静谧的小院。',
    unlocked: true,
  },
  {
    id: 'bing',
    char: '饼',
    pinyin: 'bǐng',
    radical: '饣',
    radicalName: '食字旁 (美食糕点)',
    components: ['饣', '并'],
    etymology: '形声字。从饣，并声。古代泛指烤制或烘焙的面食，中秋月饼象征阖家团圆。',
    meaning: '圆形面制糕点；中秋月饼。',
    mnemonic: '食字身旁两并立，圆圆月饼甜如蜜。',
    strokeCount: 9,
    examWords: ['月饼', '馅饼', '金饼', '画饼充饥'],
    exampleSentence: '全家人围坐在一起，细细品尝着豆沙蛋黄馅的香甜月饼。',
    unlocked: true,
  },
  {
    id: 'yuan',
    char: '圆',
    pinyin: 'yuán',
    radical: '囗',
    radicalName: '大口框 (周全完满)',
    components: ['囗', '员'],
    etymology: '形声字。从囗，员声。本义为圆形、完满，寓意亲人相聚、幸福团圆。',
    meaning: '圆形；圆满、团聚；达成心愿。',
    mnemonic: '四面围起大方框，里面团员聚满堂。',
    strokeCount: 10,
    examWords: ['团圆', '圆月', '圆满', '破镜重圆', '字正腔圆'],
    exampleSentence: '但愿人长久，千里共婵娟，期盼天下所有家庭幸福团圆。',
    unlocked: true,
  },
  {
    id: 'gui',
    char: '桂',
    pinyin: 'guì',
    radical: '木',
    radicalName: '木字旁 (草木芬芳)',
    components: ['木', '圭'],
    etymology: '形声字。从木，圭声。常绿乔木，秋季盛开香气袭人的金色桂花，传说月宫中有吴刚伐桂。',
    meaning: '桂树、桂花；象征高贵洁雅。',
    mnemonic: '木旁圭玉香千里，吴刚捧出桂花酒。',
    strokeCount: 10,
    examWords: ['桂花', '桂树', '蟾宫折桂', '十里桂香'],
    exampleSentence: '秋风送爽，庭院里的一树金桂散发着沁人心脾的芬芳。',
    unlocked: true,
  },
];

export const STORY_3_PARAGRAPHS: StorySentence[] = [
  {
    id: 1,
    audioPrompt: '农历八月十五是一年一度的中秋佳节。古老的传说中，美丽的嫦娥怀抱着雪白的玉兔，飞向了清冷圣洁的月宫。',
    tokens: [
      { char: '农', pinyin: 'nóng' },
      { char: '历', pinyin: 'lì' },
      { char: '八', pinyin: 'bā' },
      { char: '月', pinyin: 'yuè', isTarget: true, charId: 'yue' },
      { char: '十', pinyin: 'shí' },
      { char: '五', pinyin: 'wǔ' },
      { char: '是', pinyin: 'shì' },
      { char: '一', pinyin: 'yī' },
      { char: '年', pinyin: 'nián' },
      { char: '一', pinyin: 'yī' },
      { char: '度', pinyin: 'dù' },
      { char: '的', pinyin: 'de' },
      { char: '中', pinyin: 'zhōng' },
      { char: '秋', pinyin: 'qiū' },
      { char: '佳', pinyin: 'jiā' },
      { char: '节', pinyin: 'jié' },
      { char: '。', pinyin: '' },
      { char: '古', pinyin: 'gǔ' },
      { char: '老', pinyin: 'lǎo' },
      { char: '的', pinyin: 'de' },
      { char: '传', pinyin: 'chuán' },
      { char: '说', pinyin: 'shuō' },
      { char: '中', pinyin: 'zhōng' },
      { char: '，', pinyin: '' },
      { char: '美', pinyin: 'měi' },
      { char: '丽', pinyin: 'lì' },
      { char: '的', pinyin: 'de' },
      { char: '嫦', pinyin: 'cháng' },
      { char: '娥', pinyin: 'é' },
      { char: '怀', pinyin: 'huái' },
      { char: '抱', pinyin: 'bào' },
      { char: '着', pinyin: 'zhe' },
      { char: '雪', pinyin: 'xuě' },
      { char: '白', pinyin: 'bái' },
      { char: '的', pinyin: 'de' },
      { char: '玉', pinyin: 'yù' },
      { char: '兔', pinyin: 'tù' },
      { char: '，', pinyin: '' },
      { char: '飞', pinyin: 'fēi' },
      { char: '向', pinyin: 'xiàng' },
      { char: '了', pinyin: 'le' },
      { char: '清', pinyin: 'qīng' },
      { char: '冷', pinyin: 'lěng' },
      { char: '圣', pinyin: 'shèng' },
      { char: '洁', pinyin: 'jié' },
      { char: '的', pinyin: 'de' },
      { char: '月', pinyin: 'yuè', isTarget: true, charId: 'yue' },
      { char: '宫', pinyin: 'gōng' },
      { char: '。', pinyin: '' },
    ],
  },
  {
    id: 2,
    audioPrompt: '中秋之夜，皎洁的圆月挂在天空，宛如一面晶莹透亮的明镜。院子里的金桂盛开，香飘十里。',
    tokens: [
      { char: '中', pinyin: 'zhōng' },
      { char: '秋', pinyin: 'qiū' },
      { char: '之', pinyin: 'zhī' },
      { char: '夜', pinyin: 'yè' },
      { char: '，', pinyin: '' },
      { char: '皎', pinyin: 'jiǎo' },
      { char: '洁', pinyin: 'jié' },
      { char: '的', pinyin: 'de' },
      { char: '圆', pinyin: 'yuán', isTarget: true, charId: 'yuan' },
      { char: '月', pinyin: 'yuè', isTarget: true, charId: 'yue' },
      { char: '挂', pinyin: 'guà' },
      { char: '在', pinyin: 'zài' },
      { char: '天', pinyin: 'tiān' },
      { char: '空', pinyin: 'kōng' },
      { char: '，', pinyin: '' },
      { char: '宛', pinyin: 'wǎn' },
      { char: '如', pinyin: 'rú' },
      { char: '一', pinyin: 'yī' },
      { char: '面', pinyin: 'miàn' },
      { char: '晶', pinyin: 'jīng' },
      { char: '莹', pinyin: 'yíng' },
      { char: '透', pinyin: 'tòu' },
      { char: '亮', pinyin: 'liàng' },
      { char: '的', pinyin: 'de' },
      { char: '明', pinyin: 'míng' },
      { char: '镜', pinyin: 'jìng' },
      { char: '。', pinyin: '' },
      { char: '院', pinyin: 'yuàn' },
      { char: '子', pinyin: 'zi' },
      { char: '里', pinyin: 'lǐ' },
      { char: '的', pinyin: 'de' },
      { char: '金', pinyin: 'jīn' },
      { char: '桂', pinyin: 'guì', isTarget: true, charId: 'gui' },
      { char: '盛', pinyin: 'shèng' },
      { char: '开', pinyin: 'kāi' },
      { char: '，', pinyin: '' },
      { char: '香', pinyin: 'xiāng' },
      { char: '飘', pinyin: 'piāo' },
      { char: '十', pinyin: 'shí' },
      { char: '里', pinyin: 'lǐ' },
      { char: '。', pinyin: '' },
    ],
  },
  {
    id: 3,
    audioPrompt: '一家人团聚在月光下，分吃着香甜的月饼，共叙亲情，寄托着人月两团圆的美好心愿。',
    tokens: [
      { char: '一', pinyin: 'yī' },
      { char: '家', pinyin: 'jiā' },
      { char: '人', pinyin: 'rén' },
      { char: '团', pinyin: 'tuán' },
      { char: '聚', pinyin: 'jù' },
      { char: '在', pinyin: 'zài' },
      { char: '月', pinyin: 'yuè', isTarget: true, charId: 'yue' },
      { char: '光', pinyin: 'guāng' },
      { char: '下', pinyin: 'xià' },
      { char: '，', pinyin: '' },
      { char: '分', pinyin: 'fēn' },
      { char: '吃', pinyin: 'chī' },
      { char: '着', pinyin: 'zhe' },
      { char: '香', pinyin: 'xiāng' },
      { char: '甜', pinyin: 'tián' },
      { char: '的', pinyin: 'de' },
      { char: '月', pinyin: 'yuè', isTarget: true, charId: 'yue' },
      { char: '饼', pinyin: 'bǐng', isTarget: true, charId: 'bing' },
      { char: '，', pinyin: '' },
      { char: '共', pinyin: 'gòng' },
      { char: '叙', pinyin: 'xù' },
      { char: '亲', pinyin: 'qīn' },
      { char: '情', pinyin: 'qíng' },
      { char: '，', pinyin: '' },
      { char: '寄', pinyin: 'jì' },
      { char: '托', pinyin: 'tuō' },
      { char: '着', pinyin: 'zhe' },
      { char: '人', pinyin: 'rén' },
      { char: '月', pinyin: 'yuè', isTarget: true, charId: 'yue' },
      { char: '两', pinyin: 'liǎng' },
      { char: '团', pinyin: 'tuán' },
      { char: '圆', pinyin: 'yuán', isTarget: true, charId: 'yuan' },
      { char: '的', pinyin: 'de' },
      { char: '美', pinyin: 'měi' },
      { char: '好', pinyin: 'hǎo' },
      { char: '心', pinyin: 'xīn' },
      { char: '愿', pinyin: 'yuàn' },
      { char: '。', pinyin: '' },
    ],
  },
];

export const STORY_3_SOUND_QUESTIONS: SoundMatchQuestion[] = [
  {
    id: 301,
    pinyinPrompt: 'yuán',
    charToGuess: '圆',
    audioCue: 'yuán，象征中秋花好月圆、阖家团圆的“圆”。',
    meaningHint: '大口框中包人员，团团圆圆无缺欠。',
    options: ['圆', '园', '源', '员'],
    correctAnswer: '圆',
    explanation: '“圆”是团圆、圆满；“园”是花园、校园；“源”是源头。',
  },
  {
    id: 302,
    pinyinPrompt: 'bǐng',
    charToGuess: '饼',
    audioCue: 'bǐng，中秋节必备传统面点，香甜月饼的“饼”。',
    meaningHint: '饣字旁，面制烘烤食品。',
    options: ['饼', '并', '屏', '瓶'],
    correctAnswer: '饼',
    explanation: '“饼”是面制糕饼；“并”是并且；“屏”是屏幕。',
  },
];

export const STORY_3_RADICAL_GAMES: RadicalBlockGame[] = [
  {
    id: 301,
    targetChar: '饼',
    pinyin: 'bǐng',
    meaning: '圆形面点，中秋月饼',
    pieces: [
      { id: 'p1', text: '饣', type: 'radical' },
      { id: 'p2', text: '并', type: 'body' },
    ],
    correctOrder: ['p1', 'p2'],
    formula: '饣 (粮食面点) + 并 (并肩相聚) = 饼 (团圆月饼)',
    culturalLore: '自宋代起，人们在中秋之夜吃圆如满月的月饼，象征阖家和睦与美满团圆。',
  },
];

export const STORY_3_CLOZE_EXERCISES: ClozeExercise[] = [
  {
    id: 301,
    title: '第一段：月下团圆 (口述转文字填空)',
    contextSentence: '八月十五夜，一轮皎洁的[圆][月]升上高空，全家人围坐在一起吃香甜的月[饼]。',
    referenceAudio: '八月十五夜，一轮皎洁的圆月升上高空，全家人围坐在一起吃香甜的月饼。',
    blanks: [
      {
        index: 0,
        charId: 'yuan',
        correctChar: '圆',
        pinyinHint: 'yuán',
        options: ['圆', '方', '正'],
      },
      {
        index: 1,
        charId: 'yue',
        correctChar: '月',
        pinyinHint: 'yuè',
        options: ['月', '日', '星'],
      },
      {
        index: 2,
        charId: 'bing',
        correctChar: '饼',
        pinyinHint: 'bǐng',
        options: ['饼', '糕', '糖'],
      },
    ],
  },
];

export const STORY_3_ESSAY_TEMPLATE: EssayTemplate = {
  title: '《中秋月圆人团圆》—— 400字小作文积木',
  theme: '传统节日 · 中秋佳节与亲情团圆',
  sections: [
    {
      key: 'beginning',
      title: '一、 开头：引出中秋月夜与桂花飘香 (约50字)',
      targetWordCount: '40 - 60字',
      guideline: '描写八月十五夜幕降临，院中丹桂飘香，银盘般的明月缓缓升起。',
      starterPrompts: [
        '“暮云收尽溢清寒，银汉无声转玉盘。”农历八月十五的夜晚，金风送爽，月满人间。',
        '夜幕刚刚降下，一轮皎洁无瑕的明月便跃上了柳梢头，庭院里弥漫着清雅的桂花芬芳。',
      ],
      recommendedPhrases: ['金风送爽', '花好月圆', '丹桂飘香', '阖家团圆'],
      defaultText: '“但愿人长久，千里共婵娟。”农历八月十五中秋夜，银盘般的圆月静静挂在夜幕中，如水的月光洒满庭院，四处飘散着金桂的清香。',
    },
    {
      key: 'middle',
      title: '二、 中间：生动叙述赏月、吃月饼与神话传说 (约300字)',
      targetWordCount: '280 - 320字',
      guideline: '详细描写全家围坐石桌旁赏月、品尝不同风味的月饼，长辈讲述嫦娥奔月、吴刚伐桂的神话故事。',
      starterPrompts: [
        '石桌上摆满了晶莹剔透的水果与印着精美花纹的苏式、广式月饼。',
        '奶奶指着月亮里的阴影，娓娓道来嫦娥奔月和玉兔捣药的千古传说。',
      ],
      recommendedPhrases: [
        '晶莹剔透',
        '回味悠长',
        '嫦娥奔月',
        '情深意浓',
        '欢声笑语',
        '温馨美满',
      ],
      defaultText: '一家人围坐在小院的石桌旁，桌上整整齐齐地摆放着葡萄、石榴和金黄油亮的各色月饼。爸爸拿起切刀，把象征团圆的大月饼切成整齐的八等份，分给长辈和我们。\n\n我咬了一口蛋黄豆沙月饼，外皮酥松香脆，红豆沙细腻微甜，油润的咸蛋黄咸香可口，真是让人回味无穷！奶奶笑盈盈地指着月亮上的淡淡暗影，轻声说：“看，那是广寒宫里的桂树，嫦娥正抱着温顺的玉兔遥望人间呢。”\n\n微风吹拂，庭院里的金桂摇曳生姿。大家吃着香甜的月饼，说说笑笑，温馨的笑声随着银色的月光一同飘向远方。',
    },
    {
      key: 'ending',
      title: '三、 结尾：抒发对亲情与团圆的美好祝福 (约50字)',
      targetWordCount: '40 - 60字',
      guideline: '抒发对家庭团圆的感恩，送上对远方亲人及所有人的美好祝愿。',
      starterPrompts: [
        '月光洒在每个人的笑脸上，温暖了整个夜晚。愿岁岁年年，常聚常欢！',
        '这个中秋夜，明月印在我心头，让我深刻感受到亲情相聚是最珍贵的幸福。',
      ],
      recommendedPhrases: ['平安喜乐', '常聚常欢', '人月两圆', '幸福美满'],
      defaultText: '抬头仰望那轮皎洁的满月，我默默许下心愿：愿天下所有相亲相爱的人，都能平安喜乐、花好月圆，共享人世间的幸福与温暖！',
    },
  ],
};

// -------------------------------------------------------------
// MASTER STORY LEVELS ARRAY
// -------------------------------------------------------------
// -------------------------------------------------------------
// STORY 4: 小马过河与大森林 DATA (FAIRY)
// -------------------------------------------------------------
export const STORY_4_TARGET_CHARACTERS: HanziChar[] = [
  {
    id: 'ma',
    char: '马',
    pinyin: 'mǎ',
    radical: '马',
    radicalName: '马字旁 (骏马与奔腾)',
    components: ['马'],
    etymology: '象形字。甲骨文像昂首长鬃、四蹄奔腾的骏马，本义为善跑之兽。',
    meaning: '马匹；骏马；敏捷；勇敢实践。',
    mnemonic: '长鬃飘拂四蹄扬，日行千里过重洋。',
    strokeCount: 3,
    examWords: ['小马', '奔马', '马到成功', '千军万马', '快马加鞭'],
    exampleSentence: '懂事的小马驮着半口袋麦子，高高兴兴地往磨坊跑去。',
    unlocked: true,
  },
  {
    id: 'shen',
    char: '深',
    pinyin: 'shēn',
    radical: '氵',
    radicalName: '三点水 (水之深度)',
    components: ['氵', '冖', '木'],
    etymology: '形声字。从水，罙声。本义为水面到底部的距离大，引申为深刻、精深。',
    meaning: '从表面到底部距离大；深刻；久远。',
    mnemonic: '三点浪花木上探，深思熟虑知艰难。',
    strokeCount: 11,
    examWords: ['深浅', '深渊', '深思熟虑', '博大精深'],
    exampleSentence: '小松鼠认真地说：“河水深得很哩！昨天我的同伴掉下去淹死了！”',
    unlocked: true,
  },
  {
    id: 'qian',
    char: '浅',
    pinyin: 'qiǎn',
    radical: '氵',
    radicalName: '三点水 (水之浅显)',
    components: ['氵', '戋'],
    etymology: '形声字。从水，戋声。水浅不足以没顶，引申为浅显、初步。',
    meaning: '水不深；知识经验浅薄；浅色。',
    mnemonic: '三点水旁少许滴，河水刚刚没小蹄。',
    strokeCount: 8,
    examWords: ['浅水', '浅显', '搁浅', '由浅入深'],
    exampleSentence: '老牛伯伯甩甩尾巴说：“水很浅，刚没小腿，能趟过去。”',
    unlocked: true,
  },
  {
    id: 'shi',
    char: '试',
    pinyin: 'shì',
    radical: '讠',
    radicalName: '言字旁 (言语与验证)',
    components: ['讠', '式'],
    etymology: '形声字。从言，式声。按照法度考察验证，引申为试验、亲自尝试。',
    meaning: '尝试；试验；考试；实践出真知。',
    mnemonic: '言语立下规范式，大胆尝试方知底。',
    strokeCount: 8,
    examWords: ['尝试', '试验', '屡试不爽', '实践'],
    exampleSentence: '妈妈温和地对小马说：“光听别人说不行，要去亲自试一试。”',
    unlocked: true,
  },
];

export const STORY_4_PARAGRAPHS: StorySentence[] = [
  {
    id: 1,
    audioPrompt: '阳光明媚的早晨，小马驮着沉甸甸的麦子，蹦蹦跳跳地跑向磨坊。一条清澈见底的哗哗流水挡住了去路。',
    tokens: [
      { char: '阳', pinyin: 'yáng' },
      { char: '光', pinyin: 'guāng' },
      { char: '明', pinyin: 'míng' },
      { char: '媚', pinyin: 'mèi' },
      { char: '的', pinyin: 'de' },
      { char: '早', pinyin: 'zǎo' },
      { char: '晨', pinyin: 'chén' },
      { char: '，', pinyin: '' },
      { char: '小', pinyin: 'xiǎo' },
      { char: '马', pinyin: 'mǎ', isTarget: true, charId: 'ma' },
      { char: '驮', pinyin: 'tuó' },
      { char: '着', pinyin: 'zhe' },
      { char: '麦', pinyin: 'mài' },
      { char: '子', pinyin: 'zi' },
      { char: '跑', pinyin: 'pǎo' },
      { char: '向', pinyin: 'xiàng' },
      { char: '磨', pinyin: 'mó' },
      { char: '坊', pinyin: 'fáng' },
      { char: '。', pinyin: '' },
    ],
  },
  {
    id: 2,
    audioPrompt: '老牛伯伯说水很浅刚没小腿，小松鼠却急忙大喊水很深会淹死。小马拿不定主意，只好掉头回家请教妈妈。',
    tokens: [
      { char: '老', pinyin: 'lǎo' },
      { char: '牛', pinyin: 'niú' },
      { char: '说', pinyin: 'shuō' },
      { char: '水', pinyin: 'shuǐ' },
      { char: '很', pinyin: 'hěn' },
      { char: '浅', pinyin: 'qiǎn', isTarget: true, charId: 'qian' },
      { char: '，', pinyin: '' },
      { char: '松', pinyin: 'sōng' },
      { char: '鼠', pinyin: 'shǔ' },
      { char: '却', pinyin: 'què' },
      { char: '喊', pinyin: 'hǎn' },
      { char: '水', pinyin: 'shuǐ' },
      { char: '很', pinyin: 'hěn' },
      { char: '深', pinyin: 'shēn', isTarget: true, charId: 'shen' },
      { char: '。', pinyin: '' },
      { char: '小', pinyin: 'xiǎo' },
      { char: '马', pinyin: 'mǎ', isTarget: true, charId: 'ma' },
      { char: '只', pinyin: 'zhǐ' },
      { char: '好', pinyin: 'hǎo' },
      { char: '回', pinyin: 'huí' },
      { char: '家', pinyin: 'jiā' },
      { char: '问', pinyin: 'wèn' },
      { char: '妈', pinyin: 'mā' },
      { char: '妈', pinyin: 'mā' },
      { char: '。', pinyin: '' },
    ],
  },
  {
    id: 3,
    audioPrompt: '妈妈亲切地勉励小马：只有自己下水大胆试一试，才能知道河水的真正深浅。实践才能出真知！',
    tokens: [
      { char: '妈', pinyin: 'mā' },
      { char: '妈', pinyin: 'mā' },
      { char: '说', pinyin: 'shuō' },
      { char: '：', pinyin: '' },
      { char: '大', pinyin: 'dà' },
      { char: '胆', pinyin: 'dǎn' },
      { char: '试', pinyin: 'shì', isTarget: true, charId: 'shi' },
      { char: '一', pinyin: 'yī' },
      { char: '试', pinyin: 'shì', isTarget: true, charId: 'shi' },
      { char: '，', pinyin: '' },
      { char: '实', pinyin: 'shí' },
      { char: '践', pinyin: 'jiàn' },
      { char: '才', pinyin: 'cái' },
      { char: '能', pinyin: 'néng' },
      { char: '出', pinyin: 'chū' },
      { char: '真', pinyin: 'zhēn' },
      { char: '知', pinyin: 'zhī' },
      { char: '！', pinyin: '' },
    ],
  },
];

// -------------------------------------------------------------
// STORY 5: 神舟十九号筑梦苍穹 DATA (NEWS)
// -------------------------------------------------------------
export const STORY_5_TARGET_CHARACTERS: HanziChar[] = [
  {
    id: 'hang',
    char: '航',
    pinyin: 'háng',
    radical: '舟',
    radicalName: '舟字旁 (舟行万里与星汉)',
    components: ['舟', '亢'],
    etymology: '形声字。从舟，亢声。古指船行水上，今指人类驾驶航天器傲游太空、探索宇宙。',
    meaning: '船只或飞机航天器在水中或空中飞行；航天。',
    mnemonic: '一叶轻舟上九重，载人航天傲苍穹。',
    strokeCount: 10,
    examWords: ['航天', '航行', '宇航员', '领航', '扬帆起航'],
    exampleSentence: '三名中国航天员搭载神舟十九号飞船顺利进驻天宫空间站。',
    unlocked: true,
  },
  {
    id: 'yu',
    char: '宇',
    pinyin: 'yǔ',
    radical: '宀',
    radicalName: '宝盖头 (广袤天地)',
    components: ['宀', '于'],
    etymology: '形声字。古代四方上下为“宇”，古往今来为“宙”，宇宙代表无垠空间与无限时间。',
    meaning: '上下四方的无限空间；风度；屋檐。',
    mnemonic: '宝盖高悬覆四方，浩瀚宇宙耀光芒。',
    strokeCount: 6,
    examWords: ['宇宙', '宇航', '气宇轩昂', '器宇不凡'],
    exampleSentence: '浩瀚的宇宙星光灿烂，见证着中国人飞天揽月的伟大梦想。',
    unlocked: true,
  },
  {
    id: 'xing',
    char: '星',
    pinyin: 'xīng',
    radical: '日',
    radicalName: '日字头 (日月星辰)',
    components: ['日', '生'],
    etymology: '形声字。从日，生声。夜空中闪耀发光的天体，象征希望、卓越与光芒。',
    meaning: '恒星、行星；星空；闪耀的光芒。',
    mnemonic: '日光普照生星宿，北斗导航耀九州。',
    strokeCount: 9,
    examWords: ['星空', '卫星', '星汉灿烂', '披星戴月', '灿若繁星'],
    exampleSentence: '仰望漫天繁星，中国空间站如同一颗璀璨的明珠掠过天际。',
    unlocked: true,
  },
];

export const STORY_5_PARAGRAPHS: StorySentence[] = [
  {
    id: 1,
    audioPrompt: '酒泉卫星发射中心，大漠长风，烈焰奔腾。长征火箭托举着神舟十九号飞船冲入云霄，开启了探索太空的新征途。',
    tokens: [
      { char: '长', pinyin: 'cháng' },
      { char: '征', pinyin: 'zhēng' },
      { char: '火', pinyin: 'huǒ' },
      { char: '箭', pinyin: 'jiàn' },
      { char: '划', pinyin: 'huà' },
      { char: '破', pinyin: 'pò' },
      { char: '星', pinyin: 'xīng', isTarget: true, charId: 'xing' },
      { char: '空', pinyin: 'kōng' },
      { char: '，', pinyin: '' },
      { char: '神', pinyin: 'shén' },
      { char: '舟', pinyin: 'zhōu' },
      { char: '飞', pinyin: 'fēi' },
      { char: '天', pinyin: 'tiān' },
      { char: '！', pinyin: '' },
    ],
  },
  {
    id: 2,
    audioPrompt: '中国航天员乘组顺利入驻天宫空间站，在浩瀚宇宙中展开精彩纷呈的科学探索，让中华民族的科技强国梦想照耀星汉。',
    tokens: [
      { char: '航', pinyin: 'háng', isTarget: true, charId: 'hang' },
      { char: '天', pinyin: 'tiān' },
      { char: '员', pinyin: 'yuán' },
      { char: '进', pinyin: 'jìn' },
      { char: '驻', pinyin: 'zhù' },
      { char: '天', pinyin: 'tiān' },
      { char: '宫', pinyin: 'gōng' },
      { char: '，', pinyin: '' },
      { char: '宇', pinyin: 'yǔ', isTarget: true, charId: 'yu' },
      { char: '宙', pinyin: 'zhòu' },
      { char: '漫', pinyin: 'màn' },
      { char: '步', pinyin: 'bù' },
      { char: '筑', pinyin: 'zhù' },
      { char: '梦', pinyin: 'mèng' },
      { char: '强', pinyin: 'qiáng' },
      { char: '国', pinyin: 'guó' },
      { char: '。', pinyin: '' },
    ],
  },
];

// -------------------------------------------------------------
// STORY 4 SOUND QUESTIONS & RADICAL GAMES
// -------------------------------------------------------------
export const STORY_4_SOUND_QUESTIONS: SoundMatchQuestion[] = [
  {
    id: 401,
    pinyinPrompt: 'mǎ',
    charToGuess: '马',
    audioCue: 'mǎ，骏马奔腾、小马过河的“马”。',
    meaningHint: '四蹄奔腾、善跑敏捷，中华传统生肖之一。',
    options: ['马', '鸟', '乌', '妈'],
    correctAnswer: '马',
    explanation: '“马”是象形字，昂首扬鬃四蹄健；“鸟”有一点为鸟睛；“乌”无点为黑色。',
  },
  {
    id: 402,
    pinyinPrompt: 'shēn',
    charToGuess: '深',
    audioCue: 'shēn，水流渊深、深思熟虑的“深”。',
    meaningHint: '三点水旁，从表面到底部距离大。',
    options: ['深', '浅', '探', '沉'],
    correctAnswer: '深',
    explanation: '“深”从水罙声，指水深或深刻；松鼠误以为水深会淹死小马。',
  },
  {
    id: 403,
    pinyinPrompt: 'qiǎn',
    charToGuess: '浅',
    audioCue: 'qiǎn，河水浅显、由浅入深的“浅”。',
    meaningHint: '三点水旁，水不深，老牛说刚没小腿。',
    options: ['浅', '钱', '线', '残'],
    correctAnswer: '浅',
    explanation: '“浅”从水戋声，代表水浅或浅显；“钱”从金为金钱。',
  },
  {
    id: 404,
    pinyinPrompt: 'shì',
    charToGuess: '试',
    audioCue: 'shì，大胆尝试、亲自试一试的“试”。',
    meaningHint: '言字旁加式，亲自下水检验实践。',
    options: ['试', '式', '拭', '弑'],
    correctAnswer: '试',
    explanation: '“试”从言从式，言语立式去考核尝试；“拭”是擦拭；“式”是方式。',
  },
];

export const STORY_4_RADICAL_GAMES: RadicalBlockGame[] = [
  {
    id: 401,
    targetChar: '深',
    pinyin: 'shēn',
    meaning: '河水很深，深思熟虑',
    pieces: [
      { id: 'p1', text: '氵', type: 'radical' },
      { id: 'p2', text: '罙', type: 'body' },
    ],
    correctOrder: ['p1', 'p2'],
    formula: '氵 (流水波纹) + 罙 (深远探索) = 深 (水流渊深)',
    culturalLore: '三点水加上探索的罙部，寓意深入探索、躬行求证。',
  },
  {
    id: 402,
    targetChar: '浅',
    pinyin: 'qiǎn',
    meaning: '水流不深，刚没脚踝',
    pieces: [
      { id: 'p1', text: '氵', type: 'radical' },
      { id: 'p2', text: '戋', type: 'body' },
    ],
    correctOrder: ['p1', 'p2'],
    formula: '氵 (涓涓细流) + 戋 (微细少许) = 浅 (水浅显露)',
    culturalLore: '“浅”字右部的“戋”表示微少，水少则浅，实践方知真水情。',
  },
  {
    id: 403,
    targetChar: '试',
    pinyin: 'shì',
    meaning: '勇敢尝试，实践求真',
    pieces: [
      { id: 'p1', text: '讠', type: 'radical' },
      { id: 'p2', text: '式', type: 'body' },
    ],
    correctOrder: ['p1', 'p2'],
    formula: '讠 (言语立规) + 式 (法则模式) = 试 (大胆试验)',
    culturalLore: '光听别人说无法得知真相，唯有亲自试一试，实践才能出真知！',
  },
];

// -------------------------------------------------------------
// STORY 5 SOUND QUESTIONS & RADICAL GAMES
// -------------------------------------------------------------
export const STORY_5_SOUND_QUESTIONS: SoundMatchQuestion[] = [
  {
    id: 501,
    pinyinPrompt: 'háng',
    charToGuess: '航',
    audioCue: 'háng，扬帆起航、载人航天的“航”。',
    meaningHint: '舟字旁加亢，一叶飞舟傲游九天。',
    options: ['航', '舟', '抗', '坑'],
    correctAnswer: '航',
    explanation: '“航”从舟亢声，古指船行水上，今指飞船遨游浩瀚太空。',
  },
  {
    id: 502,
    pinyinPrompt: 'yǔ',
    charToGuess: '宇',
    audioCue: 'yǔ，浩瀚宇宙、器宇轩昂的“宇”。',
    meaningHint: '宝盖头，上下四方无垠之空间。',
    options: ['宇', '于', '字', '安'],
    correctAnswer: '宇',
    explanation: '四方上下为“宇”，古往今来为“宙”；“宇”代表无垠的苍穹空间。',
  },
  {
    id: 503,
    pinyinPrompt: 'xīng',
    charToGuess: '星',
    audioCue: 'xīng，繁星璀璨、神舟星空的“星”。',
    meaningHint: '日字头下加生，夜空闪烁之天体。',
    options: ['星', '生', '晶', '醒'],
    correctAnswer: '星',
    explanation: '“星”从日从生，象征太空闪耀的恒星与希望。',
  },
];

export const STORY_5_RADICAL_GAMES: RadicalBlockGame[] = [
  {
    id: 501,
    targetChar: '航',
    pinyin: 'háng',
    meaning: '飞船航行，载人航天',
    pieces: [
      { id: 'p1', text: '舟', type: 'radical' },
      { id: 'p2', text: '亢', type: 'body' },
    ],
    correctOrder: ['p1', 'p2'],
    formula: '舟 (轻舟天河) + 亢 (高昂挺拔) = 航 (飞天远航)',
    culturalLore: '中华民族的航天梦想跨越千年，神舟飞船在星汉中平稳领航。',
  },
  {
    id: 502,
    targetChar: '宇',
    pinyin: 'yǔ',
    meaning: '浩瀚宇宙，无垠空间',
    pieces: [
      { id: 'p1', text: '宀', type: 'radical' },
      { id: 'p2', text: '于', type: 'body' },
    ],
    correctOrder: ['p1', 'p2'],
    formula: '宀 (宝盖苍穹) + 于 (广阔无边) = 宇 (浩瀚宇宙)',
    culturalLore: '古人说“上下四方为宇，往古来今为宙”，体现了中国人博大的时空宇宙观。',
  },
  {
    id: 503,
    targetChar: '星',
    pinyin: 'xīng',
    meaning: '夜空繁星，北斗明珠',
    pieces: [
      { id: 'p1', text: '日', type: 'radical' },
      { id: 'p2', text: '生', type: 'body' },
    ],
    correctOrder: ['p1', 'p2'],
    formula: '日 (光明普照) + 生 (欣欣向荣) = 星 (群星璀璨)',
    culturalLore: '“星”字将太阳之光与生命生发相连，茫茫夜空中繁星闪耀，指引前路。',
  },
];

export const STORY_1_SENTENCE_PUZZLES: SentencePuzzle[] = [
  {
    id: 1,
    storyChapterRef: 2,
    prefix: '村民们在大门上挂起',
    suffix: '的灯笼，终于吓退了凶猛的年兽。',
    correctWord: '红彤彤',
    options: ['红彤彤', '绿油油', '黑漆漆', '静悄悄'],
    pinyin: 'hóng tōng tōng',
    meaning: '形容非常红的样子，象征吉祥喜庆。',
    contextLore: '年兽最怕火光与红色，红彤彤的灯笼是除夕避邪的宝物。',
    themeIcon: '🏮',
    audioPrompt: '村民们在大门上挂起红彤彤的灯笼，终于吓退了凶猛的年兽。',
  },
  {
    id: 2,
    storyChapterRef: 3,
    prefix: '除夕之夜，院子里燃烧的竹节发出',
    suffix: '的爆裂声，吓得年兽抱头鼠窜。',
    correctWord: '震耳欲聋',
    options: ['震耳欲聋', '轻声细语', '悄无声息', '无影无踪'],
    pinyin: 'zhèn ěr yù lóng',
    meaning: '形容声音极大，几乎要把耳朵震聋。',
    contextLore: '竹节在烈火中炸裂发出巨响，正是后世除夕燃放“爆竹”驱邪的由来。',
    themeIcon: '🎆',
    audioPrompt: '除夕之夜，院子里燃烧的竹节发出震耳欲聋的爆裂声，吓得年兽抱头鼠窜。',
  },
  {
    id: 3,
    storyChapterRef: 4,
    prefix: '大年初一太阳升起，村民们走出家门互相拱手拜年，欢庆',
    suffix: '的平安时刻。',
    correctWord: '辞旧迎新',
    options: ['辞旧迎新', '愁眉苦脸', '乱七八糟', '惊慌失措'],
    pinyin: 'cí jiù yíng xīn',
    meaning: '告别过去的一年，迎接充满希望与吉祥的新的一年。',
    contextLore: '“过年”原意是“度过年兽劫难”，大年初一互道恭喜，辞旧迎新代代相传。',
    themeIcon: '🧧',
    audioPrompt: '大年初一太阳升起，村民们互相拱手拜年，欢庆辞旧迎新的平安时刻。',
  },
  {
    id: 4,
    storyChapterRef: 4,
    prefix: '家家户户贴上大红春联，全村上下洋溢着',
    suffix: '的节日气氛。',
    correctWord: '喜气洋洋',
    options: ['喜气洋洋', '垂头丧气', '风平浪静', '面面相觑'],
    pinyin: 'xǐ qì yáng yáng',
    meaning: '形容节日氛围极其祥和欢乐，人人心境喜悦满足。',
    contextLore: '红春联、红窗花配上团圆守岁，村落里处处弥漫着喜气洋洋的传统年味。',
    themeIcon: '🐉',
    audioPrompt: '家家户户贴上大红春联，全村上下洋溢着喜气洋洋的节日气氛。',
  },
  {
    id: 5,
    storyChapterRef: 4,
    prefix: '度过了年兽危机的村民们围坐在一起吃年夜饭，桌上特意留了一条清蒸鱼，祈愿新的一年',
    suffix: '。',
    correctWord: '年年有余',
    options: ['年年有余', '画蛇添足', '掩耳盗铃', '井底之蛙'],
    pinyin: 'nián nián yǒu yú',
    meaning: '借由“鱼”与“余”谐音，期盼生活富足丰盈、年年有结余。',
    contextLore: '吃年夜饭留鱼头鱼尾，象征着岁岁平安、年年有余的丰收愿景。',
    themeIcon: '🐟',
    audioPrompt: '村民们围坐在一起吃年夜饭，桌上特意留了一条清蒸鱼，祈愿新的一年年年有余。',
  },
];

export const STORY_2_SENTENCE_PUZZLES: SentencePuzzle[] = [
  {
    id: 201,
    storyChapterRef: 2,
    prefix: '听到屈原大夫投江的噩耗，江畔渔民纷纷摇橹出航，在风浪中',
    suffix: '，争分夺秒搜寻拯救诗人。',
    correctWord: '同舟共济',
    options: ['同舟共济', '各自为战', '落荒而逃', '萍水相逢'],
    pinyin: 'tóng zhōu gòng jì',
    meaning: '同乘一条船渡过风浪，比喻团结一心、同甘共苦。',
    contextLore: '两岸百姓不顾江水滔滔，同舟共济竞相划桨，这正是后世端午赛龙舟的由来。',
    themeIcon: '🛶',
    audioPrompt: '江畔渔民纷纷摇橹出航，在风浪中同舟共济，争分夺秒搜寻拯救诗人。',
  },
  {
    id: 202,
    storyChapterRef: 3,
    prefix: '百姓们担心江中鱼虾伤害屈原的遗体，便把包裹着清香糯米的',
    suffix: '投入汨罗江中。',
    correctWord: '角黍香粽',
    options: ['角黍香粽', '粗茶淡饭', '枯枝败叶', '残羹冷炙'],
    pinyin: 'jiǎo shǔ xiāng zòng',
    meaning: '古代用箬叶或芦苇叶包裹糯米制成的粽子，是端午节纪念屈原的节令美食。',
    contextLore: '五彩丝线裹紧翠绿箬叶，投江护佑屈原，寄托了楚地黎民深厚的哀思与敬意。',
    themeIcon: '🍙',
    audioPrompt: '百姓们把包裹着清香糯米的角黍香粽投入汨罗江中。',
  },
  {
    id: 203,
    storyChapterRef: 1,
    prefix: '诗人屈原一生挚爱楚国山河，面对小人陷害与颠沛流离，始终保持着',
    suffix: '的崇高节操。',
    correctWord: '百折不屈',
    options: ['百折不屈', '见风使舵', '半途而废', '随波逐流'],
    pinyin: 'bǎi zhé bù qū',
    meaning: '遭受无数打击磨难也决不放弃操守与信念。',
    contextLore: '屈原写下《离骚》《天问》，其百折不屈的家国情怀千古流芳。',
    themeIcon: '📜',
    audioPrompt: '屈原一生挚爱楚国山河，始终保持着百折不屈的崇高节操。',
  },
  {
    id: 204,
    storyChapterRef: 4,
    prefix: '端午节江面上彩绘龙舟如飞箭竞发，健儿们呐喊击水，个个表现得',
    suffix: '。',
    correctWord: '生龙活虎',
    options: ['生龙活虎', '慢条斯理', '东倒西歪', '垂头丧气'],
    pinyin: 'shēng lóng huó hǔ',
    meaning: '精神饱满、健壮勇敢，充满勃勃生机。',
    contextLore: '锣鼓喧天、万众齐呼，龙舟健儿生龙活虎的拼搏身姿是民族奋斗精神的生动写照。',
    themeIcon: '🐲',
    audioPrompt: '江面上龙舟竞发，健儿们呐喊击水，个个表现得生龙活虎。',
  },
];

export const STORY_3_SENTENCE_PUZZLES: SentencePuzzle[] = [
  {
    id: 301,
    storyChapterRef: 2,
    prefix: '恶徒逢蒙趁后羿外出拔剑相逼，嫦娥为保护长生仙药不落入恶人之手，毅然将药',
    suffix: '。',
    correctWord: '一饮而尽',
    options: ['一饮而尽', '弃若敝屣', '犹豫不决', '浅尝辄止'],
    pinyin: 'yī yǐn ér jìn',
    meaning: '一口气全部饮完，形容果断决绝。',
    contextLore: '嫦娥果断吞下仙药，身子便不受控制地飘起，飞向清冷皎洁的广寒月宫。',
    themeIcon: '🌕',
    audioPrompt: '嫦娥为保护长生仙药不落入恶人之手，毅然将药一饮而尽。',
  },
  {
    id: 302,
    storyChapterRef: 3,
    prefix: '后羿归来思念妻子，在中秋之夜摆出嫦娥爱吃的蜜食鲜果，遥望夜空祈盼人间',
    suffix: '。',
    correctWord: '花好月圆',
    options: ['花好月圆', '分崩离析', '风雨飘摇', '冷冷清清'],
    pinyin: 'huā hǎo yuè yuán',
    meaning: '鲜花盛开、明月圆满，形容生活团圆美满、幸福祥和。',
    contextLore: '民间由此兴起八月十五中秋赏月之俗，寄托着家家团圆、花好月圆的美好期盼。',
    themeIcon: '🥮',
    audioPrompt: '后羿在中秋之夜摆出供品，遥望夜空祈盼人间花好月圆。',
  },
  {
    id: 303,
    storyChapterRef: 4,
    prefix: '千百年来，即便亲朋好友相隔万水千山，只要在八月十五同赏一轮明月，就能实现',
    suffix: '的深情祝福。',
    correctWord: '千里婵娟',
    options: ['千里婵娟', '咫尺天涯', '视而不见', '置若罔闻'],
    pinyin: 'qiān lǐ chán juān',
    meaning: '婵娟指明月，远隔千里的亲友借助同一轮明月传递思念。',
    contextLore: '苏轼的名句“但愿人长久，千里共婵娟”成为千百年来中秋思亲的最高意境。',
    themeIcon: '🐰',
    audioPrompt: '八月十五同赏一轮明月，就能实现千里婵娟的深情祝福。',
  },
  {
    id: 304,
    storyChapterRef: 4,
    prefix: '中秋庭院里桂花飘香，全家人围坐在月光下一边吃月饼一边赏月，真是',
    suffix: '的温馨夜晚。',
    correctWord: '欢聚一堂',
    options: ['欢聚一堂', '各奔东西', '面面相觑', '孤苦伶仃'],
    pinyin: 'huān jù yì táng',
    meaning: '欢乐地聚集在同一个厅堂里，形容亲友团聚的温馨热烈。',
    contextLore: '品尝圆圆的月饼、饮桂花酒，一家人欢聚一堂是中秋节最重要的核心意义。',
    themeIcon: '🎑',
    audioPrompt: '全家人围坐在月光下一边吃月饼一边赏月，真是欢聚一堂的温馨夜晚。',
  },
];

export const STORY_4_SENTENCE_PUZZLES: SentencePuzzle[] = [
  {
    id: 401,
    storyChapterRef: 2,
    prefix: '老牛伯伯说水浅刚过小腿，机灵的松鼠却大叫河水会淹死人，小马在河边感到',
    suffix: '，不知道究竟该信谁。',
    correctWord: '半信半疑',
    options: ['半信半疑', '坚定不移', '胸有成竹', '从容不迫'],
    pinyin: 'bàn xìn bàn yí',
    meaning: '既有些相信又有些怀疑，拿不定主意。',
    contextLore: '老牛高大、松鼠矮小，面对两种截然相反的说法，小马陷入了半信半疑的困惑。',
    themeIcon: '🐴',
    audioPrompt: '老牛和松鼠说法截然相反，小马在河边感到半信半疑，不知道究竟该信谁。',
  },
  {
    id: 402,
    storyChapterRef: 3,
    prefix: '马妈妈温和地开导小马：光听别人说是不行的，唯有自己下水',
    suffix: '，才能获得真正的答案。',
    correctWord: '亲身体验',
    options: ['亲身体验', '道听途说', '人云亦云', '坐井观天'],
    pinyin: 'qīn shēn tǐ yàn',
    meaning: '亲自去接触、尝试并感受客观实际。',
    contextLore: '小马过河的核心启示：别人的经验无法替代自己的亲身体验。',
    themeIcon: '🌊',
    audioPrompt: '马妈妈开导小马：唯有自己下水亲身体验，才能获得真正的答案。',
  },
  {
    id: 403,
    storyChapterRef: 4,
    prefix: '小马小心翼翼趟过小河，发现水既不像老牛说的浅、也不像松鼠说的深，深刻懂得了',
    suffix: '的真理。',
    correctWord: '实践出真知',
    options: ['实践出真知', '纸上谈兵', '囫囵吞枣', '掩耳盗铃'],
    pinyin: 'shí jiàn chū zhēn zhī',
    meaning: '通过亲自实践探索，才能获得真正准确的真理。',
    contextLore: '小马平安把麦子送到了磨坊，这一趟渡河之旅让他真正体会到实践出真知的道理。',
    themeIcon: '💡',
    audioPrompt: '小马小心翼翼趟过小河，深刻懂得了实践出真知的真理。',
  },
];

export const STORY_5_SENTENCE_PUZZLES: SentencePuzzle[] = [
  {
    id: 501,
    storyChapterRef: 1,
    prefix: '几代航天科学家在大漠戈壁默默奉献，怀着让中国宇航员漫步太空的',
    suffix: '，攻克了无数尖端难关。',
    correctWord: '壮志凌云',
    options: ['壮志凌云', '自暴自弃', '胸无大志', '望而却步'],
    pinyin: 'zhuàng zhì líng yún',
    meaning: '宏伟高远的志向直上云霄。',
    contextLore: '从东方红卫星到神舟飞船，航天人用壮志凌云的报负铸就了载人飞天的辉煌。',
    themeIcon: '🚀',
    audioPrompt: '几代航天科学家默默奉献，怀着让宇航员漫步太空的壮志凌云攻克难关。',
  },
  {
    id: 502,
    storyChapterRef: 2,
    prefix: '长征火箭呼啸腾空，烈焰托举着神舟飞船如巨龙般直刺',
    suffix: '，顺利进入预定运行轨道。',
    correctWord: '浩瀚苍穹',
    options: ['浩瀚苍穹', '狭窄低洼', '尺土寸地', '井底之蛙'],
    pinyin: 'hào hàn cāng qióng',
    meaning: '辽阔广袤、无边无际的广大太空与天空。',
    contextLore: '火箭穿透云海奔向浩瀚苍穹，飞船与天宫空间站成功实现交会对接。',
    themeIcon: '🌌',
    audioPrompt: '火箭呼啸腾空，烈焰托举着神舟飞船如巨龙般直刺浩瀚苍穹。',
  },
  {
    id: 503,
    storyChapterRef: 3,
    prefix: '中国航天员在天宫空间站开展了多项具有开创性的科学实验，体现出科研人员',
    suffix: '的创新开拓气魄。',
    correctWord: '敢为人先',
    options: ['敢为人先', '墨守成规', '因循守旧', '固步自封'],
    pinyin: 'gǎn wéi rén xiān',
    meaning: '敢于做别人没做过的事情，勇立潮头。',
    contextLore: '太空授课、微重力物理与生命科学实验，展现了中国航天敢为人先的智慧与勇气。',
    themeIcon: '✨',
    audioPrompt: '航天员在天宫空间站开展科学实验，体现出科研人员敢为人先的开拓气魄。',
  },
];

export const STORY_6_SENTENCE_PUZZLES: SentencePuzzle[] = [
  {
    id: 601,
    storyChapterRef: 1,
    prefix: '古堡藏宝室的黄铜大门因盛夏高温膨胀，锁舌与门槽死死咬在一起，显得',
    suffix: '，蛮力根本无法推开。',
    correctWord: '严丝合缝',
    options: ['严丝合缝', '漏洞百出', '千疮百孔', '松松垮垮'],
    pinyin: 'yán sī hé fèng',
    meaning: '缝隙密合，没有一丝空隙。',
    contextLore: '黄铜质地的密门机关受热膨胀，严丝合缝地卡死在门框中。',
    themeIcon: '🔑',
    audioPrompt: '锁舌与门槽死死咬在一起，显得严丝合缝，蛮力根本无法推开。',
  },
  {
    id: 602,
    storyChapterRef: 3,
    prefix: 'Bobu外星兔侦探巧妙利用固体遇冷体积缩小的',
    suffix: '物理现象，用冰块给铜门降温，机关顺利开启。',
    correctWord: '热胀冷缩',
    options: ['热胀冷缩', '刻舟求剑', '掩耳盗铃', '揠苗助长'],
    pinyin: 'rè zhàng lěng suō',
    meaning: '物体受热体积增大、遇冷体积缩小的常见物理规律。',
    contextLore: '冰块让铜锁降温收缩，金属分子运动放缓产生微小缝隙，Bobu侦探用科学轻松解开了谜题。',
    themeIcon: '🔬',
    audioPrompt: 'Bobu侦探巧妙利用遇冷体积缩小的热胀冷缩物理现象，顺利开启了大门。',
  },
];

export const STORY_7_SENTENCE_PUZZLES: SentencePuzzle[] = [
  {
    id: 701,
    storyChapterRef: 2,
    prefix: '小猴在清澈的溪水里看见发光的金币，伸手径直去抓却屡屡扑空，感到极其',
    suffix: '。',
    correctWord: '百思不解',
    options: ['百思不解', '胸有成竹', '恍然大悟', '理所当然'],
    pinyin: 'bǎi sī bù jiě',
    meaning: '反复思考也弄不明白究竟是怎么回事。',
    contextLore: '肉眼看到的金币位置和真实位置有偏差，直抓总是落空，让小动物们百思不解。',
    themeIcon: '💎',
    audioPrompt: '小猴在清澈的溪水里看见金币，伸手径直去抓却屡屡扑空，感到极其百思不解。',
  },
  {
    id: 702,
    storyChapterRef: 3,
    prefix: 'Bobu侦探用激光笔演示了水面光线的折射偏差，大家看清水中虚像的秘密后，顿时',
    suffix: '。',
    correctWord: '豁然开朗',
    options: ['豁然开朗', '一头雾水', '执迷不悟', '束手无策'],
    pinyin: 'huò rán kāi lǎng',
    meaning: '比喻忽然理解领悟，疑团彻底消除。',
    contextLore: '光线从水斜射入空气时发生折射，明白了物理本质后大家豁然开朗，往下深处一抓便成功捞起金币。',
    themeIcon: '🌈',
    audioPrompt: '看清水中光线折射形成的虚像秘密后，大家顿时豁然开朗。',
  },
];

export const STORY_8_SENTENCE_PUZZLES: SentencePuzzle[] = [
  {
    id: 801,
    storyChapterRef: 1,
    prefix: '漫天呼啸的暴风雪封锁了山谷，狂风呼啸声让伙伴们的空气呼救显得',
    suffix: '，根本传不出去。',
    correctWord: '微不足道',
    options: ['微不足道', '震耳欲聋', '铺天盖地', '势不可挡'],
    pinyin: 'wēi bù zú dào',
    meaning: '微小弱小得不值一提，被大风雪轻易掩盖。',
    contextLore: '空气在风雪中阻力极大且容易发散声波，求救喊声显得微不足道，极难远播。',
    themeIcon: '📻',
    audioPrompt: '狂风呼啸声让伙伴们的空气呼救显得微不足道，根本传不出去。',
  },
  {
    id: 802,
    storyChapterRef: 3,
    prefix: 'Bobu将耳朵贴近冰冷的铁轨，遇险伙伴敲击钢轨的求救信号如',
    suffix: '般在固体中高速传播，赢得了宝贵救援时间。',
    correctWord: '风驰电掣',
    options: ['风驰电掣', '步履蹒跚', '拖泥带水', '犹豫不决'],
    pinyin: 'fēng chí diàn chè',
    meaning: '像狂风飞奔、像闪电飞逝，形容速度极快。',
    contextLore: '声音在钢铁等固体介质中的传播速度达每秒五千米，风驰电掣的声波信号让救援队迅速锁定方位。',
    themeIcon: '⚡',
    audioPrompt: '敲击钢轨的求救信号如风驰电掣般在固体中高速传播，赢得了宝贵救援时间。',
  },
];

export const DEFAULT_SENTENCE_PUZZLES: SentencePuzzle[] = STORY_1_SENTENCE_PUZZLES;

export const STORY_SENTENCE_PUZZLES_MAP: Record<string, SentencePuzzle[]> = {
  'story-1': STORY_1_SENTENCE_PUZZLES,
  'story-2': STORY_2_SENTENCE_PUZZLES,
  'story-3': STORY_3_SENTENCE_PUZZLES,
  'story-4': STORY_4_SENTENCE_PUZZLES,
  'story-5': STORY_5_SENTENCE_PUZZLES,
  'story-6': STORY_6_SENTENCE_PUZZLES,
  'story-7': STORY_7_SENTENCE_PUZZLES,
  'story-8': STORY_8_SENTENCE_PUZZLES,
};

export const CLASSIC_STORY_LEVELS: StoryLevel[] = [
  {
    id: 'story-1',
    category: 'myth',
    chapterNumber: 1,
    title: '《春节与年兽》',
    shortTitle: '年兽的故事',
    subtitle: '岁暮驱邪 · 红联与爆竹',
    theme: '岁末除夕 · 传统习俗与勇敢智慧',
    difficulty: '基础必修',
    difficultyStars: 1,
    gradeLevel: '5-6年级推荐',
    icon: '🏮',
    coverTheme: {
      gradient: 'from-red-900 via-rose-800 to-amber-950',
      border: 'border-amber-400/70',
      glow: 'rgba(239, 68, 68, 0.35)',
      badgeBg: 'bg-red-500/30',
      badgeText: 'text-amber-200',
    },
    summary: '上古深山里住着一只凶猛怪兽“年”，每到除夕夜便闯入村庄。聪明的祖先发现年兽惧怕红衣、火光与鞭炮，由此开创了万家守岁、贴春联的千古习俗。',
    culturalLore: '除夕守岁、贴红春联、倒贴福字，是中华民族辞旧迎新、祈求吉祥安康的核心年俗。',
    completion: {
      reading: 100,
      challenge: 80,
      writing: 90,
    },
    targetCharacters: TARGET_CHARACTERS,
    storyParagraphs: STORY_PARAGRAPHS,
    soundQuestions: SOUND_QUESTIONS,
    radicalGames: RADICAL_GAMES,
    culturalCards: CULTURAL_CARDS,
    clozeExercises: CLOZE_EXERCISES,
    fillInTheBlank: CLOZE_EXERCISES,
    sentenceBuilding: STORY_1_SENTENCE_PUZZLES,
    sentencePuzzles: STORY_1_SENTENCE_PUZZLES,
    essayTemplate: SPRING_FESTIVAL_ESSAY_TEMPLATE,
    essayBlocks: SPRING_FESTIVAL_ESSAY_TEMPLATE,
    unlocked: true,
  },
  {
    id: 'story-2',
    category: 'history',
    chapterNumber: 2,
    title: '《端午屈原与赛龙舟》',
    shortTitle: '端午的故事',
    subtitle: '汨罗龙舟 · 艾叶与粽香',
    theme: '仲夏端午 · 爱国精神与百舸争流',
    difficulty: '进阶提升',
    difficultyStars: 2,
    gradeLevel: '5-6年级推荐',
    icon: '🐲',
    coverTheme: {
      gradient: 'from-emerald-950 via-teal-900 to-stone-950',
      border: 'border-emerald-400/70',
      glow: 'rgba(16, 185, 129, 0.35)',
      badgeBg: 'bg-emerald-500/30',
      badgeText: 'text-emerald-200',
    },
    summary: '战国时期楚国爱国诗人屈原忧国忧民。五月初五百姓划舟营救并投粽喂鱼，由此演化为千帆竞渡赛龙舟、品尝五彩糯米粽的壮美端午盛事。',
    culturalLore: '端午节赛龙舟、吃粽子、插艾草，传承的是中华儿女同舟共济、保家卫国的赤子爱国情怀。',
    completion: {
      reading: 65,
      challenge: 40,
      writing: 30,
    },
    targetCharacters: STORY_2_TARGET_CHARACTERS,
    storyParagraphs: STORY_2_PARAGRAPHS,
    soundQuestions: STORY_2_SOUND_QUESTIONS,
    radicalGames: STORY_2_RADICAL_GAMES,
    culturalCards: CULTURAL_CARDS,
    clozeExercises: STORY_2_CLOZE_EXERCISES,
    fillInTheBlank: STORY_2_CLOZE_EXERCISES,
    sentenceBuilding: STORY_2_SENTENCE_PUZZLES,
    sentencePuzzles: STORY_2_SENTENCE_PUZZLES,
    essayTemplate: STORY_2_ESSAY_TEMPLATE,
    essayBlocks: STORY_2_ESSAY_TEMPLATE,
    unlocked: true,
  },
  {
    id: 'story-3',
    category: 'myth',
    chapterNumber: 3,
    title: '《中秋明月与嫦娥》',
    shortTitle: '中秋的故事',
    subtitle: '蟾宫折桂 · 月饼与团圆',
    theme: '仲秋八月 · 亲情美满与诗意明月',
    difficulty: '高阶名篇',
    difficultyStars: 3,
    gradeLevel: '5-6年级推荐',
    icon: '🌕',
    coverTheme: {
      gradient: 'from-indigo-950 via-purple-900 to-amber-950',
      border: 'border-indigo-400/70',
      glow: 'rgba(99, 102, 241, 0.35)',
      badgeBg: 'bg-indigo-500/30',
      badgeText: 'text-indigo-200',
    },
    summary: '八月十五月儿圆。嫦娥奔月飞入广寒仙宫，人间万家灯火团坐赏月、分尝月饼。苏轼“但愿人长久，千里共婵娟”的千古绝唱在此传诵。',
    culturalLore: '中秋圆月寓意团圆美满，体现了中国人注重家庭温情与亲情眷恋的深厚人文底色。',
    completion: {
      reading: 30,
      challenge: 10,
      writing: 0,
    },
    targetCharacters: STORY_3_TARGET_CHARACTERS,
    storyParagraphs: STORY_3_PARAGRAPHS,
    soundQuestions: STORY_3_SOUND_QUESTIONS,
    radicalGames: STORY_3_RADICAL_GAMES,
    culturalCards: CULTURAL_CARDS,
    clozeExercises: STORY_3_CLOZE_EXERCISES,
    fillInTheBlank: STORY_3_CLOZE_EXERCISES,
    sentenceBuilding: STORY_3_SENTENCE_PUZZLES,
    sentencePuzzles: STORY_3_SENTENCE_PUZZLES,
    essayTemplate: STORY_3_ESSAY_TEMPLATE,
    essayBlocks: STORY_3_ESSAY_TEMPLATE,
    unlocked: true,
  },
  {
    id: 'story-4',
    category: 'fairy',
    chapterNumber: 4,
    title: '《小马过河与大森林》',
    shortTitle: '小马过河',
    subtitle: '实践真知 · 勇敢与探索',
    theme: '童话寓言 · 亲自尝试与独立思考',
    difficulty: '基础必修',
    difficultyStars: 2,
    gradeLevel: '5-6年级推荐',
    icon: '🐴',
    coverTheme: {
      gradient: 'from-amber-950 via-lime-950 to-stone-950',
      border: 'border-lime-400/70',
      glow: 'rgba(132, 204, 22, 0.35)',
      badgeBg: 'bg-lime-500/30',
      badgeText: 'text-lime-200',
    },
    summary: '小马背着麦子过河，老牛说水浅刚没小腿，松鼠说水深会淹死。唯有亲自试一试，才能解开谜题：实践出真知，凡事要学会自己思考与求证。',
    culturalLore: '实践是检验真理的唯一标准。不盲信别人，躬行实践，是中华传统辩证哲学的生动写照。',
    completion: {
      reading: 0,
      challenge: 0,
      writing: 0,
    },
    targetCharacters: STORY_4_TARGET_CHARACTERS,
    storyParagraphs: STORY_4_PARAGRAPHS,
    soundQuestions: STORY_4_SOUND_QUESTIONS,
    radicalGames: STORY_4_RADICAL_GAMES,
    culturalCards: CULTURAL_CARDS,
    clozeExercises: STORY_2_CLOZE_EXERCISES,
    fillInTheBlank: STORY_2_CLOZE_EXERCISES,
    sentenceBuilding: STORY_4_SENTENCE_PUZZLES,
    sentencePuzzles: STORY_4_SENTENCE_PUZZLES,
    essayTemplate: STORY_2_ESSAY_TEMPLATE,
    essayBlocks: STORY_2_ESSAY_TEMPLATE,
    unlocked: true,
  },
  {
    id: 'story-5',
    category: 'news',
    chapterNumber: 5,
    title: '《神舟飞天筑梦苍穹》',
    shortTitle: '神舟飞天',
    subtitle: '天宫空间站 · 航天强国梦',
    theme: '现代时事 · 科技强国与太空探索',
    difficulty: '高阶名篇',
    difficultyStars: 4,
    gradeLevel: '5-6年级推荐',
    icon: '🚀',
    coverTheme: {
      gradient: 'from-sky-950 via-blue-900 to-indigo-950',
      border: 'border-cyan-400/70',
      glow: 'rgba(6, 182, 212, 0.35)',
      badgeBg: 'bg-cyan-500/30',
      badgeText: 'text-cyan-200',
    },
    summary: '神舟十九号划破苍穹，三名航天员驻守中国天宫空间站，在浩瀚宇宙中开展微重力科学实验，向世界展示中国航天人敢上九天揽月的豪迈魄力。',
    culturalLore: '从嫦娥奔月神话到神舟飞天现实，中华民族跨越千年的航天探索梦正在当代变为壮丽现实。',
    completion: {
      reading: 0,
      challenge: 0,
      writing: 0,
    },
    targetCharacters: STORY_5_TARGET_CHARACTERS,
    storyParagraphs: STORY_5_PARAGRAPHS,
    soundQuestions: STORY_5_SOUND_QUESTIONS,
    radicalGames: STORY_5_RADICAL_GAMES,
    culturalCards: CULTURAL_CARDS,
    clozeExercises: STORY_3_CLOZE_EXERCISES,
    fillInTheBlank: STORY_3_CLOZE_EXERCISES,
    sentenceBuilding: STORY_5_SENTENCE_PUZZLES,
    sentencePuzzles: STORY_5_SENTENCE_PUZZLES,
    essayTemplate: STORY_3_ESSAY_TEMPLATE,
    essayBlocks: STORY_3_ESSAY_TEMPLATE,
    unlocked: true,
  },
];

export const ALL_STORIES: StoryLevel[] = [
  ...CLASSIC_STORY_LEVELS,
  ...BOBU_STORY_LEVELS,
];

export const STORY_LEVELS: StoryLevel[] = ALL_STORIES;

export const DEFAULT_STORY_ID = 'story-1';

export function getStoryById(id: string): StoryLevel {
  const found = ALL_STORIES.find((s) => s.id === id);
  return found || ALL_STORIES[0];
}

// -------------------------------------------------------------
// 绘本手写与演武题库数据结构与适配器
// -------------------------------------------------------------
export interface CharacterWritingMeta {
  char: string;
  pinyin: string;
  radical: string;
  strokeCount: number;
  structure: '独体' | '左右' | '上下' | '半包围' | '全包围';
  strokeOrder: string[];
  keyTips: string[];
  commonMistakes: string;
}

export interface StoryChallengeData {
  storyId: string;
  storyTitle: string;
  storyShortTitle: string;
  soundQuestions: SoundMatchQuestion[];
  radicalGames: RadicalBlockGame[];
  targetCharacters: HanziChar[];
  // 第三阶段三大核心功能强绑定数据流
  fillInTheBlank: ClozeExercise[];
  sentenceBuilding: SentencePuzzle[];
  essayBlocks: EssayTemplate;
  sentencePuzzles?: SentencePuzzle[];
  essayTemplate?: EssayTemplate;
  clozeExercises?: ClozeExercise[];
  writingTargets?: CharacterWritingMeta[];
}

export const ALL_CHARACTER_WRITING_META: Record<string, CharacterWritingMeta> = {
  // Story 1: 《春节与年兽》
  '春': {
    char: '春',
    pinyin: 'chūn',
    radical: '日',
    strokeCount: 9,
    structure: '上下',
    strokeOrder: ['横', '横', '横', '撇', '捺', '竖', '横折', '横', '横'],
    keyTips: [
      '三横长短有致：首横平正，中横略短，底横最长承载大局。',
      '撇捺舒展如鹏展翅，撇起笔高挺，捺角略沉有顿笔。',
      '下方「日」部居中收紧，不可写得过于宽扁。',
    ],
    commonMistakes: '三横间距不均匀；撇捺过于拘谨，未能包裹下方的「日」部。',
  },
  '节': {
    char: '节',
    pinyin: 'jié',
    radical: '艹',
    strokeCount: 5,
    structure: '上下',
    strokeOrder: ['横', '竖', '竖', '横折钩', '竖'],
    keyTips: [
      '草字头左右对称，左竖短而微收，右竖稍长。',
      '下方横折钩横平竖直，折角挺拔有力。',
      '悬针竖垂直居中，起笔挺拔，收笔出锋如破竹。',
    ],
    commonMistakes: '悬针竖偏左或偏右，草字头过大导致头重脚轻。',
  },
  '年': {
    char: '年',
    pinyin: 'nián',
    radical: '干',
    strokeCount: 6,
    structure: '独体',
    strokeOrder: ['撇', '横', '横', '竖', '横', '竖'],
    keyTips: [
      '首撇较平，为字形定下端正基调。',
      '中间三横间距均等，第三横最长托起上方。',
      '最后一竖正中稳健，如中流砥柱垂挂正中。',
    ],
    commonMistakes: '横画间距疏密不匀；首撇斜度过大导致字形倾斜。',
  },
  '福': {
    char: '福',
    pinyin: 'fú',
    radical: '礻',
    strokeCount: 13,
    structure: '左右',
    strokeOrder: ['点', '横撇', '竖', '点', '横', '竖', '横折', '横', '竖', '横折', '横', '竖', '横'],
    keyTips: [
      '左侧示字旁为一点（礻），左窄右宽，避就得当。',
      '右侧「一口田」上下居中对齐，田字饱满四方。',
      '横画略呈仰势，体现福气祥和之气韵。',
    ],
    commonMistakes: '误将示字旁（礻）写成衣字旁（衤，多一点）；右侧田部过于臃肿。',
  },
  '除': {
    char: '除',
    pinyin: 'chú',
    radical: '阝',
    strokeCount: 9,
    structure: '左右',
    strokeOrder: ['横折折折钩', '竖', '撇', '捺', '横', '横', '竖钩', '撇', '点'],
    keyTips: [
      '左耳旁窄而瘦长，竖画微向内弯，右侧余字要高昂开阔。',
      '人字头撇捺舒展宽绰，遮盖下方「二小」。',
      '竖钩中正挺拔，左右撇点相互呼应。',
    ],
    commonMistakes: '左耳旁与右部距离太宽；「余」部的人字头过小显得局促。',
  },
  '夕': {
    char: '夕',
    pinyin: 'xī',
    radical: '夕',
    strokeCount: 3,
    structure: '独体',
    strokeOrder: ['撇', '横撇', '点'],
    keyTips: [
      '首撇稍直，起笔沉实。',
      '横撇折角约60度，撇画自然向下弧展。',
      '心内一点不离中心，悬空聚气。',
    ],
    commonMistakes: '横撇折角过大变成钝角；内部一点贴在壁上，失去空灵通透之气。',
  },
  '迎': {
    char: '迎',
    pinyin: 'yíng',
    radical: '辶',
    strokeCount: 7,
    structure: '半包围',
    strokeOrder: ['撇', '竖提', '横折', '竖', '点', '横折折撇', '捺'],
    keyTips: [
      '先写被包围部分「卬」，后写走之底。',
      '「卬」部左高右低，重心紧聚。',
      '走之底捺画平正舒坦，平水托载上方。',
    ],
    commonMistakes: '笔顺颠倒先写走之；走之底捺画翘起未能托住被包围部分。',
  },
  '新': {
    char: '新',
    pinyin: 'xīn',
    radical: '斤',
    strokeCount: 13,
    structure: '左右',
    strokeOrder: ['点', '横', '点', '撇', '横', '竖', '撇', '点', '撇', '撇', '横', '竖'],
    keyTips: [
      '左部「亲」立字紧凑，木字下缩；右部「斤」下放。',
      '左右高低错落，斤部平撇短促，竖撇修长。',
      '右侧竖笔为悬针竖，垂直坚挺。',
    ],
    commonMistakes: '左右部分等高，缺乏穿插避让；左侧「亲」字写得太宽。',
  },

  // Story 2: 《端午屈原与赛龙舟》
  '舟': {
    char: '舟',
    pinyin: 'zhōu',
    radical: '舟',
    strokeCount: 6,
    structure: '独体',
    strokeOrder: ['撇', '竖', '横折钩', '点', '横', '点'],
    keyTips: [
      '两头尖中间宽，首撇挺拔，横折钩抱月怀珠。',
      '中横穿插破浪，两点左右呼应如桨。',
      '重心稳固在正中，象征轻舟平稳行江。',
    ],
    commonMistakes: '漏写内部两点；横折钩倾斜导致船身翻覆。',
  },
  '粽': {
    char: '粽',
    pinyin: 'zòng',
    radical: '米',
    strokeCount: 14,
    structure: '左右',
    strokeOrder: ['点', '撇', '横', '竖', '撇', '点', '点', '点', '横撇', '横', '横', '竖', '撇', '竖弯钩'],
    keyTips: [
      '左米右宗，左窄右宽，米字旁收紧避让。',
      '宗字头宝盖宽阔，下方「示」部中竖直挺。',
      '笔画密集繁复，注意笔画穿插与间隙匀称。',
    ],
    commonMistakes: '右侧「宗」误写为「崇」；左侧米字旁最后一笔写成捺（应为点）。',
  },
  '龙': {
    char: '龙',
    pinyin: 'lóng',
    radical: '龙',
    strokeCount: 5,
    structure: '独体',
    strokeOrder: ['横', '撇', '竖弯钩', '撇', '点'],
    keyTips: [
      '首横不宜太长，撇画舒展如龙身腾空。',
      '竖弯钩圆润而挺拔，底部开阔托载全字。',
      '最后一点如画龙点睛，聚气生威。',
    ],
    commonMistakes: '漏写右上角关键的「点」；竖弯钩过于扁平无力。',
  },
  '江': {
    char: '江',
    pinyin: 'jiāng',
    radical: '氵',
    strokeCount: 6,
    structure: '左右',
    strokeOrder: ['点', '点', '提', '横', '竖', '横'],
    keyTips: [
      '三点水呈弧形分布，提笔指向工字第一横。',
      '右侧「工」字横平竖直，底横略长于首横。',
      '左右呼应，江水奔流浩瀚。',
    ],
    commonMistakes: '三点水写在一条笔直竖线上缺乏弧度；工字竖画偏斜。',
  },
  '屈': {
    char: '屈',
    pinyin: 'qū',
    radical: '尸',
    strokeCount: 8,
    structure: '半包围',
    strokeOrder: ['横折', '横', '撇', '竖', '横折', '竖', '竖折', '竖'],
    keyTips: [
      '尸字头撇画舒长斜伸，庇护下方「出」字。',
      '内部「出」字两山重叠，上小下大重心稳。',
      '身体屈折而精神不屈，笔势挺拔。',
    ],
    commonMistakes: '尸字头撇画太短未能包裹；出字中间竖画未对齐。',
  },
  '艾': {
    char: '艾',
    pinyin: 'ài',
    radical: '艹',
    strokeCount: 5,
    structure: '上下',
    strokeOrder: ['横', '竖', '竖', '撇', '捺'],
    keyTips: [
      '草字头横长盖顶，两竖左低右微高。',
      '下方撇捺舒展交错，交叉点居于正中。',
      '青翠艾草驱邪祈福，气韵清新。',
    ],
    commonMistakes: '草字头写得过小显得头轻脚重；下方撇捺局促。',
  },

  // Story 3: 《中秋明月与嫦娥》
  '月': {
    char: '月',
    pinyin: 'yuè',
    radical: '月',
    strokeCount: 4,
    structure: '独体',
    strokeOrder: ['撇', '横折钩', '横', '横'],
    keyTips: [
      '竖撇向下微弧，横折钩挺拔直立如玉柱。',
      '两短横在框内居中均匀分布，右端留微隙。',
      '如皎皎空中孤月轮，体态修长端庄。',
    ],
    commonMistakes: '横折钩折角松散无力；内部两横粘连左右两壁。',
  },
  '饼': {
    char: '饼',
    pinyin: 'bǐng',
    radical: '饣',
    strokeCount: 9,
    structure: '左右',
    strokeOrder: ['撇', '横撇', '竖提', '点', '撇', '横', '横', '撇', '竖'],
    keyTips: [
      '饣字旁窄长聚气，竖提挺拔向上。',
      '右部「并」两竖起笔有高低，撇长竖挺。',
      '字形团聚圆满，体现中秋团圆食饼之温情。',
    ],
    commonMistakes: '饣字旁误写成繁体食字；右侧并字两撇横画间距不均。',
  },
  '圆': {
    char: '圆',
    pinyin: 'yuán',
    radical: '囗',
    strokeCount: 10,
    structure: '全包围',
    strokeOrder: ['竖', '横折', '竖', '横折', '横', '竖', '横折', '撇', '点', '横'],
    keyTips: [
      '大口框端正方阔，左竖直直，右折角刚劲。',
      '内部「员」居中偏上，口字扁贝字挺。',
      '先里后封口，最后底横平实闭合。',
    ],
    commonMistakes: '未写内部先封口（违反笔顺规则）；外框倾斜不方正。',
  },
  '桂': {
    char: '桂',
    pinyin: 'guì',
    radical: '木',
    strokeCount: 10,
    structure: '左右',
    strokeOrder: ['横', '竖', '撇', '点', '横', '竖', '横', '横', '竖', '横'],
    keyTips: [
      '木字旁左避让，捺画化为收敛之点。',
      '右侧双「土」重叠，上小下大，底横最宽。',
      '十里丹桂幽香飘逸，结构挺秀。',
    ],
    commonMistakes: '木字旁仍写长捺冲撞右部；双土比例失调。',
  },

  // Story 4: 《小马过河与大森林》
  '马': {
    char: '马',
    pinyin: 'mǎ',
    radical: '马',
    strokeCount: 3,
    structure: '独体',
    strokeOrder: ['横折', '竖折折钩', '横'],
    keyTips: [
      '首笔横折稍向右上倾斜，折角挺拔。',
      '竖折折钩如马背鬃毛矫健跳跃，出钩锋利。',
      '底横平托，骏马踏风过大河。',
    ],
    commonMistakes: '笔画数写错；竖折折钩转折软弱。',
  },
  '深': {
    char: '深',
    pinyin: 'shēn',
    radical: '氵',
    strokeCount: 11,
    structure: '左右',
    strokeOrder: ['点', '点', '提', '点', '横撇', '横', '竖', '撇', '捺', '横', '竖'],
    keyTips: [
      '三点水呈弧形，提笔有锋指向右侧。',
      '右侧秃宝盖下横竖撇捺紧凑收拢，木字底舒展。',
      '渊深流长，字形稳重深邃。',
    ],
    commonMistakes: '漏写右上方秃宝盖；右下木部撇捺与上方笔画冲突。',
  },
  '浅': {
    char: '浅',
    pinyin: 'qiǎn',
    radical: '氵',
    strokeCount: 8,
    structure: '左右',
    strokeOrder: ['点', '点', '提', '横', '横', '斜钩', '撇', '点'],
    keyTips: [
      '左侧三点水灵动，右侧两横平稳平行。',
      '长斜钩挺拔开阔如天弓，向右上伸展。',
      '最后一撇一点点睛提神，水浅见底。',
    ],
    commonMistakes: '漏写右上方斜钩右上角的一点；斜钩弧度过大。',
  },
  '试': {
    char: '试',
    pinyin: 'shì',
    radical: '讠',
    strokeCount: 8,
    structure: '左右',
    strokeOrder: ['点', '横折提', '横', '竖', '横', '斜钩', '提', '点'],
    keyTips: [
      '言字旁点提呼应，提笔向右上方发力。',
      '右部「式」工字上缩，斜钩修长有力。',
      '实践出真知，点画沉着笃定。',
    ],
    commonMistakes: '言字旁提笔误写成横；右部「式」漏写最后一点。',
  },

  // Story 5: 《神舟飞天筑梦苍穹》
  '航': {
    char: '航',
    pinyin: 'háng',
    radical: '舟',
    strokeCount: 10,
    structure: '左右',
    strokeOrder: ['撇', '竖', '横折钩', '点', '横', '点', '点', '横', '撇', '竖弯钩'],
    keyTips: [
      '左侧舟字旁窄长挺立，中横右端不出头避让。',
      '右侧「亢」横画宽舒，撇折弯钩圆满流畅。',
      '神舟飞天巡游星汉，体势高昂。',
    ],
    commonMistakes: '舟字旁中横穿透右边冲撞右部；亢字误写成六。',
  },
  '宇': {
    char: '宇',
    pinyin: 'yǔ',
    radical: '宀',
    strokeCount: 6,
    structure: '上下',
    strokeOrder: ['点', '点', '横撇', '横', '横', '竖钩'],
    keyTips: [
      '宝盖头如苍穹覆盖，左点垂，右横撇开阔。',
      '下方「于」首横短，次横长，竖钩垂直居中。',
      '包容四方无垠宇宙，气宇轩昂。',
    ],
    commonMistakes: '宝盖头过窄未能遮盖下方；竖钩偏离中轴线。',
  },
  '星': {
    char: '星',
    pinyin: 'xīng',
    radical: '日',
    strokeCount: 9,
    structure: '上下',
    strokeOrder: ['竖', '横折', '横', '横', '撇', '横', '横', '竖', '横'],
    keyTips: [
      '上方「日」部扁而居中，体现聚光之核。',
      '下方「生」首撇平出，三横等距，底横宽托。',
      '群星璀璨生生不息，上下呼应。',
    ],
    commonMistakes: '上方日字写得过大过宽压垮下部；三横长短无序。',
  },

  // Story 6: 《黄铜密门热胀冷缩》
  '铜': {
    char: '铜',
    pinyin: 'tóng',
    radical: '钅',
    strokeCount: 11,
    structure: '左右',
    strokeOrder: ['撇', '横', '横', '横', '竖提', '竖', '横折钩', '横', '竖', '横折', '横'],
    keyTips: [
      '金字旁三横等距，竖提坚挺有力。',
      '右侧「同」外框挺立，内部「口」悬空居中。',
      '黄铜导热遇温膨胀，金属厚实端正。',
    ],
    commonMistakes: '金字旁竖提过长；右侧「同」部口字贴底失去空间。',
  },
  '胀': {
    char: '胀',
    pinyin: 'zhàng',
    radical: '月',
    strokeCount: 8,
    structure: '左右',
    strokeOrder: ['撇', '横折钩', '横', '横', '横折', '横', '竖提', '捺'],
    keyTips: [
      '肉月旁窄长端正，横折钩挺括。',
      '右侧「长」首笔撇横相连，竖提提角锐利，长捺舒展。',
      '热胀冷缩体积拓宽，字态开阔。',
    ],
    commonMistakes: '右侧「长」笔顺写错；撇捺挤压无舒展之势。',
  },
  '缩': {
    char: '缩',
    pinyin: 'suō',
    radical: '纟',
    strokeCount: 14,
    structure: '左右',
    strokeOrder: ['撇折', '撇折', '提', '点', '点', '横撇', '撇', '竖', '横折', '横', '横', '竖', '横折', '横'],
    keyTips: [
      '绞丝旁上下两撇折紧凑对齐，提笔干脆。',
      '右部「宿」宝盖居中，亻与百部层次分明。',
      '遇冷紧收收缩自如，笔画严整。',
    ],
    commonMistakes: '绞丝旁写得过宽；右侧宝盖头下方部分比例失衡。',
  },
  '热': {
    char: '热',
    pinyin: 'rè',
    radical: '灬',
    strokeCount: 10,
    structure: '上下',
    strokeOrder: ['横', '竖', '提', '撇', '横折弯钩', '点', '点', '点', '点'],
    keyTips: [
      '上方「执」左高右低，提手变体挺拔。',
      '下方四点底（灬）左点向左，右三点向右，呈扇形托底。',
      '烈火熊熊温度升腾，笔韵生动。',
    ],
    commonMistakes: '四点底方向杂乱未呈扇形；执字右部折角绵软。',
  },

  // Story 7: 《光的折射与彩虹水晶球》
  '折': {
    char: '折',
    pinyin: 'zhé',
    radical: '扌',
    strokeCount: 7,
    structure: '左右',
    strokeOrder: ['横', '竖钩', '提', '撇', '撇', '横', '竖'],
    keyTips: [
      '提手旁竖钩垂直居中，提笔干脆向右上破空。',
      '右部「斤」平撇短促，竖撇舒长，悬针竖破空直下。',
      '光线折射界面偏转，折角刚健。',
    ],
    commonMistakes: '提手旁写得过肥；斤字两撇角度平行无变化。',
  },
  '射': {
    char: '射',
    pinyin: 'shè',
    radical: '寸',
    strokeCount: 10,
    structure: '左右',
    strokeOrder: ['撇', '竖', '横折钩', '横', '横', '撇', '竖', '横', '竖钩', '点'],
    keyTips: [
      '左侧「身」长撇穿过不宜过长，字身窄长挺立。',
      '右侧「寸」横短竖钩长，点在横下内聚。',
      '光线四射穿云破雾，左右张弛有度。',
    ],
    commonMistakes: '身字第七笔撇画过长冲撞寸部；漏写身字中间短横。',
  },
  '光': {
    char: '光',
    pinyin: 'guāng',
    radical: '儿',
    strokeCount: 6,
    structure: '上下',
    strokeOrder: ['竖', '点', '撇', '横', '撇', '竖弯钩'],
    keyTips: [
      '上方中竖高耸，左右点撇呼应聚气。',
      '中横平正承上启下。',
      '下方撇画舒展，竖弯钩宽阔圆润如托日之盘。',
    ],
    commonMistakes: '上方三笔间距不均；竖弯钩过于局促弯度不足。',
  },
  '虚': {
    char: '虚',
    pinyin: 'xū',
    radical: '虍',
    strokeCount: 11,
    structure: '半包围',
    strokeOrder: ['竖', '横', '横钩', '撇', '横', '竖弯钩', '竖', '竖', '点', '撇', '横'],
    keyTips: [
      '虎字头长撇斜伸庇护，横钩锐利有神。',
      '内部「业」变体居中悬空，两竖挺立。',
      '水中倒影折射虚像，空灵通透。',
    ],
    commonMistakes: '虎字头横钩无力；内部业部重心偏移。',
  },

  // Story 8: 《声波介质与风雪电报》
  '介': {
    char: '介',
    pinyin: 'jiè',
    radical: '人',
    strokeCount: 4,
    structure: '上下',
    strokeOrder: ['撇', '捺', '撇', '竖'],
    keyTips: [
      '人字头撇捺大展如天幕，遮蔽下方。',
      '下方两笔左撇右竖，竖画悬针垂直挂正中。',
      '居中传递声音介质，结构严谨平衡。',
    ],
    commonMistakes: '人字头撇捺不够开阔；下部竖画偏向一侧。',
  },
  '质': {
    char: '质',
    pinyin: 'zhì',
    radical: '贝',
    strokeCount: 8,
    structure: '半包围',
    strokeOrder: ['撇', '撇', '横', '竖', '竖', '横折', '撇', '点'],
    keyTips: [
      '左上「斤」部平撇竖撇错落，护持右下。',
      '右下「贝」字形瘦长端正，最后两笔撇点呼应。',
      '钢铁介质质地致密，刚劲沉实。',
    ],
    commonMistakes: '贝字写得过宽冲破外框；斤字竖画过长。'
  },
  '声': {
    char: '声',
    pinyin: 'shēng',
    radical: '士',
    strokeCount: 7,
    structure: '上下',
    strokeOrder: ['横', '竖', '横', '横折', '横', '撇', '捺'],
    keyTips: [
      '上部「士」上横长下横短，中竖稳重。',
      '中间横折平出，下方撇捺舒展交错。',
      '金石有声风雪传音，气韵磅礴。',
    ],
    commonMistakes: '士字误写成土字（下横不可长于上横）；撇捺挤作一团。',
  },
  '传': {
    char: '传',
    pinyin: 'chuán',
    radical: '亻',
    strokeCount: 6,
    structure: '左右',
    strokeOrder: ['撇', '竖', '横', '横', '竖折折', '点'],
    keyTips: [
      '单人旁竖直挺拔，左窄右宽避让自然。',
      '右侧二横平行，竖折折弧度柔美，点在心内。',
      '钢轨传声千里可闻，行云流水。',
    ],
    commonMistakes: '单人旁过胖；右侧转折僵硬无弹性。',
  },
};

/**
 * 将任意 HanziChar 对象转换为 CharacterWritingMeta
 */
export function hanziToWritingMeta(h: HanziChar): CharacterWritingMeta {
  if (ALL_CHARACTER_WRITING_META[h.char]) {
    return ALL_CHARACTER_WRITING_META[h.char];
  }

  let structure: '独体' | '左右' | '上下' | '半包围' | '全包围' = '左右';
  if (!h.components || h.components.length <= 1) {
    structure = '独体';
  } else if (['艹', '日', '宀', '虍', '灬', '人', '士'].includes(h.radical)) {
    structure = '上下';
  } else if (['辶', '门', '尸', '广', '厂'].includes(h.radical)) {
    structure = '半包围';
  } else if (['囗'].includes(h.radical)) {
    structure = '全包围';
  }

  return {
    char: h.char,
    pinyin: h.pinyin,
    radical: h.radical,
    strokeCount: h.strokeCount,
    structure,
    strokeOrder: ['横', '竖', '撇', '捺', '点', '折'].slice(0, Math.min(6, h.strokeCount)),
    keyTips: [
      `部首为「${h.radical}」(${h.radicalName || '偏旁'})，注意构件穿插避让。`,
      `字义：${h.meaning}`,
      `字理速记：${h.mnemonic}`,
    ],
    commonMistakes: '笔画重心失衡，未注意偏旁与主笔呼应。',
  };
}

/**
 * 自动根据故事获取其全套书写目标字符集
 */
export function getWritingTargetsForStory(story: StoryLevel): CharacterWritingMeta[] {
  if (!story.targetCharacters || story.targetCharacters.length === 0) {
    return Object.values(ALL_CHARACTER_WRITING_META).slice(0, 4);
  }
  return story.targetCharacters.map((h) => hanziToWritingMeta(h));
}

/**
 * 优雅降级/自动生成听音选字题目
 */
function generateFallbackSoundQuestions(story: StoryLevel): SoundMatchQuestion[] {
  if (story.soundQuestions && story.soundQuestions.length > 0) {
    return story.soundQuestions;
  }

  const chars = story.targetCharacters || [];
  if (chars.length === 0) {
    return [
      {
        id: 1,
        pinyinPrompt: 'chūn',
        charToGuess: '春',
        audioCue: '请听读音：chūn，找出春暖花开的“春”。',
        meaningHint: '岁首初春，阳气升腾。',
        options: ['春', '舂', '奉', '泰'],
        correctAnswer: '春',
        explanation: '“春”三横长短有致，下有日字居中。',
      },
    ];
  }

  return chars.map((c, i) => {
    // Generate 3 distractors from other chars or common characters
    const otherChars = chars.filter((x) => x.char !== c.char).map((x) => x.char);
    const pool = ['正', '方', '元', '天', '大', '同', '华', '光', '明'];
    const distractors: string[] = [];
    for (const oc of otherChars) {
      if (distractors.length < 3) distractors.push(oc);
    }
    for (const p of pool) {
      if (distractors.length < 3 && p !== c.char && !distractors.includes(p)) {
        distractors.push(p);
      }
    }
    const options = [c.char, ...distractors].sort(() => 0.5 - Math.random());

    return {
      id: i + 1,
      pinyinPrompt: c.pinyin,
      charToGuess: c.char,
      audioCue: `请听读音：${c.pinyin}，找出“${c.examWords?.[0] || c.meaning}”的“${c.char}”。`,
      meaningHint: c.meaning,
      options,
      correctAnswer: c.char,
      explanation: `${c.mnemonic || c.etymology || `“${c.char}”部首为${c.radical}`}`,
    };
  });
}

/**
 * 优雅降级/自动生成偏旁积木关卡
 */
function generateFallbackRadicalGames(story: StoryLevel): RadicalBlockGame[] {
  if (story.radicalGames && story.radicalGames.length > 0) {
    return story.radicalGames;
  }

  const chars = story.targetCharacters || [];
  if (chars.length === 0) {
    return [
      {
        id: 1,
        targetChar: '节',
        pinyin: 'jié',
        meaning: '节气、节日',
        pieces: [
          { id: 'p1', text: '艹', type: 'radical' },
          { id: 'p2', text: '卩', type: 'body' },
        ],
        correctOrder: ['p1', 'p2'],
        formula: '艹 (青草芬芳) + 卩 (竹骨节制) = 节 (良辰佳节)',
        culturalLore: '春回大地，万物萌发，岁岁佳节。',
      },
    ];
  }

  return chars.slice(0, 3).map((c, i) => {
    const rad = c.radical || '部';
    const bodyChar = c.components && c.components.length > 1 ? c.components[1] : '〇';
    return {
      id: i + 1,
      targetChar: c.char,
      pinyin: c.pinyin,
      meaning: c.meaning,
      pieces: [
        { id: `p_${i}_1`, text: rad, type: 'radical' as const },
        { id: `p_${i}_2`, text: bodyChar, type: 'body' as const },
      ],
      correctOrder: [`p_${i}_1`, `p_${i}_2`],
      formula: `${rad} + ${bodyChar} = ${c.char}`,
      culturalLore: c.etymology || c.mnemonic || '部首偏旁组字，领略六书汉字造字奥妙。',
    };
  });
}

/**
 * 获取故事专属的生活情境短句拼接题库
 */
export function getSentenceBuildingForStory(story: StoryLevel): SentencePuzzle[] {
  if (story.sentenceBuilding && story.sentenceBuilding.length > 0) {
    return story.sentenceBuilding;
  }
  if (story.sentencePuzzles && story.sentencePuzzles.length > 0) {
    return story.sentencePuzzles;
  }
  if (STORY_SENTENCE_PUZZLES_MAP[story.id]) {
    return STORY_SENTENCE_PUZZLES_MAP[story.id];
  }
  return STORY_1_SENTENCE_PUZZLES;
}

/**
 * 获取故事专属的原文字形挖空题库
 */
export function getFillInTheBlankForStory(story: StoryLevel): ClozeExercise[] {
  if (story.fillInTheBlank && story.fillInTheBlank.length > 0) {
    return story.fillInTheBlank;
  }
  if (story.clozeExercises && story.clozeExercises.length > 0) {
    return story.clozeExercises;
  }
  return CLOZE_EXERCISES;
}

/**
 * 获取故事专属的400字作文积木模板
 */
export function getEssayBlocksForStory(story: StoryLevel): EssayTemplate {
  return story.essayBlocks || story.essayTemplate || SPRING_FESTIVAL_ESSAY_TEMPLATE;
}

/**
 * 核心绘本题库适配函数：根据传入的 storyId 动态组装演武与文思工坊全套题库
 */
export function getStoryChallengeData(storyId: string): StoryChallengeData {
  const story = getStoryById(storyId);
  const soundQuestions = generateFallbackSoundQuestions(story);
  const radicalGames = generateFallbackRadicalGames(story);
  const writingTargets = getWritingTargetsForStory(story);
  const fillInTheBlank = getFillInTheBlankForStory(story);
  const sentenceBuilding = getSentenceBuildingForStory(story);
  const essayBlocks = getEssayBlocksForStory(story);

  return {
    storyId: story.id,
    storyTitle: story.title,
    storyShortTitle: story.shortTitle,
    soundQuestions,
    radicalGames,
    writingTargets,
    targetCharacters: story.targetCharacters || [],
    fillInTheBlank,
    sentenceBuilding,
    essayBlocks,
  };
}

/**
 * 获取故事绘本的难度星级 (1-5星)
 */
export function getStoryDifficultyStars(story: StoryLevel): number {
  if (typeof story.difficultyStars === 'number' && story.difficultyStars >= 1 && story.difficultyStars <= 5) {
    return story.difficultyStars;
  }
  if (story.difficulty === '高阶名篇') return 4;
  if (story.difficulty === '进阶提升') return 3;
  return 1;
}

