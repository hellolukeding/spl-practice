'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React, { FC } from 'react';
import { ClientWalletWrapper } from './client-wallet-wrapper';

interface WalletConnectionProps {
    onConnected?: () => void;
}

export const WalletConnection: FC<WalletConnectionProps> = ({ onConnected }) => {
    const { connected, publicKey } = useWallet();

    React.useEffect(() => {
        if (connected && onConnected) {
            onConnected();
        }
    }, [connected, onConnected]);

    if (connected && publicKey) {
        return (
            <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                    连接地址: {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                </div>
                <ClientWalletWrapper>
                    <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90" />
                </ClientWalletWrapper>
            </div>
        );
    }

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
                <CardTitle>连接钱包</CardTitle>
                <CardDescription>
                    请连接您的 Solana 钱包以使用 SPL token 功能
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
                <ClientWalletWrapper>
                    <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90" />
                </ClientWalletWrapper>
            </CardContent>
        </Card>
    );
};

export const WalletButton: FC = () => {
    const { connected } = useWallet();

    return (
        <ClientWalletWrapper
            fallback={
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            }
        >
            <WalletMultiButton
                className={`!bg-primary !text-primary-foreground hover:!bg-primary/90 ${connected ? '!bg-green-600 hover:!bg-green-700' : ''
                    }`}
            />
        </ClientWalletWrapper>
    );
};
