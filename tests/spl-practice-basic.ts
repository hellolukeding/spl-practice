import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram
} from "@solana/web3.js";
import { expect } from "chai";
import { SplPractice } from "../target/types/spl_practice";

describe("SPL Practice 基础测试", () => {
    // 配置提供者
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.splPractice as Program<SplPractice>;
    const connection = provider.connection;

    let user: Keypair;
    let userProfilePda: PublicKey;

    before(async () => {
        // 生成测试用户
        user = Keypair.generate();

        // 空投 SOL
        await connection.requestAirdrop(user.publicKey, LAMPORTS_PER_SOL);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 计算用户资料 PDA
        [userProfilePda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user-profile"), user.publicKey.toBuffer()],
            program.programId
        );
    });

    it("创建和管理用户资料", async () => {
        // 创建用户资料
        const createTx = await program.methods
            .createUserProfile("测试用户", 25)
            .accountsPartial({
                userProfile: userProfilePda,
                user: user.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([user])
            .rpc();

        console.log("✅ 用户资料创建成功:", createTx);

        // 验证创建的数据
        const account = await program.account.userProfile.fetch(userProfilePda);
        expect(account.name).to.equal("测试用户");
        expect(account.age).to.equal(25);
        expect(account.balance.toString()).to.equal("0");

        // 更新用户资料
        const updateTx = await program.methods
            .updateUserProfile("更新用户", 26)
            .accountsPartial({
                userProfile: userProfilePda,
                user: user.publicKey,
            })
            .signers([user])
            .rpc();

        console.log("✅ 用户资料更新成功:", updateTx);

        // 增加余额
        const balanceTx = await program.methods
            .addBalance(new anchor.BN(500))
            .accountsPartial({
                userProfile: userProfilePda,
                user: user.publicKey,
            })
            .signers([user])
            .rpc();

        console.log("✅ 余额增加成功:", balanceTx);

        // 最终验证
        const finalAccount = await program.account.userProfile.fetch(userProfilePda);
        expect(finalAccount.name).to.equal("更新用户");
        expect(finalAccount.age).to.equal(26);
        expect(finalAccount.balance.toString()).to.equal("500");

        console.log("🎉 基础功能测试完成!");
    });
});
