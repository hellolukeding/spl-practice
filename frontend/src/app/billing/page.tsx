'use client';

import AppContainer from "@/components/app-container";
import { ConsoleViewer } from "@/components/console-viewer";
import { DevnetGuide } from "@/components/devnet-guide";
import { IDLDebugger } from "@/components/idl-debugger";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Menubar,
    MenubarMenu,
    MenubarTrigger
} from "@/components/ui/menubar";
import { Separator } from "@/components/ui/separator";
import { WalletConnection } from "@/components/wallet-connection";
import { useTokenOperations, useTransactionHistory, useUserProfile } from "@/hooks/use-solana";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { IconAlertTriangle, IconCheck, IconCoins, IconGift, IconRefresh } from "@tabler/icons-react";
import React, { useEffect, useState } from 'react';
import { toast } from "sonner";

interface BillingProps { }

const TransactionTypeMap = {
    'mint': '铸造',
    'transfer': '转账',
    'withdraw': '提现',
    'tip': '打赏',
    'airdrop': '空投'
};

const TransactionTypeIconMap = {
    'mint': IconCoins,
    'transfer': IconRefresh,
    'withdraw': IconRefresh,
    'tip': IconGift,
    'airdrop': IconGift
};

const Billing: React.FC<BillingProps> = (props) => {
    const { connected, publicKey, wallet } = useWallet();
    const { connection } = useConnection();
    const { userProfile, isLoading: profileLoading, createUserProfile, programReady, error: programError } = useUserProfile();
    const {
        tokenBalance,
        isLoading: tokenLoading,
        mintDailyTokens,
        canMintToday,
        fetchTokenBalance
    } = useTokenOperations();
    const { transactions, isLoading: transactionLoading } = useTransactionHistory();

    const [activeFilter, setActiveFilter] = useState('所有');
    const [solBalance, setSolBalance] = useState<number>(0);
    const [networkInfo, setNetworkInfo] = useState<{
        cluster: string;
        isDevnet: boolean;
    }>({ cluster: 'unknown', isDevnet: false });
    const [isMinting, setIsMinting] = useState(false);
    const [isClient, setIsClient] = useState(false);

    // 确保组件在客户端渲染
    useEffect(() => {
        setIsClient(true);
    }, []);

    // 检查网络状态和余额
    useEffect(() => {
        const checkNetworkAndBalance = async () => {
            if (!connected || !publicKey || !connection) return;

            try {
                // 获取 SOL 余额
                const balance = await connection.getBalance(publicKey);
                setSolBalance(balance / LAMPORTS_PER_SOL);

                // 检查网络信息
                const genesisHash = await connection.getGenesisHash();
                const isDevnet = genesisHash === 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG';

                setNetworkInfo({
                    cluster: isDevnet ? 'devnet' : 'mainnet/testnet',
                    isDevnet
                });

                // 如果不是 devnet，显示警告
                if (!isDevnet) {
                    toast.warning('请切换钱包到 Devnet 网络', {
                        description: '当前合约部署在 Devnet 上，请确保钱包连接到正确的网络。'
                    });
                }

                // 如果余额太低，显示警告
                if (balance < 0.01 * LAMPORTS_PER_SOL) {
                    toast.warning('SOL 余额不足', {
                        description: `当前余额: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL。建议至少有 0.01 SOL 用于交易费用。`
                    });
                }

            } catch (error) {
                console.error('检查网络状态失败:', error);
            }
        };

        checkNetworkAndBalance();
    }, [connected, publicKey, connection]);

    // 如果钱包已连接且程序准备好但没有用户资料，创建一个默认资料
    useEffect(() => {
        if (connected && programReady && !userProfile && !profileLoading) {
            console.log('自动创建用户资料...');
            createUserProfile("用户", 25).catch((err) => {
                console.error('自动创建用户资料失败:', err);
                // 不显示错误 toast，因为这是自动尝试
            });
        }
    }, [connected, programReady, userProfile, profileLoading, createUserProfile]);

    const handleMintDailyTokens = async () => {
        console.log('钱包连接状态:', {
            connected,
            publicKey: publicKey?.toString(),
            wallet: wallet?.adapter?.name,
            programReady
        });

        if (!connected) {
            toast.error("请先连接钱包！");
            return;
        }

        if (!publicKey) {
            toast.error("未获取到钱包地址！");
            return;
        }

        if (!programReady) {
            toast.error("程序还未准备好，请稍候再试！");
            return;
        }

        if (!canMintToday) {
            toast.error("今天已经领取过了，明天再来吧！");
            return;
        }

        setIsMinting(true);
        try {
            await mintDailyTokens();
            toast.success("每日 Token 领取成功！");
            await fetchTokenBalance();
        } catch (error: any) {
            console.error('铸造失败:', error);
            toast.error(`铸造失败: ${error.message || '未知错误'}`);
        } finally {
            setIsMinting(false);
        }
    };

    const handleRefreshBalance = async () => {
        try {
            await fetchTokenBalance();
            toast.success("余额已刷新");
        } catch (error) {
            toast.error("刷新失败");
        }
    };

    const filteredTransactions = activeFilter === '所有'
        ? transactions
        : transactions.filter(tx => TransactionTypeMap[tx.type] === activeFilter);

    // 在客户端完全加载前显示加载状态
    if (!isClient) {
        return (
            <AppContainer>
                <section className="w-full h-full flex flex-col items-center justify-center px-4">
                    <div className="animate-pulse">
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4"></div>
                        <div className="w-64 h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                </section>
            </AppContainer>
        );
    }

    if (!connected) {
        return (
            <AppContainer>
                <section className="w-full h-full flex flex-col items-center justify-center px-4">
                    <WalletConnection />
                </section>
            </AppContainer>
        );
    }

    return (
        <AppContainer>
            <IDLDebugger />
            <section className="w-full h-full flex flex-col items-center justify-center px-4">
                <img src="/imgs/battery.png" alt="" className="w-20 rounded-2xl" />

                {/* 网络状态检查 */}
                <div className="w-full mt-4 p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        {networkInfo.isDevnet ? (
                            <IconCheck className="h-4 w-4 text-green-500" />
                        ) : (
                            <IconAlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                        <span className="font-medium">网络状态</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        当前网络: {networkInfo.cluster}
                        {!networkInfo.isDevnet && (
                            <span className="text-orange-500 ml-2">(需要切换到 Devnet)</span>
                        )}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        SOL 余额: {solBalance.toFixed(4)} SOL
                        {solBalance < 0.01 && (
                            <span className="text-orange-500 ml-2">(余额不足，建议至少 0.01 SOL)</span>
                        )}
                    </p>
                </div>

                {/* 调试信息 */}
                <div className="w-full mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                    <p>钱包状态: {connected ? '已连接' : '未连接'}</p>
                    <p>钱包地址: {publicKey?.toString() || '无'}</p>
                    <p>钱包类型: {wallet?.adapter?.name || '未知'}</p>
                    <p>程序状态: {programReady ? '已准备' : '未准备'}</p>
                    <p>用户资料: {userProfile ? '已创建' : '未创建'}</p>
                    {programError && (
                        <p className="text-red-500 mt-1">程序错误: {programError}</p>
                    )}
                </div>

                {/* 余额卡片 */}
                <Card className="w-full mt-4 border-0 shadow-none">
                    <CardHeader>
                        <CardTitle>Token 余额</CardTitle>
                        <CardDescription>
                            <p className="flex items-center gap-2">
                                <b className="text-xl">
                                    {tokenLoading ? "加载中..." : tokenBalance.toFixed(2)}
                                </b>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRefreshBalance}
                                    disabled={tokenLoading}
                                >
                                    <IconRefresh className="h-4 w-4" />
                                </Button>
                            </p>
                        </CardDescription>

                        <CardAction className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleMintDailyTokens}
                                disabled={!canMintToday || isMinting || tokenLoading || !programReady}
                            >
                                <IconCoins className="h-4 w-4 mr-2" />
                                {isMinting ? "领取中..." : canMintToday ? "每日领取" : "今日已领取"}
                            </Button>
                            <Button variant="outline">提现</Button>
                        </CardAction>
                    </CardHeader>
                </Card>

                {/* 显示配置指南（如果网络不正确或余额不足） */}
                {(!networkInfo.isDevnet || solBalance < 0.01) && <DevnetGuide />}

                <Separator />

                {/* 交易记录 */}
                <Card className="w-full border-0 shadow-none">
                    <CardHeader>
                        <CardTitle>交易记录</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Menubar className="border-0 shadow-none">
                            {['所有', '铸造', '购买', '打赏', '提现', '空投'].map((filter) => (
                                <MenubarMenu key={filter}>
                                    <MenubarTrigger
                                        className={activeFilter === filter ? 'bg-accent' : ''}
                                        onClick={() => setActiveFilter(filter)}
                                    >
                                        {filter}
                                    </MenubarTrigger>
                                </MenubarMenu>
                            ))}
                        </Menubar>

                        {/* 交易列表 */}
                        <div className="mt-4 space-y-2">
                            {transactionLoading ? (
                                <div className="text-center py-4 text-muted-foreground">
                                    加载交易记录...
                                </div>
                            ) : filteredTransactions.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">
                                    暂无交易记录
                                </div>
                            ) : (
                                filteredTransactions.map((tx, index) => {
                                    const IconComponent = TransactionTypeIconMap[tx.type];
                                    return (
                                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                <IconComponent className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">{TransactionTypeMap[tx.type]}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`font-medium ${tx.type === 'withdraw' ? 'text-red-500' : 'text-green-500'}`}>
                                                    {tx.type === 'withdraw' ? '-' : '+'}{tx.amount}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {tx.signature.slice(0, 4)}...{tx.signature.slice(-4)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 控制台查看器 */}
                <ConsoleViewer />
            </section>
        </AppContainer>
    );
};

export default Billing;
