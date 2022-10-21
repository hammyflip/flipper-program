import { PublicKey } from "@solana/web3.js";
import { FLIPPER_PROGRAM_ID } from "constants/ProgramIds";

type Accounts = {
  authority: PublicKey;
  programId: PublicKey;
};

export const LOCALNET_ACCOUNTS: Accounts = {
  authority: PublicKey.default,
  programId: FLIPPER_PROGRAM_ID,
};

export const TESTNET_ACCOUNTS: Accounts = {
  // TODO: fill in
  authority: new PublicKey("dcfg6CukQFmVzXdYu31wmTM6d6rvVXhnMEn1dzpCGco"),
  programId: FLIPPER_PROGRAM_ID,
};

export const DEVNET_ACCOUNTS: Accounts = {
  // TODO: fill in
  authority: new PublicKey("dcfg6CukQFmVzXdYu31wmTM6d6rvVXhnMEn1dzpCGco"),
  programId: FLIPPER_PROGRAM_ID,
};

export const MAINNET_ACCOUNTS: Accounts = {
  // TODO: fill in
  authority: new PublicKey("2VC3M7t1Uj63yxPvrFKNCa9A14F3AVXujdjTHUATzxb8"),
  programId: FLIPPER_PROGRAM_ID,
};

export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);
