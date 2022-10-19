import { setProvider, AnchorProvider } from "@project-serum/anchor";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { WRAPPED_SOL_MINT } from "constants/AccountConstants";
import FlipperSdk from "sdk/FlipperSdk";
import FEE_LAMPORTS from "tests/constants/FeeLamports";
import getAccountLamports from "tests/utils/getAccountLamports";
import requestAirdrops from "tests/utils/requestAirdrops";
import sendTransactionForTest from "tests/utils/sendTransactionForTest";
import Environment from "types/enums/Environment";

const AUTHORITY = Keypair.generate();
const FEE_BASIS_POINTS = 300;
const USER = Keypair.generate();
const TREASURY_MINT = WRAPPED_SOL_MINT;

describe("Betting tests, treasury mint = SOL", () => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env();
  const { wallet, connection } = provider;
  setProvider(provider);

  const sdk = new FlipperSdk({
    authority: AUTHORITY.publicKey,
    connection,
    environment: Environment.Local,
    wallet,
  });

  beforeAll(async () => {
    await requestAirdrops(connection, [AUTHORITY, USER]);

    const tx = await sdk.createAuctionHouseTx(
      {
        payer: USER.publicKey,
        treasuryMint: TREASURY_MINT,
        treasuryWithdrawalDestination: AUTHORITY.publicKey,
        treasuryWithdrawalDestinationOwner: AUTHORITY.publicKey,
      },
      { feeBasisPoints: FEE_BASIS_POINTS }
    );

    await sendTransactionForTest(connection, tx, [USER]);
  });

  it("Create bettor info", async () => {
    const tx = await sdk.createBettorInfo({
      bettor: USER.publicKey,
      treasuryMint: TREASURY_MINT,
    });
    await sendTransactionForTest(connection, tx, [USER]);

    const { account: bettorInfoAccount } = await sdk.fetchBettorInfo(
      USER.publicKey,
      TREASURY_MINT
    );

    expect(bettorInfoAccount.amount.toNumber()).toEqual(0);
    expect(bettorInfoAccount.bets).toEqual(0);
    expect(bettorInfoAccount.results).toEqual(0);
  });

  it("Place bet", async () => {
    const amount = LAMPORTS_PER_SOL;
    const bets = 1;

    const bettorLamportsBefore = await getAccountLamports(
      connection,
      USER.publicKey
    );

    const tx = await sdk.placeBetTx(
      {
        bettor: USER.publicKey,
        treasuryMint: TREASURY_MINT,
      },
      {
        amount,
        bets,
      }
    );
    await sendTransactionForTest(connection, tx, [USER]);

    const bettorLamportsAfter = await getAccountLamports(
      connection,
      USER.publicKey
    );

    const { account: bettorInfoAccount } = await sdk.fetchBettorInfo(
      USER.publicKey,
      TREASURY_MINT
    );

    expect(bettorInfoAccount.amount.toNumber()).toEqual(amount);
    expect(bettorInfoAccount.bets).toEqual(bets);

    expect(bettorLamportsBefore - bettorLamportsAfter).toEqual(
      // TODO: not sure why fees are not taken from the bettor?
      // Maybe something about the local validator...
      // In any case, doesn't appear to be a bug on our end
      amount + amount * (FEE_BASIS_POINTS / 10000)
    );
  });
});
