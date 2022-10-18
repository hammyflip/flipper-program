import { web3 } from "@project-serum/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "constants/ProgramIds";
import { FlipperProgram } from "generated";

type Accounts = {
  auctionHouse: PublicKey;
  authority: PublicKey;
  newAuthority: PublicKey;
  treasuryMint: PublicKey;
  treasuryWithdrawalDestination: PublicKey;
  treasuryWithdrawalDestinationOwner: PublicKey;
};

type Args = {
  feeBasisPoints: number;
  program: FlipperProgram;
};

export default async function updateAuctionHouseIx(
  {
    auctionHouse,
    authority,
    newAuthority,
    treasuryMint,
    treasuryWithdrawalDestination,
    treasuryWithdrawalDestinationOwner,
  }: Accounts,
  { feeBasisPoints, program }: Args
): Promise<TransactionInstruction> {
  return program.methods
    .updateAuctionHouse(feeBasisPoints)
    .accounts({
      auctionHouse,
      authority,
      newAuthority,
      treasuryMint,
      treasuryWithdrawalDestination,
      treasuryWithdrawalDestinationOwner,
      ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: web3.SYSVAR_RENT_PUBKEY,
    })
    .instruction();
}
