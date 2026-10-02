import React from 'react';
import { DailyMissions } from './DailyMissions';
import { DailyMissionsState } from '../data/dailyMissionsData';
import { NavTab } from './HeaderDashboard';

interface DailyMissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  missionsState: DailyMissionsState;
  onUpdateState: (newState: DailyMissionsState) => void;
  onNavigateTab: (tab: NavTab) => void;
}

export const DailyMissionsModal: React.FC<DailyMissionsModalProps> = ({
  isOpen,
  onClose,
  missionsState,
  onUpdateState,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl">
        <DailyMissions
          missionsState={missionsState}
          onUpdateMissionsState={onUpdateState}
          onNavigateToTab={onNavigateTab}
          onClose={onClose}
          isModal={true}
        />
      </div>
    </div>
  );
};
