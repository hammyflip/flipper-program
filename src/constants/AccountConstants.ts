import { PublicKey } from "@solana/web3.js";

type Accounts = {
  authority: PublicKey;
  programId: PublicKey;
};

export const LOCALNET_ACCOUNTS: Accounts = {
  authority: PublicKey.default,
  programId: new PublicKey("hamRNY1AjpqcjKqHHMi6ump7rSJafQSKKVKCFzC5oQ7"),
};

export const TESTNET_ACCOUNTS: Accounts = {
  // TODO: fill in
  authority: new PublicKey("dcfg6CukQFmVzXdYu31wmTM6d6rvVXhnMEn1dzpCGco"),
  programId: new PublicKey("hamRNY1AjpqcjKqHHMi6ump7rSJafQSKKVKCFzC5oQ7"),
};

export const DEVNET_ACCOUNTS: Accounts = {
  // TODO: fill in
  authority: new PublicKey("dcfg6CukQFmVzXdYu31wmTM6d6rvVXhnMEn1dzpCGco"),
  programId: new PublicKey("hamRNY1AjpqcjKqHHMi6ump7rSJafQSKKVKCFzC5oQ7"),
};

export const MAINNET_ACCOUNTS: Accounts = {
  // TODO: fill in
  authority: new PublicKey("2VC3M7t1Uj63yxPvrFKNCa9A14F3AVXujdjTHUATzxb8"),
  programId: new PublicKey("hamRNY1AjpqcjKqHHMi6ump7rSJafQSKKVKCFzC5oQ7"),
};

export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);
