/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { PinyinMode } from '../components/HeaderDashboard';
import { sound } from '../utils/audio';
import { safeGetItem, safeSetItem } from '../utils/storage';

export interface SettingsStoreState {
  pinyinMode: PinyinMode;
  setPinyinMode: (mode: PinyinMode) => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  toggleMute: () => boolean;
  isParentConsoleOpen: boolean;
  setIsParentConsoleOpen: (open: boolean) => void;
  openParentConsole: () => void;
  closeParentConsole: () => void;
  isImmersiveReading: boolean;
  setIsImmersiveReading: (immersive: boolean) => void;
}

const SettingsContext = createContext<SettingsStoreState | null>(null);

export interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [pinyinMode, setPinyinModeState] = useState<PinyinMode>(() =>
    safeGetItem<PinyinMode>('app_pinyin_mode', 'full')
  );

  const [speechRate, setSpeechRateState] = useState<number>(() =>
    safeGetItem<number>('app_speech_rate', 0.9)
  );

  const [isMuted, setIsMutedState] = useState<boolean>(() =>
    safeGetItem<boolean>('app_is_muted', false)
  );

  const [isParentConsoleOpen, setIsParentConsoleOpen] = useState<boolean>(false);
  const [isImmersiveReading, setIsImmersiveReadingState] = useState<boolean>(false);

  const setIsImmersiveReading = useCallback((immersive: boolean) => {
    setIsImmersiveReadingState(immersive);
  }, []);

  const setPinyinMode = useCallback((mode: PinyinMode) => {
    setPinyinModeState(mode);
    safeSetItem('app_pinyin_mode', mode);
  }, []);

  const setSpeechRate = useCallback((rate: number) => {
    setSpeechRateState(rate);
    safeSetItem('app_speech_rate', rate);
  }, []);

  const setIsMuted = useCallback((muted: boolean) => {
    setIsMutedState(muted);
    sound.setMuted(muted);
    safeSetItem('app_is_muted', muted);
  }, []);

  const toggleMute = useCallback(() => {
    const muted = sound.toggleMute();
    setIsMutedState(muted);
    safeSetItem('app_is_muted', muted);
    return muted;
  }, []);

  const openParentConsole = useCallback(() => {
    setIsParentConsoleOpen(true);
  }, []);

  const closeParentConsole = useCallback(() => {
    setIsParentConsoleOpen(false);
  }, []);

  const value = useMemo<SettingsStoreState>(
    () => ({
      pinyinMode,
      setPinyinMode,
      speechRate,
      setSpeechRate,
      isMuted,
      setIsMuted,
      toggleMute,
      isParentConsoleOpen,
      setIsParentConsoleOpen,
      openParentConsole,
      closeParentConsole,
      isImmersiveReading,
      setIsImmersiveReading,
    }),
    [
      pinyinMode,
      setPinyinMode,
      speechRate,
      setSpeechRate,
      isMuted,
      setIsMuted,
      toggleMute,
      isParentConsoleOpen,
      openParentConsole,
      closeParentConsole,
      isImmersiveReading,
      setIsImmersiveReading,
    ]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

/**
 * 访问全局设置与家长控制状态 Hook
 */
export function useSettingsStore(): SettingsStoreState {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsStore 必须在 <SettingsProvider> 内使用');
  }
  return context;
}
