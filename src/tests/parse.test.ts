import {
  AnchorProvider,
  setProvider,
  toInstruction,
} from "@project-serum/anchor";
import {
  Keypair,
  PartiallyDecodedInstruction,
  PublicKey,
} from "@solana/web3.js";
import { WRAPPED_SOL_MINT } from "constants/AccountConstants";
import parseCreateBettorInfoTx from "parse/parseCreateBettorInfoIx";
import FlipperSdk from "sdk/FlipperSdk";
import requestAirdrops from "tests/utils/requestAirdrops";
import sendTransactionForTest from "tests/utils/sendTransactionForTest";
import invariant from "tiny-invariant";
import Environment from "types/enums/Environment";

const AUTHORITY = Keypair.generate();
const FEE_BASIS_POINTS = 300;
const TREASURY_MINT = WRAPPED_SOL_MINT;
const USER = Keypair.generate();

let auctionHouseAddress: PublicKey;
let auctionHouseTreasuryAddress: PublicKey;

describe("Instruction parsing tests", () => {
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
    const parsedTx = await connection.getParsedTransaction(txid, "confirmed");
    const instructions = parsedTx!.transaction.message.instructions;
    expect(instructions.length).toEqual(1);
    const ix = instructions[0];
    const parsedIx = parseCreateBettorInfoTx(ix as PartiallyDecodedInstruction);

    expect(parsedIx).not.toBeNull();
    invariant(parsedIx != null);

    expect(parsedIx.bettor.toString()).toEqual(USER.publicKey.toString());
    expect(parsedIx.treasuryMint.toString()).toEqual(TREASURY_MINT.toString());
  });
});
