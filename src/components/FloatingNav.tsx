import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Gamepad2, PenLine, Zap, Compass, X, Sparkles, Move, Library } from 'lucide-react';
import { sound } from '../utils/audio';
import { MainlineSubTab } from './MobileLayoutContainer';

interface FloatingNavProps {
  activeTab: MainlineSubTab;
  onSelectTab: (tab: MainlineSubTab) => void;
}

interface NavModule {
  id: MainlineSubTab;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  bgGradient: string;
  accentBorder: string;
  textColor: string;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({ activeTab, onSelectTab }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const isDraggingRef = useRef(false);
  const dragStartPointRef = useRef({ x: 0, y: 0 });

  // On the bookshelf home, keep view pristine and distraction-free
  if (activeTab === 'bookshelf') {
    return null;
  }

  const modules: NavModule[] = [
    {
      id: 'story',
      title: '故事伴读',
      subtitle: '绘本剧情 · 听说驱动',
      badge: '第一阶',
      icon: <BookOpen className="w-5 h-5 text-amber-300" />,
      bgGradient: 'from-red-900/90 via-red-800/80 to-amber-950/90',
      accentBorder: 'border-red-400/60',
      textColor: 'text-amber-100',
    },
    {
      id: 'challenge',
      title: '互动挑战',
      subtitle: '拼音部首 · 手写评测',
      badge: '第二阶',
      icon: <Gamepad2 className="w-5 h-5 text-yellow-300" />,
      bgGradient: 'from-amber-900/90 via-orange-850/80 to-red-950/90',
      accentBorder: 'border-yellow-400/60',
      textColor: 'text-yellow-100',
    },
    {
      id: 'writing',
      title: '作文造句',
      subtitle: '情境填空 · 400字小作文',
      badge: '第三阶',
      icon: <PenLine className="w-5 h-5 text-emerald-300" />,
      bgGradient: 'from-emerald-950/90 via-teal-900/80 to-stone-900/90',
      accentBorder: 'border-emerald-400/60',
      textColor: 'text-emerald-100',
    },
    {
      id: 'rapid',
      title: '60秒速决',
      subtitle: '极速答题 · 压轴试炼',
      badge: '第四阶',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      bgGradient: 'from-purple-950/90 via-indigo-900/80 to-stone-900/90',
      accentBorder: 'border-amber-400/60',
      textColor: 'text-amber-200',
    },
  ];

  const handleToggle = () => {
    sound.playTap();
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (tab: MainlineSubTab) => {
    sound.playCharClick();
    onSelectTab(tab);
    setIsOpen(false);
  };

  const currentModule = modules.find((m) => m.id === activeTab) || modules[0];

  return (
    <>
      {/* 1. FLOATING ACTION BUTTON (支持全屏幕自由拖拽) */}
      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.12}
        onDragStart={(_e, info) => {
          isDraggingRef.current = false;
          dragStartPointRef.current = { x: info.point.x, y: info.point.y };
        }}
        onDrag={(_e, info) => {
          const dist = Math.hypot(
            info.point.x - dragStartPointRef.current.x,
            info.point.y - dragStartPointRef.current.y
          );
          if (dist > 6) {
            isDraggingRef.current = true;
          }
        }}
        onDragEnd={(_e, info) => {
          const dist = Math.hypot(
            info.point.x - dragStartPointRef.current.x,
            info.point.y - dragStartPointRef.current.y
          );
          if (dist > 6) {
            isDraggingRef.current = true;
            setTimeout(() => {
              isDraggingRef.current = false;
            }, 180);
          } else {
            isDraggingRef.current = false;
          }
        }}
        dragConstraints={{
          left: -8,
          right: typeof window !== 'undefined' ? window.innerWidth - 80 : 800,
          top: typeof window !== 'undefined' ? -window.innerHeight * 0.44 : -350,
          bottom: typeof window !== 'undefined' ? window.innerHeight * 0.44 : 350,
        }}
        className="fixed left-4 top-1/2 -translate-y-1/2 z-50 pointer-events-auto touch-none select-none cursor-grab active:cursor-grabbing"
      >
        <motion.button
          onClick={(e) => {
            if (isDraggingRef.current) {
              e.stopPropagation();
              return;
            }
            handleToggle();
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="relative group p-3 sm:p-3.5 rounded-full bg-gradient-to-br from-red-700 via-amber-600 to-yellow-500 text-white shadow-[0_8px_25px_rgba(234,88,12,0.45)] border-2 border-yellow-300 flex items-center justify-center cursor-pointer transition-all ring-4 ring-yellow-400/20"
          title="点击展开四大修业板块 / 返回书架"
          aria-label="导航菜单"
        >
          <span className="absolute -inset-1 rounded-full bg-yellow-400/30 blur-sm animate-pulse pointer-events-none" />

          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative z-10"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-yellow-100" />
            ) : (
              <Compass className="w-6 h-6 text-yellow-100 drop-shadow-md" />
            )}
          </motion.div>

          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-300 rounded-full border-2 border-red-900 shadow-sm flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-red-700 rounded-full animate-ping" />
          </span>

          <span className="absolute -bottom-1 -left-1 w-4 h-4 bg-stone-900/90 rounded-full border border-yellow-300 text-yellow-300 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
            <Move className="w-2.5 h-2.5" />
          </span>

          <span className="hidden sm:block absolute left-full ml-3 px-2 py-1 bg-stone-900/90 backdrop-blur-md text-[11px] font-bold text-yellow-300 rounded-lg shadow-md border border-amber-400/40 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
            {currentModule.title} · 拖拽可移位
          </span>
        </motion.button>
      </motion.div>

      {/* 2. EXPANDED 2x2 GRID MODAL */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-start sm:pl-20 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-stone-950/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.85, opacity: 0, x: -20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.85, opacity: 0, x: -20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
              className="relative z-10 w-full max-w-sm sm:max-w-md bg-stone-900/95 backdrop-blur-xl border-2 border-amber-400/80 rounded-3xl p-4 sm:p-5 shadow-2xl text-left space-y-3.5"
            >
              {/* Header inside popup */}
              <div className="flex items-center justify-between border-b border-amber-500/30 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-red-950/80 border border-yellow-400/50 text-yellow-300">
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" />
                  </div>
                  <div>
                    <h3 className="font-festive font-black text-amber-200 text-sm sm:text-base leading-tight">
                      修业进阶 · 导航中枢
                    </h3>
                    <p className="text-[10px] text-stone-400">
                      听说驱动 · 逐阶挑战
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sound.playTap();
                    setIsOpen(false);
                  }}
                  className="p-1.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors cursor-pointer"
                  title="关闭菜单"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Big "Return to Bookshelf Home" Button */}
              <button
                onClick={() => handleSelect('bookshelf')}
                className="w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-red-950 font-festive font-black text-sm shadow-md border-2 border-yellow-200 active:scale-95 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <Library className="w-4 h-4 text-red-900" />
                  <span>返回魔法书架</span>
                </div>
                <span className="text-[11px] font-sans font-bold bg-red-900/20 px-2 py-0.5 rounded-full">
                  重选绘本 ➔
                </span>
              </button>

              {/* 2x2 Grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {modules.map((mod, idx) => {
                  const isActive = mod.id === activeTab;
                  return (
                    <motion.button
                      key={mod.id}
                      onClick={() => handleSelect(mod.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      className={`relative p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br ${mod.bgGradient} border-2 transition-all cursor-pointer text-left flex flex-col justify-between min-h-[92px] sm:min-h-[102px] shadow-md group ${
                        isActive
                          ? 'border-yellow-400 ring-2 ring-yellow-300/60 shadow-[0_4px_16px_rgba(250,204,21,0.35)]'
                          : `${mod.accentBorder} hover:border-yellow-300/60 opacity-90 hover:opacity-100`
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-black tracking-wider px-2 py-0.5 rounded-md bg-black/40 text-yellow-300 border border-yellow-400/30">
                          {idx + 1}. {mod.badge}
                        </span>
                        <div className="p-1.5 rounded-xl bg-black/30 backdrop-blur-xs">
                          {mod.icon}
                        </div>
                      </div>

                      <div className="mt-2">
                        <div className="flex items-center justify-between">
                          <span className={`font-festive font-black text-sm ${mod.textColor}`}>
                            {mod.title}
                          </span>
                          {isActive && (
                            <span className="text-[9px] bg-yellow-400 text-red-950 font-black px-1.5 py-0.5 rounded-full">
                              当前
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-amber-200/70 truncate mt-0.5">
                          {mod.subtitle}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
