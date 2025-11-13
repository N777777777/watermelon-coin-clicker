import React, { useState, useEffect, useCallback } from 'react';
import { Tab, TelegramUser } from './types';
import BottomNav from './components/BottomNav';
import ProfileScreen from './components/screens/ProfileScreen';
import WatchAdScreen from './components/screens/WatchAdScreen';
import ConvertScreen from './components/screens/ConvertScreen';
import WithdrawScreen from './components/screens/WithdrawScreen';
import { playSound } from './utils/sounds';

// Mock user for development outside Telegram
const mockUser: TelegramUser = {
  id: 123456789,
  first_name: 'معلم',
  last_name: 'بطيخ',
  username: 'watermelon_master',
  language_code: 'ar',
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Watch);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [watermelonBalance, setWatermelonBalance] = useState<number>(0);
  const [diggsBalance, setDiggsBalance] = useState<number>(0);
  const [adsWatched, setAdsWatched] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const showFeedback = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    playSound(type);
    setTimeout(() => setFeedback(null), 2500);
  }, []);

  // Effect to identify user and load their data from localStorage
  useEffect(() => {
    const initializeUserAndData = () => {
      let currentUser: TelegramUser | null = null;
      try {
        if (window.Telegram && window.Telegram.WebApp) {
          window.Telegram.WebApp.ready();
          const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
          if (tgUser) {
            currentUser = {
              id: tgUser.id,
              first_name: tgUser.first_name,
              last_name: tgUser.last_name,
              username: tgUser.username,
              language_code: tgUser.language_code,
            };
          } else {
            currentUser = mockUser;
          }
          // Set theme colors based on Telegram
          document.body.style.backgroundColor = window.Telegram.WebApp.themeParams.bg_color || '#ffffff';
          document.body.style.color = window.Telegram.WebApp.themeParams.text_color || '#000000';
        } else {
          currentUser = mockUser;
        }
      } catch (error) {
        console.error("Telegram WebApp script not loaded or failed:", error);
        currentUser = mockUser;
      }
      
      setUser(currentUser);

      // Initialize Adsgram SDK after other initializations
      if (window.adsgram) {
        // IMPORTANT: Replace 'YOUR_ADSGRAM_BLOCK_ID' with your actual Adsgram Block ID.
        window.adsgram.init({ blockId: 'YOUR_ADSGRAM_BLOCK_ID' });
        console.log("Adsgram SDK Initialized.");
      } else {
        console.warn("Adsgram SDK not found. Ads will fallback to Telegram's service.");
      }

      // Now load data based on the identified user
      if (currentUser) {
        const storageKey = `watermelon_coin_data_${currentUser.id}`;
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          try {
            const { watermelonBalance, diggsBalance, adsWatched } = JSON.parse(savedData);
            setWatermelonBalance(watermelonBalance || 0);
            setDiggsBalance(diggsBalance || 0);
            setAdsWatched(adsWatched || 0);
          } catch(e) {
            console.error("Failed to parse user data from localStorage", e);
            localStorage.removeItem(storageKey);
          }
        }
      }
      setIsDataLoaded(true);
    };

    initializeUserAndData();
  }, []);
  
  // Effect to check for referral link after data is loaded
  useEffect(() => {
    if (!isDataLoaded || !user) return;

    // Check for Telegram start_param first for referral
    const tgStartParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
    let refId: string | null = null;

    if (tgStartParam && tgStartParam.startsWith('ref_')) {
      refId = tgStartParam.substring(4);
    } else {
      // Fallback to URL param for development/testing
      const urlParams = new URLSearchParams(window.location.search);
      refId = urlParams.get('ref');
    }
    
    if (refId) {
      const referralMessageShown = sessionStorage.getItem('referralMessageShown');
      
      if (!referralMessageShown) {
        // Don't show welcome message for self-referral
        if (String(user.id) !== refId) {
          console.log(`User was referred by ID: ${refId}`);
          showFeedback(`Welcome! Thanks for joining via a friend's invite.`, 'success');
        }
        sessionStorage.setItem('referralMessageShown', 'true');
      }

      // Clean the URL search params to avoid re-triggering on refresh, only if they exist.
      if (window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [isDataLoaded, user, showFeedback]);

  // Effect to save data to localStorage whenever it changes
  useEffect(() => {
    if (user && isDataLoaded) { // Only save after initial load
      const storageKey = `watermelon_coin_data_${user.id}`;
      const dataToSave = {
        watermelonBalance,
        diggsBalance,
        adsWatched,
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }
  }, [watermelonBalance, diggsBalance, adsWatched, user, isDataLoaded]);

  
  const handleAdWatched = useCallback(() => {
    setWatermelonBalance(prev => prev + 1);
    setAdsWatched(prev => prev + 1);
    showFeedback('+1 Watermelon Coin! 🍉', 'success');
  }, [showFeedback]);

  const handleConversion = useCallback((amount: number) => {
    const conversionRate = 0.05; // 1 Watermelon = 0.05 Diggs
    if (watermelonBalance >= amount) {
        setWatermelonBalance(prev => prev - amount);
        setDiggsBalance(prev => prev + (amount * conversionRate));
        playSound('swoosh');
        showFeedback(`Converted ${amount} 🍉 to ${(amount * conversionRate).toFixed(4)} Diggs`);
    } else {
        showFeedback('Insufficient Watermelon Coins!', 'error');
    }
  }, [watermelonBalance, showFeedback]);

  const handleWithdrawal = useCallback((amount: number, address: string) => {
      if (diggsBalance >= amount) {
          setDiggsBalance(prev => prev - amount);
          playSound('swoosh');
          showFeedback(`Withdrew ${amount} Diggs to ${address}`);
      } else {
          showFeedback('Insufficient Diggs Balance!', 'error');
      }
  }, [diggsBalance, showFeedback]);


  const renderScreen = () => {
    switch (activeTab) {
      case Tab.Profile:
        return <ProfileScreen user={user} watermelonBalance={watermelonBalance} diggsBalance={diggsBalance} adsWatched={adsWatched} showFeedback={showFeedback} />;
      case Tab.Watch:
        return <WatchAdScreen onAdWatched={handleAdWatched} showFeedback={showFeedback} />;
      case Tab.Convert:
        return <ConvertScreen watermelonBalance={watermelonBalance} onConvert={handleConversion} />;
      case Tab.Withdraw:
        return <WithdrawScreen diggsBalance={diggsBalance} onWithdraw={handleWithdrawal} />;
      default:
        return <WatchAdScreen onAdWatched={handleAdWatched} showFeedback={showFeedback} />;
    }
  };
  
  if (!isDataLoaded || !user) {
    return (
        <div className="flex items-center justify-center h-screen bg-telegram-bg text-telegram-text">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-watermelon-red"></div>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-screen font-sans bg-gradient-to-b from-watermelon-green/20 to-telegram-bg text-telegram-text">
      {feedback && (
          <div className={`absolute top-5 left-1/2 -translate-x-1/2 ${feedback.type === 'success' ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-red-600 to-red-500'} text-white py-2 px-5 rounded-full shadow-lg z-50 animate-slide-down-fade-in`}>
              {feedback.message}
          </div>
      )}
      <main className="flex-grow overflow-y-auto p-4 pb-24">
        {renderScreen()}
      </main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;