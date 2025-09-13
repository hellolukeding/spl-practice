use anchor_lang::prelude::*;

// 模块声明 - 重命名以避免与Anchor内部模块冲突
pub mod account_structs;
pub mod error_types;
pub mod instruction_handlers;
pub mod state_types;

// 重新导出类型，供外部使用
pub use account_structs::*;
pub use error_types::ErrorCode;
pub use state_types::*;

// 导入指令模块
use instruction_handlers::{token_instructions, user_profile_instructions};

declare_id!("85geTUQkHkLGJULKAWs211TR3Exs5hbdjLV53zwZGL7q");

// ==================== 程序指令实现 ====================
#[program]
pub mod spl_practice {
    use super::*;

    /// 创建用户资料账户并存储数据
    pub fn create_user_profile(
        ctx: Context<CreateUserProfile>,
        name: String,
        age: u8,
    ) -> Result<()> {
        user_profile_instructions::create_user_profile(ctx, name, age)
    }

    /// 更新用户资料数据
    pub fn update_user_profile(
        ctx: Context<UpdateUserProfile>,
        name: String,
        age: u8,
    ) -> Result<()> {
        user_profile_instructions::update_user_profile(ctx, name, age)
    }

    /// 增加用户余额
    pub fn add_balance(ctx: Context<UpdateBalance>, amount: u64) -> Result<()> {
        user_profile_instructions::add_balance(ctx, amount)
    }

    /// 创建 Token 元数据账户
    pub fn create_token_metadata(
        ctx: Context<CreateTokenMetadata>,
        name: String,
        symbol: String,
        description: String,
    ) -> Result<()> {
        token_instructions::create_token_metadata(ctx, name, symbol, description)
    }

    /// 每日铸造Token（用户每天第一次打开页面时调用）
    pub fn mint_daily_tokens(ctx: Context<MintDailyTokens>) -> Result<()> {
        token_instructions::mint_daily_tokens(ctx)
    }
}
