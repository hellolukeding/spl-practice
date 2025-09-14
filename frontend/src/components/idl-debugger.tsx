'use client';

import { IDL } from '@/lib/idl-legacy';
import { useEffect } from 'react';

export const IDLDebugger = () => {
    useEffect(() => {
        console.log('=== IDL 调试信息 ===');
        console.log('IDL 类型:', typeof IDL);
        console.log('IDL 是否存在:', !!IDL);
        console.log('IDL 内容:', IDL);

        if (IDL) {
            console.log('IDL 结构:');
            console.log('- name:', IDL.name);
            console.log('- version:', IDL.version);
            console.log('- instructions:', IDL.instructions);
            console.log('- accounts:', IDL.accounts);
            console.log('- errors:', IDL.errors);

            if (IDL.instructions) {
                console.log('- instructions 长度:', IDL.instructions.length);
                console.log('- 第一个指令:', IDL.instructions[0]);
            }

            if (IDL.accounts) {
                console.log('- accounts 长度:', IDL.accounts.length);
                console.log('- 第一个账户类型:', IDL.accounts[0]);
            }
        }
        console.log('=== IDL 调试信息结束 ===');
    }, []);

    return null;
};
