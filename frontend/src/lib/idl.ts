// 从环境变量获取程序地址
const PROGRAM_ADDRESS = process.env.NEXT_PUBLIC_PROGRAM_ID;
if (!PROGRAM_ADDRESS) {
    throw new Error('NEXT_PUBLIC_PROGRAM_ID 环境变量未设置');
}

export const IDL = {
    "address": PROGRAM_ADDRESS,
    "metadata": {
        "name": "spl_practice",
        "version": "0.1.0",
        "spec": "0.1.0",
        "description": "Created with Anchor"
    },
    "instructions": [
        {
            "name": "add_balance",
            "docs": ["增加用户余额"],
            "discriminator": [222, 94, 198, 210, 48, 187, 242, 30],
            "accounts": [
                {
                    "name": "user_profile",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [117, 115, 101, 114, 45, 112, 114, 111, 102, 105, 108, 101]
                            },
                            {
                                "kind": "account",
                                "path": "user"
                            }
                        ]
                    }
                },
                {
                    "name": "user",
                    "signer": true
                }
            ],
            "args": [
                {
                    "name": "amount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "create_token_metadata",
            "docs": ["创建 Token 元数据账户"],
            "discriminator": [221, 80, 176, 37, 153, 188, 160, 68],
            "accounts": [
                {
                    "name": "metadata",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [116, 111, 107, 101, 110, 45, 109, 101, 116, 97, 100, 97, 116, 97]
                            },
                            {
                                "kind": "account",
                                "path": "mint"
                            }
                        ]
                    }
                },
                {
                    "name": "mint"
                },
                {
                    "name": "authority",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "system_program",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "symbol",
                    "type": "string"
                },
                {
                    "name": "description",
                    "type": "string"
                }
            ]
        },
        {
            "name": "create_user_profile",
            "docs": ["创建用户资料账户并存储数据"],
            "discriminator": [9, 214, 142, 184, 153, 65, 50, 174],
            "accounts": [
                {
                    "name": "user_profile",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [117, 115, 101, 114, 45, 112, 114, 111, 102, 105, 108, 101]
                            },
                            {
                                "kind": "account",
                                "path": "user"
                            }
                        ]
                    }
                },
                {
                    "name": "user",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "system_program",
                    "address": "11111111111111111111111111111111"
                }
            ],
            "args": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "age",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "mint_daily_tokens",
            "docs": ["每日铸造Token（用户每天第一次打开页面时调用）"],
            "discriminator": [242, 110, 25, 253, 64, 151, 39, 75],
            "accounts": [
                {
                    "name": "record",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [100, 97, 105, 108, 121, 45, 109, 105, 110, 116, 45, 114, 101, 99, 111, 114, 100]
                            },
                            {
                                "kind": "account",
                                "path": "user"
                            }
                        ]
                    }
                },
                {
                    "name": "mint",
                    "writable": true
                },
                {
                    "name": "user_token_account",
                    "writable": true
                },
                {
                    "name": "mint_authority",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "user",
                    "writable": true,
                    "signer": true
                },
                {
                    "name": "system_program",
                    "address": "11111111111111111111111111111111"
                },
                {
                    "name": "token_program",
                    "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                }
            ],
            "args": []
        },
        {
            "name": "update_user_profile",
            "docs": ["更新用户资料数据"],
            "discriminator": [79, 75, 114, 130, 68, 123, 180, 11],
            "accounts": [
                {
                    "name": "user_profile",
                    "writable": true,
                    "pda": {
                        "seeds": [
                            {
                                "kind": "const",
                                "value": [117, 115, 101, 114, 45, 112, 114, 111, 102, 105, 108, 101]
                            },
                            {
                                "kind": "account",
                                "path": "user"
                            }
                        ]
                    }
                },
                {
                    "name": "user",
                    "signer": true
                }
            ],
            "args": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "age",
                    "type": "u8"
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "DailyMintRecord",
            "discriminator": [132, 109, 202, 243, 67, 215, 157, 5]
        },
        {
            "name": "TokenMetadata",
            "discriminator": [237, 215, 132, 182, 24, 127, 175, 173]
        },
        {
            "name": "UserProfile",
            "discriminator": [32, 37, 119, 205, 179, 180, 13, 194]
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "Unauthorized",
            "msg": "Unauthorized access"
        },
        {
            "code": 6001,
            "name": "Overflow",
            "msg": "Arithmetic overflow"
        }
    ],
    "types": [
        {
            "name": "DailyMintRecord",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "user",
                        "type": "pubkey"
                    },
                    {
                        "name": "last_mint_day",
                        "type": "u32"
                    },
                    {
                        "name": "total_minted",
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "TokenMetadata",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "mint",
                        "type": "pubkey"
                    },
                    {
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "name": "symbol",
                        "type": "string"
                    },
                    {
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "name": "total_supply",
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "UserProfile",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "owner",
                        "type": "pubkey"
                    },
                    {
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "name": "age",
                        "type": "u8"
                    },
                    {
                        "name": "balance",
                        "type": "u64"
                    },
                    {
                        "name": "created_at",
                        "type": "i64"
                    },
                    {
                        "name": "updated_at",
                        "type": "i64"
                    }
                ]
            }
        }
    ]
} as const;
