import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Volume2,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { CharacterStrokeData, HanziStroke, STROKE_REGISTRY } from '../data/strokeData';
import { sound, speakChinese, stopChineseSpeech } from '../utils/audio';

interface HanziStrokeAnimatorProps {
  char: string;
  pinyin: string;
  defaultRadicalColor?: string;
}

export const HanziStrokeAnimator: React.FC<HanziStrokeAnimatorProps> = ({
  char,
  pinyin,
}) => {
  const strokeData: CharacterStrokeData =
    STROKE_REGISTRY[char] || STROKE_REGISTRY['春'] || STROKE_REGISTRY['年'];

  // Current stroke progress (0-based count of completed strokes, 0 .. strokeCount)
  const strokeCount = strokeData.strokes.length;
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [showRadicalHighlight, setShowRadicalHighlight] = useState<boolean>(true);

  // Safe boundary check: prevent out-of-bounds indexing crashes
  const safeIndex = Math.min(Math.max(0, currentStrokeIndex - 1), strokeCount - 1);
  const currentStroke: HanziStroke | undefined = strokeData.strokes[safeIndex];

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      stopChineseSpeech();
    };
  }, []);

  // Character switch reset
  useEffect(() => {
    setCurrentStrokeIndex(0);
    setIsPlaying(true);
  }, [char]);

  // Auto-play interval
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      if (currentStrokeIndex < strokeCount) {
        timer = setTimeout(() => {
          sound.playTap();
          setCurrentStrokeIndex((prev) => prev + 1);
        }, 1100 / speed);
      } else {
        setIsPlaying(false);
        sound.playFillSuccess();
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStrokeIndex, strokeCount, speed]);

  const handlePlayPause = () => {
    sound.playTap();
    if (currentStrokeIndex >= strokeCount) {
      setCurrentStrokeIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    sound.playTap();
    setIsPlaying(false);
    setCurrentStrokeIndex(0);
  };

  const handlePrevStroke = () => {
    sound.playTap();
    setIsPlaying(false);
    setCurrentStrokeIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextStroke = () => {
    sound.playTap();
    setIsPlaying(false);
    setCurrentStrokeIndex((prev) => Math.min(strokeCount, prev + 1));
  };

  const handleSpeakCurrentStroke = () => {
    if (currentStroke) {
      sound.playTap();
      speakChinese(`第${safeIndex + 1}笔，${currentStroke.name}`);
    }
  };

  // Color selection: radical highlight or classic indigo
  const getStrokeColor = (s: HanziStroke) => {
    if (!showRadicalHighlight) return '#dc2626';
    if (s.isRadical || s.radical) return '#dc2626'; // Vermilion for radical
    // Check component ranges if defined
    if (strokeData.components && strokeData.components.length > 0) {
      const comp = strokeData.components.find(
        (c) => s.id >= c.strokeRange[0] && s.id <= c.strokeRange[1]
      );
      if (comp) return comp.color;
    }
    return '#1e3a8a'; // Deep Indigo for body
  };

  return (
    <div className="bg-amber-100/70 rounded-3xl p-4 sm:p-5 border-2 border-amber-300 text-center max-w-md mx-auto shadow-md">
      {/* Top Banner with Radical Toggle */}
      <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5 mb-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-red-900">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>汉字笔顺动画演示</span>
        </div>

        <button
          onClick={() => {
            sound.playTap();
            setShowRadicalHighlight(!showRadicalHighlight);
          }}
          className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[36px] active:scale-95 ${
            showRadicalHighlight
              ? 'bg-amber-300 text-red-950 border border-amber-400 shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200'
          }`}
          title="切换偏旁部首朱红高亮"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>偏旁高亮: {showRadicalHighlight ? '开' : '关'}</span>
        </button>
      </div>

      {/* Rice Grid (米字格) SVG Canvas */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto bg-amber-50 rounded-2xl border-3 border-amber-400 shadow-inner flex items-center justify-center overflow-hidden">
        {/* Rice grid dashed guidelines */}
        <svg
          className="absolute inset-0 w-full h-full stroke-amber-300/70"
          strokeDasharray="4 4"
        >
          <line x1="0" y1="50%" x2="100%" y2="50%" strokeWidth="1.5" />
          <line x1="50%" y1="0" x2="50%" y2="100%" strokeWidth="1.5" />
          <line x1="0" y1="0" x2="100%" y2="100%" strokeWidth="1" />
          <line x1="100%" y1="0" x2="0" y2="100%" strokeWidth="1" />
        </svg>

        {/* Dynamic SVG Animated Strokes (0..100 coordinate space) */}
        <svg
          className="relative w-full h-full z-10 p-2 select-none"
          viewBox="0 0 100 100"
        >
          {/* Boundary Clip */}
          <defs>
            <clipPath id={`grid-clip-${char}`}>
              <rect x="2" y="2" width="96" height="96" rx="6" />
            </clipPath>
          </defs>

          <g clipPath={`url(#grid-clip-${char})`}>
            {/* Ghost outline underlay for calligraphic reference */}
            {strokeData.strokes.map((s, idx) => (
              <path
                key={`ghost-${idx}`}
                d={s.path}
                fill="none"
                stroke="#e5e0d8"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="1"
              />
            ))}

            {/* Completed and currently animated strokes */}
            {strokeData.strokes.map((s, idx) => {
              if (idx >= currentStrokeIndex) return null;
              const isCurrent = idx === currentStrokeIndex - 1 && isPlaying;
              const strokeColor = getStrokeColor(s);

              return (
                <motion.path
                  key={`stroke-${idx}`}
                  d={s.path}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isCurrent ? '8' : '7'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeMiterlimit="1"
                  initial={{ pathLength: idx < currentStrokeIndex - 1 ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: isCurrent ? 0.75 / speed : 0.1,
                    ease: 'easeInOut',
                  }}
                />
              );
            })}
          </g>
        </svg>

        {/* Floating progress badge */}
        <div className="absolute top-2 left-2 bg-red-700/85 text-white font-bold text-[11px] px-2 py-0.5 rounded-lg backdrop-blur-xs flex items-center gap-1 z-20 shadow-xs">
          <span>{Math.min(currentStrokeIndex, strokeCount)} / {strokeCount}</span>
          {currentStrokeIndex >= strokeCount && (
            <CheckCircle2 className="w-3 h-3 text-yellow-300" />
          )}
        </div>
      </div>

      {/* Stroke Name Hint & Audio Reading Bar */}
      <div className="mt-3.5 flex items-center justify-between bg-white px-4 py-2.5 rounded-2xl border border-amber-200 shadow-2xs">
        <div className="text-xs sm:text-sm font-bold text-amber-950">
          笔顺进度: <span className="text-red-600 font-black">{Math.min(currentStrokeIndex, strokeCount)}</span> / {strokeCount}
        </div>
        {currentStroke && (
          <button
            onClick={handleSpeakCurrentStroke}
            className="flex items-center gap-1.5 text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 rounded-xl transition-all cursor-pointer active:scale-95 shadow-2xs"
            title="点击收听笔画名称读音"
          >
            <Volume2 className="w-4 h-4 text-red-600" />
            <span>第 {safeIndex + 1} 笔：{currentStroke.name}</span>
          </button>
        )}
      </div>

      {/* Kid-Friendly Large Control Center (min 48px touch targets) */}
      <div className="mt-3.5 flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={handleReset}
          className="min-h-[48px] px-3.5 bg-white hover:bg-amber-50 border-2 border-amber-300 text-amber-900 rounded-2xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1 shadow-xs"
          title="重置"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-xs font-bold">重置</span>
        </button>

        <button
          onClick={handlePrevStroke}
          disabled={currentStrokeIndex <= 0}
          className="min-h-[48px] px-3.5 bg-white hover:bg-amber-50 border-2 border-amber-300 disabled:opacity-40 text-amber-900 rounded-2xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1 shadow-xs"
          title="上一步"
        >
          <SkipBack className="w-4 h-4" />
          <span className="text-xs font-bold">上一步</span>
        </button>

        <button
          onClick={handlePlayPause}
          className="min-h-[48px] px-5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{isPlaying ? '暂停' : '自动演示'}</span>
        </button>

        <button
          onClick={handleNextStroke}
          disabled={currentStrokeIndex >= strokeCount}
          className="min-h-[48px] px-3.5 bg-white hover:bg-amber-50 border-2 border-amber-300 disabled:opacity-40 text-amber-900 rounded-2xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1 shadow-xs"
          title="下一步"
        >
          <SkipForward className="w-4 h-4" />
          <span className="text-xs font-bold">下一步</span>
        </button>

        {/* Speed Adjustment */}
        <div className="flex items-center bg-white border-2 border-amber-300 rounded-2xl p-1 gap-1 text-xs font-bold min-h-[48px]">
          {[0.8, 1.0, 1.3].map((s) => (
            <button
              key={s}
              onClick={() => {
                sound.playTap();
                setSpeed(s);
              }}
              className={`px-2 py-1 rounded-xl cursor-pointer transition-all ${
                speed === s
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
