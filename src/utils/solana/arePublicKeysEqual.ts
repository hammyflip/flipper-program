import { PublicKey } from "@solana/web3.js";

export default function arePublicKeysEqual(
  pubkey1: PublicKey | string,
  pubkey2: PublicKey | string
): boolean {
  return pubkey1.toString() === pubkey2.toString();
}
