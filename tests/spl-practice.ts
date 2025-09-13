import * as anchor from "@coral-xyz/anchor";
import { AnchorError, Program } from "@coral-xyz/anchor";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram
} from "@solana/web3.js";
import { expect } from "chai";
import { SplPractice } from "../target/types/spl_practice";

describe("SPL Practice Tests", () => {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.splPractice as Program<SplPractice>;
  const connection = provider.connection;

  // Test keypairs
  let user: Keypair;
  let mintAuthority: Keypair;
  let mint: PublicKey;
  let userTokenAccount: PublicKey;

  // PDA addresses
  let userProfilePda: PublicKey;
  let userProfileBump: number;
  let tokenMetadataPda: PublicKey;
  let tokenMetadataBump: number;
  let dailyMintRecordPda: PublicKey;
  let dailyMintRecordBump: number;

  before(async () => {
    // Generate keypairs
    user = Keypair.generate();
    mintAuthority = Keypair.generate();

    // Airdrop SOL to user and mint authority
    await connection.requestAirdrop(user.publicKey, 2 * LAMPORTS_PER_SOL);
    await connection.requestAirdrop(mintAuthority.publicKey, 2 * LAMPORTS_PER_SOL);

    // Wait for airdrop to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Find PDAs
    [userProfilePda, userProfileBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("user-profile"), user.publicKey.toBuffer()],
      program.programId
    );

    console.log("User Profile PDA:", userProfilePda.toString());
    console.log("User:", user.publicKey.toString());
  });

  describe("用户资料管理", () => {
    it("创建用户资料", async () => {
      const name = "Alice";
      const age = 25;

      const tx = await program.methods
        .createUserProfile(name, age)
        .accounts({
          userProfile: userProfilePda,
          user: user.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user])
        .rpc();

      console.log("Create user profile transaction:", tx);

      // 验证账户数据
      const userProfileAccount = await program.account.userProfile.fetch(userProfilePda);
      expect(userProfileAccount.owner.toString()).to.equal(user.publicKey.toString());
      expect(userProfileAccount.name).to.equal(name);
      expect(userProfileAccount.age).to.equal(age);
      expect(userProfileAccount.balance.toString()).to.equal("0");
      expect(userProfileAccount.createdAt.toNumber()).to.be.greaterThan(0);
      expect(userProfileAccount.updatedAt.toNumber()).to.be.greaterThan(0);
    });

    it("更新用户资料", async () => {
      const newName = "Alice Updated";
      const newAge = 26;

      const tx = await program.methods
        .updateUserProfile(newName, newAge)
        .accounts({
          userProfile: userProfilePda,
          user: user.publicKey,
        })
        .signers([user])
        .rpc();

      console.log("Update user profile transaction:", tx);

      // 验证更新后的数据
      const userProfileAccount = await program.account.userProfile.fetch(userProfilePda);
      expect(userProfileAccount.name).to.equal(newName);
      expect(userProfileAccount.age).to.equal(newAge);
    });

    it("增加用户余额", async () => {
      const amountToAdd = new anchor.BN(1000);

      const tx = await program.methods
        .addBalance(amountToAdd)
        .accounts({
          userProfile: userProfilePda,
          user: user.publicKey,
        })
        .signers([user])
        .rpc();

      console.log("Add balance transaction:", tx);

      // 验证余额增加
      const userProfileAccount = await program.account.userProfile.fetch(userProfilePda);
      expect(userProfileAccount.balance.toString()).to.equal("1000");
    });

    it("不应该允许其他用户更新资料", async () => {
      const otherUser = Keypair.generate();
      await connection.requestAirdrop(otherUser.publicKey, LAMPORTS_PER_SOL);
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        await program.methods
          .updateUserProfile("Hacker", 30)
          .accounts({
            userProfile: userProfilePda,
            user: otherUser.publicKey,
          })
          .signers([otherUser])
          .rpc();

        expect.fail("应该抛出未授权错误");
      } catch (error) {
        expect(error).to.be.instanceOf(AnchorError);
        console.log("正确地阻止了未授权访问");
      }
    });
  });

  describe("Token 功能", () => {
    before(async () => {
      // Create a mint
      mint = await createMint(
        connection,
        mintAuthority,
        mintAuthority.publicKey,
        mintAuthority.publicKey,
        9 // decimals
      );

      console.log("Created mint:", mint.toString());

      // Create associated token account for user
      const userTokenAccountInfo = await getOrCreateAssociatedTokenAccount(
        connection,
        user,
        mint,
        user.publicKey
      );
      userTokenAccount = userTokenAccountInfo.address;

      console.log("User token account:", userTokenAccount.toString());

      // Find token metadata PDA
      [tokenMetadataPda, tokenMetadataBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("token-metadata"), mint.toBuffer()],
        program.programId
      );

      // Find daily mint record PDA
      [dailyMintRecordPda, dailyMintRecordBump] = PublicKey.findProgramAddressSync(
        [Buffer.from("daily-mint-record"), user.publicKey.toBuffer()],
        program.programId
      );
    });

    it("创建 Token 元数据", async () => {
      const name = "Test Token";
      const symbol = "TEST";
      const description = "This is a test token for practice";

      const tx = await program.methods
        .createTokenMetadata(name, symbol, description)
        .accounts({
          metadata: tokenMetadataPda,
          mint: mint,
          authority: mintAuthority.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([mintAuthority])
        .rpc();

      console.log("Create token metadata transaction:", tx);

      // 验证元数据
      const metadataAccount = await program.account.tokenMetadata.fetch(tokenMetadataPda);
      expect(metadataAccount.mint.toString()).to.equal(mint.toString());
      expect(metadataAccount.name).to.equal(name);
      expect(metadataAccount.symbol).to.equal(symbol);
      expect(metadataAccount.description).to.equal(description);
      expect(metadataAccount.totalSupply.toString()).to.equal("0");
    });

    it("每日铸造 Token", async () => {
      const tx = await program.methods
        .mintDailyTokens()
        .accounts({
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

      console.log("Mint daily tokens transaction:", tx);

      // 验证铸造记录
      const recordAccount = await program.account.dailyMintRecord.fetch(dailyMintRecordPda);
      expect(recordAccount.user.toString()).to.equal(user.publicKey.toString());
      expect(recordAccount.totalMinted.toString()).to.equal("100");
      expect(recordAccount.lastMintDay).to.be.greaterThan(0);

      // 验证用户Token余额
      const tokenBalance = await connection.getTokenAccountBalance(userTokenAccount);
      expect(tokenBalance.value.amount).to.equal("100");
    });

    it("不应该允许同一天再次铸造", async () => {
      try {
        await program.methods
          .mintDailyTokens()
          .accounts({
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
        console.log("正确地阻止了重复铸造");
      }
    });
  });

  describe("错误处理", () => {
    it("余额溢出检查", async () => {
      // 尝试添加一个非常大的数字来触发溢出
      const maxU64 = new anchor.BN("18446744073709551615"); // 2^64 - 1

      try {
        await program.methods
          .addBalance(maxU64)
          .accounts({
            userProfile: userProfilePda,
            user: user.publicKey,
          })
          .signers([user])
          .rpc();

        expect.fail("应该抛出溢出错误");
      } catch (error) {
        expect(error).to.be.instanceOf(AnchorError);
        console.log("正确地处理了溢出错误");
      }
    });
  });

  describe("账户数据完整性", () => {
    it("验证所有账户数据的完整性", async () => {
      // 验证用户资料
      const userProfileAccount = await program.account.userProfile.fetch(userProfilePda);
      console.log("用户资料:", {
        owner: userProfileAccount.owner.toString(),
        name: userProfileAccount.name,
        age: userProfileAccount.age,
        balance: userProfileAccount.balance.toString(),
        createdAt: new Date(userProfileAccount.createdAt.toNumber() * 1000),
        updatedAt: new Date(userProfileAccount.updatedAt.toNumber() * 1000)
      });

      // 验证Token元数据
      const metadataAccount = await program.account.tokenMetadata.fetch(tokenMetadataPda);
      console.log("Token元数据:", {
        mint: metadataAccount.mint.toString(),
        name: metadataAccount.name,
        symbol: metadataAccount.symbol,
        description: metadataAccount.description,
        totalSupply: metadataAccount.totalSupply.toString()
      });

      // 验证每日铸造记录
      const recordAccount = await program.account.dailyMintRecord.fetch(dailyMintRecordPda);
      console.log("每日铸造记录:", {
        user: recordAccount.user.toString(),
        lastMintDay: recordAccount.lastMintDay,
        totalMinted: recordAccount.totalMinted.toString()
      });

      // 所有数据都应该是有效的
      expect(userProfileAccount.owner.toString()).to.equal(user.publicKey.toString());
      expect(metadataAccount.mint.toString()).to.equal(mint.toString());
      expect(recordAccount.user.toString()).to.equal(user.publicKey.toString());
    });
  });
});
