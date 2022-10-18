import { PublicKey } from "@solana/web3.js";
import { WRAPPED_SOL_MINT } from "constants/AccountConstants";
import arePublicKeysEqual from "utils/solana/arePublicKeysEqual";

export default function isNative(treasuryMint: PublicKey) {
  return arePublicKeysEqual(treasuryMint, WRAPPED_SOL_MINT);
}
