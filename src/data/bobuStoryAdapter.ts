/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  HanziChar,
  StorySentence,
  SoundMatchQuestion,
  RadicalBlockGame,
  CulturalCard,
  ClozeExercise,
  EssayTemplate,
} from './level1Data';
import { StoryLevel, StoryCategory } from './storyLevels';
import rawMysteriesData from './bobuScienceMysteries.json';

export interface RawBobuMystery {
  id: string;
  title: string;
  content: string;
  question: string;
  options: string[];
  answer: number;
  sciencePrinciple: string;
}

// -------------------------------------------------------------
// 高频汉字拼音速查表 (涵盖三篇科普探案全量汉字)
// -------------------------------------------------------------
export const PINYIN_TABLE: Record<string, string> = {
  "一":"yī","七":"qī","三":"sān","上":"shàng","下":"xià","不":"bù","东":"dōng","严":"yán","个":"gè","中":"zhōng",
  "为":"wéi","举":"jǔ","久":"jiǔ","么":"me","之":"zhī","乖":"guāi","也":"yě","乱":"luàn","了":"le","事":"shì",
  "二":"èr","交":"jiāo","亮":"liàng","人":"rén","什":"shén","今":"jīn","介":"jiè","从":"cóng","仔":"zǐ","他":"tā",
  "们":"men","任":"rèn","伙":"huǒ","会":"huì","传":"chuán","伤":"shāng","伯":"bó","伴":"bàn","伸":"shēn","但":"dàn",
  "位":"wèi","住":"zhù","何":"hé","作":"zuò","依":"yī","侦":"zhēn","信":"xìn","值":"zhí","偷":"tōu","傍":"bàng",
  "像":"xiàng","光":"guāng","兔":"tù","兜":"dōu","入":"rù","全":"quán","共":"gòng","关":"guān","兴":"xīng","其":"qí",
  "兽":"shòu","内":"nèi","冬":"dōng","冰":"bīng","冲":"chōng","冷":"lěng","冻":"dòng","净":"jìng","准":"zhǔn","减":"jiǎn",
  "几":"jǐ","出":"chū","刚":"gāng","别":"bié","到":"dào","刺":"cì","前":"qián","剔":"tī","剧":"jù","剩":"shèng",
  "力":"lì","动":"dòng","勘":"kān","匙":"shi","半":"bàn","占":"zhàn","危":"wēi","却":"què","卵":"luǎn","厚":"hòu",
  "原":"yuán","去":"qù","双":"shuāng","发":"fā","口":"kǒu","古":"gǔ","只":"zhǐ","叭":"bā","可":"kě","台":"tái",
  "号":"hào","叹":"tàn","合":"hé","同":"tóng","名":"míng","后":"hòu","向":"xiàng","吓":"xià","吞":"tūn","吧":"ba",
  "听":"tīng","吹":"chuī","员":"yuán","周":"zhōu","味":"wèi","呼":"hū","命":"mìng","和":"hé","响":"xiǎng","哭":"kū",
  "唯":"wéi","啦":"la","啸":"xiào","喇":"lǎ","喊":"hǎn","嘴":"zuǐ","噬":"shì","四":"sì","回":"huí","团":"tuán",
  "围":"wéi","在":"zài","地":"de","场":"chǎng","坍":"tān","坏":"huài","块":"kuài","坚":"jiān","型":"xíng","基":"jī",
  "堵":"dǔ","塌":"tā","塔":"tǎ","塞":"sè","境":"jìng","墙":"qiáng","声":"shēng","处":"chù","备":"bèi","夏":"xià",
  "外":"wài","夜":"yè","大":"dà","天":"tiān","太":"tài","失":"shī","头":"tóu","奇":"qí","奋":"fèn","好":"hǎo",
  "如":"rú","子":"zi","孔":"kǒng","存":"cún","安":"ān","完":"wán","实":"shí","室":"shì","家":"jiā","寂":"jì",
  "密":"mì","寒":"hán","察":"chá","对":"duì","射":"shè","将":"jiāng","小":"xiǎo","就":"jiù","居":"jū","展":"zhǎn",
  "属":"shǔ","山":"shān","岸":"àn","巡":"xún","己":"jǐ","已":"yǐ","干":"gān","平":"píng","幽":"yōu","底":"dǐ",
  "废":"fèi","度":"dù","座":"zuò","延":"yán","开":"kāi","异":"yì","弃":"qì","形":"xíng","彩":"cǎi","彻":"chè",
  "往":"wǎng","得":"de","微":"wēi","心":"xīn","快":"kuài","怎":"zěn","怒":"nù","急":"jí","性":"xìng","怪":"guài",
  "息":"xī","恶":"è","情":"qíng","想":"xiǎng","慎":"shèn","成":"chéng","我":"wǒ","或":"huò","所":"suǒ","扇":"shàn",
  "手":"shǒu","扑":"pū","打":"dǎ","扩":"kuò","扬":"yáng","抄":"chāo","把":"bǎ","抓":"zhuā","抖":"dǒu","折":"zhé",
  "护":"hù","报":"bào","拢":"lǒng","拧":"nǐng","拼":"pīn","拿":"ná","按":"àn","挖":"wā","振":"zhèn","捉":"zhuō",
  "捕":"bǔ","捞":"lāo","捷":"jié","掏":"tāo","排":"pái","掘":"jué","探":"tàn","接":"jiē","推":"tuī","插":"chā",
  "援":"yuán","摄":"shè","摆":"bǎi","摘":"zhāi","摩":"mó","摸":"mō","撕":"sī","撤":"chè","撬":"qiào","收":"shōu",
  "放":"fàng","敏":"mǐn","救":"jiù","散":"sàn","数":"shù","整":"zhěng","文":"wén","断":"duàn","斯":"sī","方":"fāng",
  "旁":"páng","无":"wú","日":"rì","旧":"jiù","时":"shí","明":"míng","星":"xīng","昨":"zuó","是":"shì","晒":"shài",
  "晚":"wǎn","晨":"chén","晶":"jīng","暑":"shǔ","暗":"àn","暴":"bào","更":"gèng","曾":"céng","最":"zuì","有":"yǒu",
  "望":"wàng","本":"běn","朵":"duǒ","机":"jī","杆":"gān","条":"tiáo","来":"lái","松":"sōng","极":"jí","林":"lín",
  "果":"guǒ","柄":"bǐng","查":"chá","标":"biāo","样":"yàng","根":"gēn","框":"kuàng","桩":"zhuāng","桶":"tǒng","森":"sēn",
  "楚":"chǔ","次":"cì","正":"zhèng","死":"sǐ","毁":"huǐ","每":"měi","毛":"máo","氏":"shì","气":"qì","水":"shuǐ",
  "求":"qiú","沉":"chén","没":"méi","河":"hé","波":"bō","泥":"ní","洗":"xǐ","洞":"dòng","流":"liú","浅":"qiǎn",
  "浑":"hún","浣":"huàn","涡":"wō","深":"shēn","清":"qīng","温":"wēn","湖":"hú","滑":"huá","滚":"gǔn","滩":"tān",
  "漆":"qī","漩":"xuán","澈":"chè","火":"huǒ","灵":"líng","点":"diǎn","烁":"shuò","烫":"tàng","热":"rè","焊":"hàn",
  "然":"rán","熊":"xióng","爱":"ài","爷":"yé","片":"piàn","物":"wù","狂":"kuáng","狐":"hú","独":"dú","狸":"lí",
  "猛":"měng","獭":"tǎ","玩":"wán","环":"huán","现":"xiàn","珍":"zhēn","球":"qiú","理":"lǐ","生":"shēng","用":"yòng",
  "电":"diàn","界":"jiè","畔":"pàn","留":"liú","痕":"hén","白":"bái","百":"bǎi","的":"de","皮":"pí","盔":"kuī",
  "盖":"gài","目":"mù","盯":"dīng","直":"zhí","看":"kàn","眼":"yǎn","着":"zhe","睁":"zhēng","睛":"jīng","瞄":"miáo",
  "瞬":"shùn","石":"shí","矿":"kuàng","破":"pò","砸":"zá","硬":"yìng","确":"què","碎":"suì","碰":"pèng","礼":"lǐ",
  "神":"shén","祟":"suì","秘":"mì","空":"kōng","突":"tū","站":"zhàn","竟":"jìng","竹":"zhú","笔":"bǐ","第":"dì",
  "管":"guǎn","米":"mǐ","糖":"táng","索":"suǒ","紧":"jǐn","纹":"wén","线":"xiàn","细":"xì","结":"jié","绝":"jué",
  "网":"wǎng","置":"zhì","翘":"qiào","翠":"cuì","翡":"fěi","老":"lǎo","而":"ér","耍":"shuǎ","耳":"ěr","联":"lián",
  "胶":"jiāo","胸":"xiōng","能":"néng","腰":"yāo","膝":"xī","自":"zì","至":"zhì","艰":"jiān","节":"jié","芒":"máng",
  "芦":"lú","花":"huā","苇":"wěi","茸":"róng","草":"cǎo","荡":"dàng","莹":"yíng","营":"yíng","落":"luò","董":"dǒng",
  "藏":"cáng","虹":"hóng","虽":"suī","衰":"shuāi","被":"bèi","西":"xī","要":"yào","见":"jiàn","观":"guān","角":"jiǎo",
  "讲":"jiǎng","诡":"guǐ","误":"wù","谨":"jǐn","败":"bài","质":"zhì","贴":"tiē","贵":"guì","走":"zǒu","赶":"gǎn",
  "起":"qǐ","趴":"pā","跃":"yuè","跳":"tiào","身":"shēn","躺":"tǎng","轨":"guǐ","转":"zhuàn","边":"biān","迅":"xùn",
  "还":"hái","这":"zhè","进":"jìn","连":"lián","迹":"jì","退":"tuì","透":"tòu","速":"sù","逻":"luó","遇":"yù",
  "道":"dào","遭":"zāo","避":"bì","那":"nà","部":"bù","都":"dōu","酷":"kù","里":"lǐ","重":"zhòng","野":"yě",
  "金":"jīn","钢":"gāng","钥":"yào","铁":"tiě","铜":"tóng","银":"yín","铺":"pū","锁":"suǒ","锐":"ruì","锤":"chuí",
  "锹":"qiāo","镜":"jìng","长":"cháng","门":"mén","闪":"shǎn","间":"jiān","队":"duì","阳":"yáng","阵":"zhèn","降":"jiàng",
  "除":"chú","陨":"yǔn","随":"suí","隐":"yǐn","难":"nán","雪":"xuě","静":"jìng","面":"miàn","音":"yīn","顶":"dǐng",
  "颗":"kē","风":"fēng","食":"shí","餐":"cān","香":"xiāng","骗":"piàn","骨":"gǔ","高":"gāo","鱼":"yú","鹅":"é",
  "鹿":"lù","黄":"huáng","黑":"hēi","鼠":"shǔ","齐":"qí","胀":"zhàng","缩":"suō","虚":"xū"
};

// -------------------------------------------------------------
// 1. STORY 6: 铜、胀、缩、热 核心生字库
// -------------------------------------------------------------
export const STORY_6_TARGET_CHARACTERS: HanziChar[] = [
  {
    id: 'tong',
    char: '铜',
    pinyin: 'tóng',
    radical: '钅',
    radicalName: '金字旁 (金属延展)',
    components: ['钅', '同'],
    etymology: '形声字。从金，同声。红黄色优良导热金属，具有热胀冷缩物理特性。',
    meaning: '铜金属；青铜、黄铜；具有优良导热性。',
    mnemonic: '金旁一同铸铜门，热胀冷缩显神通。',
    strokeCount: 11,
    examWords: ['黄铜', '铜门', '青铜器', '铜墙铁壁'],
    exampleSentence: '烈日暴晒下的黄铜大门因为受热膨胀，紧紧卡在了门框中。',
    unlocked: true,
  },
  {
    id: 'zhang',
    char: '胀',
    pinyin: 'zhàng',
    radical: '月',
    radicalName: '月字旁 (肉月旁/体积变大)',
    components: ['月', '张'],
    etymology: '形声字。从月，张声。体积膨胀扩大，受热时分子间距悄悄增大。',
    meaning: '膨胀；体积增大；发胀。',
    mnemonic: '月随张弛体积扩，遇热膨胀微粒跃。',
    strokeCount: 8,
    examWords: ['热胀冷缩', '膨胀', '气胀', '肿胀'],
    exampleSentence: '金属受热后会发生膨胀，这是日常生活中常见的热胀现象。',
    unlocked: true,
  },
  {
    id: 'suo',
    char: '缩',
    pinyin: 'suō',
    radical: '纟',
    radicalName: '绞丝旁 (紧收聚集)',
    components: ['纟', '宿'],
    etymology: '形声字。从糸，宿声。由大变小，向内聚集紧缩。',
    meaning: '缩小；收缩；受冷体积减小。',
    mnemonic: '丝绳紧束归宿定，遇冷收缩裂缝清。',
    strokeCount: 14,
    examWords: ['收缩', '缩小', '缩短', '热胀冷缩'],
    exampleSentence: '冰块敷在滚烫的铜门上，黄铜遇冷收缩，大门顺利打开了。',
    unlocked: true,
  },
  {
    id: 're',
    char: '热',
    pinyin: 'rè',
    radical: '灬',
    radicalName: '四点底 (烈火热源)',
    components: ['执', '灬'],
    etymology: '会意兼形声字。从火，执声。温度高，物体分子热运动剧烈。',
    meaning: '温度高；热量；热能。',
    mnemonic: '四点烈火底上升，温度炽热万物膨。',
    strokeCount: 10,
    examWords: ['炎热', '热量', '热胀冷缩', '热情'],
    exampleSentence: '西晒的阳光炽热无比，将天文台的金属门烤得滚烫。',
    unlocked: true,
  },
];

// -------------------------------------------------------------
// 2. STORY 7: 折、射、光、虚 核心生字库
// -------------------------------------------------------------
export const STORY_7_TARGET_CHARACTERS: HanziChar[] = [
  {
    id: 'zhe',
    char: '折',
    pinyin: 'zhé',
    radical: '扌',
    radicalName: '提手旁 (手持斧截/光路偏折)',
    components: ['扌', '斤'],
    etymology: '会意字。从手，从斤（斧），断木也。引申为光线在不同介质界面改变传播方向。',
    meaning: '折断；弯曲、转折；光的折射。',
    mnemonic: '手持利斧断木折，光穿水面路径斜。',
    strokeCount: 7,
    examWords: ['折射', '转折', '折叠', '百折不挠'],
    exampleSentence: '笔直的芦苇插入水中，在水面处看起来像被折断了一样。',
    unlocked: true,
  },
  {
    id: 'she',
    char: '射',
    pinyin: 'shè',
    radical: '寸',
    radicalName: '寸字旁 (发箭引申射线)',
    components: ['身', '寸'],
    etymology: '会意字。金文字形像箭在弦上引而待发。引申为光线由发光体向四周发出。',
    meaning: '射出；光线发射、照射、反射。',
    mnemonic: '身引寸矢发长空，光线四射映苍穹。',
    strokeCount: 10,
    examWords: ['折射', '反射', '照射', '射线'],
    exampleSentence: '水底彩虹球反射的光线斜射入空气时，发生了奇妙的折射。',
    unlocked: true,
  },
  {
    id: 'guang',
    char: '光',
    pinyin: 'guāng',
    radical: '儿',
    radicalName: '儿字底 (人在火上举火照明)',
    components: ['⺌', '兀'],
    etymology: '会意字。甲骨文像人头上戴着火把，照亮四方。',
    meaning: '光线；光明；光芒；可见光波。',
    mnemonic: '火把高擎照四方，七彩晶球映日光。',
    strokeCount: 6,
    examWords: ['光线', '折射光', '阳光', '光明磊落'],
    exampleSentence: '阳光照耀在清澈的湖面上，泛起粼粼的金色波光。',
    unlocked: true,
  },
  {
    id: 'xu',
    char: '虚',
    pinyin: 'xū',
    radical: '虍',
    radicalName: '虎字头 (空丘旷远)',
    components: ['虍', '业'],
    etymology: '形声兼会意。从虍，本义为空虚、不实。光学上指折射反向延长线交汇形成的虚像。',
    meaning: '空虚；虚假；光学中的虚像。',
    mnemonic: '虎踞高丘空旷景，眼睛所见是虚影。',
    strokeCount: 11,
    examWords: ['虚像', '虚实', '虚心', '不虚此行'],
    exampleSentence: '我们眼睛看到的水晶球其实是折射形成的虚像，真球在更深处。',
    unlocked: true,
  },
];

// -------------------------------------------------------------
// 3. STORY 8: 介、质、声、传 核心生字库
// -------------------------------------------------------------
export const STORY_8_TARGET_CHARACTERS: HanziChar[] = [
  {
    id: 'jie',
    char: '介',
    pinyin: 'jiè',
    radical: '人',
    radicalName: '人字头 (居中传递)',
    components: ['人', '八'],
    etymology: '象形字。古文字形像人身披铠甲居中介护。引申为在两方之间传递物理作用的媒介。',
    meaning: '媒介；介质；中间介绍、传递。',
    mnemonic: '一人居中八方连，声波传递靠介质。',
    strokeCount: 4,
    examWords: ['介质', '媒介', '介绍', '煞费苦心'],
    exampleSentence: '声波不能在真空中传播，必须依靠空气、水或钢铁等介质。',
    unlocked: true,
  },
  {
    id: 'zhi',
    char: '质',
    pinyin: 'zhì',
    radical: '贝',
    radicalName: '贝字底 (物质本底)',
    components: ['斤', '贝'],
    etymology: '会意字。从斤，从贝。古代以贝为货币，作抵押物。引申为事物的本质、构成材料。',
    meaning: '物质；本质；实体品质。',
    mnemonic: '斤斤计较贝本色，钢铁介质质地硬。',
    strokeCount: 8,
    examWords: ['介质', '物质', '质量', '朴实无华'],
    exampleSentence: '钢铁的密度大、质地坚密，能够超高速传递敲击产生的振动。',
    unlocked: true,
  },
  {
    id: 'sheng',
    char: '声',
    pinyin: 'shēng',
    radical: '士',
    radicalName: '士字头 (敲击石磬发声)',
    components: ['士', '𠃍', '殳'],
    etymology: '形声字。古文从磬，殳声。本指敲击磬产生的乐音，引申为一切声音与声波。',
    meaning: '声音；声波；敲击振动产生的波动。',
    mnemonic: '石磬敲响振长空，万籁俱寂声不绝。',
    strokeCount: 7,
    examWords: ['声音', '声波', '声速', '风声鹤唳'],
    exampleSentence: '声音在钢铁中传播的速度，比在空气中快了十多倍。',
    unlocked: true,
  },
  {
    id: 'chuan',
    char: '传',
    pinyin: 'chuán',
    radical: '亻',
    radicalName: '单人旁 (人递接力)',
    components: ['亻', '专'],
    etymology: '形声字。从人，专声。古代驿站递送公文接力传递，引申为波动物质向远方传播。',
    meaning: '传递；传播；传输；传导。',
    mnemonic: '单立人旁专心递，钢轨传声破狂风。',
    strokeCount: 6,
    examWords: ['传播', '传递', '传导', '薪火相传'],
    exampleSentence: '老鹿爷爷敲击钢轨的求救信号，顺着铁轨迅速传播到了洞口。',
    unlocked: true,
  },
];

// 文本拆分与汉字拼音标记转换器
export function convertTextToParagraphs(
  content: string,
  targetChars: HanziChar[]
): StorySentence[] {
  const targetMap = new Map<string, string>();
  targetChars.forEach((t) => targetMap.set(t.char, t.id));

  const paragraphs = content
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return paragraphs.map((paraText, pIdx) => {
    const tokens: {
      char: string;
      pinyin: string;
      isTarget?: boolean;
      charId?: string;
    }[] = [];

    for (const char of paraText) {
      if (targetMap.has(char)) {
        tokens.push({
          char,
          pinyin: PINYIN_TABLE[char] || '',
          isTarget: true,
          charId: targetMap.get(char),
        });
      } else if (/[\u4e00-\u9fa5]/.test(char)) {
        tokens.push({
          char,
          pinyin: PINYIN_TABLE[char] || '',
        });
      } else {
        tokens.push({
          char,
          pinyin: '',
        });
      }
    }

    return {
      id: pIdx + 1,
      audioPrompt: paraText,
      tokens,
    };
  });
}

// -------------------------------------------------------------
// 核心适配器映射函数：使用 .map() 将原始科普谜题适配为完整 StoryLevel
// -------------------------------------------------------------
export function adaptBobuMysteries(rawList: RawBobuMystery[]): StoryLevel[] {
  const metaConfigs = [
    {
      shortTitle: '黄铜密门',
      subtitle: '热胀冷缩 · 密室大侦探',
      theme: '物理奥秘 · 固体热胀冷缩与分子间隙',
      difficulty: '基础必修' as const,
      difficultyStars: 3,
      icon: '🌡️',
      coverTheme: {
        gradient: 'from-amber-950 via-orange-900 to-yellow-950',
        border: 'border-amber-400/80',
        glow: 'rgba(245, 158, 11, 0.4)',
        badgeBg: 'bg-amber-500/30',
        badgeText: 'text-amber-200',
      },
      targetChars: STORY_6_TARGET_CHARACTERS,
      summary:
        '酷暑夏夜，天文台珍藏陨石标本的黄铜密室大门神秘“锁死”。大家猜测是密室幽灵作祟，外星兔子侦探Bobu仅凭一桶野餐冰块，就用“热胀冷缩”原理轻松开门破案！',
      soundQuestions: [
        {
          id: 1,
          pinyinPrompt: 'tóng',
          charToGuess: '铜',
          audioCue: '请听读音：tóng，并找出对应金属汉字。',
          meaningHint: '红黄色优良导热金属，常用于制作钥匙和大门。',
          options: ['铜', '同', '童', '桐'],
          correctAnswer: '铜',
          explanation: '金字旁的“铜”代表金属黄铜，遇到烈日高温会悄悄受热膨胀。',
        },
        {
          id: 2,
          pinyinPrompt: 'zhàng',
          charToGuess: '胀',
          audioCue: '请听读音：zhàng，找出热胀冷缩的“胀”。',
          meaningHint: '体积变大，分子间距增加。',
          options: ['账', '胀', '张', '长'],
          correctAnswer: '胀',
          explanation: '“胀”指体积增大，受热时物体内部微粒剧烈振动导致向外膨胀。',
        },
      ],
      radicalGames: [
        {
          id: 1,
          targetChar: '铜',
          pinyin: 'tóng',
          meaning: '黄铜、青铜金属',
          pieces: [
            { id: 'p1', text: '钅', type: 'radical' as const },
            { id: 'p2', text: '同', type: 'body' as const },
          ],
          correctOrder: ['p1', 'p2'],
          formula: '钅 + 同 = 铜',
          culturalLore: '金属遇热膨胀、遇冷收缩，大自然奇妙的物理法则！',
        },
        {
          id: 2,
          targetChar: '热',
          pinyin: 'rè',
          meaning: '温度高、炽热',
          pieces: [
            { id: 'p1', text: '执', type: 'body' as const },
            { id: 'p2', text: '灬', type: 'radical' as const },
          ],
          correctOrder: ['p1', 'p2'],
          formula: '执 + 灬 = 热',
          culturalLore: '四点底代表熊熊燃烧的烈火，温度越高，热膨胀越显著。',
        },
      ] as RadicalBlockGame[],
      culturalCards: [
        {
          id: 'card-science-thermal',
          title: '热胀冷缩与生活智慧',
          badge: '科学探案',
          tag: '物理科普 · 固体形变',
          quote: '万物皆有隙，遇热而舒，逢寒而敛。',
          description:
            '铁路铁轨之间必须留有微小的缝隙，大桥的桥面也设有伸缩缝，正是为了防止炎炎夏日金属受热膨胀挤压变形！',
          essayPhrases: ['热胀冷缩', '微观察见真知', '抽丝剥茧', '迎刃而解'],
          iconName: 'Flame',
          unlocked: true,
        },
      ],
      clozeExercises: [
        {
          id: 601,
          title: '第一段：黄铜密门热胀冷缩 (口述转文字填空)',
          contextSentence: '滚烫的黄[铜]大门敷上冰块后遇冷收[缩]，排除了[幽]灵作祟的猜疑。',
          referenceAudio: '滚烫的黄铜大门敷上冰块后遇冷收缩，排除了幽灵作祟的猜疑。',
          blanks: [
            {
              index: 0,
              charId: 'tong',
              correctChar: '铜',
              pinyinHint: 'tóng',
              options: ['铜', '同', '童'],
            },
            {
              index: 1,
              charId: 'suo',
              correctChar: '缩',
              pinyinHint: 'suō',
              options: ['缩', '索', '宿'],
            },
          ],
        },
      ] as ClozeExercise[],
      essayTemplate: {
        title: '《我的科学侦探小实验》—— 400字小作文积木',
        theme: '科学探案 · 发现身边的热胀冷缩奥秘',
        sections: [
          {
            key: 'beginning',
            title: '一、 开头：引出谜题背景 (约50字)',
            targetWordCount: '40 - 60字',
            guideline: '点明时间、地点与神秘不可思议的卡死难题。',
            starterPrompts: [
              '在这个炎热的夏日午后，我和外星兔子侦探Bobu遇到了一件神奇的怪事。',
              '烈日把天文台的地面烤得发烫，一扇厚重的大铜门竟然神秘地卡死了。',
            ],
            recommendedPhrases: ['烈日炎炎', '不可思议', '仔细观察', '疑云密布'],
            defaultText: '烈日炎炎的夏日午后，天文台密室的大铜门突然卡死了。大家议论纷纷，我和侦探Bobu决定抽丝剥茧一探究竟。',
          },
          {
            key: 'middle',
            title: '二、 中间：生动叙述侦破过程与科学实验 (约300字)',
            targetWordCount: '280 - 320字',
            guideline: '描写观察细节、运用冰块降温缩小的推理过程及实验成功时的激动心情。',
            starterPrompts: [
              'Bobu仔细查看了门框，发现西晒阳光把黄铜烤得滚烫发热。',
              '我们将碎冰块均匀敷在铜门边缘，奇迹悄悄发生了。',
            ],
            recommendedPhrases: ['热胀冷缩', '微粒运动', '迎刃而解', '恍然大悟', '科学魔法'],
            defaultText: 'Bobu蹲下身子，轻轻抚摸滚烫的铜门。原来，金属在40度高温暴晒下发生了“受热膨胀”，分子间隙变大，整扇门变宽变胖卡在了铁框里！\n\n我们找来了一桶冰块，小心翼翼地敷在门缝边缘。伴随着丝丝白气，黄铜迅速降温冷缩。咔哒一声，松鼠伯伯轻轻一拧钥匙，沉重大门应声而开！周围的小伙伴们都欢呼雀跃，赞叹科学的奇妙威力。',
          },
          {
            key: 'ending',
            title: '三、 结尾：感悟生活中的科学法则 (约50字)',
            targetWordCount: '40 - 60字',
            guideline: '总结热胀冷缩在生活中的妙用，抒发对科学探索的热爱。',
            starterPrompts: [
              '科学就像一把神奇的金钥匙，总能打开大自然留给我们的无尽奥秘。',
              '原来生活中处处有科学，只要用心观察，每个人都是了不起的小侦探！',
            ],
            recommendedPhrases: ['恍然大悟', '善于观察', '探索未知', '其乐无穷'],
            defaultText: '这次探案让我深刻体会到：只要善于观察思考，用科学原理武装头脑，生活中的难题都能迎刃而解！',
          },
        ],
      } as EssayTemplate,
    },
    {
      shortTitle: '湖底彩球',
      subtitle: '光的折射 · 湖底彩虹球',
      theme: '光学奥秘 · 光的折射与虚像',
      difficulty: '进阶提升' as const,
      difficultyStars: 4,
      icon: '🌈',
      coverTheme: {
        gradient: 'from-cyan-950 via-teal-900 to-blue-950',
        border: 'border-cyan-400/80',
        glow: 'rgba(6, 182, 212, 0.4)',
        badgeBg: 'bg-cyan-500/30',
        badgeText: 'text-cyan-200',
      },
      targetChars: STORY_7_TARGET_CHARACTERS,
      summary:
        '皮皮心爱的彩虹水晶球掉进清澈齐膝的翡翠湖，小动物们跳下水伸手猛抓却屡屡扑空。Bobu识破了光从水射入空气时的“折射虚像”，一网精准捞出彩球！',
      soundQuestions: [
        {
          id: 1,
          pinyinPrompt: 'zhé',
          charToGuess: '折',
          audioCue: '请听读音：zhé，找出折射的“折”。',
          meaningHint: '弯曲、偏折，光线在介质界面改变传播方向。',
          options: ['折', '浙', '哲', '者'],
          correctAnswer: '折',
          explanation: '提手旁的“折”在这里指光线在水面发生弯折偏向。',
        },
        {
          id: 2,
          pinyinPrompt: 'shè',
          charToGuess: '射',
          audioCue: '请听读音：shè，找出反射与折射的“射”。',
          meaningHint: '光线由光源或物体向外发出。',
          options: ['射', '舍', '社', '涉'],
          correctAnswer: '射',
          explanation: '“射”表示光线向外照射和传播。',
        },
      ],
      radicalGames: [
        {
          id: 1,
          targetChar: '折',
          pinyin: 'zhé',
          meaning: '偏折、弯折',
          pieces: [
            { id: 'p1', text: '扌', type: 'radical' as const },
            { id: 'p2', text: '斤', type: 'body' as const },
          ],
          correctOrder: ['p1', 'p2'],
          formula: '扌 + 斤 = 折',
          culturalLore: '光线从水中斜射入空气时会发生折射，眼睛看到的其实是虚像！',
        },
        {
          id: 2,
          targetChar: '虚',
          pinyin: 'xū',
          meaning: '虚幻、虚像',
          pieces: [
            { id: 'p1', text: '虍', type: 'radical' as const },
            { id: 'p2', text: '业', type: 'body' as const },
          ],
          correctOrder: ['p1', 'p2'],
          formula: '虍 + 业 = 虚',
          culturalLore: '水底的水晶球实际位置比眼睛看到的虚像更深。',
        },
      ] as RadicalBlockGame[],
      culturalCards: [
        {
          id: 'card-science-optics',
          title: '光的折射与渔夫智慧',
          badge: '科学探案',
          tag: '物理科普 · 几何光学',
          quote: '潭清疑水浅，见底现虚形。',
          description:
            '有经验的渔夫叉鱼时，往往把鱼叉瞄准看到鱼影的下方深处，正是因为光从水射入空气发生折射，眼睛看到的是被抬高的虚像！',
          essayPhrases: ['光的折射', '虚实相生', '洞若观火', '明察秋毫'],
          iconName: 'Sparkles',
          unlocked: true,
        },
      ],
      clozeExercises: [
        {
          id: 701,
          title: '第一段：湖底水晶球与折射虚像 (口述转文字填空)',
          contextSentence: '清澈见底的湖水中，[光]线发生弯[折]，眼睛看到的只是[虚]像。',
          referenceAudio: '清澈见底的湖水中，光线发生弯折，眼睛看到的只是虚像。',
          blanks: [
            {
              index: 0,
              charId: 'guang',
              correctChar: '光',
              pinyinHint: 'guāng',
              options: ['光', '先', '元'],
            },
            {
              index: 1,
              charId: 'zhe',
              correctChar: '折',
              pinyinHint: 'zhé',
              options: ['折', '斤', '拆'],
            },
            {
              index: 2,
              charId: 'xu',
              correctChar: '虚',
              pinyinHint: 'xū',
              options: ['虚', '虎', '虑'],
            },
          ],
        },
      ] as ClozeExercise[],
      essayTemplate: {
        title: '《湖畔神奇的“折筷”实验》—— 400字小作文积木',
        theme: '科学探案 · 探索神奇的光线折射',
        sections: [
          {
            key: 'beginning',
            title: '一、 开头：引出湖水与折射之谜 (约50字)',
            targetWordCount: '40 - 60字',
            guideline: '描写湖水清澈与小伙伴抓球扑空的不可思议情景。',
            starterPrompts: [
              '清晨的翡翠湖碧波荡漾，清澈见底，但湖水里却藏着一个奇妙的科学秘密。',
              '阳光洒在湖面上，一颗彩虹水晶球静静躺在湖底，却怎么也抓不到。',
            ],
            recommendedPhrases: ['清澈见底', '晶莹剔透', '百思不解', '引人入胜'],
            defaultText: '清晨的翡翠湖碧波微漾，清澈见底。小浣熊的彩虹水晶球不慎落水，明明就在眼前，大家扑下去却次次落空。',
          },
          {
            key: 'middle',
            title: '二、 中间：生动叙述折射原理与破案过程 (约300字)',
            targetWordCount: '280 - 320字',
            guideline: '描写Bobu折芦苇观察水面偏折，解释光线从水中射入空气发生折射的原理。',
            starterPrompts: [
              'Bobu拿出一根笔直的芦苇插进水中，奇妙的是，芦苇像折断了一样向上翘起。',
              '原来光线穿过水和空气的界面时发生了转折，眼睛看到的只是虚像！',
            ],
            recommendedPhrases: ['光的折射', '虚实相生', '洞若观火', '胸有成竹', '一击必中'],
            defaultText: 'Bobu侦探推了推护目镜，折下一根芦苇插进水里。原本笔直的芦苇在水面处竟然像被“折断”了一样翘起！\n\nBobu笑着告诉大家：水和空气是两种不同的介质，光线从水斜射进空气时会发生“折射”。我们眼睛看到的只是被抬高的“虚像”，而水晶球的真正位置要更深！\n\n只见Bobu拿起长柄网兜，看准虚像下方偏深处顺势一捞，晶莹剔透的彩虹球稳稳落入网中！岸边响起了热烈的掌声。',
          },
          {
            key: 'ending',
            title: '三、 结尾：领会真知灼见与科学魅力 (约50字)',
            targetWordCount: '40 - 60字',
            guideline: '感悟“眼见未必为实”，科学能帮助我们看到事物本质。',
            starterPrompts: [
              '这次探险让我懂得了“眼见未必为实”，科学的眼睛能穿透迷雾。',
              '小小的折射原理蕴藏着大智慧，科学的乐趣就在我们身边！',
            ],
            recommendedPhrases: ['眼见未必为实', '明察秋毫', '科学求真', '回味无穷'],
            defaultText: '“潭清疑水浅，见底现虚形。”这次探险让我明白：眼睛有时会被错觉蒙骗，只有掌握科学规律，才能明辨真伪！',
          },
        ],
      } as EssayTemplate,
    },
    {
      shortTitle: '幽灵电报',
      subtitle: '声波介质 · 幽灵电报',
      theme: '声学奥秘 · 声音在不同介质中的传播与衰减',
      difficulty: '高阶名篇' as const,
      difficultyStars: 5,
      icon: '📡',
      coverTheme: {
        gradient: 'from-purple-950 via-indigo-900 to-slate-950',
        border: 'border-purple-400/80',
        glow: 'rgba(168, 85, 247, 0.4)',
        badgeBg: 'bg-purple-500/30',
        badgeText: 'text-purple-200',
      },
      targetChars: STORY_8_TARGET_CHARACTERS,
      summary:
        '暴风雪夜巡山爷爷在矿洞失联，狂风怒号吞噬了一切呼喊。在对讲机失效的绝境中，Bobu将长耳朵贴在冰冷铁轨上，利用声波在固体介质中超高速传播的原理，成功破译求救信号！',
      soundQuestions: [
        {
          id: 1,
          pinyinPrompt: 'jiè',
          charToGuess: '介',
          audioCue: '请听读音：jiè，找出介质的“介”。',
          meaningHint: '媒介、介质，传递声音和物理波动的材料。',
          options: ['介', '界', '借', '阶'],
          correctAnswer: '介',
          explanation: '声音不能在真空中传播，必须依靠空气、水或钢铁等介质。',
        },
        {
          id: 2,
          pinyinPrompt: 'chuán',
          charToGuess: '传',
          audioCue: '请听读音：chuán，找出传播的“传”。',
          meaningHint: '波动物质向远方传播、传递。',
          options: ['传', '船', '川', '穿'],
          correctAnswer: '传',
          explanation: '单人旁的“传”代表声音或信息接力传递。',
        },
      ],
      radicalGames: [
        {
          id: 1,
          targetChar: '声',
          pinyin: 'shēng',
          meaning: '声音、声波',
          pieces: [
            { id: 'p1', text: '士', type: 'radical' as const },
            { id: 'p2', text: '𠃍', type: 'body' as const },
            { id: 'p3', text: '殳', type: 'body' as const },
          ],
          correctOrder: ['p1', 'p2', 'p3'],
          formula: '士 + 𠃍 + 殳 = 声',
          culturalLore: '敲击物体引起空气或固体振动，便产生了向四周传播的声波。',
        },
        {
          id: 2,
          targetChar: '质',
          pinyin: 'zhì',
          meaning: '介质、物质',
          pieces: [
            { id: 'p1', text: '斤', type: 'body' as const },
            { id: 'p2', text: '贝', type: 'radical' as const },
          ],
          correctOrder: ['p1', 'p2'],
          formula: '斤 + 贝 = 质',
          culturalLore: '固体钢铁的密度大、分子紧密，声波传播速度高达5000米/秒以上！',
        },
      ] as RadicalBlockGame[],
      culturalCards: [
        {
          id: 'card-science-acoustics',
          title: '声速奇迹与介质密码',
          badge: '科学探案',
          tag: '物理科普 · 声波传播',
          quote: '金石有声，击之而鸣；固介传疾，风雪难掩。',
          description:
            '声音在空气中的速度约为340米/秒，在水中约为1500米/秒，而在坚硬的钢铁中高达5000多米/秒！趴在铁轨上往往能比空气中提前几十秒听到远处列车的轰鸣！',
          essayPhrases: ['声波介质', '振聋发聩', '化险为夷', '分秒必争'],
          iconName: 'Award',
          unlocked: true,
        },
      ],
      clozeExercises: [
        {
          id: 801,
          title: '第一段：暴风雪与钢轨传声 (口述转文字填空)',
          contextSentence: '风雪撕碎了呼喊，但[声]音在钢铁[介][质]中飞速[传]播。',
          referenceAudio: '风雪撕碎了呼喊，但声音在钢铁介质中飞速传播。',
          blanks: [
            {
              index: 0,
              charId: 'sheng',
              correctChar: '声',
              pinyinHint: 'shēng',
              options: ['声', '生', '升'],
            },
            {
              index: 1,
              charId: 'jie',
              correctChar: '介',
              pinyinHint: 'jiè',
              options: ['介', '界', '价'],
            },
            {
              index: 2,
              charId: 'zhi',
              correctChar: '质',
              pinyinHint: 'zhì',
              options: ['质', '斤', '志'],
            },
            {
              index: 3,
              charId: 'chuan',
              correctChar: '传',
              pinyinHint: 'chuán',
              options: ['传', '船', '专'],
            },
          ],
        },
      ] as ClozeExercise[],
      essayTemplate: {
        title: '《风雪夜的钢铁回响》—— 400字小作文积木',
        theme: '科学探案 · 声音介质的生死救援',
        sections: [
          {
            key: 'beginning',
            title: '一、 开头：引出暴风雪夜与紧急营救 (约50字)',
            targetWordCount: '40 - 60字',
            guideline: '渲染大雪封山、通讯中断、呼喊无应的危急关头。',
            starterPrompts: [
              '狂风裹挟着暴雪肆虐，深山矿洞前，救援队的呼喊声被风雪撕扯得粉碎。',
              '寒夜漆黑如墨，巡山爷爷在矿洞深处失联，无线电对讲机彻底沉寂。',
            ],
            recommendedPhrases: ['风雪交加', '通讯中断', '万分焦急', '千钧一发'],
            defaultText: '寒冬深夜，暴风雪呼啸着席卷了整座大山。半山腰的旧矿洞前，通讯完全中断，狂风瞬间吞噬了所有的呼喊声。',
          },
          {
            key: 'middle',
            title: '二、 中间：生动叙述铁轨听音与科学救援 (约300字)',
            targetWordCount: '280 - 320字',
            guideline: '描写Bobu耳朵贴钢轨、解释声音在固体中高速传播衰减小、成功定位老人的过程。',
            starterPrompts: [
              '空气中听不到声音，但Bobu果断俯下身子，将长耳朵紧紧贴在冰冷的钢轨上。',
              '声音在空气中速度慢且衰减快，但在致密的钢铁中传播速度超过五千米每秒！',
            ],
            recommendedPhrases: ['介质传播', '声速奇迹', '屏息凝神', '摩斯密码', '化险为夷'],
            defaultText: '正当大家绝望准备放弃时，Bobu侦探趴在地上，将长耳朵紧紧贴在实心钢轨上！\n\n原来，暴风雪的空气气流虽然撕碎了声音，但声音在固体钢铁中的传播速度高达5000米/秒，不仅速度快，能量损耗也极小！\n\n“咚、咚咚、咚！”微弱却规律的铁器敲击声顺着钢轨清晰传到了Bobu耳中！老鹿爷爷正在深处敲击求救！救援队员们精神大振，挥动铁锹全力破冰掘进，终于成功救出了被困的老人！',
          },
          {
            key: 'ending',
            title: '三、 结尾：总结科学力量与勇敢精神 (约50字)',
            targetWordCount: '40 - 60字',
            guideline: '抒发对科学知识在生死攸关时刻巨大力量的由衷赞叹。',
            starterPrompts: [
              '冰冷的钢轨传递着生命的讯息，科学的光芒穿透了漫天风雪。',
              '这一次难忘的救援让我明白：学好科学知识，在关键时刻真的能拯救生命！',
            ],
            recommendedPhrases: ['生命奇迹', '科学力量', '分秒必争', '永生难忘'],
            defaultText: '茫茫风雪中，冰冷的钢轨奏响了生命的希望交响曲。科学不仅是书本上的公式，更是守护生命最坚实的力量！',
          },
        ],
      } as EssayTemplate,
    },
  ];

  // 使用 .map() 映射函数进行字段适配
  return rawList.map((raw, index): StoryLevel => {
    const meta = metaConfigs[index] || metaConfigs[0];
    const paragraphs = convertTextToParagraphs(raw.content, meta.targetChars);

    return {
      id: raw.id,
      category: 'science' as StoryCategory,
      chapterNumber: 6 + index,
      title: raw.title,
      shortTitle: meta.shortTitle,
      subtitle: meta.subtitle,
      theme: meta.theme,
      difficulty: meta.difficulty,
      difficultyStars: meta.difficultyStars,
      gradeLevel: '科普探案 · 3-6年级推荐',
      icon: meta.icon,
      coverTheme: meta.coverTheme,
      summary: meta.summary,
      culturalLore: raw.sciencePrinciple,
      completion: {
        reading: 0,
        challenge: 0,
        writing: 0,
      },
      targetCharacters: meta.targetChars,
      storyParagraphs: paragraphs,
      soundQuestions: meta.soundQuestions,
      radicalGames: meta.radicalGames,
      culturalCards: meta.culturalCards,
      clozeExercises: meta.clozeExercises,
      essayTemplate: meta.essayTemplate,
      unlocked: true,
      bobuMystery: {
        question: raw.question,
        options: raw.options,
        answer: raw.answer,
        sciencePrinciple: raw.sciencePrinciple,
      },
    };
  });
}

// 导出转换后的故事等级数组
export const BOBU_STORY_LEVELS: StoryLevel[] = adaptBobuMysteries(
  rawMysteriesData as RawBobuMystery[]
);

export {
  getStoryChallengeData,
  type StoryChallengeData,
  type CharacterWritingMeta,
} from './storyLevels';

export default BOBU_STORY_LEVELS;

