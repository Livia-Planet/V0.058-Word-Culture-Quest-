import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Search,
  Volume2,
  BookOpen,
  Award,
  Compass,
  Shuffle,
  ChevronRight,
  Filter,
  Layers,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { RADICAL_CATEGORIES, RadicalCategory } from '../data/radicalsExplorerData';
import { sound, speakChinese } from '../utils/audio';
import { useGameStore } from '../store/useGameStore';

interface RadicalExplorerProps {
  onUnlockNewWord?: () => void;
  onNavigateToWriting?: (char?: string) => void;
}

export const RadicalExplorer: React.FC<RadicalExplorerProps> = ({
  onUnlockNewWord,
  onNavigateToWriting,
}) => {
  const gameStore = useGameStore();
  const handleUnlockWord = onUnlockNewWord ?? (() => { gameStore.unlockNewWord(); });
  // Selected radical filter ('all' or category id)
  const [selectedRadicalId, setSelectedRadicalId] = useState<string>('shi');

  // Search keyword (char, pinyin, or meaning)
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active inspected character
  const [activeChar, setActiveChar] = useState<RadicalCategory['characters'][0]>(
    RADICAL_CATEGORIES[0].characters[0]
  );

  // Active radical category data
  const currentCategory = useMemo(() => {
    return (
      RADICAL_CATEGORIES.find((c) => c.id === selectedRadicalId) || RADICAL_CATEGORIES[0]
    );
  }, [selectedRadicalId]);

  // Filtered characters list
  const filteredList = useMemo(() => {
    let pool: {
      charData: RadicalCategory['characters'][0];
      category: RadicalCategory;
    }[] = [];

    if (selectedRadicalId === 'all') {
      RADICAL_CATEGORIES.forEach((cat) => {
        cat.characters.forEach((charItem) => {
          pool.push({ charData: charItem, category: cat });
        });
      });
    } else {
      const cat = RADICAL_CATEGORIES.find((c) => c.id === selectedRadicalId);
      if (cat) {
        cat.characters.forEach((charItem) => {
          pool.push({ charData: charItem, category: cat });
        });
      }
    }

    if (!searchQuery.trim()) return pool;

    const query = searchQuery.trim().toLowerCase();
    return pool.filter(
      (item) =>
        item.charData.char.includes(query) ||
        item.charData.pinyin.toLowerCase().includes(query) ||
        item.charData.meaning.toLowerCase().includes(query) ||
        item.charData.words.some((w) => w.toLowerCase().includes(query)) ||
        item.category.name.toLowerCase().includes(query)
    );
  }, [selectedRadicalId, searchQuery]);

  // Handle character tile tap with sound, speech, and animation
  const handleTapChar = (
    charItem: RadicalCategory['characters'][0],
    category: RadicalCategory
  ) => {
    sound.playCharClick();
    speakChinese(charItem.char);
    setActiveChar(charItem);

    // If radical category is not active and in 'all' mode, sync it
    if (selectedRadicalId !== 'all' && selectedRadicalId !== category.id) {
      setSelectedRadicalId(category.id);
    }

    handleUnlockWord();
  };

  // Discover a random character with animation
  const handleRandomExplore = () => {
    sound.playTap();
    const allChars: { charData: RadicalCategory['characters'][0]; category: RadicalCategory }[] = [];
    RADICAL_CATEGORIES.forEach((cat) => {
      cat.characters.forEach((c) => allChars.push({ charData: c, category: cat }));
    });
    const chosen = allChars[Math.floor(Math.random() * allChars.length)];
    if (chosen) {
      setSelectedRadicalId(chosen.category.id);
      setActiveChar(chosen.charData);
      speakChinese(chosen.charData.char);
      try {
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.6 },
        });
      } catch (error) {
        console.warn('[UI Effect Error]:', error);
      }
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-red-900 via-amber-800 to-red-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl border-4 border-yellow-400 relative overflow-hidden">
        {/* Background Seal Watermark */}
        <div className="absolute right-4 -bottom-6 text-9xl font-calligraphy text-yellow-300/5 select-none pointer-events-none font-black">
          部首
        </div>

        <div className="relative z-10 max-w-3xl text-left space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-yellow-400/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-yellow-200 border border-yellow-300/30">
            <Compass className="w-3.5 h-3.5 text-yellow-300 animate-spin" />
            <span>字源寻根 · 3500 高频常用字部首探索仪</span>
          </div>

          <h3 className="font-festive text-2xl sm:text-3xl font-black text-amber-100">
            探寻汉字造字奥秘 · 掌握形旁表意规律
          </h3>

          <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
            汉字中 80% 以上为形声字，形旁表意、声旁表音。按核心部首检索 3500 常用字家族，点击汉字激活发音、笔画分解与民俗词汇，构建清晰的字理记忆网！
          </p>
        </div>
      </div>

      {/* Search Bar & Random Discovery */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 p-3.5 rounded-2xl border-2 border-amber-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="检索汉字、拼音或释义 (如: 福 / fu / 祈)..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-amber-50/60 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-600 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleRandomExplore}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-200 to-orange-200 hover:from-amber-300 hover:to-orange-300 text-red-950 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-amber-400 active:scale-95 shadow-xs"
          >
            <Shuffle className="w-3.5 h-3.5 text-red-800" />
            <span>随机探索字</span>
          </button>

          <span className="text-xs text-stone-500 font-medium bg-amber-100/80 px-2.5 py-1.5 rounded-xl border border-amber-200">
            已收录 <strong>{filteredList.length}</strong> 字
          </span>
        </div>
      </div>

      {/* Radical Categories Filter Chips */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-red-700" />
            <span>筛选常用核心部首分类：</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => {
              sound.playTap();
              setSelectedRadicalId('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedRadicalId === 'all'
                ? 'bg-red-700 text-white shadow-md ring-2 ring-yellow-400 scale-102'
                : 'bg-white hover:bg-amber-100 text-stone-700 border border-amber-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>全部部首汇总</span>
          </button>

          {RADICAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sound.playTap();
                setSelectedRadicalId(cat.id);
                if (cat.characters[0]) setActiveChar(cat.characters[0]);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedRadicalId === cat.id
                  ? 'bg-gradient-to-r from-red-700 to-amber-700 text-yellow-200 shadow-md ring-2 ring-yellow-400 scale-105'
                  : 'bg-white hover:bg-amber-100 text-stone-700 border border-amber-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span className="font-calligraphy text-sm">{cat.radical}</span>
              <span className="hidden sm:inline font-sans text-[11px] opacity-80">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area: Left Character Index Grid (7 cols) + Right Dossier Detail (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Character Matrix (7 Cols) */}
        <div className="lg:col-span-7 bg-white/90 border-2 border-amber-200 rounded-3xl p-4 sm:p-6 shadow-md space-y-4">
          {/* Radical Info Banner */}
          {selectedRadicalId !== 'all' && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 flex items-start gap-3">
              <span className="text-2xl mt-0.5">{currentCategory.icon}</span>
              <div className="text-xs text-left space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-calligraphy font-black text-red-950 text-base">
                    {currentCategory.radical} · {currentCategory.name}
                  </span>
                  <span className="bg-red-800 text-yellow-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {currentCategory.meaningDomain}
                  </span>
                </div>
                <p className="text-stone-600 leading-relaxed text-[11px]">
                  {currentCategory.culturalOrigin}
                </p>
              </div>
            </div>
          )}

          {/* Character Tiles Matrix */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-stone-600">
                点击汉字播放声韵，并查看字源档案：
              </span>
              <span className="text-[11px] text-stone-400">
                支持高频词汇拓展与练字
              </span>
            </div>

            {filteredList.length === 0 ? (
              <div className="text-center py-12 text-stone-400 space-y-2">
                <Compass className="w-8 h-8 mx-auto text-amber-300" />
                <p className="text-xs">未找到匹配的汉字，尝试搜索其他汉字或拼音吧！</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 sm:gap-3">
                {filteredList.map(({ charData, category }, itemIdx) => {
                  const isSelected = activeChar?.char === charData.char;
                  return (
                    <button
                      key={`${category.id}-${charData.char}-${itemIdx}`}
                      onClick={() => handleTapChar(charData, category)}
                      className={`relative p-3 rounded-2xl transition-all flex flex-col items-center justify-center cursor-pointer select-none group active:scale-90 ${
                        isSelected
                          ? 'bg-gradient-to-b from-red-700 via-amber-700 to-red-800 text-white shadow-xl ring-3 ring-yellow-400 scale-105 z-10'
                          : 'bg-amber-50/70 hover:bg-amber-100/90 text-stone-800 border border-amber-300/80 hover:shadow-md hover:scale-103'
                      }`}
                    >
                      {/* Top Frequency Badge */}
                      <span
                        className={`text-[9px] font-sans px-1.5 py-0.2 rounded-md mb-1 ${
                          isSelected
                            ? 'bg-yellow-400 text-red-950 font-black'
                            : 'bg-stone-200/80 text-stone-600 group-hover:bg-amber-200'
                        }`}
                      >
                        #{charData.freqRank}
                      </span>

                      {/* Main Character Glyph */}
                      <span className="font-calligraphy text-3xl sm:text-4xl font-black leading-none my-1 tracking-tight">
                        {charData.char}
                      </span>

                      {/* Pinyin with tone */}
                      <span
                        className={`text-[11px] font-medium font-sans mt-0.5 ${
                          isSelected ? 'text-yellow-200' : 'text-stone-500'
                        }`}
                      >
                        {charData.pinyin}
                      </span>

                      {/* Tapped Pulse Ripple Indicator */}
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-yellow-300 absolute top-2 right-2 animate-ping" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Character Dossier & Cultural Breakdown (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {activeChar ? (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 border-2 border-amber-300 rounded-3xl p-5 shadow-lg space-y-4 text-left animate-in fade-in duration-200">
              {/* Dossier Header */}
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <div className="flex items-center gap-3">
                  {/* Giant Character Calligraphy Badge */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-700 via-amber-700 to-red-900 text-yellow-300 flex items-center justify-center font-calligraphy text-4xl font-black shadow-md border-2 border-yellow-300 relative">
                    {activeChar.char}
                    <button
                      onClick={() => {
                        sound.playCharClick();
                        speakChinese(activeChar.char);
                      }}
                      className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-yellow-400 hover:bg-yellow-300 text-red-950 flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110"
                      title="朗读发音"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-red-950">
                        【{activeChar.pinyin}】
                      </span>
                      <span className="bg-amber-200/90 text-red-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                        3500常用字第 {activeChar.freqRank} 位
                      </span>
                    </div>
                    <span className="text-xs text-stone-500 block mt-0.5">
                      笔画: {activeChar.strokeCount} 画 · 形声规律
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block">部首归属</span>
                  <span className="text-xs font-bold text-red-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                    {selectedRadicalId !== 'all' ? currentCategory.name : '核心部首'}
                  </span>
                </div>
              </div>

              {/* Character Meaning */}
              <div className="bg-white/80 border border-amber-200 rounded-2xl p-3.5 space-y-1">
                <span className="text-xs font-bold text-amber-900 block flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-red-700" />
                  <span>字义与造字本源：</span>
                </span>
                <p className="text-xs text-stone-700 leading-relaxed font-medium">
                  {activeChar.meaning}
                </p>
              </div>

              {/* High-frequency Essay Words & Idioms */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-amber-900 block flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>考试与作文常用成语词库：</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeChar.words.map((w, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        sound.playCharClick();
                        speakChinese(w);
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-amber-100 text-stone-800 hover:text-red-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs active:scale-95"
                      title="点击伴读词汇"
                    >
                      <Volume2 className="w-3 h-3 text-red-700" />
                      <span>{w}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Jump to Handwriting Practice Canvas */}
              {onNavigateToWriting && (
                <button
                  onClick={() => {
                    sound.playTap();
                    onNavigateToWriting(activeChar.char);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-orange-500 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 border border-yellow-300 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-yellow-300" />
                  <span>前往手写板练习「{activeChar.char}」字规范写法</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="bg-stone-50 border-2 border-stone-200 rounded-3xl p-8 text-center text-stone-400 space-y-2">
              <Compass className="w-8 h-8 mx-auto text-stone-300" />
              <p className="text-xs">在左侧字库中点击任意汉字查看字源档案</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
