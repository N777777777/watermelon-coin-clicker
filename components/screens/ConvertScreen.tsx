import React, { useState, useMemo, useEffect } from 'react';
import { playSound } from '../../utils/sounds';

interface ConvertScreenProps {
  watermelonBalance: number;
  onConvert: (amount: number) => void;
}

const ConvertScreen: React.FC<ConvertScreenProps> = ({ watermelonBalance, onConvert }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const conversionRate = 0.05;

  const diggsToReceive = useMemo(() => {
    const numericAmount = parseFloat(amount);
    return isNaN(numericAmount) ? 0 : numericAmount * conversionRate;
  }, [amount, conversionRate]);

  useEffect(() => {
    if (amount === '') {
      setError(null);
      return;
    }

    if (amount.includes('.') || amount.includes(',')) {
      setError('الرجاء إدخال عدد صحيح.');
      return;
    }
    
    const numericAmount = parseInt(amount, 10);

    if (isNaN(numericAmount)) {
        setError('الرجاء إدخال رقم صالح.');
    } else if (numericAmount <= 0) {
      setError('يجب أن تكون الكمية أكبر من صفر.');
    } else if (numericAmount > watermelonBalance) {
      setError('ليس لديك رصيد بطيخ كافٍ.');
    } else {
      setError(null);
    }
  }, [amount, watermelonBalance]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only integers
    if (/^\d*$/.test(value)) {
        setAmount(value);
    }
  };
  
  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseInt(amount, 10);
    if (!error && !isNaN(numericAmount) && numericAmount > 0) {
      onConvert(numericAmount);
      setAmount('');
    } else if(error) {
      playSound('error');
    }
  };
  
  const setMaxAmount = () => {
    playSound('click');
    setAmount(String(Math.floor(watermelonBalance)));
  };

  return (
    <div className="flex flex-col items-center h-full animate-fade-in text-right pt-8" dir="rtl">
      <h1 className="text-3xl font-bold text-telegram-text mb-2">تحويل العملات</h1>
      <p className="text-telegram-hint mb-6">حول عملات البطيخ إلى Diggs.</p>
      
      <div className="w-full max-w-md bg-white/70 dark:bg-gray-800/60 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="bg-watermelon-green/20 text-center p-4 rounded-xl">
          <p className="text-sm text-telegram-hint">رصيدك الحالي</p>
          <p className="text-3xl font-bold text-telegram-text">{Math.floor(watermelonBalance)} 🍉</p>
        </div>

        <form onSubmit={handleConvert}>
          <div className="mb-4">
            <label htmlFor="amount" className="block text-sm font-medium text-telegram-hint mb-1">
              الكمية للتحويل
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full p-4 text-lg bg-white/80 dark:bg-gray-700/80 border-2 border-transparent focus:border-watermelon-red focus:ring-0 rounded-lg transition-colors"
                required
              />
              <button type="button" onClick={setMaxAmount} className="absolute left-2 top-1/2 -translate-y-1/2 text-sm bg-watermelon-light-green/80 text-watermelon-dark font-bold py-1.5 px-3 rounded-md transition hover:bg-watermelon-light-green">
                الحد الأقصى
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-1 text-right">{error}</p>}
          </div>
          
          <div className="text-center my-6 text-telegram-text bg-black/5 dark:bg-black/20 p-3 rounded-lg">
            ستحصل على <span className="font-bold text-watermelon-red text-lg">{diggsToReceive.toFixed(4)} Diggs</span>
          </div>

          <button
            type="submit"
            disabled={!!error || !amount}
            className="w-full bg-gradient-to-br from-watermelon-red to-red-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:scale-105 transition-transform duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
          >
            تحويل الآن
          </button>
        </form>
      </div>
       <p className="text-xs text-telegram-hint mt-4">سعر التحويل: 1 🍉 = {conversionRate} Diggs</p>
    </div>
  );
};

export default ConvertScreen;