
import React, { useState } from 'react';
import { playSound } from '../../utils/sounds';

interface WatchAdScreenProps {
  onAdWatched: () => void;
  showFeedback: (message: string, type: 'success' | 'error') => void;
}

const WatchAdScreen: React.FC<WatchAdScreenProps> = ({ onAdWatched, showFeedback }) => {
  const [isAdLoading, setIsAdLoading] = useState(false);

  const handleWatchAd = () => {
    playSound('click');
    setIsAdLoading(true);

    try {
      if (window.Telegram?.WebApp?.showRewardedVideo) {
        window.Telegram.WebApp.showRewardedVideo({
          onAdViewed: () => {
            onAdWatched(); // This already shows a success message via App.tsx
            setIsAdLoading(false);
          },
          onError: (err) => {
            console.error("Telegram Ad Error:", err);
            showFeedback('Failed to load ad. Please try again later.', 'error');
            setIsAdLoading(false);
          },
        });
      } else {
        // Fallback for development/testing outside Telegram
        console.log("Telegram Ad API not found. Simulating ad for 2 seconds.");
        setTimeout(() => {
          onAdWatched();
          setIsAdLoading(false);
        }, 2000);
      }
    } catch (error) {
        console.error("Error trying to show ad:", error);
        showFeedback('An unexpected error occurred while showing the ad.', 'error');
        setIsAdLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in" dir="rtl">
        <div className="flex flex-col items-center">
            <div className="text-9xl mb-6 animate-pulse-grow">🍉</div>
            <h1 className="text-4xl font-extrabold text-telegram-text mb-2">اربح عملات البطيخ!</h1>
            <p className="text-lg text-telegram-hint mb-10 max-w-sm">
                شاهد إعلانًا قصيرًا واحصل على 1 عملة بطيخ لكل مشاهدة.
            </p>
            <button
                onClick={handleWatchAd}
                disabled={isAdLoading}
                className="w-full max-w-xs bg-gradient-to-br from-watermelon-red to-red-500 text-white font-bold py-4 px-8 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-200 ease-in-out text-xl ring-4 ring-watermelon-red/30 flex items-center justify-center disabled:bg-gray-400 disabled:scale-100 disabled:cursor-not-allowed"
            >
                {isAdLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        جاري تحميل الإعلان...
                    </>
                ) : (
                    'شاهد الإعلان الآن'
                )}
            </button>
        </div>
    </div>
  );
};

export default WatchAdScreen;
