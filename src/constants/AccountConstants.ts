import { PublicKey } from "@solana/web3.js";
import Environment from "types/enums/Environment";

export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);

const AUTHORITY_DEV = new PublicKey(
  "authyWritV3BSybcBdkQc1fMaQ7ycidrvYiRKvtjbec"
);
const AUTHORITY_MAINNET = new PublicKey(
  "auth6FQ5A3YM8YR77w8XzrCaTk4sSnUGAcNmPVtHMZT.json"
);

export const AUTHORITIES = {
  [Environment.Development]: AUTHORITY_DEV,
  [Environment.Local]: AUTHORITY_DEV,
  [Environment.Testnet]: AUTHORITY_DEV,
  [Environment.Production]: AUTHORITY_MAINNET,
};
