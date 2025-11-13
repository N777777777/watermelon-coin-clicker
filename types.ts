
export enum Tab {
  Profile = 'PROFILE',
  Watch = 'WATCH',
  Convert = 'CONVERT',
  Withdraw = 'WITHDRAW',
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
}

// Fix: Add Telegram WebApp types to the global Window interface to resolve TypeScript errors.
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        initDataUnsafe?: {
          user?: TelegramUser;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
        };
        showRewardedVideo?: ({ onAdViewed, onError }: {
            onAdViewed: () => void;
            onError: (error: 'ad_not_loaded' | 'internal_error' | string) => void;
        }) => void;
        openTelegramLink?: (url: string) => void;
      };
    };
  }
}
