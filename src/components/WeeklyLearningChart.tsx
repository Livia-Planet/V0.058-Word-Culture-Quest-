import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  AreaChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Award,
  Calendar,
  Sparkles,
  Zap,
  BarChart3,
  LineChart as LineIcon,
  Layers,
  ChevronDown,
  ChevronUp,
  Volume2,
  CheckCircle2,
} from 'lucide-react';
import { DailyLearningRecord, WeeklyLearningStats, computeWeeklyStats } from '../data/weeklyLearningData';
import { sound, speakChinese } from '../utils/audio';

interface WeeklyLearningChartProps {
  records: DailyLearningRecord[];
  onAddWordSample?: () => void;
  onSelectCharacter?: (char: string) => void;
  className?: string;
  isCollapsible?: boolean;
}

type ChartMode = 'composed' | 'daily' | 'cumulative';

// Custom Tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data: DailyLearningRecord = payload[0].payload;
    return (
      <div className="bg-stone-900/95 text-stone-100 p-3.5 rounded-2xl shadow-2xl border-2 border-amber-400/80 backdrop-blur-md text-xs max-w-xs transition-all">
        <div className="flex items-center justify-between border-b border-amber-500/40 pb-2 mb-2">
          <div className="flex items-center gap-1.5 font-bold text-yellow-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{data.fullDate} ({data.dayName})</span>
          </div>
          <span className="text-[10px] bg-red-800 text-yellow-200 px-1.5 py-0.5 rounded font-bold">
            用时 {data.studyMinutes} 分钟
          </span>
        </div>

        <div className="space-y-1.5 my-2">
          <div className="flex justify-between items-center text-stone-300">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
              当日新增汉字：
            </span>
            <span className="text-yellow-300 font-extrabold text-sm">{data.newWordsCount} 字</span>
          </div>
          <div className="flex justify-between items-center text-stone-300">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              阶段累计总识字量：
            </span>
            <span className="text-emerald-300 font-bold">{data.cumulativeCount} 字</span>
          </div>
          <div className="flex justify-between items-center text-stone-300">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
              挑战正确率：
            </span>
            <span className="text-blue-300 font-medium">{data.accuracy}%</span>
          </div>
        </div>

        {data.charactersLearned && data.charactersLearned.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-stone-800">
            <span className="text-[10px] text-stone-400 block mb-1">当日研习核心生字：</span>
            <div className="flex flex-wrap gap-1">
              {data.charactersLearned.map((c, i) => (
                <span
                  key={i}
                  className="bg-amber-500/20 text-yellow-200 border border-amber-400/40 px-1.5 py-0.5 rounded font-calligraphy font-bold text-xs"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
  return null;
};

export const WeeklyLearningChart: React.FC<WeeklyLearningChartProps> = ({
  records,
  onAddWordSample,
  onSelectCharacter,
  className = '',
  isCollapsible = false,
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>('composed');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const stats: WeeklyLearningStats = computeWeeklyStats(records);

  const todayRecord = records[records.length - 1];

  return (
    <div
      className={`bg-gradient-to-br from-amber-50/95 via-orange-50/90 to-amber-100/90 border-2 border-amber-300/80 rounded-3xl p-4 sm:p-6 shadow-md relative overflow-hidden transition-all ${className}`}
    >
      {/* Decorative Traditional Paper Watermark */}
      <div className="absolute top-2 right-4 text-7xl font-calligraphy text-amber-900/5 select-none pointer-events-none font-bold">
        学无止境
      </div>

      {/* Header with Title and Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center shadow-md shrink-0 border border-yellow-300">
            <TrendingUp className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-festive font-black text-lg sm:text-xl text-red-950">
                最近一周词汇学习量 · 成长轨迹看板
              </h3>
              <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                Recharts 可视化
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              直观呈现近7日新增汉字与累计掌握轨迹，量化每天的进步与巩固成果
            </p>
          </div>
        </div>

        {/* Right side controls: Mode switcher and Collapse */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Mode Switcher */}
          <div className="flex items-center bg-amber-200/70 p-1 rounded-xl border border-amber-400/40 text-xs">
            <button
              onClick={() => {
                sound.playTap();
                setChartMode('composed');
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                chartMode === 'composed'
                  ? 'bg-red-800 text-yellow-200 shadow-sm'
                  : 'text-amber-900 hover:text-red-900'
              }`}
              title="双轴综合：每日新增柱状 + 累计增长曲线"
            >
              <Layers className="w-3 h-3" />
              <span className="hidden xs:inline">双轴综合</span>
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setChartMode('daily');
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                chartMode === 'daily'
                  ? 'bg-red-800 text-yellow-200 shadow-sm'
                  : 'text-amber-900 hover:text-red-900'
              }`}
              title="每日新增柱状图"
            >
              <BarChart3 className="w-3 h-3" />
              <span className="hidden xs:inline">每日新增</span>
            </button>
            <button
              onClick={() => {
                sound.playTap();
                setChartMode('cumulative');
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                chartMode === 'cumulative'
                  ? 'bg-red-800 text-yellow-200 shadow-sm'
                  : 'text-amber-900 hover:text-red-900'
              }`}
              title="累计词汇增长面积图"
            >
              <LineIcon className="w-3 h-3" />
              <span className="hidden xs:inline">累计曲线</span>
            </button>
          </div>

          {isCollapsible && (
            <button
              onClick={() => {
                sound.playTap();
                setIsExpanded(!isExpanded);
              }}
              className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors cursor-pointer"
              title={isExpanded ? '收起看板' : '展开看板'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {isExpanded && (
        <>
          {/* Key Stat Badges Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
            {/* 1. Total this week */}
            <div className="bg-white/80 border border-amber-200 rounded-2xl p-2.5 sm:p-3 shadow-xs">
              <span className="text-[11px] text-stone-500 font-medium block">近7天新增词汇</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-red-900">{stats.totalThisWeek}</span>
                <span className="text-xs text-stone-600 font-bold">字</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded font-extrabold ml-1">
                  +{stats.growthPercentage}%
                </span>
              </div>
            </div>

            {/* 2. Daily Average */}
            <div className="bg-white/80 border border-amber-200 rounded-2xl p-2.5 sm:p-3 shadow-xs">
              <span className="text-[11px] text-stone-500 font-medium block">日均研习量</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-amber-800">{stats.dailyAverage}</span>
                <span className="text-xs text-stone-600 font-bold">字/天</span>
                <span className="text-[10px] text-amber-800 bg-amber-100 px-1 py-0.5 rounded font-bold ml-1">
                  目标 5字
                </span>
              </div>
            </div>

            {/* 3. Peak Day */}
            <div className="bg-white/80 border border-amber-200 rounded-2xl p-2.5 sm:p-3 shadow-xs">
              <span className="text-[11px] text-stone-500 font-medium block">单日突破峰值</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-red-800">{stats.peakDay.count}</span>
                <span className="text-xs text-stone-600 font-bold">字</span>
                <span className="text-[10px] text-red-900 bg-red-100 px-1.5 py-0.5 rounded font-bold ml-1">
                  {stats.peakDay.dayName}
                </span>
              </div>
            </div>

            {/* 4. Target Achieved Days */}
            <div className="bg-white/80 border border-amber-200 rounded-2xl p-2.5 sm:p-3 shadow-xs">
              <span className="text-[11px] text-stone-500 font-medium block">达标研习天数</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-xl sm:text-2xl font-black text-emerald-700">{stats.targetAchievedDays}</span>
                <span className="text-xs text-stone-600 font-bold">/ 7 天</span>
                <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded font-bold ml-1">
                  {Math.round((stats.targetAchievedDays / 7) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Recharts Visualization Chart Box */}
          <div className="bg-white/90 border border-amber-200/90 rounded-2xl p-3 sm:p-4 shadow-inner mb-4">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === 'composed' ? (
                  <ComposedChart data={records} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="todayBarGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.8} />
                      </linearGradient>
                      <linearGradient id="areaCurveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                    <XAxis
                      dataKey="dayName"
                      stroke="#78716c"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#e7e5e4' }}
                    />
                    {/* Left Y Axis for Daily New Words */}
                    <YAxis
                      yAxisId="left"
                      stroke="#d97706"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 'dataMax + 2']}
                      allowDecimals={false}
                    />
                    {/* Right Y Axis for Cumulative Words */}
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke="#059669"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={['dataMin - 5', 'dataMax + 5']}
                      allowDecimals={false}
                    />

                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                      formatter={(value) => {
                        if (value === 'newWordsCount') return '每日新增字量（左轴）';
                        if (value === 'cumulativeCount') return '阶段累计识字量（右轴）';
                        return value;
                      }}
                    />

                    {/* Daily Target Benchmark Line */}
                    <ReferenceLine
                      yAxisId="left"
                      y={5}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: '目标: 5字/天',
                        position: 'insideTopRight',
                        fill: '#dc2626',
                        fontSize: 10,
                        fontWeight: 'bold',
                      }}
                    />

                    {/* Area under line */}
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="cumulativeCount"
                      fill="url(#areaCurveGradient)"
                      stroke="none"
                    />

                    {/* Daily New Words Bars */}
                    <Bar
                      yAxisId="left"
                      dataKey="newWordsCount"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={38}
                    >
                      {records.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={index === records.length - 1 ? 'url(#todayBarGradient)' : 'url(#barGradient)'}
                        />
                      ))}
                    </Bar>

                    {/* Cumulative Growth Line */}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="cumulativeCount"
                      stroke="#059669"
                      strokeWidth={3}
                      dot={{ fill: '#059669', stroke: '#ffffff', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#047857' }}
                    />
                  </ComposedChart>
                ) : chartMode === 'daily' ? (
                  <BarChart data={records} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barOnlyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#d97706" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="todayBarOnlyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                    <XAxis
                      dataKey="dayName"
                      stroke="#78716c"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#e7e5e4' }}
                    />
                    <YAxis
                      stroke="#d97706"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 'dataMax + 2']}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine
                      y={5}
                      stroke="#ef4444"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      label={{
                        value: '每日目标: 5字',
                        position: 'insideTopRight',
                        fill: '#dc2626',
                        fontSize: 10,
                        fontWeight: 'bold',
                      }}
                    />
                    <Bar
                      dataKey="newWordsCount"
                      name="每日新增字量"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={42}
                    >
                      {records.map((entry, index) => (
                        <Cell
                          key={`cell-bar-${index}`}
                          fill={index === records.length - 1 ? 'url(#todayBarOnlyGradient)' : 'url(#barOnlyGradient)'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <AreaChart data={records} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pureAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#059669" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
                    <XAxis
                      dataKey="dayName"
                      stroke="#78716c"
                      fontSize={11}
                      tickLine={false}
                      axisLine={{ stroke: '#e7e5e4' }}
                    />
                    <YAxis
                      stroke="#059669"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      domain={['dataMin - 5', 'dataMax + 5']}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="cumulativeCount"
                      name="阶段累计总识字量"
                      stroke="#059669"
                      strokeWidth={3}
                      fill="url(#pureAreaGradient)"
                      dot={{ fill: '#059669', stroke: '#ffffff', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#047857' }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Today's Words Chips & Interactive Quick Action Ribbon */}
          <div className="bg-amber-100/60 border border-amber-200/80 rounded-2xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            {/* Left: Today's Characters */}
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <div className="flex items-center gap-1 font-bold text-red-950 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>今日研习字词：</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {todayRecord.charactersLearned.map((char, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sound.playCharClick();
                      speakChinese(char);
                      if (onSelectCharacter) onSelectCharacter(char);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-xl bg-white hover:bg-amber-50 border border-amber-300 text-red-900 font-calligraphy font-extrabold text-sm shadow-xs transition-transform active:scale-95 cursor-pointer"
                    title={`点击伴读生字【${char}】`}
                  >
                    <span>{char}</span>
                    <Volume2 className="w-3 h-3 text-amber-500 opacity-60" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Quick live increment simulation button for user test */}
            {onAddWordSample && (
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                <button
                  onClick={() => {
                    sound.playFillSuccess();
                    onAddWordSample();
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                  title="点击模拟今日再学新字，查看图表实时上升动态"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-300" />
                  <span>模拟今日新增生字 (+1)</span>
                </button>
              </div>
            )}
          </div>

          {/* Pedagogical Reinforcement Advice */}
          <div className="mt-3 flex items-center gap-2 text-[11px] text-stone-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              <strong>进阶备考建议：</strong>5-6年级重点在字词语境迁移。保持每日 5 字稳固节奏，结合小作文应用，生字巩固率显著提升！
            </span>
          </div>
        </>
      )}
    </div>
  );
};
