import React from 'react';
import { Tab } from '../types';
import { ProfileIcon, WatchAdIcon, ConvertIcon, WithdrawIcon, WalletIcon } from './icons/NavIcons';
import { playSound } from '../utils/sounds';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const NavItem: React.FC<{
  tab: Tab;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ tab, label, icon, isActive, onClick }) => {
  const activeClasses = 'text-watermelon-red';
  const inactiveClasses = 'text-telegram-hint';

  return (
    <button
      onClick={() => {
        playSound('click');
        onClick();
      }}
      className="flex flex-col items-center justify-center w-1/5 h-full transition-all duration-300 ease-in-out relative"
      aria-label={label}
    >
      <div className={`w-7 h-7 mb-1 transition-all duration-300 ${isActive ? activeClasses : inactiveClasses} ${isActive ? 'scale-110' : ''}`}>{icon}</div>
      <span className={`text-xs font-semibold transition-colors duration-300 ${isActive ? activeClasses : inactiveClasses}`}>{label}</span>
      {isActive && <div className="absolute bottom-2 w-5 h-1 bg-watermelon-red rounded-full"></div>}
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-telegram-bg/80 dark:bg-black/50 backdrop-blur-lg border-t border-black/10 dark:border-white/10 flex justify-around items-center">
      <NavItem
        tab={Tab.Profile}
        label="الملف الشخصي"
        icon={<ProfileIcon />}
        isActive={activeTab === Tab.Profile}
        onClick={() => setActiveTab(Tab.Profile)}
      />
      <NavItem
        tab={Tab.Watch}
        label="مشاهدة إعلان"
        icon={<WatchAdIcon />}
        isActive={activeTab === Tab.Watch}
        onClick={() => setActiveTab(Tab.Watch)}
      />
       <NavItem
        tab={Tab.Wallet}
        label="المحفظة"
        icon={<WalletIcon />}
        isActive={activeTab === Tab.Wallet}
        onClick={() => setActiveTab(Tab.Wallet)}
      />
      <NavItem
        tab={Tab.Convert}
        label="تحويل"
        icon={<ConvertIcon />}
        isActive={activeTab === Tab.Convert}
        onClick={() => setActiveTab(Tab.Convert)}
      />
      <NavItem
        tab={Tab.Withdraw}
        label="سحب"
        icon={<WithdrawIcon />}
        isActive={activeTab === Tab.Withdraw}
        onClick={() => setActiveTab(Tab.Withdraw)}
      />
    </nav>
  );
};

export default BottomNav;
