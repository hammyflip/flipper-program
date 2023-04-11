import { PublicKey } from "@solana/web3.js";
import { AUCTION_HOUSE } from "constants/PdaConstants";

export default async function findAuctionHousePda(
  creator: PublicKey,
  treasuryMint: PublicKey,
  programId: PublicKey
) {
  return PublicKey.findProgramAddress(
    [Buffer.from(AUCTION_HOUSE), creator.toBuffer(), treasuryMint.toBuffer()],
    programId
  );
}
