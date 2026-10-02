/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BrushSkin {
  id: string;
  name: string;
  type: 'brush' | 'pen';
  costExp: number;
  strokeColor: string;
  strokeShadow?: string;
  glowColor?: string;
  effectName: string;
  desc: string;
  icon: string;
  previewGradient: string;
  badgeText: string;
  samplePhrase: string;
  unlockedByDefault?: boolean;
}

export const AVAILABLE_BRUSH_SKINS: BrushSkin[] = [
  {
    id: 'brush-ink',
    name: '松烟玄墨笔',
    type: 'brush',
    costExp: 0,
    strokeColor: '#1c1917',
    effectName: '古典墨韵',
    desc: '徽州传统古法松烟墨，入水不晕，落纸如漆，笔意醇厚苍劲。',
    icon: '🖌️',
    previewGradient: 'from-stone-900 to-stone-700',
    badgeText: '经典必备',
    samplePhrase: '松烟润玉 · 骨气洞达',
    unlockedByDefault: true,
  },
  {
    id: 'pen-steel',
    name: '精钢行楷笔',
    type: 'pen',
    costExp: 0,
    strokeColor: '#0f172a',
    effectName: '刚劲挺拔',
    desc: '钨钢金尖硬笔，出水细腻匀净，横平竖直，运笔爽利遒劲。',
    icon: '✒️',
    previewGradient: 'from-slate-800 to-blue-950',
    badgeText: '硬笔必备',
    samplePhrase: '铁画银钩 · 锋芒毕露',
    unlockedByDefault: true,
  },
  {
    id: 'brush-cinnabar',
    name: '御批朱砂笔',
    type: 'brush',
    costExp: 80,
    strokeColor: '#dc2626',
    strokeShadow: '#ef4444',
    glowColor: '#fca5a5',
    effectName: '朱砂破煞',
    desc: '辰溪上等晶体朱砂辰砂，御笔亲批，红光潋滟，笔力透纸。',
    icon: '🔴',
    previewGradient: 'from-red-600 via-rose-700 to-amber-700',
    badgeText: '皇家御批',
    samplePhrase: '朱砂点翰 · 破雾驱煞',
  },
  {
    id: 'brush-gold',
    name: '金漆沥粉墨',
    type: 'brush',
    costExp: 160,
    strokeColor: '#d97706',
    strokeShadow: '#fbbf24',
    glowColor: '#fde047',
    effectName: '御制泥金',
    desc: '纯金金箔研细伴松胶，重金流光，如盛唐殿阁御制泥金经卷。',
    icon: '✨',
    previewGradient: 'from-amber-400 via-yellow-500 to-amber-600',
    badgeText: '殿阁泥金',
    samplePhrase: '沥粉堆金 · 辉耀日月',
  },
  {
    id: 'brush-jade',
    name: '翠竹青峦墨',
    type: 'brush',
    costExp: 240,
    strokeColor: '#059669',
    strokeShadow: '#6ee7b7',
    glowColor: '#a7f3d0',
    effectName: '碧玉青峦',
    desc: '终南山老竹鲜青汁与孔雀石矿彩相溶，如碧玉生烟，清幽雅致。',
    icon: '🎋',
    previewGradient: 'from-emerald-500 via-teal-600 to-green-700',
    badgeText: '清雅文风',
    samplePhrase: '翠竹凝碧 · 风骨嶙峋',
  },
  {
    id: 'brush-purple',
    name: '紫毫星汉墨',
    type: 'brush',
    costExp: 350,
    strokeColor: '#7c3aed',
    strokeShadow: '#c4b5fd',
    glowColor: '#e9d5ff',
    effectName: '紫极星汉',
    desc: '宣州野兔秋毫与Bobu星际荧光矿石相融，泛起天阶夜光与紫霞。',
    icon: '🌌',
    previewGradient: 'from-purple-600 via-indigo-600 to-fuchsia-700',
    badgeText: '天阶夜光',
    samplePhrase: '紫微映雪 · 星汉迢迢',
  },
];

export function getBrushSkinById(id: string): BrushSkin {
  const found = AVAILABLE_BRUSH_SKINS.find((s) => s.id === id);
  if (found) return found;
  // 兼容别名
  if (id === 'brush') return AVAILABLE_BRUSH_SKINS[0];
  if (id === 'pen') return AVAILABLE_BRUSH_SKINS[1];
  if (id === 'cinnabar') return AVAILABLE_BRUSH_SKINS[2];
  if (id === 'gold') return AVAILABLE_BRUSH_SKINS[3];
  return AVAILABLE_BRUSH_SKINS[0];
}
