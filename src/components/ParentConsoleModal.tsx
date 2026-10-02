import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  X,
  Volume2,
  VolumeX,
  Eye,
  Gauge,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Info,
  CheckCircle,
} from 'lucide-react';
import { PinyinMode } from './HeaderDashboard';
import { sound } from '../utils/audio';
import { useSettingsStore } from '../store/useSettingsStore';
import { useGameStore } from '../store/useGameStore';

interface ParentConsoleModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  pinyinMode?: PinyinMode;
  onChangePinyinMode?: (mode: PinyinMode) => void;
  speechRate?: number;
  onChangeSpeechRate?: (rate: number) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  collectedCount?: number;
  totalTarget?: number;
}

export const ParentConsoleModal: React.FC<ParentConsoleModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  pinyinMode: propPinyinMode,
  onChangePinyinMode: propOnChangePinyinMode,
  speechRate: propSpeechRate,
  onChangeSpeechRate: propOnChangeSpeechRate,
  isMuted: propIsMuted,
  onToggleMute: propOnToggleMute,
  collectedCount: propCollectedCount,
  totalTarget: propTotalTarget,
}) => {
  const settingsStore = useSettingsStore();
  const gameStore = useGameStore();

  const isOpen = propIsOpen ?? settingsStore.isParentConsoleOpen;
  const onClose = propOnClose ?? settingsStore.closeParentConsole;
  const pinyinMode = propPinyinMode ?? settingsStore.pinyinMode;
  const onChangePinyinMode = propOnChangePinyinMode ?? settingsStore.setPinyinMode;
  const speechRate = propSpeechRate ?? settingsStore.speechRate;
  const onChangeSpeechRate = propOnChangeSpeechRate ?? settingsStore.setSpeechRate;
  const isMuted = propIsMuted ?? settingsStore.isMuted;
  const onToggleMute = propOnToggleMute ?? settingsStore.toggleMute;
  const collectedCount = propCollectedCount ?? gameStore.collectedCount;
  const totalTarget = propTotalTarget ?? gameStore.totalTarget;
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 15 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="relative w-full max-w-lg bg-amber-50 rounded-3xl border-4 border-amber-400 shadow-2xl overflow-hidden z-10 text-stone-800"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-white px-5 py-4 border-b-2 border-amber-400/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-amber-400/20 border border-amber-300/40 text-yellow-300">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-calligraphy font-black text-lg text-yellow-100 leading-tight">
                  家长与教师辅导控制台
                </h3>
                <p className="text-[11px] text-amber-200/80">
                  为孩子定制无干扰、沉浸式的阅读与识字环境
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="p-2 rounded-2xl bg-black/40 hover:bg-black/60 text-amber-200 hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="完成并关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* 1. Pinyin Visibility Control */}
            <div className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-sm text-stone-800">
                    生字注音展示模式
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 font-medium">
                  {pinyinMode === 'full' && '当前：完整注音'}
                  {pinyinMode === 'faded' && '当前：艾宾浩斯渐隐 (推荐)'}
                  {pinyinMode === 'hidden' && '当前：全汉字阅读'}
                </span>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                针对不同中文基础的孩子进行视觉辅助分层，避免过度依赖拼音而忽视汉字字形。
              </p>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  {
                    id: 'full' as PinyinMode,
                    title: '全部显示',
                    desc: '适合初识阶段',
                    badge: '基础',
                  },
                  {
                    id: 'faded' as PinyinMode,
                    title: '艾宾浩斯渐隐',
                    desc: '透明度40%，按需提示',
                    badge: '科学推荐',
                  },
                  {
                    id: 'hidden' as PinyinMode,
                    title: '隐藏注音',
                    desc: '纯字形脱敏训练',
                    badge: '高阶进阶',
                  },
                ].map((item) => {
                  const isSelected = pinyinMode === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        sound.playTap();
                        onChangePinyinMode(item.id);
                      }}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400/50 shadow-xs'
                          : 'bg-stone-50 border-stone-200 hover:border-amber-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-black ${isSelected ? 'text-red-900' : 'text-stone-800'}`}>
                            {item.title}
                          </span>
                          {isSelected && <CheckCircle className="w-3.5 h-3.5 text-amber-600" />}
                        </div>
                        <p className="text-[10px] text-stone-500 mt-0.5 leading-tight">
                          {item.desc}
                        </p>
                      </div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-2 w-fit ${
                        isSelected ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-600'
                      }`}>
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Audio Narration Speed */}
            <div className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-sm text-stone-800">
                    课文伴读与跟读语速
                  </span>
                </div>
                <span className="text-[11px] font-black text-red-900 bg-red-100 px-2 py-0.5 rounded-full">
                  {speechRate}x
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { rate: 0.8, label: '0.8x 慢速伴读', sub: '发音清晰，磨耳朵初学' },
                  { rate: 1.0, label: '1.0x 标准日常', sub: '适合5-6年级正常阅读' },
                  { rate: 1.2, label: '1.2x 敏捷挑战', sub: '锻炼快速口语反应' },
                ].map((item) => {
                  const isSelected = speechRate === item.rate;
                  return (
                    <button
                      key={item.rate}
                      onClick={() => {
                        sound.playTap();
                        onChangeSpeechRate(item.rate);
                      }}
                      className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-100 border-amber-500 ring-2 ring-amber-400/50 font-black text-red-900'
                          : 'bg-stone-50 border-stone-200 text-stone-700 hover:border-amber-300 font-bold text-xs'
                      }`}
                    >
                      <div className="text-xs">{item.label}</div>
                      <div className="text-[10px] text-stone-500 font-normal mt-0.5">{item.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Audio & Haptics Sound Switch */}
            <div className="bg-white rounded-2xl p-4 border-2 border-amber-200 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${isMuted ? 'bg-stone-100 text-stone-400 border-stone-200' : 'bg-amber-100 text-amber-700 border-amber-300'}`}>
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-800">
                    互动操作音效与触觉反馈
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    包括翻书声、金石印章加盖声、汉字点击玉石清音
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  onToggleMute();
                  sound.playTap();
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer min-h-[44px] min-w-[64px] flex items-center justify-center ${
                  isMuted
                    ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                    : 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                }`}
              >
                {isMuted ? '已静音' : '开启中'}
              </button>
            </div>

            {/* 4. Child-friendly philosophy badge */}
            <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-amber-200 rounded-2xl p-3.5 border border-amber-300 text-xs text-amber-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">儿童专注阅读保护原则：</span>
                <p className="text-[11px] text-amber-950/80 leading-relaxed">
                  孩子在故事书页中时，我们去除了复杂的参数调节，只保留最清晰的生字点读、跟读与探索按钮。您随时可以在此为孩子微调阅读节奏。
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-stone-100 px-5 py-3 border-t border-stone-200 flex items-center justify-between">
            <span className="text-xs text-stone-500">
              已收录高频汉字: <strong className="text-red-900">{collectedCount}</strong> / {totalTarget}
            </span>
            <button
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-red-950 font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer"
            >
              保存并返回学习
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
