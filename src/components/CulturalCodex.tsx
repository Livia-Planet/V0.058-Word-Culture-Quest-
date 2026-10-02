import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Scroll, Utensils, HeartHandshake, CheckCircle2, Volume2, Send, Lock, Unlock, Map, BookOpen, Compass } from 'lucide-react';
import { CULTURAL_CARDS, CulturalCard } from '../data/level1Data';
import { sound, speakChinese } from '../utils/audio';
import { RadicalExplorer } from './RadicalExplorer';
import { useGameStore } from '../store/useGameStore';

interface CulturalCodexProps {
  onUnlockNewWord?: () => void;
  onNavigateToWriting?: (char?: string) => void;
}

export const CulturalCodex: React.FC<CulturalCodexProps> = ({
  onUnlockNewWord,
  onNavigateToWriting,
}) => {
  const gameStore = useGameStore();
  const handleUnlockWord = onUnlockNewWord ?? (() => { gameStore.unlockNewWord(); });
  const [codexTab, setCodexTab] = useState<'radicals' | 'cards'>('radicals');
  const [cards, setCards] = useState<CulturalCard[]>(CULTURAL_CARDS);
  const [userSentenceInput, setUserSentenceInput] = useState<string>('');
  const [submittedSentences, setSubmittedSentences] = useState<string[]>([
    '除夕之夜，家家户户贴上红春联和倒福字，全家欢聚吃年夜饭，爆竹声声辞旧迎新！',
  ]);

  const handleUnlockCard = (cardId: string) => {
    sound.playBadgeUnlock();
    handleUnlockWord();
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, unlocked: true } : c))
    );
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch (error) {
      console.warn('[UI Effect Error]:', error);
    }
  };

  const handlePlayQuote = (quote: string) => {
    sound.playCharClick();
    speakChinese(quote);
  };

  const handleAddCustomSentence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSentenceInput.trim()) return;
    sound.playCorrect();
    setSubmittedSentences([userSentenceInput.trim(), ...submittedSentences]);
    setUserSentenceInput('');
    handleUnlockWord();

    try {
      confetti({ particleCount: 40, spread: 50 });
    } catch (error) {
      console.warn('[UI Effect Error]:', error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* View Mode Switcher */}
      <div className="flex justify-center">
        <div className="bg-amber-200/80 p-1.5 rounded-2xl flex items-center gap-1.5 sm:gap-2 border border-amber-300 shadow-inner flex-wrap justify-center">
          <button
            onClick={() => {
              sound.playTap();
              setCodexTab('radicals');
            }}
            className={`px-4 sm:px-6 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer ${
              codexTab === 'radicals'
                ? 'bg-red-700 text-white shadow-md scale-102 ring-2 ring-yellow-300'
                : 'text-stone-700 hover:text-red-900'
            }`}
          >
            <Compass className="w-4 h-4 text-yellow-300" />
            <span>1. 🧩 3500常用字部首探索仪 (Radical Explorer)</span>
          </button>
          <button
            onClick={() => {
              sound.playTap();
              setCodexTab('cards');
            }}
            className={`px-4 sm:px-6 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer ${
              codexTab === 'cards'
                ? 'bg-red-700 text-white shadow-md scale-102 ring-2 ring-yellow-300'
                : 'text-stone-700 hover:text-red-900'
            }`}
          >
            <Scroll className="w-4 h-4" />
            <span>2. 🏮 春节民俗典籍卡片 (Cultural Cards)</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: RADICAL EXPLORER */}
      {codexTab === 'radicals' && (
        <RadicalExplorer
          onNavigateToWriting={onNavigateToWriting}
        />
      )}

      {/* VIEW 2: CULTURAL CARDS & ESSAY SENTENCE LAB */}
      {codexTab === 'cards' && (
        <div className="space-y-8">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-amber-700 via-red-700 to-amber-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-amber-400 relative overflow-hidden">
            <div className="relative z-10 max-w-2xl text-left">
              <div className="inline-flex items-center gap-1.5 bg-amber-400/30 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-yellow-200 mb-2 border border-yellow-300/40">
                <Sparkles className="w-3.5 h-3.5" /> 传统文化宝库 · 消除考场文化背景盲区
              </div>
              <h2 className="font-festive text-2xl sm:text-3xl font-black text-amber-100 mb-2">
                春节文化卡片与高分短句库
              </h2>
              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                将 3500 个高频汉字融入节日风俗、神话典故与诗词意境中。
                收藏以下文化卡片，积累地道生动的书面表达，轻松写出满分小作文！
              </p>
            </div>
          </div>

      {/* Cultural Collectible Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-base font-bold text-red-950">
            <Scroll className="w-5 h-5 text-red-700" />
            <span>第一关：除夕迎春文化卡片收藏</span>
          </div>
          <span className="text-xs text-stone-500">
            已点亮 {cards.filter((c) => c.unlocked).length} / {cards.length} 张文化卡
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card) => {
            return (
              <div
                key={card.id}
                className={`relative rounded-3xl border-2 transition-all p-5 text-left flex flex-col justify-between ${
                  card.unlocked
                    ? 'bg-gradient-to-b from-amber-50 to-orange-50/50 border-amber-300 shadow-md hover:shadow-lg'
                    : 'bg-stone-100 border-stone-200 opacity-80'
                }`}
              >
                <div>
                  {/* Card Header Tag */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                        {card.badge}
                      </span>
                      <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                        {card.tag}
                      </span>
                    </div>

                    {card.unlocked ? (
                      <span className="flex items-center gap-1 text-emerald-700 text-xs font-bold">
                        <Unlock className="w-3.5 h-3.5" /> 已收藏
                      </span>
                    ) : (
                      <button
                        onClick={() => handleUnlockCard(card.id)}
                        className="flex items-center gap-1 text-amber-900 bg-amber-200 hover:bg-amber-300 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                      >
                        <Lock className="w-3.5 h-3.5" /> 点击解锁
                      </button>
                    )}
                  </div>

                  {/* Card Title */}
                  <h3 className="font-calligraphy font-black text-xl text-red-950 mb-2">
                    {card.title}
                  </h3>

                  {/* Classic Poetry Quote */}
                  <div className="bg-red-100/70 border border-red-200 rounded-xl p-2.5 mb-3 flex items-center justify-between gap-2">
                    <span className="font-calligraphy text-xs sm:text-sm font-bold text-red-900">
                      “{card.quote}”
                    </span>
                    <button
                      onClick={() => handlePlayQuote(card.quote)}
                      className="p-1.5 bg-red-600 text-white rounded-lg hover:scale-110 active:scale-95 transition-all cursor-pointer shrink-0"
                      title="朗读名句"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Cultural Description */}
                  <p className="text-xs text-stone-600 leading-relaxed mb-4">
                    {card.description}
                  </p>
                </div>

                {/* Exam High-Scoring Phrases Bank */}
                <div className="pt-3 border-t border-amber-200/80">
                  <div className="text-[11px] font-bold text-amber-900 mb-1.5">
                    作文积累金句 (点击朗读):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {card.essayPhrases.map((phrase, idx) => (
                      <span
                        key={idx}
                        onClick={() => {
                          sound.playTap();
                          speakChinese(phrase);
                        }}
                        className="bg-white hover:bg-amber-100 border border-amber-300/80 text-amber-950 text-[11px] font-medium px-2 py-0.5 rounded-lg cursor-pointer transition-colors"
                      >
                        {phrase} 🔊
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Sentence Writing Practice Box */}
      <div className="bg-white/90 border-2 border-amber-200 rounded-3xl p-6 sm:p-8 shadow-lg text-left">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-red-700" />
          <h3 className="font-calligraphy font-black text-lg text-red-950">
            春节文化口述/句子练习场
          </h3>
        </div>
        <p className="text-xs text-stone-500 mb-4">
          尝试写下一句或口述一句包含本关汉字（年、兽、红、火、福、贴、炮、春）的春节生动描述：
        </p>

        <form onSubmit={handleAddCustomSentence} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={userSentenceInput}
              onChange={(e) => setUserSentenceInput(e.target.value)}
              placeholder="例如：大年三十，我们全家围坐吃年夜饭，红红火火迎新春！"
              className="flex-1 px-4 py-3 rounded-2xl border border-stone-300 bg-amber-50/40 text-stone-800 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-400 font-calligraphy"
            />
            <button
              type="submit"
              disabled={!userSentenceInput.trim()}
              className={`px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all cursor-pointer ${
                userSentenceInput.trim()
                  ? 'bg-red-600 hover:bg-red-700 text-white active:scale-95'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>提交记录</span>
            </button>
          </div>
        </form>

        {/* Display Submitted Sentences */}
        <div className="mt-5 space-y-2.5">
          <div className="text-xs font-bold text-stone-600">已记录的优秀句子：</div>
          {submittedSentences.map((sentence, idx) => (
            <div
              key={idx}
              className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between gap-3 text-xs text-stone-800 font-calligraphy"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{sentence}</span>
              </div>
              <button
                onClick={() => {
                  sound.playTap();
                  speakChinese(sentence);
                }}
                className="p-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg cursor-pointer transition-colors shrink-0"
                title="朗读"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3500 High Frequency Characters 2-Year Roadmap Map */}
      <div className="bg-gradient-to-br from-red-950 via-stone-900 to-red-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-3 border-amber-400 text-left">
        <div className="flex items-center gap-2 mb-2">
          <Map className="w-5 h-5 text-yellow-300" />
          <h3 className="font-festive text-xl text-yellow-200">
            2年突破 3500 考试高频汉字 · 四大主题文化冒险地图
          </h3>
        </div>
        <p className="text-xs text-stone-300 mb-6">
          从 5 年级到 6 年级，循序渐进构建文化背景与语文考试读写能力：
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-900/60 border-2 border-amber-400 p-4 rounded-2xl relative overflow-hidden shadow-md">
            <span className="absolute top-2 right-2 bg-amber-400 text-red-950 text-[10px] font-black px-2 py-0.5 rounded-full">
              当前进行中
            </span>
            <div className="text-2xl mb-1">🏮</div>
            <h4 className="font-bold text-sm text-yellow-100">第 1 主题：节日风俗</h4>
            <p className="text-[11px] text-stone-300 mt-1">
              春节年兽、端午屈原、中秋月饼、重阳茱萸。包含 850 个高频字。
            </p>
          </div>

          <div className="bg-stone-800/80 border border-stone-700 p-4 rounded-2xl relative opacity-85">
            <span className="absolute top-2 right-2 bg-stone-700 text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              下一章解锁
            </span>
            <div className="text-2xl mb-1">📜</div>
            <h4 className="font-bold text-sm text-stone-200">第 2 主题：民间故事与成语</h4>
            <p className="text-[11px] text-stone-400 mt-1">
              司马光砸缸、守株待兔、滥竽充数。包含 950 个成语典故核心字。
            </p>
          </div>

          <div className="bg-stone-800/80 border border-stone-700 p-4 rounded-2xl relative opacity-85">
            <span className="absolute top-2 right-2 bg-stone-700 text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              待探索
            </span>
            <div className="text-2xl mb-1">🌸</div>
            <h4 className="font-bold text-sm text-stone-200">第 3 主题：诗词与自然节气</h4>
            <p className="text-[11px] text-stone-400 mt-1">
              二十四节气、唐诗宋词意境。包含 850 个文学意象高频字。
            </p>
          </div>

          <div className="bg-stone-800/80 border border-stone-700 p-4 rounded-2xl relative opacity-85">
            <span className="absolute top-2 right-2 bg-stone-700 text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
              待探索
            </span>
            <div className="text-2xl mb-1">🏯</div>
            <h4 className="font-bold text-sm text-stone-200">第 4 主题：美食与名胜古迹</h4>
            <p className="text-[11px] text-stone-400 mt-1">
              丝绸之路、长城兵马俑、中华老字号。包含 850 个生活实景字。
            </p>
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};
