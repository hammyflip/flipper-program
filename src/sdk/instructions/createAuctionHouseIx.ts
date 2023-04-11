import { web3 } from "@project-serum/anchor";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "constants/ProgramIds";
import { FlipperProgram } from "generated";
import findAuctionHousePda from "utils/pdas/findAuctionHousePda";
import findAuctionHouseTreasuryPda from "utils/pdas/findAuctionHouseTreasuryPda";

type Accounts = {
  authority: PublicKey;
  payer: PublicKey;
  treasuryMint: PublicKey;
  treasuryWithdrawalDestination: PublicKey;
  treasuryWithdrawalDestinationOwner: PublicKey;
};

type Args = {
  feeBasisPoints?: number;
  program: FlipperProgram;
};

export default async function createAuctionHouseIx(
  {
    authority,
    payer,
    treasuryMint,
    treasuryWithdrawalDestination,
    treasuryWithdrawalDestinationOwner,
  }: Accounts,
  { feeBasisPoints = 300, program }: Args
): Promise<TransactionInstruction> {
  const [auctionHouse, auctionHouseBump] = await findAuctionHousePda(
    authority,
    treasuryMint,
    program.programId
  );

  const [auctionHouseTreasury, auctionHouseTreasuryBump] =
    await findAuctionHouseTreasuryPda(auctionHouse, program.programId);

  return program.methods
    .createAuctionHouse(
      auctionHouseBump,
      auctionHouseTreasuryBump,
      feeBasisPoints
    )
    .accounts({
      ataProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      auctionHouse,
      auctionHouseTreasury,
      authority,
      payer,
      rent: web3.SYSVAR_RENT_PUBKEY,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      treasuryMint,
      treasuryWithdrawalDestination,
      treasuryWithdrawalDestinationOwner,
    })
    .instruction();
}
