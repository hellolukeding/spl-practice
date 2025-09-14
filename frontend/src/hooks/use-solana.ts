'use client';

import {
    getDailyMintRecordPDA,
    getUserProfilePDA,
    IDL,
    PROGRAM_ID,
    TOKEN_PROGRAM_ID
} from '@/lib/solana-config';
import { AnchorProvider, Program } from '@project-serum/anchor';
import {
    createAssociatedTokenAccountInstruction,
    getAccount,
    getAssociatedTokenAddress,
    TokenAccountNotFoundError,
    TokenInvalidAccountOwnerError
} from '@solana/spl-token';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
    PublicKey,
    SystemProgram,
    Transaction
} from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

// 类型定义
interface UserProfile {
    owner: PublicKey;
    name: string;
    age: number;
    balance: number;
    createdAt: Date;
    updatedAt: Date;
}

interface TokenMetadata {
    mint: PublicKey;
    name: string;
    symbol: string;
    description: string;
    totalSupply: number;
}

interface DailyMintRecord {
    user: PublicKey;
    lastMintDay: number;
    totalMinted: number;
}

interface TransactionRecord {
    type: 'mint' | 'transfer' | 'withdraw' | 'tip' | 'airdrop';
    amount: number;
    timestamp: Date;
    signature: string;
    status: 'confirmed' | 'pending' | 'failed';
}

export const useSolanaProgram = () => {
    const { wallet, publicKey, signTransaction } = useWallet();
    const { connection } = useConnection();

    const [program, setProgram] = useState<Program | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    // 确保在客户端运行
    useEffect(() => {
        setIsClient(true);
    }, []);

    // 初始化程序
    useEffect(() => {
        if (!isClient) return;

        console.log('=== 程序初始化开始 ===');
        console.log('useSolanaProgram useEffect:', {
            wallet: !!wallet,
            walletName: wallet?.adapter?.name,
            publicKey: publicKey?.toString(),
            signTransaction: !!signTransaction,
            connection: !!connection,
            IDL: !!IDL,
            PROGRAM_ID: PROGRAM_ID?.toString()
        });

        if (wallet && publicKey && signTransaction) {
            // 检查是否是 Solana 钱包
            const walletName = wallet.adapter.name;
            console.log('检测到钱包:', walletName);

            if (walletName === 'MetaMask' || walletName.includes('MetaMask')) {
                console.error('检测到非 Solana 钱包:', walletName);
                setError('请使用 Solana 钱包（如 Phantom、Solflare）而不是以太坊钱包');
                setProgram(null);
                return;
            }

            try {
                // 验证 IDL 是否存在
                if (!IDL) {
                    throw new Error('IDL 未定义或加载失败');
                }

                // 更详细的 IDL 结构验证
                if (typeof IDL !== 'object') {
                    throw new Error('IDL 不是有效的对象');
                }

                if (!IDL.metadata || !IDL.instructions || !IDL.types) {
                    throw new Error('IDL 格式不正确，缺少必要字段 (metadata, instructions, types)');
                }

                if (!Array.isArray(IDL.instructions)) {
                    throw new Error('IDL instructions 必须是数组');
                }

                console.log('IDL 验证通过:', {
                    name: IDL.metadata?.name,
                    instructions: IDL.instructions?.length,
                    types: IDL.types?.length,
                    hasMetadata: !!IDL.metadata,
                    idlKeys: Object.keys(IDL)
                });

                console.log('创建 AnchorProvider...');
                const provider = new AnchorProvider(
                    connection,
                    {
                        publicKey,
                        signTransaction,
                    } as any,
                    { commitment: 'confirmed' }
                );
                console.log('AnchorProvider 创建成功');

                console.log('创建 Program 实例...');
                try {
                    // 尝试方法1: 直接使用 IDL
                    const program = new Program(IDL as any, PROGRAM_ID, provider);
                    console.log('Program 实例创建成功 (方法1)');
                    setProgram(program);
                    setError(null);
                    console.log('=== 程序初始化成功 ===');
                } catch (programError) {
                    console.error('方法1失败，尝试方法2:', programError);

                    // 尝试方法2: 使用简化的 IDL
                    try {
                        const simplifiedIDL = {
                            ...IDL,
                            version: IDL.metadata?.version || "0.1.0",
                            name: IDL.metadata?.name || "spl_practice"
                        };
                        const program = new Program(simplifiedIDL as any, PROGRAM_ID, provider);
                        console.log('Program 实例创建成功 (方法2)');
                        setProgram(program);
                        setError(null);
                        console.log('=== 程序初始化成功 (方法2) ===');
                    } catch (program2Error) {
                        console.error('所有方法都失败:', program2Error);
                        throw program2Error;
                    }
                }
            } catch (err) {
                console.error('=== 程序初始化失败 ===');
                console.error('Program initialization failed:', err);

                // 更详细的错误信息
                if (err instanceof Error) {
                    console.error('错误名称:', err.name);
                    console.error('错误消息:', err.message);
                    console.error('错误堆栈:', err.stack);
                } else {
                    console.error('非Error类型的错误:', typeof err, err);
                }

                console.error('IDL content:', IDL);
                console.error('PROGRAM_ID:', PROGRAM_ID.toString());
                console.error('Connection:', connection);
                console.error('PublicKey:', publicKey?.toString());

                const errorMessage = err instanceof Error ? err.message : '未知错误';
                setError(`无法初始化程序连接: ${errorMessage}`);
                setProgram(null);
            }
        } else {
            setProgram(null);
            console.log('程序未初始化，缺少必要参数', {
                wallet: !!wallet,
                publicKey: !!publicKey,
                signTransaction: !!signTransaction
            });
        }
    }, [wallet, publicKey, signTransaction, connection, isClient]); return {
        program,
        isLoading,
        error,
        publicKey,
        connection,
        isClient
    };
};

export const useUserProfile = () => {
    const { program, publicKey, isLoading: programLoading, error: programError, isClient } = useSolanaProgram();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 获取用户资料
    const fetchUserProfile = useCallback(async () => {
        if (!program || !publicKey) return;

        setIsLoading(true);
        setError(null);

        try {
            const userProfilePDA = getUserProfilePDA(publicKey);
            const account = await program.account.userProfile.fetch(userProfilePDA);

            setUserProfile({
                owner: account.owner as PublicKey,
                name: account.name as string,
                age: account.age as number,
                balance: (account.balance as any).toNumber(),
                createdAt: new Date((account.createdAt as any).toNumber() * 1000),
                updatedAt: new Date((account.updatedAt as any).toNumber() * 1000),
            });
        } catch (err: any) {
            if (err.toString().includes('Account does not exist')) {
                setUserProfile(null);
            } else {
                console.error('获取用户资料失败:', err);
                setError('获取用户资料失败');
            }
        }

        setIsLoading(false);
    }, [program, publicKey]);

    // 创建用户资料
    const createUserProfile = useCallback(async (name: string, age: number) => {
        if (!program || !publicKey) throw new Error('钱包未连接');

        setIsLoading(true);
        setError(null);

        try {
            const userProfilePDA = getUserProfilePDA(publicKey);

            const tx = await program.methods
                .createUserProfile(name, age)
                .accounts({
                    userProfile: userProfilePDA,
                    user: publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            console.log('用户资料创建成功:', tx);
            await fetchUserProfile();
            return tx;
        } catch (err: any) {
            console.error('创建用户资料失败:', err);
            setError('创建用户资料失败');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [program, publicKey, fetchUserProfile]);

    // 更新用户资料
    const updateUserProfile = useCallback(async (name: string, age: number) => {
        if (!program || !publicKey) throw new Error('钱包未连接');

        setIsLoading(true);
        setError(null);

        try {
            const userProfilePDA = getUserProfilePDA(publicKey);

            const tx = await program.methods
                .updateUserProfile(name, age)
                .accounts({
                    userProfile: userProfilePDA,
                    user: publicKey,
                })
                .rpc();

            console.log('用户资料更新成功:', tx);
            await fetchUserProfile();
            return tx;
        } catch (err: any) {
            console.error('更新用户资料失败:', err);
            setError('更新用户资料失败');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [program, publicKey, fetchUserProfile]);

    // 初始加载
    useEffect(() => {
        if (!programLoading && program && publicKey && isClient) {
            fetchUserProfile();
        }
    }, [program, publicKey, programLoading, fetchUserProfile, isClient]);

    return {
        userProfile,
        isLoading: isLoading || programLoading,
        error: error || programError,
        createUserProfile,
        updateUserProfile,
        fetchUserProfile,
        program,
        programReady: !!(program && publicKey && isClient),
    };
};

export const useTokenOperations = () => {
    const { program, publicKey, connection, isClient } = useSolanaProgram();
    const [tokenBalance, setTokenBalance] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dailyMintRecord, setDailyMintRecord] = useState<DailyMintRecord | null>(null);

    // 模拟 mint 公钥（实际应用中需要从某处获取）
    const [mintPublicKey] = useState(() => new PublicKey("11111111111111111111111111111112")); // 需要替换为实际的 mint

    // 获取 token 余额
    const fetchTokenBalance = useCallback(async () => {
        if (!publicKey || !connection) return;

        try {
            const tokenAccount = await getAssociatedTokenAddress(
                mintPublicKey,
                publicKey
            );

            const account = await getAccount(connection, tokenAccount);
            setTokenBalance(Number(account.amount) / Math.pow(10, 9)); // 假设 9 位小数
        } catch (err) {
            if (err instanceof TokenAccountNotFoundError || err instanceof TokenInvalidAccountOwnerError) {
                setTokenBalance(0);
            } else {
                console.error('获取 token 余额失败:', err);
            }
        }
    }, [publicKey, connection, mintPublicKey]);

    // 获取每日铸造记录
    const fetchDailyMintRecord = useCallback(async () => {
        if (!program || !publicKey) return;

        try {
            const recordPDA = getDailyMintRecordPDA(publicKey);
            const account = await program.account.dailyMintRecord.fetch(recordPDA);

            setDailyMintRecord({
                user: account.user as PublicKey,
                lastMintDay: account.lastMintDay as number,
                totalMinted: (account.totalMinted as any).toNumber(),
            });
        } catch (err: any) {
            if (err.toString().includes('Account does not exist')) {
                setDailyMintRecord(null);
            } else {
                console.error('获取每日铸造记录失败:', err);
            }
        }
    }, [program, publicKey]);

    // 每日铸造 token
    const mintDailyTokens = useCallback(async () => {
        console.log('mintDailyTokens 调用:', {
            program: !!program,
            publicKey: publicKey?.toString(),
            connection: !!connection
        });

        if (!program || !publicKey) {
            const errorMsg = '钱包未连接或程序未初始化';
            console.error(errorMsg, { program: !!program, publicKey: !!publicKey });
            throw new Error(errorMsg);
        }

        if (!connection) {
            const errorMsg = '网络连接未建立';
            console.error(errorMsg);
            throw new Error(errorMsg);
        }

        setIsLoading(true);
        setError(null);

        try {
            const recordPDA = getDailyMintRecordPDA(publicKey);
            const tokenAccount = await getAssociatedTokenAddress(
                mintPublicKey,
                publicKey
            );

            // 检查 token 账户是否存在，不存在则创建
            try {
                await getAccount(connection, tokenAccount);
            } catch (err) {
                if (err instanceof TokenAccountNotFoundError) {
                    // 创建关联 token 账户的指令
                    const createATAInstruction = createAssociatedTokenAccountInstruction(
                        publicKey, // payer
                        tokenAccount, // ata
                        publicKey, // owner
                        mintPublicKey // mint
                    );

                    const transaction = new Transaction().add(createATAInstruction);
                    // 这里需要发送交易来创建账户
                    // 为了简化，我们假设账户已存在或在 mint 指令中会自动创建
                }
            }

            const tx = await program.methods
                .mintDailyTokens()
                .accounts({
                    record: recordPDA,
                    mint: mintPublicKey,
                    userTokenAccount: tokenAccount,
                    mintAuthority: publicKey, // 这里需要实际的 mint authority
                    user: publicKey,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .rpc();

            console.log('每日 token 铸造成功:', tx);
            await Promise.all([fetchTokenBalance(), fetchDailyMintRecord()]);
            return tx;
        } catch (err: any) {
            console.error('铸造 token 失败:', err);
            setError('铸造 token 失败');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [program, publicKey, connection, mintPublicKey, fetchTokenBalance, fetchDailyMintRecord]);

    // 检查是否可以进行每日铸造
    const canMintToday = useCallback(() => {
        if (!dailyMintRecord) return true;

        const currentDay = Math.floor(Date.now() / 1000 / 86400);
        return dailyMintRecord.lastMintDay !== currentDay;
    }, [dailyMintRecord]);

    // 初始加载
    useEffect(() => {
        if (publicKey && isClient) {
            fetchTokenBalance();
            fetchDailyMintRecord();
        }
    }, [publicKey, fetchTokenBalance, fetchDailyMintRecord, isClient]);

    return {
        tokenBalance,
        dailyMintRecord,
        isLoading,
        error,
        mintDailyTokens,
        canMintToday: canMintToday(),
        fetchTokenBalance,
        fetchDailyMintRecord,
    };
};

// 模拟交易记录 hook（实际应用中应该从链上获取）
export const useTransactionHistory = () => {
    const { publicKey, isClient } = useSolanaProgram();
    const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchTransactions = useCallback(async () => {
        if (!publicKey) return;

        setIsLoading(true);

        // 模拟数据，实际应用中应该从 Solana 链上获取交易历史
        setTimeout(() => {
            const mockTransactions: TransactionRecord[] = [
                {
                    type: 'mint',
                    amount: 100,
                    timestamp: new Date(Date.now() - 86400000),
                    signature: '5K1z...abc123',
                    status: 'confirmed',
                },
                {
                    type: 'tip',
                    amount: 50,
                    timestamp: new Date(Date.now() - 172800000),
                    signature: '3K9x...def456',
                    status: 'confirmed',
                },
                {
                    type: 'withdraw',
                    amount: 25,
                    timestamp: new Date(Date.now() - 259200000),
                    signature: '7M2y...ghi789',
                    status: 'confirmed',
                },
            ];
            setTransactions(mockTransactions);
            setIsLoading(false);
        }, 1000);
    }, [publicKey]);

    useEffect(() => {
        if (isClient) {
            fetchTransactions();
        }
    }, [fetchTransactions, isClient]);

    return {
        transactions,
        isLoading,
        fetchTransactions,
    };
};
