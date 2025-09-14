import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';

// Solana 配置
export const SOLANA_NETWORK = 'devnet'; // 可以改为 'mainnet-beta' 或 'testnet'
export const RPC_URL = clusterApiUrl(SOLANA_NETWORK);

// 程序配置 - 从环境变量读取
const PROGRAM_ID_STRING = process.env.NEXT_PUBLIC_PROGRAM_ID;
if (!PROGRAM_ID_STRING) {
    throw new Error('NEXT_PUBLIC_PROGRAM_ID 环境变量未设置');
}
export const PROGRAM_ID = new PublicKey(PROGRAM_ID_STRING);

// 连接配置
export const connection = new Connection(RPC_URL, 'confirmed');

// SPL Token 程序 ID
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

// 常量配置
export const DAILY_MINT_AMOUNT = 100; // 每日铸造数量
export const DECIMALS = 9; // Token 小数位数

// PDA Seeds
export const USER_PROFILE_SEED = 'user-profile';
export const TOKEN_METADATA_SEED = 'token-metadata';
export const DAILY_MINT_RECORD_SEED = 'daily-mint-record';

// 工具函数：获取 PDA 地址
export const getUserProfilePDA = (userPublicKey: PublicKey) => {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from(USER_PROFILE_SEED), userPublicKey.toBuffer()],
        PROGRAM_ID
    );
    return pda;
};

export const getTokenMetadataPDA = (mintPublicKey: PublicKey) => {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from(TOKEN_METADATA_SEED), mintPublicKey.toBuffer()],
        PROGRAM_ID
    );
    return pda;
};

export const getDailyMintRecordPDA = (userPublicKey: PublicKey) => {
    const [pda] = PublicKey.findProgramAddressSync(
        [Buffer.from(DAILY_MINT_RECORD_SEED), userPublicKey.toBuffer()],
        PROGRAM_ID
    );
    return pda;
};
