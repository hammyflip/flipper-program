import { PublicKey, Transaction } from "@solana/web3.js";

type AnchorWallet = {
  publicKey: PublicKey;
  signAllTransactions(
    transactions: Array<Transaction>
  ): Promise<Array<Transaction>>;
  signTransaction(transaction: Transaction): Promise<Transaction>;
};

export default AnchorWallet;
