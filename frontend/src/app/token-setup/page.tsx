'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    getMint
} from '@solana/spl-token';
import AppContainer from "@/components/app-container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WalletConnection } from "@/components/wallet-connection";
import { useSolanaProgram } from "@/hooks/use-solana";
import { toast } from "sonner";
import { IconCoins, IconDatabase, IconSettings } from "@tabler/icons-react";

const TokenSetup: React.FC = () => {
    const { connected, publicKey, wallet } = useWallet();
    const { program, connection } = useSolanaProgram();

    const [isCreatingMint, setIsCreatingMint] = useState(false);
    const [isCreatingMetadata, setIsCreatingMetadata] = useState(false);
    const [mintAddress, setMintAddress] = useState<string>('');
    const [tokenName, setTokenName] = useState('Battery Token');
    const [tokenSymbol, setTokenSymbol] = useState('BTRY');
    const [tokenDescription, setTokenDescription] = useState('Practice SPL Token for Battery App');
    const [decimals, setDecimals] = useState(9);

    // 创建新的 SPL Token Mint (简化版本，仅作演示)
    const handleCreateMint = async () => {
        if (!connected || !publicKey || !connection) {
            toast.error('请先连接钱包');
            return;
        }

        setIsCreatingMint(true);
        try {
            // 这里我们模拟创建mint的过程
            // 实际应用中，您需要使用正确的钱包签名
            toast.success('这是一个演示版本。实际应用中，您需要设置正确的钱包签名。');

            // 生成一个示例地址用于演示
            const mockMint = new PublicKey("11111111111111111111111111111112");
            setMintAddress(mockMint.toString());

        } catch (error: any) {
            console.error('创建 Mint 失败:', error);
            toast.error(`创建 Mint 失败: ${error.message}`);
        } finally {
            setIsCreatingMint(false);
        }
    };

    // 创建 Token 元数据
    const handleCreateMetadata = async () => {
        if (!program || !publicKey || !mintAddress) {
            toast.error('请先创建 Mint 或连接钱包');
            return;
        }

        setIsCreatingMetadata(true);
        try {
            const mintPubkey = new PublicKey(mintAddress);
            const metadataPDA = PublicKey.findProgramAddressSync(
                [Buffer.from('token-metadata'), mintPubkey.toBuffer()],
                program.programId
            )[0];

            const tx = await program.methods
                .createTokenMetadata(tokenName, tokenSymbol, tokenDescription)
                .accounts({
                    metadata: metadataPDA,
                    mint: mintPubkey,
                    authority: publicKey,
                })
                .rpc();

            toast.success(`Token 元数据创建成功！交易: ${tx}`);
        } catch (error: any) {
            console.error('创建元数据失败:', error);
            toast.error(`创建元数据失败: ${error.message}`);
        } finally {
            setIsCreatingMetadata(false);
        }
    };

    // 验证 Mint 地址
    const handleVerifyMint = async () => {
        if (!connection || !mintAddress) return;

        try {
            const mintPubkey = new PublicKey(mintAddress);
            // 这里只是验证地址格式
            toast.success(`Mint 地址格式验证成功: ${mintPubkey.toString()}`);
        } catch (error: any) {
            toast.error(`Mint 验证失败: ${error.message}`);
        }
    };

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
            <section className="w-full h-full flex flex-col gap-6 px-4 py-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2">SPL Token 管理</h1>
                    <p className="text-muted-foreground">创建和管理您的 SPL Token</p>
                </div>

                {/* 创建 Mint */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <IconCoins className="h-5 w-5" />
                            创建 SPL Token Mint
                        </CardTitle>
                        <CardDescription>
                            创建一个新的 SPL Token Mint 地址
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="decimals">小数位数</Label>
                                <Input
                                    id="decimals"
                                    type="number"
                                    value={decimals}
                                    onChange={(e) => setDecimals(parseInt(e.target.value))}
                                    min="0"
                                    max="18"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleCreateMint}
                            disabled={isCreatingMint}
                            className="w-full"
                        >
                            {isCreatingMint ? "创建中..." : "创建 Token Mint (演示)"}
                        </Button>

                        {mintAddress && (
                            <div className="p-3 bg-muted rounded-lg">
                                <Label>Mint 地址:</Label>
                                <p className="text-sm font-mono break-all">{mintAddress}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleVerifyMint}
                                    className="mt-2"
                                >
                                    验证 Mint
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 创建元数据 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <IconDatabase className="h-5 w-5" />
                            创建 Token 元数据
                        </CardTitle>
                        <CardDescription>
                            为您的 Token 创建链上元数据
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="tokenName">Token 名称</Label>
                                <Input
                                    id="tokenName"
                                    value={tokenName}
                                    onChange={(e) => setTokenName(e.target.value)}
                                    placeholder="Battery Token"
                                />
                            </div>
                            <div>
                                <Label htmlFor="tokenSymbol">Token 符号</Label>
                                <Input
                                    id="tokenSymbol"
                                    value={tokenSymbol}
                                    onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                                    placeholder="BTRY"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="tokenDescription">Token 描述</Label>
                            <Textarea
                                id="tokenDescription"
                                value={tokenDescription}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTokenDescription(e.target.value)}
                                placeholder="描述您的 Token..."
                            />
                        </div>

                        <div>
                            <Label htmlFor="mintAddress">Mint 地址</Label>
                            <Input
                                id="mintAddress"
                                value={mintAddress}
                                onChange={(e) => setMintAddress(e.target.value)}
                                placeholder="输入 Mint 地址..."
                            />
                        </div>

                        <Button
                            onClick={handleCreateMetadata}
                            disabled={isCreatingMetadata || !mintAddress}
                            className="w-full"
                        >
                            {isCreatingMetadata ? "创建中..." : "创建 Token 元数据"}
                        </Button>
                    </CardContent>
                </Card>

                {/* 使用说明 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <IconSettings className="h-5 w-5" />
                            使用说明
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                            <li>首先点击 "创建 Token Mint" 来创建一个新的 SPL Token</li>
                            <li>创建成功后，复制生成的 Mint 地址</li>
                            <li>填写 Token 的基本信息（名称、符号、描述）</li>
                            <li>点击 "创建 Token 元数据" 来在链上存储 Token 信息</li>
                            <li>将生成的 Mint 地址更新到配置文件中，以便在其他页面使用</li>
                        </ol>
                    </CardContent>
                </Card>
            </section>
        </AppContainer>
    );
};

export default TokenSetup;

// 创建 Token 元数据
const handleCreateMetadata = async () => {
    if (!program || !publicKey || !mintAddress) {
        toast.error('请先创建 Mint 或连接钱包');
        return;
    }

    setIsCreatingMetadata(true);
    try {
        const mintPubkey = new PublicKey(mintAddress);
        const metadataPDA = PublicKey.findProgramAddressSync(
            [Buffer.from('token-metadata'), mintPubkey.toBuffer()],
            program.programId
        )[0];

        const tx = await program.methods
            .createTokenMetadata(tokenName, tokenSymbol, tokenDescription)
            .accounts({
                metadata: metadataPDA,
                mint: mintPubkey,
                authority: publicKey,
            })
            .rpc();

        toast.success(`Token 元数据创建成功！交易: ${tx}`);
    } catch (error: any) {
        console.error('创建元数据失败:', error);
        toast.error(`创建元数据失败: ${error.message}`);
    } finally {
        setIsCreatingMetadata(false);
    }
};

// 验证 Mint 地址
const handleVerifyMint = async () => {
    if (!connection || !mintAddress) return;

    try {
        const mintPubkey = new PublicKey(mintAddress);
        const mintInfo = await getMint(connection, mintPubkey);

        toast.success(`Mint 验证成功！小数位数: ${mintInfo.decimals}, 供应量: ${mintInfo.supply.toString()}`);
    } catch (error: any) {
        toast.error(`Mint 验证失败: ${error.message}`);
    }
};

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
        <section className="w-full h-full flex flex-col gap-6 px-4 py-6">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">SPL Token 管理</h1>
                <p className="text-muted-foreground">创建和管理您的 SPL Token</p>
            </div>

            {/* 创建 Mint */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconCoins className="h-5 w-5" />
                        创建 SPL Token Mint
                    </CardTitle>
                    <CardDescription>
                        创建一个新的 SPL Token Mint 地址
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="decimals">小数位数</Label>
                            <Input
                                id="decimals"
                                type="number"
                                value={decimals}
                                onChange={(e) => setDecimals(parseInt(e.target.value))}
                                min="0"
                                max="18"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleCreateMint}
                        disabled={isCreatingMint}
                        className="w-full"
                    >
                        {isCreatingMint ? "创建中..." : "创建 Token Mint"}
                    </Button>

                    {mintAddress && (
                        <div className="p-3 bg-muted rounded-lg">
                            <Label>Mint 地址:</Label>
                            <p className="text-sm font-mono break-all">{mintAddress}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleVerifyMint}
                                className="mt-2"
                            >
                                验证 Mint
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 创建元数据 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconDatabase className="h-5 w-5" />
                        创建 Token 元数据
                    </CardTitle>
                    <CardDescription>
                        为您的 Token 创建链上元数据
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="tokenName">Token 名称</Label>
                            <Input
                                id="tokenName"
                                value={tokenName}
                                onChange={(e) => setTokenName(e.target.value)}
                                placeholder="Battery Token"
                            />
                        </div>
                        <div>
                            <Label htmlFor="tokenSymbol">Token 符号</Label>
                            <Input
                                id="tokenSymbol"
                                value={tokenSymbol}
                                onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                                placeholder="BTRY"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="tokenDescription">Token 描述</Label>
                        <Textarea
                            id="tokenDescription"
                            value={tokenDescription}
                            onChange={(e) => setTokenDescription(e.target.value)}
                            placeholder="描述您的 Token..."
                        />
                    </div>

                    <div>
                        <Label htmlFor="mintAddress">Mint 地址</Label>
                        <Input
                            id="mintAddress"
                            value={mintAddress}
                            onChange={(e) => setMintAddress(e.target.value)}
                            placeholder="输入 Mint 地址..."
                        />
                    </div>

                    <Button
                        onClick={handleCreateMetadata}
                        disabled={isCreatingMetadata || !mintAddress}
                        className="w-full"
                    >
                        {isCreatingMetadata ? "创建中..." : "创建 Token 元数据"}
                    </Button>
                </CardContent>
            </Card>

            {/* 使用说明 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconSettings className="h-5 w-5" />
                        使用说明
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                        <li>首先点击 "创建 Token Mint" 来创建一个新的 SPL Token</li>
                        <li>创建成功后，复制生成的 Mint 地址</li>
                        <li>填写 Token 的基本信息（名称、符号、描述）</li>
                        <li>点击 "创建 Token 元数据" 来在链上存储 Token 信息</li>
                        <li>将生成的 Mint 地址更新到配置文件中，以便在其他页面使用</li>
                    </ol>
                </CardContent>
            </Card>
        </section>
    </AppContainer>
);
};

export default TokenSetup;
