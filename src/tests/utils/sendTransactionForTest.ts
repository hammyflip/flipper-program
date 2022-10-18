import {
  ConfirmOptions,
  Connection,
  sendAndConfirmTransaction,
  Signer,
  Transaction,
  TransactionSignature,
} from "@solana/web3.js";
import { IS_DEBUG } from "tests/setup/setup";

/**
 * A wrapper around sendAndConfirmTransaction which logs errors if the
 * tests are run in DEBUG mode. Without this the error.logs output from
 * the Solana Program is suppressed which leaves the errors almost useless.
 */
export default async function sendTransactionForTest(
  connection: Connection,
  transaction: Transaction,
  signers: Array<Signer>,
  options?: ConfirmOptions
): Promise<TransactionSignature> {
  try {
    // NOTE: We need to await here to catch if the returned Promise rejects.
    return await sendAndConfirmTransaction(
      connection,
      transaction,
      signers,
      options
    );
  } catch (err) {
    if (IS_DEBUG) {
      console.error(err);
    }

    throw err;
  }
}
