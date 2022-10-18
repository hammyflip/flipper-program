import { BN, web3 } from "@project-serum/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "constants/ProgramIds";
import { FlipperProgram } from "generated";
import findAuctionHouseTreasuryPda from "utils/pdas/findAuctionHouseTreasuryPda";

type Accounts = {
  auctionHouse: PublicKey;
  authority: PublicKey;
  treasuryMint: PublicKey;
  treasuryWithdrawalDestination: PublicKey;
};

type Args = {
  amount: number;
  program: FlipperProgram;
};

export default async function withdrawFromTreasuryIx(
  {
    auctionHouse,
    authority,
    treasuryMint,
    treasuryWithdrawalDestination,
  }: Accounts,
  { amount, program }: Args
): Promise<TransactionInstruction> {
  const [auctionHouseTreasury] = await findAuctionHouseTreasuryPda(
    auctionHouse,
    program.programId
  );

  return program.methods
    .withdrawFromTreasury(new BN(amount))
    .accounts({
      auctionHouse,
      auctionHouseTreasury,
      authority,
      treasuryMint,
      treasuryWithdrawalDestination,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .instruction();
}
