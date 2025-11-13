import React, { useState, useEffect } from 'react';
import { playSound } from '../../utils/sounds';

interface WithdrawScreenProps {
  diggsBalance: number;
  onWithdraw: (amount: number, address: string) => void;
  walletAddress?: string;
}

const WithdrawScreen: React.FC<WithdrawScreenProps> = ({ diggsBalance, onWithdraw, walletAddress }) => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      if (walletAddress) {
          setAddress(walletAddress);
      }
  }, [walletAddress]);

  useEffect(() => {
    if (amount === '') {
        setError(null);
        return;
    }
    
    const numericAmount = parseFloat(amount);

    if (isNaN(numericAmount)) {
        setError('الرجاء إدخال رقم صالح.');
    } else if (numericAmount <= 0) {
        setError('يجب أن تكون الكمية أكبر من صفر.');
    } else if (numericAmount > diggsBalance) {
        setError('ليس لديك رصيد Diggs كافٍ.');
    } else {
        setError(null);
    }
  }, [amount, diggsBalance]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
        setAmount(value);
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!error && !isNaN(numericAmount) && numericAmount > 0 && address.trim() !== '') {
      onWithdraw(numericAmount, address);
      setAmount('');
      setAddress(walletAddress || '');
    } else {
      playSound('error');
    }
  };

  const setMaxAmount = () => {
    playSound('click');
    setAmount(String(diggsBalance.toFixed(4)));
  };


  return (
    <div className="flex flex-col items-center h-full animate-fade-in text-right pt-8" dir="rtl">
      <h1 className="text-3xl font-bold text-telegram-text mb-2">سحب الأرباح</h1>
      <p className="text-telegram-hint mb-6">اسحب رصيد Diggs إلى محفظتك.</p>
      
      <div className="w-full max-w-md bg-white/70 dark:bg-gray-800/60 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="bg-watermelon-light-green/30 text-center p-4 rounded-xl">
          <p className="text-sm text-telegram-hint">رصيدك المتاح للسحب</p>
          <p className="text-3xl font-bold text-telegram-text">{diggsBalance.toFixed(4)} Diggs</p>
        </div>

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-telegram-hint mb-1">
              عنوان المحفظة
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x... or connect wallet"
              className="w-full p-4 text-lg bg-white/80 dark:bg-gray-700/80 border-2 border-transparent focus:border-watermelon-red focus:ring-0 rounded-lg transition-colors"
              required
              readOnly={!!walletAddress}
            />
             {walletAddress && <p className="text-xs text-telegram-hint mt-1">تمت تعبئة العنوان من المحفظة المتصلة.</p>}
          </div>

          <div>
            <label htmlFor="withdraw-amount" className="block text-sm font-medium text-telegram-hint mb-1">
              الكمية (Diggs)
            </label>
            <div className="relative">
                <input
                    type="text"
                    inputMode="decimal"
                    id="withdraw-amount"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="w-full p-4 text-lg bg-white/80 dark:bg-gray-700/80 border-2 border-transparent focus:border-watermelon-red focus:ring-0 rounded-lg transition-colors"
                    required
                />
                <button type="button" onClick={setMaxAmount} className="absolute left-2 top-1/2 -translate-y-1/2 text-sm bg-watermelon-light-green/80 text-watermelon-dark font-bold py-1.5 px-3 rounded-md transition hover:bg-watermelon-light-green">
                  الحد الأقصى
                </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-1 text-right">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={!!error || !amount || !address.trim()}
            className="w-full bg-gradient-to-br from-watermelon-red to-red-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:scale-105 transition-transform duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
          >
            تأكيد السحب
          </button>
        </form>
      </div>
    </div>
  );
};

export default WithdrawScreen;
