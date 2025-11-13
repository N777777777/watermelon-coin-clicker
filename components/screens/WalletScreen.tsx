import React from 'react';
import { TonConnectButton, useTonAddress, useTonWallet } from '@tonconnect/ui-react';
import { truncateAddress } from '../../utils/stringUtils';

const WalletScreen: React.FC = () => {
    const userFriendlyAddress = useTonAddress();
    const wallet = useTonWallet();
    const isConnected = !!wallet;

    return (
        <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in" dir="rtl">
            <div className="w-full max-w-md bg-white/70 dark:bg-gray-800/60 p-8 rounded-2xl shadow-xl space-y-6">
                <div className="text-6xl mb-4">
                    {isConnected ? '✅' : '🔗'}
                </div>
                <h1 className="text-3xl font-bold text-telegram-text mb-2">
                    {isConnected ? 'المحفظة متصلة' : 'ربط محفظة TON'}
                </h1>
                
                {isConnected ? (
                    <div className="space-y-4">
                        <p className="text-telegram-hint">
                            محفظتك متصلة بنجاح! يمكنك الآن سحب أرباحك مباشرة.
                        </p>
                        <div className="bg-black/5 dark:bg-black/20 p-4 rounded-lg text-center font-mono text-sm text-telegram-text break-all">
                            <p className="text-xs text-telegram-hint mb-1">
                                {wallet.appName}
                            </p>
                            <p className="font-bold text-lg">{truncateAddress(userFriendlyAddress)}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-lg text-telegram-hint mb-10 max-w-sm mx-auto">
                        قم بتوصيل محفظة TON الخاصة بك لإدارة وسحب رصيد Diggs الخاص بك.
                    </p>
                )}

                <div className="flex justify-center pt-4">
                    <TonConnectButton />
                </div>
            </div>
        </div>
    );
};

export default WalletScreen;
