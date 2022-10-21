import { AnchorProvider, setProvider } from "@project-serum/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { WRAPPED_SOL_MINT } from "constants/AccountConstants";
import FlipperSdk from "sdk/FlipperSdk";
import expectToThrow from "tests/utils/expectToThrow";
import getAccountLamports from "tests/utils/getAccountLamports";
import requestAirdrops from "tests/utils/requestAirdrops";
import sendTransactionForTest from "tests/utils/sendTransactionForTest";
import Environment from "types/enums/Environment";

const AMOUNT = LAMPORTS_PER_SOL;
const AUTHORITY = Keypair.generate();
const FEE_BASIS_POINTS = 300;
const USER = Keypair.generate();
const TREASURY_MINT = WRAPPED_SOL_MINT;
let auctionHouseAddress: PublicKey;
let auctionHouseTreasuryAddress: PublicKey;

describe("Betting tests, treasury mint = SOL", () => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env();
  const { wallet, connection } = provider;
  setProvider(provider);

  const sdk = new FlipperSdk({
    authority: AUTHORITY.publicKey,
    connection,
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

    [auctionHouseAddress] = await sdk.findAuctionHousePda(
      AUTHORITY.publicKey,
      TREASURY_MINT
    );
    [auctionHouseTreasuryAddress] = await sdk.findAuctionHouseTreasuryPda(
      auctionHouseAddress
    );
    await requestAirdrops(connection, [auctionHouseTreasuryAddress]);
  });

  it("Create bettor info", async () => {
    const tx = await sdk.createBettorInfoTx({
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
    const bets = 1;
    const numFlips = 1;

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
        amount: AMOUNT,
        bets,
        numFlips,
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

    expect(bettorInfoAccount.amount.toNumber()).toEqual(AMOUNT);
    expect(bettorInfoAccount.bets).toEqual(bets);
    expect(bettorInfoAccount.numFlips).toEqual(numFlips);
    expect(bettorInfoAccount.results).toEqual(0);

    expect(bettorLamportsBefore - bettorLamportsAfter).toEqual(
      // TODO: not sure why fees are not taken from the bettor?
      // Maybe something about the local validator...
      // In any case, doesn't appear to be a bug on our end
      AMOUNT + AMOUNT * (FEE_BASIS_POINTS / 10000)
    );
  });

  it("Flip", async () => {
    const results = 1;
    const tx = await sdk.flipTx(
      {
        bettor: USER.publicKey,
        treasuryMint: TREASURY_MINT,
      },
      { results }
    );
    await expectToThrow(
      () => sendTransactionForTest(connection, tx, [USER]),
      "Signature verification failed"
    );

    await sendTransactionForTest(connection, tx, [AUTHORITY]);
    const { account: bettorInfoAccount } = await sdk.fetchBettorInfo(
      USER.publicKey,
      TREASURY_MINT
    );
    expect(bettorInfoAccount.results).toEqual(results);
  });

  it("Payout (bettor wins)", async () => {
    const tx = await sdk.payoutTx({
      bettor: USER.publicKey,
      treasuryMint: TREASURY_MINT,
    });
    await expectToThrow(
      () => sendTransactionForTest(connection, tx, [USER]),
      "Signature verification failed"
    );

    const bettorLamportsBefore = await getAccountLamports(
      connection,
      USER.publicKey
    );
    const treasuryLamportsBefore = await getAccountLamports(
      connection,
      auctionHouseTreasuryAddress
    );

    await sendTransactionForTest(connection, tx, [AUTHORITY]);

    const bettorLamportsAfter = await getAccountLamports(
      connection,
      USER.publicKey
    );
    const treasuryLamportsAfter = await getAccountLamports(
      connection,
      auctionHouseTreasuryAddress
    );

    expect(bettorLamportsAfter - bettorLamportsBefore).toEqual(AMOUNT * 2);
    expect(treasuryLamportsAfter - treasuryLamportsBefore).toEqual(-AMOUNT);

    const { account: bettorInfoAccount } = await sdk.fetchBettorInfo(
      USER.publicKey,
      TREASURY_MINT
    );

    expect(bettorInfoAccount.amount.toNumber()).toEqual(0);
    expect(bettorInfoAccount.bets).toEqual(0);
    expect(bettorInfoAccount.numFlips).toEqual(0);
    expect(bettorInfoAccount.results).toEqual(0);
  });

  it("Payout (bettor loses)", async () => {
    const bets = 1;
    const results = 0;
    const numFlips = 1;

    const placeBetTx = await sdk.placeBetTx(
      {
        bettor: USER.publicKey,
        treasuryMint: TREASURY_MINT,
      },
      {
        amount: AMOUNT,
        bets,
        numFlips,
      }
    );
    await sendTransactionForTest(connection, placeBetTx, [USER]);

    const flipTx = await sdk.flipTx(
      {
        bettor: USER.publicKey,
        treasuryMint: TREASURY_MINT,
      },
      { results }
    );
    await sendTransactionForTest(connection, flipTx, [AUTHORITY]);

    const bettorLamportsBefore = await getAccountLamports(
      connection,
      USER.publicKey
    );
    const treasuryLamportsBefore = await getAccountLamports(
      connection,
      auctionHouseTreasuryAddress
    );

    const payoutTx = await sdk.payoutTx({
      bettor: USER.publicKey,
      treasuryMint: TREASURY_MINT,
    });
    await sendTransactionForTest(connection, payoutTx, [AUTHORITY]);

    const bettorLamportsAfter = await getAccountLamports(
      connection,
      USER.publicKey
    );
    const treasuryLamportsAfter = await getAccountLamports(
      connection,
      auctionHouseTreasuryAddress
    );

    expect(bettorLamportsAfter - bettorLamportsBefore).toEqual(0);
    expect(treasuryLamportsAfter - treasuryLamportsBefore).toEqual(AMOUNT);
  });
});
