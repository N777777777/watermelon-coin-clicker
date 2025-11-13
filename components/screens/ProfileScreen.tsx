import React from 'react';
import { TelegramUser } from '../../types';
import { ShareIcon } from '../icons/NavIcons';
import { playSound } from '../../utils/sounds';

interface ProfileScreenProps {
  user: TelegramUser | null;
  watermelonBalance: number;
  diggsBalance: number;
  adsWatched: number;
  showFeedback: (message: string, type: 'success' | 'error') => void;
}

const StatCard: React.FC<{ label: string; value: string | number; icon: string; className?: string }> = ({ label, value, icon, className = '' }) => (
  <div className={`bg-gradient-to-br from-white/80 to-white/50 dark:from-gray-800/80 dark:to-gray-800/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl ${className}`}>
    <div className="text-4xl mb-2">{icon}</div>
    <div className="text-2xl font-bold text-telegram-text">{value}</div>
    <div className="text-sm text-telegram-hint font-medium">{label}</div>
  </div>
);

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, watermelonBalance, diggsBalance, adsWatched, showFeedback }) => {
  if (!user) return null;

  const referralLink = `${window.location.origin}${window.location.pathname}?ref=${user.id}`;
  
  const handleShare = () => {
    playSound('click');
    const shareText = "🍉 انضم إلى Watermelon Coin Clicker! شاهد الإعلانات واكسب العملات وحولها إلى مكافآت حقيقية. استخدم الرابط الخاص بي للبدء!";
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;

    if (window.Telegram?.WebApp?.openTelegramLink) {
        window.Telegram.WebApp.openTelegramLink(shareUrl);
    } else {
        // Fallback for browsers
        navigator.clipboard.writeText(referralLink).then(() => {
            showFeedback('تم نسخ رابط الدعوة!', 'success');
        }).catch(() => {
            showFeedback('فشل نسخ الرابط.', 'error');
        });
        console.log("Sharing outside Telegram:", referralLink);
    }
  };


  return (
    <div className="flex flex-col items-center space-y-8 animate-fade-in text-right" dir="rtl">
      
      <div className="w-full max-w-md bg-white/70 dark:bg-gray-800/60 rounded-3xl p-6 shadow-xl text-center">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-watermelon-red to-watermelon-pink flex items-center justify-center text-white text-5xl font-bold mb-4 shadow-lg mx-auto -mt-16 border-4 border-telegram-bg">
          {user?.first_name.charAt(0)}
        </div>
        <h1 className="text-3xl font-bold text-telegram-text">
          {user?.first_name} {user?.last_name || ''}
        </h1>
        <p className="text-telegram-hint font-medium">@{user?.username || 'user'}</p>
      </div>
      
      <div className="w-full max-w-md grid grid-cols-2 gap-4">
        <StatCard label="عملات البطيخ" value={watermelonBalance} icon="🍉" />
        <StatCard label="إعلانات تمت مشاهدتها" value={adsWatched} icon="📺" />
        <StatCard label="رصيد Diggs" value={diggsBalance.toFixed(4)} icon="💰" />
        <StatCard label="الحالة" value="Pro" icon="✨" />
      </div>

      <div className="w-full max-w-md bg-white/70 dark:bg-gray-800/60 rounded-3xl p-6 shadow-xl text-center space-y-4">
          <h2 className="text-2xl font-bold text-telegram-text">ادعُ أصدقاءك!</h2>
          <p className="text-telegram-hint">شارك رابط الدعوة الخاص بك واكسبوا المكافآت معًا.</p>
          <div className="bg-black/5 dark:bg-black/20 p-3 rounded-lg text-left font-mono text-sm text-telegram-text overflow-x-auto select-all">
              {referralLink}
          </div>
          <button
              onClick={handleShare}
              className="w-full bg-gradient-to-br from-watermelon-light-green to-green-400 text-watermelon-dark font-bold py-3 px-4 rounded-lg shadow-md hover:scale-105 transition-transform duration-200 flex items-center justify-center gap-2"
          >
              <div className="w-5 h-5"><ShareIcon /></div>
              <span>مشاركة الرابط</span>
          </button>
      </div>

    </div>
  );
};

export default ProfileScreen;
