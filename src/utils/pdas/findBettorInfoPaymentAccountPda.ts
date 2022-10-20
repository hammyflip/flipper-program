import { PublicKey } from "@solana/web3.js";
import { BETTOR_INFO_PAYMENT_ACCOUNT } from "constants/PdaConstants";

export default async function findBettorInfoPaymentAccountPda(
  bettor: PublicKey,
  treasuryMint: PublicKey,
  programId: PublicKey
) {
  return PublicKey.findProgramAddress(
    [
      Buffer.from(BETTOR_INFO_PAYMENT_ACCOUNT),
      bettor.toBuffer(),
      treasuryMint.toBuffer(),
    ],
    programId
  );
}
