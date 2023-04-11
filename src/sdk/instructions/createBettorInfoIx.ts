import { web3 } from "@project-serum/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { FlipperProgram } from "generated";
import findBettorInfoPda from "utils/pdas/findBettorInfoPda";

type Accounts = {
  bettor: PublicKey;
  treasuryMint: PublicKey;
};

type Args = {
  program: FlipperProgram;
};

export default async function createBettorInfoIx(
  { bettor, treasuryMint }: Accounts,
  { program }: Args
): Promise<TransactionInstruction> {
  const [bettorInfo] = await findBettorInfoPda(
    bettor,
    treasuryMint,
    program.programId
  );

  return program.methods
    .createBettorInfo()
    .accounts({
      bettor,
      bettorInfo,
      rent: web3.SYSVAR_RENT_PUBKEY,
      systemProgram: web3.SystemProgram.programId,
      treasuryMint,
    })
    .instruction();
}
