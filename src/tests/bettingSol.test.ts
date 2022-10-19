import { setProvider, AnchorProvider } from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import { WRAPPED_SOL_MINT } from "constants/AccountConstants";
import FlipperSdk from "sdk/FlipperSdk";
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
});
