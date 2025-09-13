use anchor_lang::prelude::*;

// 自定义数据结构 - 存储在账户中的数据
#[account]
pub struct UserProfile {
    pub owner: Pubkey,   // 账户所有者
    pub name: String,    // 用户名 (最大 50 字符)
    pub age: u8,         // 年龄
    pub balance: u64,    // 余额
    pub created_at: i64, // 创建时间
    pub updated_at: i64, // 更新时间
}

// Token 元数据结构
#[account]
pub struct TokenMetadata {
    pub mint: Pubkey,        // Token Mint 地址
    pub name: String,        // Token 名称
    pub symbol: String,      // Token 符号
    pub description: String, // 描述
    pub total_supply: u64,   // 总供应量
}

// 每日铸造记录
#[account]
pub struct DailyMintRecord {
    pub user: Pubkey,       // 用户地址
    pub last_mint_day: u32, // 最后铸造的天数（从1970-01-01开始的天数）
    pub total_minted: u64,  // 总铸造数量
}
