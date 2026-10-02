export interface HanziStroke {
  id: number;
  name: string; // 笔画名称，如：撇、横、竖、捺、点、横折
  pinyin: string; // 笔画读音
  path: string; // SVG path data (0..100 coordinate space)
  isRadical?: boolean; // 是否属于偏旁部首
  radical?: boolean; // 别名
  radicalGroup?: string; // 对应的偏旁构件名称
}

export interface CharacterStrokeData {
  char: string;
  totalStrokes: number;
  components: {
    name: string;
    strokeRange: [number, number]; // [startIdx, endIdx] 1-based
    color: string;
    label: string;
  }[];
  strokes: HanziStroke[];
}

export const STROKE_REGISTRY: Record<string, CharacterStrokeData> = {
  '年': {
    char: '年',
    totalStrokes: 6,
    components: [
      { name: '𠂉 (禾部变体)', strokeRange: [1, 2], color: '#dc2626', label: '上部偏旁' },
      { name: '午 (四季周而复始)', strokeRange: [3, 6], color: '#d97706', label: '下部字身' },
    ],
    strokes: [
      { id: 1, name: '撇', pinyin: 'piě', path: 'M 50,18 Q 42,28 32,36', isRadical: true, radicalGroup: '𠂉' },
      { id: 2, name: '横', pinyin: 'héng', path: 'M 32,34 L 70,34', isRadical: true, radicalGroup: '𠂉' },
      { id: 3, name: '横', pinyin: 'héng', path: 'M 22,50 L 78,50' },
      { id: 4, name: '竖', pinyin: 'shù', path: 'M 36,50 L 36,70' },
      { id: 5, name: '横', pinyin: 'héng', path: 'M 14,70 L 86,70' },
      { id: 6, name: '竖', pinyin: 'shù', path: 'M 50,24 L 50,92' },
    ],
  },
  '福': {
    char: '福',
    totalStrokes: 13,
    components: [
      { name: '礻 (示字旁 - 祈福祭神)', strokeRange: [1, 4], color: '#dc2626', label: '偏旁部首' },
      { name: '一口田 (丰衣足食)', strokeRange: [5, 13], color: '#2563eb', label: '字身构件' },
    ],
    strokes: [
      // 礻
      { id: 1, name: '点', pinyin: 'diǎn', path: 'M 26,18 Q 28,24 30,28', isRadical: true, radicalGroup: '礻' },
      { id: 2, name: '横撇', pinyin: 'héngpiě', path: 'M 16,33 L 36,33 Q 26,45 18,55', isRadical: true, radicalGroup: '礻' },
      { id: 3, name: '竖', pinyin: 'shù', path: 'M 27,38 L 27,88', isRadical: true, radicalGroup: '礻' },
      { id: 4, name: '点', pinyin: 'diǎn', path: 'M 32,50 Q 37,56 40,62', isRadical: true, radicalGroup: '礻' },
      // 一
      { id: 5, name: '横', pinyin: 'héng', path: 'M 50,26 L 86,26', radicalGroup: '一' },
      // 口
      { id: 6, name: '竖', pinyin: 'shù', path: 'M 54,37 L 54,51', radicalGroup: '口' },
      { id: 7, name: '横折', pinyin: 'héngzhé', path: 'M 54,37 L 82,37 L 82,51', radicalGroup: '口' },
      { id: 8, name: '横', pinyin: 'héng', path: 'M 54,51 L 82,51', radicalGroup: '口' },
      // 田
      { id: 9, name: '竖', pinyin: 'shù', path: 'M 50,60 L 50,88', radicalGroup: '田' },
      { id: 10, name: '横折', pinyin: 'héngzhé', path: 'M 50,60 L 86,60 L 86,88', radicalGroup: '田' },
      { id: 11, name: '横', pinyin: 'héng', path: 'M 50,74 L 86,74', radicalGroup: '田' },
      { id: 12, name: '竖', pinyin: 'shù', path: 'M 68,60 L 68,88', radicalGroup: '田' },
      { id: 13, name: '横', pinyin: 'héng', path: 'M 50,88 L 86,88', radicalGroup: '田' },
    ],
  },
  '春': {
    char: '春',
    totalStrokes: 9,
    components: [
      { name: '三人 (草木萌动同游)', strokeRange: [1, 5], color: '#d97706', label: '上部构件' },
      { name: '日 (温暖阳光)', strokeRange: [6, 9], color: '#dc2626', label: '偏旁部首' },
    ],
    strokes: [
      { id: 1, name: '横', pinyin: 'héng', path: 'M 28,22 L 72,22' },
      { id: 2, name: '横', pinyin: 'héng', path: 'M 24,34 L 76,34' },
      { id: 3, name: '横', pinyin: 'héng', path: 'M 14,46 L 86,46' },
      { id: 4, name: '撇', pinyin: 'piě', path: 'M 50,15 Q 46,45 18,74' },
      { id: 5, name: '捺', pinyin: 'nà', path: 'M 50,44 Q 65,58 86,74' },
      // 日
      { id: 6, name: '竖', pinyin: 'shù', path: 'M 38,58 L 38,88', isRadical: true, radicalGroup: '日' },
      { id: 7, name: '横折', pinyin: 'héngzhé', path: 'M 38,58 L 64,58 L 64,88', isRadical: true, radicalGroup: '日' },
      { id: 8, name: '横', pinyin: 'héng', path: 'M 38,73 L 64,73', isRadical: true, radicalGroup: '日' },
      { id: 9, name: '横', pinyin: 'héng', path: 'M 38,88 L 64,88', isRadical: true, radicalGroup: '日' },
    ],
  },
  '红': {
    char: '红',
    totalStrokes: 6,
    components: [
      { name: '纟 (绞丝旁)', strokeRange: [1, 3], color: '#dc2626', label: '偏旁部首' },
      { name: '工 (工匠造物)', strokeRange: [4, 6], color: '#0891b2', label: '声旁字身' },
    ],
    strokes: [
      { id: 1, name: '撇折', pinyin: 'piězhé', path: 'M 32,20 L 22,36 L 36,44', isRadical: true, radicalGroup: '纟' },
      { id: 2, name: '撇折', pinyin: 'piězhé', path: 'M 26,38 L 16,56 L 38,60', isRadical: true, radicalGroup: '纟' },
      { id: 3, name: '提', pinyin: 'tí', path: 'M 18,78 L 40,64', isRadical: true, radicalGroup: '纟' },
      { id: 4, name: '横', pinyin: 'héng', path: 'M 48,28 L 84,28', radicalGroup: '工' },
      { id: 5, name: '竖', pinyin: 'shù', path: 'M 66,28 L 66,74', radicalGroup: '工' },
      { id: 6, name: '横', pinyin: 'héng', path: 'M 44,74 L 88,74', radicalGroup: '工' },
    ],
  },
  '火': {
    char: '火',
    totalStrokes: 4,
    components: [
      { name: '火 (象形烈焰)', strokeRange: [1, 4], color: '#dc2626', label: '独体部首' },
    ],
    strokes: [
      { id: 1, name: '点', pinyin: 'diǎn', path: 'M 26,38 Q 22,46 18,54', isRadical: true },
      { id: 2, name: '短撇', pinyin: 'duǎnpiě', path: 'M 74,36 Q 78,44 82,52', isRadical: true },
      { id: 3, name: '竖撇', pinyin: 'shùpiě', path: 'M 50,18 Q 48,50 24,86', isRadical: true },
      { id: 4, name: '捺', pinyin: 'nà', path: 'M 50,44 Q 65,65 84,86', isRadical: true },
    ],
  },
  '兽': {
    char: '兽',
    totalStrokes: 11,
    components: [
      { name: '丷 + 一 (捕兽网罗)', strokeRange: [1, 3], color: '#d97706', label: '上部' },
      { name: '口口 (双眼警觉)', strokeRange: [4, 9], color: '#0891b2', label: '中部' },
      { name: '犬 (奔跑猎兽)', strokeRange: [10, 11], color: '#dc2626', label: '下部偏旁' },
    ],
    strokes: [
      { id: 1, name: '点', pinyin: 'diǎn', path: 'M 35,16 Q 32,22 30,28' },
      { id: 2, name: '撇', pinyin: 'piě', path: 'M 65,16 Q 68,22 70,28' },
      { id: 3, name: '横', pinyin: 'héng', path: 'M 22,34 L 78,34' },
      // 口 1
      { id: 4, name: '竖', pinyin: 'shù', path: 'M 28,42 L 28,52' },
      { id: 5, name: '横折', pinyin: 'héngzhé', path: 'M 28,42 L 46,42 L 46,52' },
      { id: 6, name: '横', pinyin: 'héng', path: 'M 28,52 L 46,52' },
      // 口 2
      { id: 7, name: '竖', pinyin: 'shù', path: 'M 54,42 L 54,52' },
      { id: 8, name: '横折', pinyin: 'héngzhé', path: 'M 54,42 L 72,42 L 72,52' },
      { id: 9, name: '横', pinyin: 'héng', path: 'M 54,52 L 72,52' },
      // 犬
      { id: 10, name: '横', pinyin: 'héng', path: 'M 20,62 L 80,62', isRadical: true },
      { id: 11, name: '竖撇弯勾', pinyin: 'shùpiě', path: 'M 50,56 Q 44,72 26,88 M 50,62 Q 54,78 68,84 M 66,66 L 72,72', isRadical: true },
    ],
  },
  '贴': {
    char: '贴',
    totalStrokes: 9,
    components: [
      { name: '贝 (贝币典当)', strokeRange: [1, 4], color: '#dc2626', label: '偏旁部首' },
      { name: '占 (占据稳妥)', strokeRange: [5, 9], color: '#2563eb', label: '字身构件' },
    ],
    strokes: [
      // 贝
      { id: 1, name: '竖', pinyin: 'shù', path: 'M 20,24 L 20,70', isRadical: true, radicalGroup: '贝' },
      { id: 2, name: '横折', pinyin: 'héngzhé', path: 'M 20,24 L 42,24 L 42,70', isRadical: true, radicalGroup: '贝' },
      { id: 3, name: '撇', pinyin: 'piě', path: 'M 26,72 Q 22,80 18,86', isRadical: true, radicalGroup: '贝' },
      { id: 4, name: '点', pinyin: 'diǎn', path: 'M 36,72 Q 39,78 44,84', isRadical: true, radicalGroup: '贝' },
      // 占
      { id: 5, name: '竖', pinyin: 'shù', path: 'M 64,18 L 64,48', radicalGroup: '占' },
      { id: 6, name: '短横', pinyin: 'duǎnhéng', path: 'M 64,33 L 78,33', radicalGroup: '占' },
      { id: 7, name: '竖', pinyin: 'shù', path: 'M 54,54 L 54,78', radicalGroup: '占' },
      { id: 8, name: '横折', pinyin: 'héngzhé', path: 'M 54,54 L 78,54 L 78,78', radicalGroup: '占' },
      { id: 9, name: '横', pinyin: 'héng', path: 'M 54,78 L 78,78', radicalGroup: '占' },
    ],
  },
  '炮': {
    char: '炮',
    totalStrokes: 9,
    components: [
      { name: '火 (烈火灼灼)', strokeRange: [1, 4], color: '#dc2626', label: '偏旁部首' },
      { name: '包 (火药包裹)', strokeRange: [5, 9], color: '#d97706', label: '字身构件' },
    ],
    strokes: [
      // 火
      { id: 1, name: '点', pinyin: 'diǎn', path: 'M 18,36 Q 15,42 12,48', isRadical: true, radicalGroup: '火' },
      { id: 2, name: '短撇', pinyin: 'duǎnpiě', path: 'M 40,32 Q 42,40 44,46', isRadical: true, radicalGroup: '火' },
      { id: 3, name: '竖撇', pinyin: 'shùpiě', path: 'M 30,22 Q 28,52 14,80', isRadical: true, radicalGroup: '火' },
      { id: 4, name: '点/捺', pinyin: 'diǎn', path: 'M 32,54 Q 38,62 42,70', isRadical: true, radicalGroup: '火' },
      // 包
      { id: 5, name: '撇', pinyin: 'piě', path: 'M 64,18 Q 58,26 50,34', radicalGroup: '包' },
      { id: 6, name: '横折钩', pinyin: 'héngzhégōu', path: 'M 50,30 L 82,30 L 82,50 Q 80,54 74,54', radicalGroup: '包' },
      { id: 7, name: '横折', pinyin: 'héngzhé', path: 'M 54,46 L 76,46 L 76,64', radicalGroup: '包' },
      { id: 8, name: '横', pinyin: 'héng', path: 'M 54,64 L 76,64', radicalGroup: '包' },
      { id: 9, name: '竖弯钩', pinyin: 'shùwāngōu', path: 'M 54,46 L 54,78 Q 54,88 74,88 L 84,88 Q 88,88 88,82', radicalGroup: '包' },
    ],
  },
  '喜': {
    char: '喜',
    totalStrokes: 12,
    components: [
      { name: '士 (上部)', strokeRange: [1, 3], color: '#d97706', label: '上部' },
      { name: '口 (鼓身中部)', strokeRange: [4, 6], color: '#0891b2', label: '中部' },
      { name: '丷 + 一 (鼓架)', strokeRange: [7, 9], color: '#2563eb', label: '架座' },
      { name: '口 (口字底)', strokeRange: [10, 12], color: '#dc2626', label: '偏旁部首' },
    ],
    strokes: [
      // 士
      { id: 1, name: '横', pinyin: 'héng', path: 'M 28,18 L 72,18' },
      { id: 2, name: '竖', pinyin: 'shù', path: 'M 50,12 L 50,26' },
      { id: 3, name: '短横', pinyin: 'duǎnhéng', path: 'M 36,26 L 64,26' },
      // 口
      { id: 4, name: '竖', pinyin: 'shù', path: 'M 36,32 L 36,44' },
      { id: 5, name: '横折', pinyin: 'héngzhé', path: 'M 36,32 L 64,32 L 64,44' },
      { id: 6, name: '横', pinyin: 'héng', path: 'M 36,44 L 64,44' },
      // 丷 + 一
      { id: 7, name: '点', pinyin: 'diǎn', path: 'M 34,50 Q 30,56 28,60' },
      { id: 8, name: '撇', pinyin: 'piě', path: 'M 66,50 Q 70,56 72,60' },
      { id: 9, name: '长横', pinyin: 'chánghéng', path: 'M 16,62 L 84,62' },
      // 口
      { id: 10, name: '竖', pinyin: 'shù', path: 'M 34,70 L 34,88', isRadical: true, radicalGroup: '口' },
      { id: 11, name: '横折', pinyin: 'héngzhé', path: 'M 34,70 L 66,70 L 66,88', isRadical: true, radicalGroup: '口' },
      { id: 12, name: '横', pinyin: 'héng', path: 'M 34,88 L 66,88', isRadical: true, radicalGroup: '口' },
    ],
  },
  '庆': {
    char: '庆',
    totalStrokes: 6,
    components: [
      { name: '广 (广字头)', strokeRange: [1, 3], color: '#dc2626', label: '偏旁部首' },
      { name: '大 (庆贺盛大)', strokeRange: [4, 6], color: '#d97706', label: '字身构件' },
    ],
    strokes: [
      // 广
      { id: 1, name: '点', pinyin: 'diǎn', path: 'M 50,14 Q 50,20 50,24', isRadical: true, radicalGroup: '广' },
      { id: 2, name: '横', pinyin: 'héng', path: 'M 20,24 L 80,24', isRadical: true, radicalGroup: '广' },
      { id: 3, name: '长撇', pinyin: 'chángpiě', path: 'M 28,24 Q 28,58 14,88', isRadical: true, radicalGroup: '广' },
      // 大
      { id: 4, name: '横', pinyin: 'héng', path: 'M 36,44 L 80,44', radicalGroup: '大' },
      { id: 5, name: '撇', pinyin: 'piě', path: 'M 58,32 Q 52,62 34,84', radicalGroup: '大' },
      { id: 6, name: '捺', pinyin: 'nà', path: 'M 58,44 Q 68,66 84,84', radicalGroup: '大' },
    ],
  },
};

export const STROKE_LIBRARY = STROKE_REGISTRY;
