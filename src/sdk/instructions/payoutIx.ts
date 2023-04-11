import { web3 } from "@project-serum/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "constants/ProgramIds";
import { FlipperProgram } from "generated";
import findAuctionHouseTreasuryPda from "utils/pdas/findAuctionHouseTreasuryPda";
import findBettorInfoPaymentAccountPda from "utils/pdas/findBettorInfoPaymentAccountPda";
import findBettorInfoPda from "utils/pdas/findBettorInfoPda";

type Accounts = {
  auctionHouse: PublicKey;
  authority: PublicKey;
  bettor: PublicKey;
  bettorPaymentAccount: PublicKey;
  treasuryMint: PublicKey;
};

type Args = {
  program: FlipperProgram;
};

export default async function payoutIx(
  {
    auctionHouse,
    authority,
    bettor,
    bettorPaymentAccount,
    treasuryMint,
  }: Accounts,
  { program }: Args
): Promise<TransactionInstruction> {
  const [auctionHouseTreasury] = await findAuctionHouseTreasuryPda(
    auctionHouse,
    program.programId
  );
  const [bettorInfo] = await findBettorInfoPda(
    bettor,
    treasuryMint,
    program.programId
  );
  const [bettorInfoPaymentAccount, bettorInfoPaymentAccountBump] =
    await findBettorInfoPaymentAccountPda(
      bettor,
      treasuryMint,
      program.programId
    );

  return program.methods
    .payout(bettorInfoPaymentAccountBump)
    .accounts({
      auctionHouse,
      auctionHouseTreasury,
      authority,
      bettor,
      bettorInfo,
      bettorInfoPaymentAccount,
      bettorPaymentAccount,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      treasuryMint,
    })
    .instruction();
}
