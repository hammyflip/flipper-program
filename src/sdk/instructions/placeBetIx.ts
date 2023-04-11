import { BN, web3 } from "@project-serum/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "constants/ProgramIds";
import { FlipperProgram } from "generated";
import findAuctionHouseTreasuryPda from "utils/pdas/findAuctionHouseTreasuryPda";
import findBettorInfoPaymentAccountPda from "utils/pdas/findBettorInfoPaymentAccountPda";
import findBettorInfoPda from "utils/pdas/findBettorInfoPda";

type Accounts = {
  auctionHouse: PublicKey;
  bettor: PublicKey;
  bettorPaymentAccount: PublicKey;
  treasuryMint: PublicKey;
};

type Args = {
  amount: number;
  bets: number;
  numFlips: number;
  program: FlipperProgram;
};

export default async function placeBetIx(
  { auctionHouse, bettor, bettorPaymentAccount, treasuryMint }: Accounts,
  { amount, bets, numFlips, program }: Args
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
    .placeBet(bettorInfoPaymentAccountBump, bets, new BN(amount), numFlips)
    .accounts({
      auctionHouse,
      auctionHouseTreasury,
      bettor,
      bettorInfo,
      bettorInfoPaymentAccount,
      bettorPaymentAccount,
      rent: web3.SYSVAR_RENT_PUBKEY,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      transferAuthority: bettor,
      treasuryMint,
    })
    .instruction();
}
