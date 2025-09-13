import * as anchor from "@coral-xyz/anchor";
import { AnchorError, Program } from "@coral-xyz/anchor";
import {
    TOKEN_PROGRAM_ID,
    createMint,
    getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import {
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram
} from "@solana/web3.js";
import { expect } from "chai";
import { SplPractice } from "../target/types/spl_practice";

describe("SPL Practice 完整测试", () => {
    // 配置提供者
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.splPractice as Program<SplPractice>;
    const connection = provider.connection;

    // 测试用的密钥对
    let user: Keypair;
    let mintAuthority: Keypair;
    let mint: PublicKey;
    let userTokenAccount: PublicKey;

    // PDA 地址
    let userProfilePda: PublicKey;
    let tokenMetadataPda: PublicKey;
    let dailyMintRecordPda: PublicKey;

    before(async () => {
        // 生成密钥对
        user = Keypair.generate();
        mintAuthority = Keypair.generate();

        // 空投 SOL
        await connection.requestAirdrop(user.publicKey, 2 * LAMPORTS_PER_SOL);
        await connection.requestAirdrop(mintAuthority.publicKey, 2 * LAMPORTS_PER_SOL);

        // 等待空投完成
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 计算 PDA 地址
        [userProfilePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user-profile"), user.publicKey.toBuffer()],
            program.programId
        );

        console.log("🔑 用户地址:", user.publicKey.toString());
        console.log("📋 用户资料 PDA:", userProfilePda.toString());
    });

    describe("👤 用户资料管理", () => {
        it("✅ 创建用户资料", async () => {
            const name = "Alice";
            const age = 25;

            const tx = await program.methods
                .createUserProfile(name, age)
                .accountsPartial({
                    userProfile: userProfilePda,
                    user: user.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .signers([user])
                .rpc();

            console.log("📝 创建用户资料交易:", tx);

            // 验证账户数据
            const userProfileAccount = await program.account.userProfile.fetch(userProfilePda);
            expect(userProfileAccount.owner.toString()).to.equal(user.publicKey.toString());
            expect(userProfileAccount.name).to.equal(name);
            expect(userProfileAccount.age).to.equal(age);
            expect(userProfileAccount.balance.toString()).to.equal("0");

            console.log("✅ 用户资料创建成功");
        });

        it("✏️ 更新用户资料", async () => {
            const newName = "Alice Updated";
            const newAge = 26;

            const tx = await program.methods
                .updateUserProfile(newName, newAge)
                .accountsPartial({
                    userProfile: userProfilePda,
                    user: user.publicKey,
                })
                .signers([user])
                .rpc();

            console.log("🔄 更新用户资料交易:", tx);

            // 验证更新后的数据
            const userProfileAccount = await program.account.userProfile.fetch(userProfilePda);
            expect(userProfileAccount.name).to.equal(newName);
            expect(userProfileAccount.age).to.equal(newAge);

            console.log("✅ 用户资料更新成功");
        });

        it("💰 增加用户余额", async () => {
            const amountToAdd = new anchor.BN(1000);

            const tx = await program.methods
                .addBalance(amountToAdd)
                .accountsPartial({
                    userProfile: userProfilePda,
                    user: user.publicKey,
                })
                .signers([user])
                .rpc();

            console.log("💸 增加余额交易:", tx);

            // 验证余额增加
            const userProfileAccount = await program.account.userProfile.fetch(userProfilePda);
            expect(userProfileAccount.balance.toString()).to.equal("1000");

            console.log("✅ 余额增加成功，当前余额:", userProfileAccount.balance.toString());
        });

        it("🚫 应该阻止未授权用户更新资料", async () => {
            const otherUser = Keypair.generate();
            await connection.requestAirdrop(otherUser.publicKey, LAMPORTS_PER_SOL);
            await new Promise(resolve => setTimeout(resolve, 1000));

            try {
                await program.methods
                    .updateUserProfile("Hacker", 30)
                    .accountsPartial({
                        userProfile: userProfilePda,
                        user: otherUser.publicKey,
                    })
                    .signers([otherUser])
                    .rpc();

                expect.fail("应该抛出未授权错误");
            } catch (error) {
                expect(error).to.be.instanceOf(AnchorError);
                console.log("✅ 成功阻止未授权访问");
            }
        });
    });

    describe("🪙 Token 功能测试", () => {
        before(async () => {
            // 创建 mint
            mint = await createMint(
                connection,
                mintAuthority,
                mintAuthority.publicKey,
                mintAuthority.publicKey,
                9 // decimals
            );

            console.log("🎯 创建的 Mint:", mint.toString());

            // 为用户创建关联代币账户
            const userTokenAccountInfo = await getOrCreateAssociatedTokenAccount(
                connection,
                user,
                mint,
                user.publicKey
            );
            userTokenAccount = userTokenAccountInfo.address;

            console.log("🏦 用户代币账户:", userTokenAccount.toString());

            // 计算其他 PDA
            [tokenMetadataPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("token-metadata"), mint.toBuffer()],
                program.programId
            );

            [dailyMintRecordPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("daily-mint-record"), user.publicKey.toBuffer()],
                program.programId
            );
        });

        it("📊 创建 Token 元数据", async () => {
            const name = "Practice Token";
            const symbol = "PRAC";
            const description = "这是一个用于练习的测试代币";

            const tx = await program.methods
                .createTokenMetadata(name, symbol, description)
                .accountsPartial({
                    metadata: tokenMetadataPda,
                    mint: mint,
                    authority: mintAuthority.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .signers([mintAuthority])
                .rpc();

            console.log("📋 创建元数据交易:", tx);

            // 验证元数据
            const metadataAccount = await program.account.tokenMetadata.fetch(tokenMetadataPda);
            expect(metadataAccount.mint.toString()).to.equal(mint.toString());
            expect(metadataAccount.name).to.equal(name);
            expect(metadataAccount.symbol).to.equal(symbol);
            expect(metadataAccount.description).to.equal(description);

            console.log("✅ Token 元数据创建成功");
        });

        it("🎁 每日铸造 Token", async () => {
            const tx = await program.methods
                .mintDailyTokens()
                .accountsPartial({
                    record: dailyMintRecordPda,
                    mint: mint,
                    userTokenAccount: userTokenAccount,
                    mintAuthority: mintAuthority.publicKey,
                    user: user.publicKey,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .signers([mintAuthority, user])
                .rpc();

            console.log("🎯 每日铸造交易:", tx);

            // 验证铸造记录
            const recordAccount = await program.account.dailyMintRecord.fetch(dailyMintRecordPda);
            expect(recordAccount.user.toString()).to.equal(user.publicKey.toString());
            expect(recordAccount.totalMinted.toString()).to.equal("100");

            // 验证用户代币余额
            const tokenBalance = await connection.getTokenAccountBalance(userTokenAccount);
            expect(tokenBalance.value.amount).to.equal("100");

            console.log("✅ 每日铸造成功，获得 100 代币");
        });

        it("🚫 应该阻止同一天重复铸造", async () => {
            try {
                await program.methods
                    .mintDailyTokens()
                    .accountsPartial({
                        record: dailyMintRecordPda,
                        mint: mint,
                        userTokenAccount: userTokenAccount,
                        mintAuthority: mintAuthority.publicKey,
                        user: user.publicKey,
                        systemProgram: SystemProgram.programId,
                        tokenProgram: TOKEN_PROGRAM_ID,
                    })
                    .signers([mintAuthority, user])
                    .rpc();

                expect.fail("应该抛出错误，因为今天已经铸造过了");
            } catch (error) {
                expect(error).to.be.instanceOf(AnchorError);
                console.log("✅ 成功阻止重复铸造");
            }
        });
    });

    describe("⚠️ 错误处理测试", () => {
        it("🔄 余额溢出保护", async () => {
            // 尝试添加一个非常大的数字来触发溢出
            const maxU64 = new anchor.BN("18446744073709551615"); // 2^64 - 1

            try {
                await program.methods
                    .addBalance(maxU64)
                    .accountsPartial({
                        userProfile: userProfilePda,
                        user: user.publicKey,
                    })
                    .signers([user])
                    .rpc();

                expect.fail("应该抛出溢出错误");
            } catch (error) {
                expect(error).to.be.instanceOf(AnchorError);
                console.log("✅ 成功处理溢出错误");
            }
        });
    });

    describe("🔍 数据完整性验证", () => {
        it("📊 验证所有账户数据", async () => {
            // 验证用户资料
            const userProfileAccount = await program.account.userProfile.fetch(userProfilePda);
            console.log("\n📋 用户资料数据:");
            console.log("👤 所有者:", userProfileAccount.owner.toString());
            console.log("📝 姓名:", userProfileAccount.name);
            console.log("🎂 年龄:", userProfileAccount.age);
            console.log("💰 余额:", userProfileAccount.balance.toString());
            console.log("📅 创建时间:", new Date(userProfileAccount.createdAt.toNumber() * 1000));
            console.log("🔄 更新时间:", new Date(userProfileAccount.updatedAt.toNumber() * 1000));

            // 验证 Token 元数据
            const metadataAccount = await program.account.tokenMetadata.fetch(tokenMetadataPda);
            console.log("\n🪙 Token 元数据:");
            console.log("🎯 Mint 地址:", metadataAccount.mint.toString());
            console.log("📝 名称:", metadataAccount.name);
            console.log("🏷️ 符号:", metadataAccount.symbol);
            console.log("📄 描述:", metadataAccount.description);

            // 验证每日铸造记录
            const recordAccount = await program.account.dailyMintRecord.fetch(dailyMintRecordPda);
            console.log("\n🎁 每日铸造记录:");
            console.log("👤 用户:", recordAccount.user.toString());
            console.log("📅 最后铸造天:", recordAccount.lastMintDay);
            console.log("📊 总铸造量:", recordAccount.totalMinted.toString());

            // 验证代币余额
            const tokenBalance = await connection.getTokenAccountBalance(userTokenAccount);
            console.log("\n💰 代币余额:");
            console.log("🪙 数量:", tokenBalance.value.amount);
            console.log("🔢 小数位:", tokenBalance.value.decimals);

            // 断言所有关键数据
            expect(userProfileAccount.owner.toString()).to.equal(user.publicKey.toString());
            expect(userProfileAccount.name).to.equal("Alice Updated");
            expect(userProfileAccount.age).to.equal(26);
            expect(userProfileAccount.balance.toString()).to.equal("1000");

            expect(metadataAccount.mint.toString()).to.equal(mint.toString());
            expect(metadataAccount.name).to.equal("Practice Token");
            expect(metadataAccount.symbol).to.equal("PRAC");

            expect(recordAccount.user.toString()).to.equal(user.publicKey.toString());
            expect(recordAccount.totalMinted.toString()).to.equal("100");

            expect(tokenBalance.value.amount).to.equal("100");

            console.log("\n✅ 所有数据验证通过！");
        });
    });

    after(async () => {
        console.log("\n🎉 所有测试完成！");
        console.log("📊 测试摘要:");
        console.log("- ✅ 用户资料管理: 创建、更新、余额管理");
        console.log("- ✅ Token 功能: 元数据创建、每日铸造");
        console.log("- ✅ 安全验证: 未授权访问保护、重复操作阻止");
        console.log("- ✅ 错误处理: 溢出保护、边界条件测试");
        console.log("- ✅ 数据完整性: 所有账户数据验证通过");
    });
});
