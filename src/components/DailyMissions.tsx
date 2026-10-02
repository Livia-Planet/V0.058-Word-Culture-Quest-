import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Gift,
  Sparkles,
  ChevronRight,
  Trophy,
  Zap,
  RotateCcw,
  Volume2,
  X,
  Target,
  PenTool,
  Puzzle,
  Gamepad2,
  BookOpen,
  Coins,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyMission, DailyMissionsState, DEFAULT_MISSIONS, saveDailyMissions } from '../data/dailyMissionsData';
import { sound, speakChinese } from '../utils/audio';
import { NavTab } from './HeaderDashboard';

interface DailyMissionsProps {
  missionsState: DailyMissionsState;
  onUpdateMissionsState: (newState: DailyMissionsState) => void;
  onNavigateToTab: (tab: NavTab) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const DailyMissions: React.FC<DailyMissionsProps> = ({
  missionsState,
  onUpdateMissionsState,
  onNavigateToTab,
  onClose,
  isModal = false,
}) => {
  const { missions, chestClaimed, totalCoins, totalExpEarned } = missionsState;

  const completedCount = missions.filter((m) => m.status === 'completed' || m.status === 'claimed').length;
  const totalMissions = missions.length;
  const progressPercent = Math.round((completedCount / totalMissions) * 100);
  const canClaimChest = completedCount >= 3 && !chestClaimed;

  const handleClaimReward = (missionId: string) => {
    sound.playFillSuccess();
    try {
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
    } catch (error) {
      console.warn('[UI Effect Error]:', error);
    }

    const updatedMissions = missions.map((m) => {
      if (m.id === missionId && m.status === 'completed') {
        return { ...m, status: 'claimed' as const };
      }
      return m;
    });

    const targetMission = missions.find((m) => m.id === missionId);
    const addedExp = targetMission?.reward.exp || 30;
    const addedCoins = targetMission?.reward.coins || 20;

    const newState: DailyMissionsState = {
      ...missionsState,
      missions: updatedMissions,
      totalExpEarned: missionsState.totalExpEarned + addedExp,
      totalCoins: missionsState.totalCoins + addedCoins,
    };

    onUpdateMissionsState(newState);
    saveDailyMissions(newState);
  };

  const handleQuickProgress = (missionId: string) => {
    sound.playCharClick();
    const updatedMissions = missions.map((m) => {
      if (m.id === missionId && m.status === 'in_progress') {
        const nextCount = Math.min(m.targetCount, m.currentCount + 1);
        const nextStatus = nextCount >= m.targetCount ? ('completed' as const) : ('in_progress' as const);
        if (nextStatus === 'completed') {
          sound.playFillSuccess();
          try {
            confetti({ particleCount: 30, spread: 50 });
          } catch (error) {
            console.warn('[UI Effect Error]:', error);
          }
        }
        return {
          ...m,
          currentCount: nextCount,
          status: nextStatus,
        };
      }
      return m;
    });

    const newState: DailyMissionsState = {
      ...missionsState,
      missions: updatedMissions,
    };
    onUpdateMissionsState(newState);
    saveDailyMissions(newState);
  };

  const handleClaimChest = () => {
    if (!canClaimChest) return;
    sound.playBadgeUnlock();
    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch (error) {
      console.warn('[UI Effect Error]:', error);
    }

    const newState: DailyMissionsState = {
      ...missionsState,
      chestClaimed: true,
      totalExpEarned: missionsState.totalExpEarned + 80,
      totalCoins: missionsState.totalCoins + 50,
    };
    onUpdateMissionsState(newState);
    saveDailyMissions(newState);
  };

  const handleResetMissions = () => {
    sound.playTap();
    const resetState: DailyMissionsState = {
      ...missionsState,
      missions: DEFAULT_MISSIONS.map((m) => ({ ...m })),
      chestClaimed: false,
    };
    onUpdateMissionsState(resetState);
    saveDailyMissions(resetState);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Puzzle':
        return <Puzzle className="w-5 h-5 text-amber-600" />;
      case 'PenTool':
        return <PenTool className="w-5 h-5 text-red-600" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5 text-emerald-600" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-indigo-600" />;
      default:
        return <Target className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className={`relative ${isModal ? 'max-w-2xl w-full mx-auto' : 'w-full'}`}>
      <div className="bg-gradient-to-br from-amber-50 via-orange-50/70 to-amber-100/90 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Cultural Watermark */}
        <div className="absolute top-2 right-6 text-7xl font-calligraphy text-amber-900/5 select-none pointer-events-none font-bold">
          日进有功
        </div>

        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b-2 border-amber-200/80 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 text-white flex items-center justify-center shadow-md border-2 border-yellow-300 shrink-0">
              <Target className="w-6 h-6 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-festive font-black text-lg sm:text-xl text-red-950">
                  每日研习任务 · 日进有功
                </h3>
                <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                  5-6年级实训
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                完成偏旁拆解、成语实训与听说挑战，获取文昌通宝与研习加成
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* EXP & Coin Badges */}
            <div className="hidden sm:flex items-center gap-2 bg-amber-100/90 border border-amber-300 px-3 py-1.5 rounded-2xl shadow-xs text-xs">
              <div className="flex items-center gap-1 font-bold text-amber-800">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>通宝: {totalCoins}</span>
              </div>
              <span className="text-amber-300">|</span>
              <div className="flex items-center gap-1 font-bold text-red-800">
                <Zap className="w-3.5 h-3.5 text-red-600" />
                <span>经验: {totalExpEarned}</span>
              </div>
            </div>

            {isModal && onClose && (
              <button
                onClick={() => {
                  sound.playTap();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-800 flex items-center justify-center cursor-pointer transition-colors"
                title="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Big Chest Banner */}
        <div className="bg-gradient-to-r from-red-900 via-amber-900 to-red-950 text-white rounded-2xl p-4 shadow-md mb-4 border border-amber-400/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-3 mb-1.5">
                <span className="font-bold text-xs text-yellow-200">
                  今日任务达成率：{completedCount} / {totalMissions} 项
                </span>
                <span className="text-xs font-black text-amber-300 bg-red-950/80 px-2 py-0.5 rounded-md border border-amber-400/40">
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full sm:w-64 md:w-80 h-2.5 bg-stone-800 rounded-full overflow-hidden border border-amber-400/30">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-200 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Daily Chest Trigger */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-amber-700/50 pt-2 sm:pt-0">
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-amber-200 block font-medium">每日修业大宝箱</span>
                <span className="text-[10px] text-stone-300 block">
                  {chestClaimed ? '已开启本日宝箱' : '达成 3 项任务即可开启'}
                </span>
              </div>

              {chestClaimed ? (
                <div className="flex items-center gap-1 bg-amber-400/20 border border-amber-400/50 px-3 py-1.5 rounded-xl text-yellow-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>宝箱已领</span>
                </div>
              ) : (
                <button
                  onClick={handleClaimChest}
                  disabled={!canClaimChest}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-black text-xs transition-all shadow-md active:scale-95 ${
                    canClaimChest
                      ? 'bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-300 text-red-950 hover:from-yellow-300 hover:to-amber-200 ring-2 ring-yellow-300 animate-bounce cursor-pointer'
                      : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
                  }`}
                  title={canClaimChest ? '点击开启大宝箱领丰厚通宝' : '尚未达成 3 项任务'}
                >
                  <Gift className={`w-4 h-4 ${canClaimChest ? 'text-red-950' : 'text-stone-500'}`} />
                  <span>开启大宝箱</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mission List */}
        <div className="space-y-3">
          {missions.map((mission) => {
            const isCompleted = mission.status === 'completed';
            const isClaimed = mission.status === 'claimed';
            const percent = Math.min(100, Math.round((mission.currentCount / mission.targetCount) * 100));

            return (
              <div
                key={mission.id}
                className={`border-2 rounded-2xl p-3.5 sm:p-4 transition-all ${
                  isClaimed
                    ? 'bg-stone-50/80 border-stone-200 opacity-80'
                    : isCompleted
                    ? 'bg-gradient-to-r from-amber-100/90 to-yellow-50/90 border-amber-400 shadow-sm'
                    : 'bg-white border-amber-200 hover:border-amber-300 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Icon & Title & Description */}
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 shrink-0 mt-0.5">
                      {renderIcon(mission.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-festive font-black text-sm sm:text-base text-red-950">
                          {mission.title}
                        </span>
                        {mission.reward.tag && (
                          <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 border border-amber-400/40 px-1.5 py-0.2 rounded-md">
                            ★ {mission.reward.tag}
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded-full">
                          +{mission.reward.exp}经验 · +{mission.reward.coins}通宝
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                        {mission.description}
                      </p>

                      {/* Detail Chips (Radicals / Idioms preview) */}
                      {mission.details && mission.details.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                          <span className="text-[10px] text-stone-400 font-bold">任务要素：</span>
                          {mission.details.map((detail, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                sound.playCharClick();
                                speakChinese(detail);
                              }}
                              className="px-2 py-0.5 rounded-lg bg-amber-100/80 hover:bg-amber-200 text-red-900 border border-amber-300/80 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
                              title={`朗读【${detail}】`}
                            >
                              <span>{detail}</span>
                              <Volume2 className="w-2.5 h-2.5 text-amber-700 opacity-60" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Progress and Action Button */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-200">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-stone-500 font-medium">进度:</span>
                      <span className="font-extrabold text-red-900">
                        {mission.currentCount}
                      </span>
                      <span className="text-stone-400 font-normal">/ {mission.targetCount}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isClaimed ? (
                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>已领取</span>
                        </div>
                      ) : isCompleted ? (
                        <button
                          onClick={() => handleClaimReward(mission.id)}
                          className="flex items-center gap-1 px-4 py-1.5 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs shadow-md transition-all active:scale-95 cursor-pointer animate-pulse ring-2 ring-yellow-400"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                          <span>领奖励</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          {/* Quick test increment button for instant user feedback */}
                          <button
                            onClick={() => handleQuickProgress(mission.id)}
                            className="px-2 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold border border-amber-300 transition-colors cursor-pointer"
                            title="模拟推进此任务进度 (+1)"
                          >
                            +1步
                          </button>
                          <button
                            onClick={() => {
                              sound.playTap();
                              onNavigateToTab(mission.targetTab);
                              if (onClose) onClose();
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-800 hover:bg-red-700 text-yellow-100 font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer"
                          >
                            <span>去完成</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer controls & test reset */}
        <div className="mt-4 pt-3 border-t border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-600" />
            <span>
              <strong>备考建议：</strong>每日任务涵盖教育部《语文课程标准》核心偏旁与成语积累，日拱一卒无有弗届。
            </span>
          </div>
          <button
            onClick={handleResetMissions}
            className="flex items-center gap-1 text-[11px] text-stone-500 hover:text-red-800 underline cursor-pointer shrink-0"
            title="重置今日任务测试数据"
          >
            <RotateCcw className="w-3 h-3" />
            <span>重置任务进度</span>
          </button>
        </div>
      </div>
    </div>
  );
};
