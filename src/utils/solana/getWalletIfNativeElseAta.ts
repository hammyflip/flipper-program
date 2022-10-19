import { PublicKey } from "@solana/web3.js";
import findAtaPda from "utils/pdas/findAtaPda";
import isNative from "utils/solana/isNative";

export default async function getWalletIfNativeElseAta(
  wallet: PublicKey,
  treasuryMint: PublicKey
) {
  if (isNative(treasuryMint)) {
    return wallet;
  }

  const [ata] = await findAtaPda(wallet, treasuryMint);
  return ata;
}
