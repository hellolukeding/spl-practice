// 简化的 IDL，与 @project-serum/anchor 0.26.0 兼容
export const IDL = {
    "version": "0.1.0",
    "name": "spl_practice",
    "instructions": [
        {
            "name": "addBalance",
            "accounts": [
                {
                    "name": "userProfile",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": false,
                    "isSigner": true
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
            "name": "createTokenMetadata",
            "accounts": [
                {
                    "name": "metadata",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "mint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
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
            "name": "createUserProfile",
            "accounts": [
                {
                    "name": "userProfile",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
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
            "name": "mintDailyTokens",
            "accounts": [
                {
                    "name": "record",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "mint",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "mintAuthority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "user",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": []
        },
        {
            "name": "updateUserProfile",
            "accounts": [
                {
                    "name": "userProfile",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "user",
                    "isMut": false,
                    "isSigner": true
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
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "user",
                        "type": "publicKey"
                    },
                    {
                        "name": "lastMintDay",
                        "type": "u32"
                    },
                    {
                        "name": "totalMinted",
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
                        "type": "publicKey"
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
                        "name": "totalSupply",
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
                        "type": "publicKey"
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
                        "name": "createdAt",
                        "type": "i64"
                    },
                    {
                        "name": "updatedAt",
                        "type": "i64"
                    }
                ]
            }
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
    ]
} as const;
