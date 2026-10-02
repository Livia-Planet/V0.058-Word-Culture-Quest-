export interface HanziCulturalTriviaItem {
  id: string;
  char: string;
  pinyin: string;
  radical: string;
  storyId?: string;
  title: string;
  trivia: string;
  ancientMeaning: string;
  funTag: string;
  oracleGlyphDesc?: string;
}

export const HANZI_CULTURAL_TRIVIA_LIST: HanziCulturalTriviaItem[] = [
  {
    id: 'trivia-nian',
    char: '年',
    pinyin: 'nián',
    radical: '禾',
    storyId: 'story-1',
    title: '为什么【年】字原本不是怪兽，而是一束金黄的稻谷？',
    trivia: '在三千年前的商代甲骨文中，“年”字写作一个人弯着腰背着一束沉甸甸的成熟谷禾！因为在远古农耕时代，庄稼一年一熟，所以古人把五谷大丰收称为“过年”。后来人们把驱除岁末灾厄的年兽传说和庆祝丰收的大团圆合在一起，才演变成了今天的春节和“过大年”！',
    ancientMeaning: '甲骨文象形：人负嘉禾，五谷丰登。',
    funTag: '远古农耕密码 · 丰收之始',
    oracleGlyphDesc: '🌾 上禾下人，负穗前行',
  },
  {
    id: 'trivia-chu',
    char: '除',
    pinyin: 'chú',
    radical: '阝(阜)',
    storyId: 'story-1',
    title: '【除】夕的“除”字，原来是皇宫门前的高高台阶？',
    trivia: '“除”字的部首“阝”古称“阜”，是两座相连的土山阶梯。“除”的造字本义就是宫殿大门前逐级而上的石阶！踩着台阶向上走，一级一级迈过去，就引申出了“去掉、更替、跨过”的意思。“除夕”便是踩着岁月的最后一道台阶，告别旧岁，迈进崭新的一年！',
    ancientMeaning: '造字本义：宫殿阶陛，引申为岁月更替、除旧布新。',
    funTag: '宫阙台阶 · 跨越旧岁',
    oracleGlyphDesc: '🏛️ 拾级而上，辞旧迎新',
  },
  {
    id: 'trivia-xi',
    char: '夕',
    pinyin: 'xī',
    radical: '夕',
    storyId: 'story-1',
    title: '【夕】字和【月】字为什么长得这么像孪生兄弟？',
    trivia: '甲骨文里的“夕”其实就是半边露出来的月亮！古人日出而作、日入而息，每当黄昏太阳落山、明月刚在天边露出一小半微光时，就称为“夕”。因为月亮只有在半遮半掩的薄暮时刻才最美，所以“夕”字比“月”字少了一横，代表暮色初临的静谧时光。',
    ancientMeaning: '象形造字：初升之半月，暮色朦胧。',
    funTag: '日暮新月 · 岁月温情',
    oracleGlyphDesc: '🌙 新月一弯，薄暮微光',
  },
  {
    id: 'trivia-shou',
    char: '兽',
    pinyin: 'shòu',
    radical: '犬 / 丷',
    storyId: 'story-1',
    title: '【兽】字上面藏着的，居然是古人捕猎的“捕兽叉”？',
    trivia: '看甲骨文的“兽”字，上面是一个带手柄的网兜或两齿猎叉（即“单”字的雏形），下面是一个陷阱与张牙舞爪的野兽嘴巴！古人在莽荒森林中狩猎，正是用手持猎叉与捕兽网捕捉猛兽。传说中头长尖角的“年兽”，正是集合了上古多种猛兽特征的想象神兽。',
    ancientMeaning: '甲骨文会意：手持猎网猎叉围捕四足野兽。',
    funTag: '上古狩猎 · 勇者之智',
    oracleGlyphDesc: '🐾 网罗百兽，勇御天灾',
  },
  {
    id: 'trivia-fu',
    char: '福',
    pinyin: 'fú',
    radical: '礻',
    storyId: 'story-1',
    title: '【福】字原来是双手捧着一整坛美酒敬献给神明？',
    trivia: '在最古老的甲骨文中，“福”字左边是一个祈神的祭台（礻），右边是一双虔诚的手紧紧抱着一口装满醇香粮食酒的酒坛（畐）！在远古时代，只有五谷大丰收、家境富足才能酿出美酒。双手把美酒献给祖先与神明祈求安康，这份真挚的感恩就是中国人最初的“福气”！',
    ancientMeaning: '甲骨文会意：双手捧醇酒祭神，祈求安泰。',
    funTag: '双手捧醇酒 · 纳祥承安',
    oracleGlyphDesc: '🍶 敬天法祖，五福临门',
  },
  {
    id: 'trivia-bao',
    char: '爆',
    pinyin: 'bào',
    radical: '火',
    storyId: 'story-1',
    title: '古人没有火药时，是怎么让竹子发出“爆”鸣声的？',
    trivia: '古时候可没有黑火药和纸筒鞭炮！聪明的古人发现，刚砍下来的青竹竿内部有一节一节封闭的竹腔，把湿竹竿直接扔进烈火中燃烧，竹腔里的空气受热急速膨胀，“啪！砰！”地剧烈炸响！这便是名副其实的“爆竹”，清脆的炸裂声成功把怕响声的年兽吓得落荒而逃！',
    ancientMeaning: '形声造字：从火从暴，火烧受热疾速炸裂。',
    funTag: '青竹炸裂 · 智慧驱邪',
    oracleGlyphDesc: '🔥 火燃青节，声震群山',
  },
  {
    id: 'trivia-zhou',
    char: '舟',
    pinyin: 'zhōu',
    radical: '舟',
    storyId: 'story-2',
    title: '为什么【舟】字横着看就像一只翘起两端的小木船？',
    trivia: '三千年前甲骨文的“舟”，就是一根大树干中间掏空做成的独木舟！上下两个尖尖翘起的是船头和船尾，中间的几道横线就是加固船体的隔舱板和船桨。端午节划的“龙舟”，便是在轻快的小舟上雕刻龙头、彩绘龙鳞，化身为江中飞驰的神龙！',
    ancientMeaning: '象形造字：中流砥柱，一叶扁舟荡沧浪。',
    funTag: '中流砥柱 · 同舟共济',
    oracleGlyphDesc: '🛶 独木成舟，轻波远渡',
  },
  {
    id: 'trivia-zong',
    char: '粽',
    pinyin: 'zòng',
    radical: '米',
    storyId: 'story-2',
    title: '【粽】字为什么带“宗”字？粽子最初竟有尖尖的牛角？',
    trivia: '古时候粽子叫做“角黍”，古人用青箬叶把黏黍糯米包成尖锐的牛角模样，用来在宗庙祭祀（宗）祖先。后来楚国大诗人屈原投汨罗江，百姓舍不得屈原遗体被江中鱼虾伤害，纷纷划龙舟投下这种神圣的角黍裹米，久而久之便演变成了纪念忠魂的端午美食！',
    ancientMeaning: '形声造字：从米从宗，宗庙祭祀之神圣米食。',
    funTag: '菰叶飘香 · 浩气忠魂',
    oracleGlyphDesc: '🌿 青叶裹玉，千年情思',
  },
  {
    id: 'trivia-jia',
    char: '家',
    pinyin: 'jiā',
    radical: '宀',
    storyId: 'story-1',
    title: '为什么温暖的【家】字底下，竟然住着一头大胖猪？',
    trivia: '看甲骨文的“家”，上面是坚固房舍的屋顶（宀），下面则是一头大腹便便的“豕”（古语里的猪）。在蛮荒农耕时代，野兽随时出没，家里若能有一栋结实的房子，还能在屋下圈养牲畜，不仅代表顿顿有肉、财富充裕，更代表不必四处流浪。有避风港和存粮，就是最温暖的“家”！',
    ancientMeaning: '会意造字：屋下圈豕，定居丰衣足食。',
    funTag: '屋下有豕 · 定居温饱',
    oracleGlyphDesc: '🏡 瓦舍安澜，阖府融融',
  },
  {
    id: 'trivia-xiu',
    char: '休',
    pinyin: 'xiū',
    radical: '亻',
    storyId: 'story-3',
    title: '最惬意的【休】字，原来是一个人靠在大树下乘凉？',
    trivia: '甲骨文的“休”字格外生动：左边是一个人（亻），右边是一棵枝繁叶茂的大树（木）！古代农人顶着烈日在大田里锄禾插秧，累得满头大汗时，走到大树荫蔽下倚靠树干，微风吹拂，闭目养神。这就是最纯粹的“休养生息”，大自然是大地上最舒适的摇篮！',
    ancientMeaning: '会意造字：人依木阴，歇息养神。',
    funTag: '倚树吹风 · 张弛有度',
    oracleGlyphDesc: '🌳 人傍嘉木，清风徐来',
  },
  {
    id: 'trivia-yue',
    char: '月',
    pinyin: 'yuè',
    radical: '月',
    storyId: 'story-4',
    title: '天上的【月】亮那么圆，为什么字形却是一弯月牙？',
    trivia: '古人造字时抬头观察：太阳天天都是圆圆滚滚的，所以“日”字画成圆形；而月亮大多数夜晚都是弯弯的月牙儿，只有月中短短几天才圆满。为了不让“日”和“月”混淆，聪明的仓颉就把月亮特意画成了残月与娥眉月的优美弧线，一目了然！',
    ancientMeaning: '象形造字：阙而又满，阴晴圆缺之美。',
    funTag: '娥眉皎洁 · 望舒引梦',
    oracleGlyphDesc: '🌔 弧光皎皎，天地幽明',
  },
  {
    id: 'trivia-tu',
    char: '兔',
    pinyin: 'tù',
    radical: '兔',
    storyId: 'story-4',
    title: '【兔】字最后那一点，原来是小兔子抖动的小短尾巴？',
    trivia: '看甲骨文的“兔”，长长的两只招风耳高高竖立，弓着身子前腿趴着，而最关键的就是右下角那一点——正是毛茸茸的圆球短尾巴！古人夸赞跑得飞快叫“动若脱兔”。神话里广寒宫的小白兔捣着长生灵药，其实是古人对健康长寿、灵动活泼的美好期盼！',
    ancientMeaning: '象形造字：长耳短尾，机敏跃动。',
    funTag: '长耳灵动 · 仙药长生',
    oracleGlyphDesc: '🐇 竖耳翘尾，蹦跳如飞',
  },
];

/**
 * Helper to get cold trivia list for a specific story or all
 */
export function getTriviaForStory(storyId?: string): HanziCulturalTriviaItem[] {
  if (!storyId) return HANZI_CULTURAL_TRIVIA_LIST;
  const filtered = HANZI_CULTURAL_TRIVIA_LIST.filter((t) => t.storyId === storyId);
  return filtered.length > 0 ? filtered : HANZI_CULTURAL_TRIVIA_LIST;
}
