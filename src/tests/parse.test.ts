import { AnchorProvider, setProvider } from "@project-serum/anchor";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PartiallyDecodedInstruction,
  PublicKey,
} from "@solana/web3.js";
import { WRAPPED_SOL_MINT } from "constants/AccountConstants";
import parseCreateBettorInfoTx from "parse/parseCreateBettorInfoIx";
import parseFlipIx from "parse/parseFlipIx";
import parsePayoutIx from "parse/parsePayoutIx";
import parsePlaceBetIx from "parse/parsePlaceBetIx";
import FlipperSdk from "sdk/FlipperSdk";
import requestAirdrops from "tests/utils/requestAirdrops";
import sendTransactionForTest from "tests/utils/sendTransactionForTest";
import invariant from "tiny-invariant";
import Environment from "types/enums/Environment";

const AMOUNT = LAMPORTS_PER_SOL;
const AUTHORITY = Keypair.generate();
const BETS = 1;
const FEE_BASIS_POINTS = 300;
const TREASURY_MINT = WRAPPED_SOL_MINT;
const USER = Keypair.generate();

let auctionHouseAddress: PublicKey;
let auctionHouseTreasuryAddress: PublicKey;

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

async function getFirstAndOnlyIx(txid: string) {
  const parsedTx = await connection.getParsedTransaction(txid, "confirmed");
  const instructions = parsedTx!.transaction.message.instructions;
  expect(instructions.length).toEqual(1);
  return instructions[0];
}

describe("Instruction parsing tests", () => {
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

  it("Parse create_bettor_info ix", async () => {
    const tx = await sdk.createBettorInfoTx({
      bettor: USER.publicKey,
      treasuryMint: TREASURY_MINT,
    });
    const txid = await sendTransactionForTest(connection, tx, [USER]);
    const ix = await getFirstAndOnlyIx(txid);
    const parsedIx = parseCreateBettorInfoTx(ix as PartiallyDecodedInstruction);

    expect(parsedIx).not.toBeNull();
    invariant(parsedIx != null);

    const ixAccounts = parsedIx.accounts;
    expect(ixAccounts.bettor.toString()).toEqual(USER.publicKey.toString());
    expect(ixAccounts.treasuryMint.toString()).toEqual(
      TREASURY_MINT.toString()
    );
  });

  it("Parse place_bet ix", async () => {
    const numFlips = 1;

    const tx = await sdk.placeBetTx(
      {
        bettor: USER.publicKey,
        treasuryMint: TREASURY_MINT,
      },
      {
        amount: AMOUNT,
        bets: BETS,
        numFlips,
      }
    );
    const txid = await sendTransactionForTest(connection, tx, [USER]);
    const ix = await getFirstAndOnlyIx(txid);
    const parsedIx = parsePlaceBetIx(ix as PartiallyDecodedInstruction);

    expect(parsedIx).not.toBeNull();
    invariant(parsedIx != null);

    const { accounts: ixAccounts, data: ixData } = parsedIx;
    expect(ixAccounts.bettor.toString()).toEqual(USER.publicKey.toString());
    expect(ixAccounts.treasuryMint.toString()).toEqual(
      TREASURY_MINT.toString()
    );

    expect(ixData.amount).toEqual(AMOUNT);
    expect(ixData.bets).toEqual(BETS);
    expect(ixData.numFlips).toEqual(numFlips);
  });

  it("Parse flip ix", async () => {
    const results = 1;

    const tx = await sdk.flipTx(
      {
        bettor: USER.publicKey,
        treasuryMint: TREASURY_MINT,
      },
      {
        results,
      }
    );
    const txid = await sendTransactionForTest(connection, tx, [AUTHORITY]);
    const ix = await getFirstAndOnlyIx(txid);
    const parsedIx = parseFlipIx(ix as PartiallyDecodedInstruction);

    expect(parsedIx).not.toBeNull();
    invariant(parsedIx != null);

    const { accounts: ixAccounts, data: ixData } = parsedIx;
    expect(ixAccounts.bettor.toString()).toEqual(USER.publicKey.toString());
    expect(ixAccounts.treasuryMint.toString()).toEqual(
      TREASURY_MINT.toString()
    );

    expect(ixData.bets).toEqual(BETS);
    expect(ixData.results).toEqual(results);
  });

  it("Parse payout ix", async () => {
    const tx = await sdk.payoutTx({
      bettor: USER.publicKey,
      treasuryMint: TREASURY_MINT,
    });
    const txid = await sendTransactionForTest(connection, tx, [AUTHORITY]);

    const ix = await getFirstAndOnlyIx(txid);
    const parsedIx = parsePayoutIx(ix as PartiallyDecodedInstruction);

    expect(parsedIx).not.toBeNull();
    invariant(parsedIx != null);

    const { accounts: ixAccounts } = parsedIx;
    expect(ixAccounts.bettor.toString()).toEqual(USER.publicKey.toString());
    expect(ixAccounts.treasuryMint.toString()).toEqual(
      TREASURY_MINT.toString()
    );
  });
});
