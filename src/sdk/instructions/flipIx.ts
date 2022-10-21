import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { FlipperProgram } from "generated";
import findBettorInfoPda from "utils/pdas/findBettorInfoPda";

type Accounts = {
  auctionHouse: PublicKey;
  authority: PublicKey;
  bettor: PublicKey;
  treasuryMint: PublicKey;
};

type Args = {
  program: FlipperProgram;
  results: number;
};

export default async function flipIx(
  { auctionHouse, authority, bettor, treasuryMint }: Accounts,
  { results, program }: Args
): Promise<TransactionInstruction> {
  const [bettorInfo] = await findBettorInfoPda(
    bettor,
    treasuryMint,
    program.programId
  );

  const bettorInfoAccount = await program.account.bettorInfo.fetch(bettorInfo);

  return program.methods
    .flip(bettorInfoAccount.bets, results)
    .accounts({
      auctionHouse,
      authority,
      bettor,
      bettorInfo,
      treasuryMint,
    })
    .instruction();
}
