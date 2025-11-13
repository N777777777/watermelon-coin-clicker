import React, { useState, useEffect, useCallback } from 'react';
import { Tab, TelegramUser } from './types';
import BottomNav from './components/BottomNav';
import ProfileScreen from './components/screens/ProfileScreen';
import WatchAdScreen from './components/screens/WatchAdScreen';
import ConvertScreen from './components/screens/ConvertScreen';
import WithdrawScreen from './components/screens/WithdrawScreen';
import WalletScreen from './components/screens/WalletScreen';
import { playSound } from './utils/sounds';
import { TonConnectUIProvider, useTonAddress } from '@tonconnect/ui-react';

// Mock user for development outside Telegram
const mockUser: TelegramUser = {
  id: 123456789,
  first_name: 'معلم',
  last_name: 'بطيخ',
  username: 'watermelon_master',
  language_code: 'ar',
};


function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.Watch);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [watermelonBalance, setWatermelonBalance] = useState<number>(0);
  const [diggsBalance, setDiggsBalance] = useState<number>(0);
  const [adsWatched, setAdsWatched] = useState<number>(0);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  
  const connectedAddress = useTonAddress(); // Live address from TON Connect hook

  const handleUserInteraction = useCallback(() => {
    if (!isAudioInitialized) {
      const soundIds = ['click-sound', 'success-sound', 'error-sound', 'swoosh-sound'];
      soundIds.forEach(id => {
        const audio = document.getElementById(id) as HTMLAudioElement;
        if (audio) {
          audio.volume = 0; // Mute to play silently
          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              audio.pause();
              audio.currentTime = 0; // Rewind
              audio.volume = 1; // Unmute for future use
            }).catch(error => {
              console.warn(`Audio unlock failed for ${id}.`);
              audio.volume = 1;
            });
          }
        }
      });
      setIsAudioInitialized(true);
    }
  }, [isAudioInitialized]);

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
            currentUser = tgUser;
          } else {
            currentUser = mockUser;
          }
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

      if (window.adsgram) {
        window.adsgram.init({ blockId: 'YOUR_ADSGRAM_BLOCK_ID' });
        console.log("Adsgram SDK Initialized.");
      } else {
        console.warn("Adsgram SDK not found. Ads will fallback to Telegram's service.");
      }

      if (currentUser) {
        const storageKey = `watermelon_coin_data_${currentUser.id}`;
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
          try {
            const { watermelonBalance, diggsBalance, adsWatched, walletAddress } = JSON.parse(savedData);
            setWatermelonBalance(watermelonBalance || 0);
            setDiggsBalance(diggsBalance || 0);
            setAdsWatched(adsWatched || 0);
            setWalletAddress(walletAddress || '');
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
    const tgStartParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;
    let refId: string | null = tgStartParam && tgStartParam.startsWith('ref_') ? tgStartParam.substring(4) : new URLSearchParams(window.location.search).get('ref');
    
    if (refId && !sessionStorage.getItem('referralMessageShown')) {
      if (String(user.id) !== refId) {
        console.log(`User was referred by ID: ${refId}`);
        showFeedback(`Welcome! Thanks for joining via a friend's invite.`, 'success');
      }
      sessionStorage.setItem('referralMessageShown', 'true');
      if (window.location.search) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [isDataLoaded, user, showFeedback]);

  // Effect to save data to localStorage whenever it changes
  useEffect(() => {
    if (user && isDataLoaded) {
      const storageKey = `watermelon_coin_data_${user.id}`;
      const dataToSave = {
        watermelonBalance,
        diggsBalance,
        adsWatched,
        walletAddress,
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    }
  }, [watermelonBalance, diggsBalance, adsWatched, walletAddress, user, isDataLoaded]);

  // Effect to sync wallet address from TON Connect hook to our app's state
  useEffect(() => {
    if (connectedAddress) {
      setWalletAddress(connectedAddress);
    }
    // If user disconnects, the hook provides an empty string
    if (connectedAddress === '') {
        setWalletAddress('');
    }
  }, [connectedAddress]);

  const handleAdWatched = useCallback(() => {
    setWatermelonBalance(prev => prev + 1);
    setAdsWatched(prev => prev + 1);
    showFeedback('+1 Watermelon Coin! 🍉', 'success');
  }, [showFeedback]);

  const handleConversion = useCallback((amount: number) => {
    const conversionRate = 0.05;
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
        return <ProfileScreen user={user} watermelonBalance={watermelonBalance} diggsBalance={diggsBalance} adsWatched={adsWatched} showFeedback={showFeedback} walletAddress={walletAddress} />;
      case Tab.Watch:
        return <WatchAdScreen onAdWatched={handleAdWatched} showFeedback={showFeedback} />;
      case Tab.Convert:
        return <ConvertScreen watermelonBalance={watermelonBalance} onConvert={handleConversion} />;
      case Tab.Withdraw:
        return <WithdrawScreen diggsBalance={diggsBalance} onWithdraw={handleWithdrawal} walletAddress={walletAddress} />;
      case Tab.Wallet:
        return <WalletScreen />;
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
    <div 
      className="flex flex-col h-screen font-sans bg-gradient-to-b from-watermelon-green/20 to-telegram-bg text-telegram-text"
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
    >
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

function App() {
  // NOTE: You need to host the tonconnect-manifest.json file and replace this URL.
  // Using a raw Gist link for demonstration purposes.
  const manifestUrl = 'https://gist.githubusercontent.com/master-bat/01b3339e0c50b694119864223f6d726c/raw/tonconnect-manifest.json';
  
  return (
      <TonConnectUIProvider manifestUrl={manifestUrl}>
          <AppContent />
      </TonConnectUIProvider>
  );
}

export default App;
