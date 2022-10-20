import { AnchorProvider, setProvider } from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import { WRAPPED_SOL_MINT } from "constants/AccountConstants";
import FlipperSdk from "sdk/FlipperSdk";
import getAccountLamports from "tests/utils/getAccountLamports";
import requestAirdrops from "tests/utils/requestAirdrops";
import sendTransactionForTest from "tests/utils/sendTransactionForTest";
import Environment from "types/enums/Environment";

const AUTHORITY = Keypair.generate();
const NEW_AUTHORITY = Keypair.generate();
const USER = Keypair.generate();
const TREASURY_MINT = WRAPPED_SOL_MINT;

describe("Auction House tests, treasury mint = SOL", () => {
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
    await requestAirdrops(connection, [AUTHORITY, NEW_AUTHORITY, USER]);
  });

  it("Create auction house", async () => {
    const feeBasisPoints = 300;

    const tx = await sdk.createAuctionHouseTx(
      {
        payer: USER.publicKey,
        treasuryMint: TREASURY_MINT,
        treasuryWithdrawalDestination: AUTHORITY.publicKey,
        treasuryWithdrawalDestinationOwner: AUTHORITY.publicKey,
      },
      { feeBasisPoints }
    );

    await sendTransactionForTest(connection, tx, [USER]);

    const { account: auctionHouseAccount, pubkey: auctionHousePubkey } =
      await sdk.fetchAuctionHouse(AUTHORITY.publicKey, TREASURY_MINT);
    const [auctionHouseTreasuryExpected] =
      await sdk.findAuctionHouseTreasuryPda(auctionHousePubkey);
    const { authority, creator, treasuryMint, auctionHouseTreasury } =
      auctionHouseAccount;
    expect(authority.toString()).toEqual(AUTHORITY.publicKey.toString());
    expect(creator.toString()).toEqual(AUTHORITY.publicKey.toString());
    expect(treasuryMint.toString()).toEqual(TREASURY_MINT.toString());
    expect(auctionHouseAccount.treasuryMint.toString()).toEqual(
      TREASURY_MINT.toString()
    );
    expect(auctionHouseTreasury.toString()).toEqual(
      auctionHouseTreasuryExpected.toString()
    );
    expect(
      auctionHouseAccount.treasuryWithdrawalDestination.toString()
    ).toEqual(AUTHORITY.publicKey.toString());
    expect(auctionHouseAccount.feeBasisPoints).toEqual(feeBasisPoints);
  });

  it("Update auction house", async () => {
    const updatedFeeBasisPoints = 500;
    const tx = await sdk.updateAuctionHouseTx(
      {
        newAuthority: NEW_AUTHORITY.publicKey,
        treasuryMint: TREASURY_MINT,
        treasuryWithdrawalDestination: AUTHORITY.publicKey,
        treasuryWithdrawalDestinationOwner: AUTHORITY.publicKey,
      },
      { feeBasisPoints: updatedFeeBasisPoints }
    );

    await sendTransactionForTest(connection, tx, [AUTHORITY]);

    const { account: auctionHouseAccount } = await sdk.fetchAuctionHouse(
      AUTHORITY.publicKey,
      TREASURY_MINT
    );
    const { authority, creator, treasuryMint } = auctionHouseAccount;
    expect(authority.toString()).toEqual(NEW_AUTHORITY.publicKey.toString());
    expect(creator.toString()).toEqual(AUTHORITY.publicKey.toString());
    expect(auctionHouseAccount.feeBasisPoints).toEqual(updatedFeeBasisPoints);
    expect(treasuryMint.toString()).toEqual(TREASURY_MINT.toString());
  });

  it("Withdraw from treasury", async () => {
    // First, send some money to the treasury
    const [auctionHouse] = await sdk.findAuctionHousePda(
      AUTHORITY.publicKey,
      TREASURY_MINT
    );
    const [auctionHouseTreasury] = await sdk.findAuctionHouseTreasuryPda(
      auctionHouse
    );

    await requestAirdrops(connection, [auctionHouseTreasury]);
    const treasuryLamportsBefore = await getAccountLamports(
      connection,
      auctionHouseTreasury
    );
    const authorityLamportsBefore = await getAccountLamports(
      connection,
      AUTHORITY.publicKey
    );

    // Then withdraw
    const amount = 1;
    const tx = await sdk.withdrawFromTreasury(
      {
        creator: AUTHORITY.publicKey,
        treasuryMint: TREASURY_MINT,
        treasuryWithdrawalDestination: AUTHORITY.publicKey,
      },
      { amount: 1 }
    );
    await sendTransactionForTest(connection, tx, [NEW_AUTHORITY]);

    // Make sure lamports were withdrawn
    const treasuryLamportsAfter = await getAccountLamports(
      connection,
      auctionHouseTreasury
    );
    const authorityLamportsAfter = await getAccountLamports(
      connection,
      AUTHORITY.publicKey
    );

    expect(treasuryLamportsAfter - treasuryLamportsBefore).toEqual(-amount);
    expect(authorityLamportsAfter - authorityLamportsBefore).toEqual(amount);
  });
});
