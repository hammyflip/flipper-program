import { PublicKey } from "@solana/web3.js";

type Accounts = {
  authority: PublicKey;
  programId: PublicKey;
};

export const LOCALNET_ACCOUNTS: Accounts = {
  authority: PublicKey.default,
  programId: new PublicKey("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"),
};

export const TESTNET_ACCOUNTS: Accounts = {
  // TODO: fill in
  authority: new PublicKey("dcfg6CukQFmVzXdYu31wmTM6d6rvVXhnMEn1dzpCGco"),
  // TODO: fill in
  programId: new PublicKey("dgumN6t8fDjoHAbb1K4ySqcP2sWJHaqX9JLNQMDPT9U"),
};

export const DEVNET_ACCOUNTS: Accounts = {
  // TODO: fill in
  authority: new PublicKey("dcfg6CukQFmVzXdYu31wmTM6d6rvVXhnMEn1dzpCGco"),
  // TODO: fill in
  programId: new PublicKey("dgumN6t8fDjoHAbb1K4ySqcP2sWJHaqX9JLNQMDPT9U"),
};

export const MAINNET_ACCOUNTS: Accounts = {
  // TODO: fill in
  authority: new PublicKey("2VC3M7t1Uj63yxPvrFKNCa9A14F3AVXujdjTHUATzxb8"),
  // TODO: fill in
  programId: new PublicKey("gum8aDxTHP5HSXxQzVHDdSQJGUQFLreGDX2cUa133tk"),
};

export const WRAPPED_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);
