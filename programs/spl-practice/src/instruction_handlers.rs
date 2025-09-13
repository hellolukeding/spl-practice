use crate::account_structs::*;
use crate::error_types::ErrorCode;
use anchor_lang::prelude::*;
use anchor_spl::token::MintTo;

// 用户资料相关指令
pub mod user_profile_instructions {
    use super::*;

    /// 创建用户资料账户并存储数据
    pub fn create_user_profile(
        ctx: Context<CreateUserProfile>,
        name: String,
        age: u8,
    ) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        let clock = Clock::get()?;

        // 存储数据到账户
        user_profile.owner = ctx.accounts.user.key();
        user_profile.name = name;
        user_profile.age = age;
        user_profile.balance = 0;
        user_profile.created_at = clock.unix_timestamp;
        user_profile.updated_at = clock.unix_timestamp;

        msg!("用户资料已创建: {}", user_profile.name);
        Ok(())
    }

    /// 更新用户资料数据
    pub fn update_user_profile(
        ctx: Context<UpdateUserProfile>,
        name: String,
        age: u8,
    ) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        let clock = Clock::get()?;

        // 更新数据
        user_profile.name = name;
        user_profile.age = age;
        user_profile.updated_at = clock.unix_timestamp;

        msg!("用户资料已更新: {}", user_profile.name);
        Ok(())
    }

    /// 增加用户余额
    pub fn add_balance(ctx: Context<UpdateBalance>, amount: u64) -> Result<()> {
        let user_profile = &mut ctx.accounts.user_profile;
        let clock = Clock::get()?;

        // 更新余额
        user_profile.balance = user_profile
            .balance
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;
        user_profile.updated_at = clock.unix_timestamp;

        msg!("余额已增加: {} -> {}", amount, user_profile.balance);
        Ok(())
    }
}

// Token 相关指令
pub mod token_instructions {
    use super::*;

    /// 创建 Token 元数据账户
    pub fn create_token_metadata(
        ctx: Context<CreateTokenMetadata>,
        name: String,
        symbol: String,
        description: String,
    ) -> Result<()> {
        let metadata = &mut ctx.accounts.metadata;

        // 存储 Token 元数据
        metadata.mint = ctx.accounts.mint.key();
        metadata.name = name;
        metadata.symbol = symbol;
        metadata.description = description;
        metadata.total_supply = 0;

        msg!(
            "Token 元数据已创建: {} ({})",
            metadata.name,
            metadata.symbol
        );
        Ok(())
    }

    /// 每日铸造Token（用户每天第一次打开页面时调用）
    pub fn mint_daily_tokens(ctx: Context<MintDailyTokens>) -> Result<()> {
        let record = &mut ctx.accounts.record;
        let clock = Clock::get()?;
        let current_day = (clock.unix_timestamp / 86400) as u32; // 计算当前天数

        // 如果是新记录，初始化
        if record.user == Pubkey::default() {
            record.user = ctx.accounts.user.key();
            record.last_mint_day = 0;
            record.total_minted = 0;
        }

        // 检查是否今天已铸造
        if record.last_mint_day == current_day {
            return err!(ErrorCode::Unauthorized); // 今天已铸造
        }

        // 铸造100 Token
        let amount = 100;
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.mint_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        anchor_spl::token::mint_to(cpi_ctx, amount)?;

        // 更新记录
        record.last_mint_day = current_day;
        record.total_minted = record
            .total_minted
            .checked_add(amount)
            .ok_or(ErrorCode::Overflow)?;

        msg!("每日Token已铸造: {} 个", amount);
        Ok(())
    }
}
