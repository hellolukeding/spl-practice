'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconExternalLink, IconWallet } from "@tabler/icons-react";

export function DevnetGuide() {
    return (
        <Card className="w-full mt-4">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <IconWallet className="h-5 w-5" />
                    钱包配置指南
                </CardTitle>
                <CardDescription>
                    确保钱包正确配置以使用 Devnet 网络
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h4 className="font-medium mb-2">1. 切换到 Devnet 网络</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        在 Phantom 钱包中：设置 → 更改网络 → Devnet
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        在 Solflare 钱包中：点击网络选择器 → 选择 Devnet
                    </p>
                </div>

                <div>
                    <h4 className="font-medium mb-2">2. 获取测试 SOL</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        访问 Solana Faucet 获取免费的测试 SOL：
                    </p>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open('https://faucet.solana.com/', '_blank')}
                    >
                        <IconExternalLink className="h-4 w-4 mr-2" />
                        打开 Solana Faucet
                    </Button>
                </div>

                <div>
                    <h4 className="font-medium mb-2">3. 验证配置</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <li>• 确认网络显示为 "devnet"</li>
                        <li>• 确认 SOL 余额至少有 0.01 SOL</li>
                        <li>• 程序状态显示为 "已准备"</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
