import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

export default async function requestAirdrops(
  connection: Connection,
  wallets: Array<Keypair | PublicKey>
) {
  await Promise.all(
    wallets.map(async (wallet) => {
      const airdrop = await connection.requestAirdrop(
        "publicKey" in wallet ? wallet.publicKey : wallet,
        50 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdrop, "confirmed");
    })
  );
}
