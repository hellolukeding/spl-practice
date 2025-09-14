'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconCopy, IconTerminal, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ConsoleLog {
    timestamp: Date;
    level: 'log' | 'error' | 'warn' | 'info';
    message: string;
}

export function ConsoleViewer() {
    const [logs, setLogs] = useState<ConsoleLog[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        // 拦截控制台输出
        const originalConsole = {
            log: console.log,
            error: console.error,
            warn: console.warn,
            info: console.info
        };

        const interceptConsole = (level: keyof typeof originalConsole) => {
            console[level] = (...args: any[]) => {
                originalConsole[level](...args);

                // 只记录包含 Solana 相关关键词的日志
                const message = args.map(arg =>
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ');

                if (message.includes('程序') ||
                    message.includes('钱包') ||
                    message.includes('IDL') ||
                    message.includes('Program') ||
                    message.includes('Anchor') ||
                    message.includes('Solana') ||
                    message.includes('初始化') ||
                    message.includes('failed') ||
                    message.includes('error')) {

                    setLogs(prev => [...prev.slice(-19), {
                        timestamp: new Date(),
                        level,
                        message
                    }]);
                }
            };
        };

        interceptConsole('log');
        interceptConsole('error');
        interceptConsole('warn');
        interceptConsole('info');

        return () => {
            // 恢复原始控制台
            Object.assign(console, originalConsole);
        };
    }, []);

    const clearLogs = () => {
        setLogs([]);
        toast.success('控制台日志已清空');
    };

    const copyLogs = () => {
        const logText = logs.map(log =>
            `[${log.timestamp.toLocaleTimeString()}] ${log.level.toUpperCase()}: ${log.message}`
        ).join('\n');

        navigator.clipboard.writeText(logText).then(() => {
            toast.success('日志已复制到剪贴板');
        }).catch(() => {
            toast.error('复制失败');
        });
    };

    const getLogColor = (level: string) => {
        switch (level) {
            case 'error': return 'text-red-500';
            case 'warn': return 'text-orange-500';
            case 'info': return 'text-blue-500';
            default: return 'text-gray-700 dark:text-gray-300';
        }
    };

    if (!isExpanded) {
        return (
            <Card className="w-full mt-4">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <IconTerminal className="h-5 w-5" />
                            <CardTitle>控制台日志</CardTitle>
                            {logs.length > 0 && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                    {logs.length}
                                </span>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsExpanded(true)}
                        >
                            展开查看
                        </Button>
                    </div>
                    <CardDescription>
                        实时显示 Solana 相关的控制台输出
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="w-full mt-4">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <IconTerminal className="h-5 w-5" />
                        <CardTitle>控制台日志</CardTitle>
                        {logs.length > 0 && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {logs.length}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={copyLogs}
                            disabled={logs.length === 0}
                        >
                            <IconCopy className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearLogs}
                            disabled={logs.length === 0}
                        >
                            <IconTrash className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsExpanded(false)}
                        >
                            收起
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
                    {logs.length === 0 ? (
                        <p className="text-gray-500">暂无日志...</p>
                    ) : (
                        logs.map((log, index) => (
                            <div key={index} className="mb-1">
                                <span className="text-gray-400">
                                    [{log.timestamp.toLocaleTimeString()}]
                                </span>
                                <span className={`ml-2 ${getLogColor(log.level)}`}>
                                    {log.level.toUpperCase()}:
                                </span>
                                <span className="ml-2 break-all">
                                    {log.message}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
