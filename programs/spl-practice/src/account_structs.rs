use crate::state_types::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};

// 用户资料相关账户
#[derive(Accounts)]
pub struct CreateUserProfile<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + 32 + (4 + 50) + 1 + 8 + 8 + 8, // 8字节discriminator + 数据大小
        seeds = [b"user-profile", user.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateUserProfile<'info> {
    #[account(
        mut,
        seeds = [b"user-profile", user.key().as_ref()],
        bump,
        constraint = user_profile.owner == user.key() @ crate::error_types::ErrorCode::Unauthorized
    )]
    pub user_profile: Account<'info, UserProfile>,

    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateBalance<'info> {
    #[account(
        mut,
        seeds = [b"user-profile", user.key().as_ref()],
        bump,
        constraint = user_profile.owner == user.key() @ crate::error_types::ErrorCode::Unauthorized
    )]
    pub user_profile: Account<'info, UserProfile>,

    pub user: Signer<'info>,
}

// Token 相关账户
#[derive(Accounts)]
#[instruction(decimals: u8)]
pub struct InitializeMint<'info> {
    #[account(
        init,
        payer = authority,
        mint::decimals = decimals,
        mint::authority = authority,       // 设置谁能 mint
        mint::freeze_authority = authority // 可选：设置冻结权限
    )]
    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority: Signer<'info>, // 创建人

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CreateTokenMetadata<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + (4 + 50) + (4 + 10) + (4 + 200) + 8, // discriminator + 数据大小
        seeds = [b"token-metadata", mint.key().as_ref()],
        bump
    )]
    pub metadata: Account<'info, TokenMetadata>,

    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintDailyTokens<'info> {
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + 32 + 4 + 8, // 8字节discriminator + 数据大小
        seeds = [b"daily-mint-record", user.key().as_ref()],
        bump
    )]
    pub record: Account<'info, DailyMintRecord>,

    #[account(mut)]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = user_token_account.owner == user.key() @ crate::error_types::ErrorCode::Unauthorized
    )]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub mint_authority: Signer<'info>, // Mint authority

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}
