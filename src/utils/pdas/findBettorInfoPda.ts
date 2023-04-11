import { PublicKey } from "@solana/web3.js";
import { BETTOR_INFO } from "constants/PdaConstants";

export default async function findBettorInfoPda(
  bettor: PublicKey,
  treasuryMint: PublicKey,
  programId: PublicKey
) {
  return PublicKey.findProgramAddress(
    [Buffer.from(BETTOR_INFO), bettor.toBuffer(), treasuryMint.toBuffer()],
    programId
  );
}
