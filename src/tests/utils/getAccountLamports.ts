import { Connection, PublicKey } from "@solana/web3.js";
import { Undef } from "types/UtilityTypes";

export default async function getAccountLamports(
  connection: Connection,
  pubkey: PublicKey
): Promise<number> {
  return (await connection.getAccountInfo(pubkey))!.lamports;
}
