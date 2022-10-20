import { PublicKey } from "@solana/web3.js";
import { TREASURY } from "constants/PdaConstants";

export default async function findAuctionHouseTreasuryPda(
  auctionHouse: PublicKey,
  programId: PublicKey
): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from(TREASURY), auctionHouse.toBuffer()],
    programId
  );
}
