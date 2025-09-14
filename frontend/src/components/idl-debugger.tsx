'use client';

import { IDL } from '@/lib/solana-config';
import { useEffect } from 'react';

export const IDLDebugger = () => {
    useEffect(() => {
        console.log('=== IDL 调试信息 ===');
        console.log('IDL 类型:', typeof IDL);
        console.log('IDL 是否存在:', !!IDL);
        console.log('IDL 内容:', IDL);

        if (IDL) {
            console.log('IDL 结构:');
            console.log('- address:', IDL.address);
            console.log('- metadata:', IDL.metadata);
            console.log('- instructions:', IDL.instructions);
            console.log('- types:', IDL.types);
            console.log('- accounts:', IDL.accounts);

            if (IDL.instructions) {
                console.log('- instructions 长度:', IDL.instructions.length);
                console.log('- 第一个指令:', IDL.instructions[0]);
            }

            if (IDL.types) {
                console.log('- types 长度:', IDL.types.length);
                console.log('- 第一个类型:', IDL.types[0]);
            }
        }
        console.log('=== IDL 调试信息结束 ===');
    }, []);

    return null;
};
