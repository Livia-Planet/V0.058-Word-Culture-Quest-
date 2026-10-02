import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { Award, Star, GripVertical, ChevronLeft, ChevronRight, ArrowUpToLine, Lock } from 'lucide-react';
import { StoryLevel } from '../data/storyLevels';

export interface SpineStyle {
  spineBg: string;
  spineBorder: string;
  ribbonColor: string;
  titleColor: string;
  accentColor: string;
}

export interface TiltBookSpineProps {
  story: StoryLevel;
  index: number;
  totalCount?: number;
  isCurrent: boolean;
  progress: number;
  isWobbling: boolean;
  isBreathingTarget: boolean;
  isIdlePromptActive: boolean;
  style: SpineStyle;
  spineHeight: string;
  onSelectBook: (story: StoryLevel) => void;
  onTouchStart: (storyId: string) => void;
  onTouchEnd: () => void;
  onHoverSound: () => void;
  onResetIdle: () => void;
  // Drag & Reorder Props
  isReorderMode?: boolean;
  isDragging?: boolean;
  isUnlocked?: boolean;
  onDragHandlePointerDown?: (e: React.PointerEvent) => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onMoveToTop?: () => void;
}

export const TiltBookSpine: React.FC<TiltBookSpineProps> = ({
  story,
  index,
  totalCount,
  isCurrent,
  progress,
  isWobbling,
  isBreathingTarget,
  isIdlePromptActive,
  style,
  spineHeight,
  onSelectBook,
  onTouchStart,
  onTouchEnd,
  onHoverSound,
  onResetIdle,
  isReorderMode = false,
  isDragging = false,
  isUnlocked = story.unlocked !== false,
  onDragHandlePointerDown,
  onMoveLeft,
  onMoveRight,
  onMoveToTop,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Raw cursor position normalized from -0.5 to 0.5
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Physics springs for natural inertia, elasticity and damping
  const springX = useSpring(mouseX, { stiffness: 320, damping: 22, mass: 0.6 });
  const springY = useSpring(mouseY, { stiffness: 320, damping: 22, mass: 0.6 });

  // 3D Tilt angles (Euler rotations in degrees)
  const tiltRotateX = useTransform(springY, [-0.5, 0.5], [16, -16]);
  const tiltRotateY = useTransform(springX, [-0.5, 0.5], [-16, 16]);
  const tiltRotateZ = useTransform(springX, [-0.5, 0.5], [-3, 3]);

  // Physical dynamic drop shadow offset shifting in 3D space
  const shadowX = useTransform(springX, [-0.5, 0.5], [18, -18]);
  const shadowY = useTransform(springY, [-0.5, 0.5], [26, 10]);

  // Specular lacquer reflection sheen gradient position
  const sheenOpacity = useTransform(springX, [-0.5, 0, 0.5], [0.45, 0.08, 0.45]);

  // Handle cursor tracking on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || isReorderMode) return;
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  // Handle touch tracking for tactile mobile tilt (only when not reordering/dragging)
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDragging || isReorderMode) return;
    if (!cardRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = Math.max(-0.6, Math.min(0.6, (touch.clientX - rect.left) / rect.width - 0.5));
    const yPct = Math.max(-0.6, Math.min(0.6, (touch.clientY - rect.top) / rect.height - 0.5));
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseEnter = () => {
    if (isDragging) return;
    setIsHovered(true);
    onHoverSound();
    onResetIdle();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleTouchEndInternal = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    onTouchEnd();
  };

  return (
    <div
      ref={cardRef}
      style={{ perspective: 1000 }}
      className={`relative shrink-0 select-none group ${
        !isUnlocked ? 'opacity-65 grayscale-30 cursor-not-allowed' : ''
      }`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => {
        if (isUnlocked && !isReorderMode) {
          setIsHovered(true);
          onTouchStart(story.id);
        }
      }}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEndInternal}
      onTouchCancel={handleTouchEndInternal}
      onClick={() => {
        if (isDragging) return;
        if (!isUnlocked) {
          return;
        }
        onResetIdle();
        onSelectBook(story);
      }}
    >
      {/* 3D Dynamic Cast Shadow on the bookshelf base behind the book */}
      <motion.div
        className="absolute -bottom-2 inset-x-1 h-6 rounded-full bg-black/75 blur-md pointer-events-none transition-opacity duration-300"
        style={{
          x: isDragging ? 0 : shadowX,
          y: isDragging ? 18 : shadowY,
          opacity: isDragging ? 0.95 : isHovered ? 0.9 : 0.45,
          scale: isDragging ? 1.3 : isHovered ? 1.15 : 1,
        }}
      />

      {/* Main 3D Tilting Book Spine Entity */}
      <motion.div
        layoutId={isDragging ? undefined : `book-card-${story.id}`}
        style={{
          rotateX: isDragging ? 0 : tiltRotateX,
          rotateY: isDragging ? 0 : tiltRotateY,
          rotateZ: isDragging ? 0 : tiltRotateZ,
          transformStyle: 'preserve-3d',
        }}
        whileHover={
          !isReorderMode && isUnlocked
            ? {
                y: -22,
                scale: 1.06,
              }
            : undefined
        }
        whileTap={
          !isReorderMode && isUnlocked
            ? {
                scale: 0.95,
                rotate: -2,
              }
            : undefined
        }
        animate={
          isDragging
            ? {
                y: -16,
                scale: 1.08,
                rotate: 0,
                boxShadow: '0 20px 40px rgba(251,191,36,0.9), 0 0 20px rgba(245,158,11,0.8)',
              }
            : isReorderMode && isUnlocked
            ? {
                rotate: [-0.6, 0.6, -0.6],
                transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' },
              }
            : isWobbling
            ? {
                rotate: [0, -4.5, 4.5, -2.5, 2.5, 0],
                y: [-4, -14, -6, 0],
                scale: [1, 1.06, 1.02, 1],
                transition: { duration: 0.45, ease: 'easeOut', type: 'tween' },
              }
            : isBreathingTarget
            ? {
                boxShadow: [
                  '0 0 10px rgba(251,191,36,0.25)',
                  '0 0 32px rgba(251,191,36,0.9)',
                  '0 0 10px rgba(251,191,36,0.25)',
                ],
                y: [0, -8, 0],
                scale: [1, 1.04, 1],
                transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut', type: 'tween' },
              }
            : isIdlePromptActive
            ? {
                boxShadow: [
                  '0 0 4px rgba(251,191,36,0.1)',
                  '0 0 16px rgba(251,191,36,0.45)',
                  '0 0 4px rgba(251,191,36,0.1)',
                ],
                transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut', type: 'tween' },
              }
            : {}
        }
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
        className={`relative ${spineHeight} w-[58px] sm:w-[68px] rounded-t-xl rounded-b-sm bg-gradient-to-b ${style.spineBg} border-3 ${style.spineBorder} shadow-2xl flex flex-col justify-between items-center py-2.5 px-1.5 transition-shadow shrink-0 ${
          isDragging
            ? 'ring-4 ring-yellow-300 z-50 shadow-[0_0_35px_rgba(250,204,21,0.95)]'
            : isReorderMode && isUnlocked
            ? 'ring-2 ring-amber-400/80 hover:ring-3 hover:ring-yellow-300 cursor-grab active:cursor-grabbing'
            : isCurrent
            ? 'ring-4 ring-yellow-400 shadow-[0_0_26px_rgba(250,204,21,0.7)] cursor-pointer'
            : 'hover:shadow-[0_16px_36px_rgba(0,0,0,0.8)] cursor-pointer'
        }`}
      >
        {/* Physical Specular Glare / Sheen overlay that follows the mouse/tilt light angle */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-t-xl rounded-b-sm overflow-hidden z-20"
          style={{
            opacity: isDragging ? 0.2 : sheenOpacity,
            background: `radial-gradient(ellipse 90% 70% at 50% 30%, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.15) 45%, transparent 70%)`,
          }}
        />

        {/* 3D Simulated Book Spine Lacquer Edge / Thickness bevel */}
        <div className="absolute inset-y-0 -left-1 w-1 bg-gradient-to-r from-black/50 to-transparent pointer-events-none rounded-l-sm" />
        <div className="absolute inset-y-0 -right-1 w-1 bg-gradient-to-l from-black/50 to-transparent pointer-events-none rounded-r-sm" />

        {/* Top Decorative Spine Ribbon / Bookmark hanging down with 3D elevation */}
        <div
          style={{ transform: 'translateZ(24px)' }}
          className={`w-3 sm:w-3.5 h-5 ${style.ribbonColor} rounded-b-md shadow-sm border border-black/20 -mt-2.5 z-10 transition-transform flex items-center justify-center`}
        >
          {/* Subtle touch grip dot indicator on ribbon */}
          <div className="w-1 h-1 rounded-full bg-black/40" />
        </div>

        {/* Top Row: Chapter Badge or Reorder Index Badge */}
        <div
          style={{ transform: 'translateZ(26px)' }}
          className="w-full flex items-center justify-center z-10 my-0.5"
        >
          {isReorderMode ? (
            <span className="text-[10px] font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-stone-950 px-1.5 py-0.2 rounded-full border border-yellow-200 shadow-sm flex items-center gap-0.5 whitespace-nowrap">
              <span>#{index + 1}</span>
            </span>
          ) : (
            <span className="text-[10px] font-black bg-black/40 text-amber-200 px-1 py-0.5 rounded-sm border border-amber-300/30 shadow-xs">
              卷{story.chapterNumber}
            </span>
          )}
        </div>

        {/* Tactile Drag Grip Handle in Reorder Mode (纯 SVG 图标化，去文字) */}
        {isReorderMode && isUnlocked && (
          <div
            style={{ transform: 'translateZ(28px)' }}
            onPointerDown={onDragHandlePointerDown}
            className="w-full py-1 px-1 rounded-md bg-amber-400/90 hover:bg-yellow-300 text-stone-950 flex items-center justify-center cursor-grab active:cursor-grabbing border border-yellow-200 shadow-sm transition-transform active:scale-95 touch-none z-30"
            title="按住把手拖拽重排"
            aria-label="拖拽"
          >
            <GripVertical className="w-3.5 h-3.5 text-stone-950 shrink-0" />
          </div>
        )}

        {/* Main Story Icon with 3D elevation and hover bounce */}
        <div
          style={{ transform: 'translateZ(28px)' }}
          className="text-xl sm:text-2xl drop-shadow-md my-0.5 group-hover:scale-115 transition-transform z-10"
        >
          {story.icon}
        </div>

        {/* Vertical Book Title (竖排中文，大号加粗防误触) with 3D elevation */}
        <div
          style={{ transform: 'translateZ(22px)' }}
          className="flex-1 flex flex-col items-center justify-center my-0.5 z-10"
        >
          <span
            className={`font-festive font-black text-sm sm:text-base leading-tight tracking-widest ${style.titleColor} text-center drop-shadow-sm`}
            style={{ writingMode: 'vertical-rl' }}
          >
            {story.shortTitle || story.title.replace(/[《》]/g, '')}
          </span>
        </div>

        {/* Locked state indicator */}
        {!isUnlocked && (
          <div
            style={{ transform: 'translateZ(28px)' }}
            className="w-full flex items-center justify-center gap-0.5 py-0.5 px-1 rounded-md bg-stone-900/90 text-stone-300 border border-stone-600 my-0.5 z-20"
            title="该篇章尚未解锁"
          >
            <Lock className="w-2.5 h-2.5 text-amber-400" />
            <span className="text-[9px] font-bold">未解锁</span>
          </div>
        )}

        {/* Reorder Mode: Quick Move Controls (◀ 置顶 ▶) for small screen convenience */}
        {isReorderMode && isUnlocked && (
          <div
            style={{ transform: 'translateZ(30px)' }}
            className="w-full flex items-center justify-between gap-0.5 px-0.5 my-1 z-30"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={index === 0}
              onClick={(e) => {
                e.stopPropagation();
                onMoveLeft?.();
              }}
              className={`p-1 rounded-md transition-all ${
                index === 0
                  ? 'opacity-25 cursor-not-allowed text-stone-500'
                  : 'bg-black/70 hover:bg-black text-yellow-300 border border-yellow-400/50 active:scale-85 cursor-pointer shadow-xs'
              }`}
              title="向左前移一位"
              aria-label="向左前移"
            >
              <ChevronLeft className="w-2.5 h-2.5" />
            </button>

            <button
              type="button"
              disabled={index === 0}
              onClick={(e) => {
                e.stopPropagation();
                onMoveToTop?.();
              }}
              className={`px-1 py-0.5 rounded-md text-[8px] font-black transition-all ${
                index === 0
                  ? 'opacity-25 cursor-not-allowed text-stone-500'
                  : 'bg-yellow-400 hover:bg-yellow-300 text-stone-950 border border-yellow-200 active:scale-85 cursor-pointer shadow-xs'
              }`}
              title="置于最前位"
              aria-label="置顶"
            >
              <ArrowUpToLine className="w-2.5 h-2.5" />
            </button>

            <button
              type="button"
              disabled={totalCount !== undefined && index >= totalCount - 1}
              onClick={(e) => {
                e.stopPropagation();
                onMoveRight?.();
              }}
              className={`p-1 rounded-md transition-all ${
                totalCount !== undefined && index >= totalCount - 1
                  ? 'opacity-25 cursor-not-allowed text-stone-500'
                  : 'bg-black/70 hover:bg-black text-yellow-300 border border-yellow-400/50 active:scale-85 cursor-pointer shadow-xs'
              }`}
              title="向右后移一位"
              aria-label="向右后移"
            >
              <ChevronRight className="w-2.5 h-2.5" />
            </button>
          </div>
        )}

        {/* Progress / Completion: 难度星级 + 100%金色勋章 / 百分比 / 待读 with 3D elevation */}
        {!isReorderMode && (
          <div
            style={{ transform: 'translateZ(20px)' }}
            className="w-full flex flex-col items-center gap-0.5 mt-auto z-10"
          >
            {/* 难度星级微徽章 */}
            <div
              className="flex items-center justify-center gap-0.5 my-0.5 px-1 py-0.2 rounded-full bg-black/40 border border-amber-400/30"
              title={`难度系数：${story.difficultyStars ?? 1}星 (${story.difficulty})`}
            >
              {Array.from({ length: story.difficultyStars ?? 1 }).map((_, i) => (
                <span key={i} className="text-[7px] text-yellow-300 leading-none">★</span>
              ))}
            </div>

            {progress === 100 ? (
              <div className="flex items-center text-yellow-300 text-[10px] font-bold" title="字词100%掌握 · 获封金勋章">
                <Award className="w-3.5 h-3.5 fill-yellow-400 text-yellow-300 drop-shadow-[0_0_6px_rgba(250,204,21,0.9)] animate-pulse" />
                <span className="font-bold ml-0.5 text-[9px]">100%</span>
              </div>
            ) : progress > 0 ? (
              <div className="flex items-center text-yellow-300 text-[10px]" title={`掌握进度：${progress}%`}>
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-300" />
                <span className="font-bold ml-0.5 text-[9px]">{progress}%</span>
              </div>
            ) : (
              <span className="text-[9px] text-amber-200/60 font-bold">待读</span>
            )}
          </div>
        )}

        {/* Active Current Marker */}
        {isCurrent && !isReorderMode && (
          <div
            style={{ transform: 'translateZ(30px)' }}
            className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-red-950 font-black text-[9px] px-1.5 py-0.5 rounded-full shadow-md whitespace-nowrap z-30"
          >
            在读
          </div>
        )}

        {/* Dragging Badge */}
        {isDragging && (
          <div
            style={{ transform: 'translateZ(35px)' }}
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow-400 text-red-950 font-festive font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-yellow-100 whitespace-nowrap z-50 animate-bounce"
          >
            调整中
          </div>
        )}

        {/* 3D Physical Tilt Tactile Indicator on hover (when not reordering) */}
        {isHovered && !isReorderMode && !isDragging && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ transform: 'translateZ(32px)' }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/85 text-yellow-300 text-[8px] font-festive font-bold px-1.5 py-0.2 rounded-full border border-yellow-400/50 shadow-md whitespace-nowrap z-30 pointer-events-none"
          >
            <span>✨ 3D倾斜</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
