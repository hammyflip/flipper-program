import { AnchorProvider, Idl, Program, web3 } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { Flipper, FlipperProgram, FLIPPER_IDL } from "generated";
import createAuctionHouseIx from "sdk/instructions/createAuctionHouseIx";
import createBettorInfoIx from "sdk/instructions/createBettorInfoIx";
import placeBetIx from "sdk/instructions/placeBetIx";
import updateAuctionHouseIx from "sdk/instructions/updateAuctionHouseIx";
import withdrawFromTreasuryIx from "sdk/instructions/withdrawFromTreasuryIx";
import invariant from "tiny-invariant";
import AnchorWallet from "types/AnchorWallet";
import Environment from "types/enums/Environment";
import getAccountsForEnvironment from "utils/getAccountsForEnvironment";
import findAuctionHousePda from "utils/pdas/findAuctionHousePda";
import findAuctionHouseTreasuryPda from "utils/pdas/findAuctionHouseTreasuryPda";
import findBettorInfoPaymentAccountPda from "utils/pdas/findBettorInfoPaymentAccountPda";
import findBettorInfoPda from "utils/pdas/findBettorInfoPda";
import getWalletIfNativeElseAta from "utils/solana/getWalletIfNativeElseAta";
import ixToTx from "utils/solana/ixToTx";

export default class FlipperSdk {
  private _connection: Connection;

  private _idl: Idl = FLIPPER_IDL;

  public program: FlipperProgram;

  private _authority: PublicKey;

  constructor({
    authority,
    connection,
    environment,
    wallet,
  }: {
    authority: PublicKey;
    connection: Connection;
    environment: Environment;
    wallet: AnchorWallet;
  }) {
    this._connection = connection;

    const accounts = getAccountsForEnvironment(environment);

    this._authority = authority ?? accounts.authority;

    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: "recent",
    });

    this.program = new Program<Flipper>(
      FLIPPER_IDL as any,
      accounts.programId,
      provider
    );
  }

  //
  // TRANSACTIONS
  //

  async createAuctionHouseTx(
    {
      payer,
      treasuryMint,
      treasuryWithdrawalDestination,
      treasuryWithdrawalDestinationOwner,
    }: {
      treasuryMint: PublicKey;
      payer: PublicKey;
      treasuryWithdrawalDestination: PublicKey;
      treasuryWithdrawalDestinationOwner: PublicKey;
    },
    {
      feeBasisPoints,
    }: {
      feeBasisPoints?: number;
    }
  ) {
    const ix = await createAuctionHouseIx(
      {
        authority: this._authority,
        payer,
        treasuryMint,
        treasuryWithdrawalDestination,
        treasuryWithdrawalDestinationOwner,
      },
      {
        feeBasisPoints,
        program: this.program,
      }
    );
    return ixToTx(ix);
  }

  async createBettorInfo({
    bettor,
    treasuryMint,
  }: {
    bettor: PublicKey;
    treasuryMint: PublicKey;
  }) {
    const ix = await createBettorInfoIx(
      {
        bettor,
        treasuryMint,
      },
      {
        program: this.program,
      }
    );
    return ixToTx(ix);
  }

  async placeBetTx(
    {
      bettor,
      creator,
      treasuryMint,
    }: {
      bettor: PublicKey;
      creator?: PublicKey;
      treasuryMint: PublicKey;
    },
    {
      amount,
      bets,
    }: {
      amount: number;
      bets: number;
    }
  ) {
    invariant(bets <= 256, "bets should be an 8-bit bitmask");
    const [auctionHouse] = await this.findAuctionHousePda(
      creator ?? this._authority,
      treasuryMint
    );
    const ix = await placeBetIx(
      {
        auctionHouse,
        bettor,
        paymentAccount: await getWalletIfNativeElseAta(bettor, treasuryMint),
        treasuryMint,
      },
      {
        amount,
        bets,
        program: this.program,
      }
    );
    return ixToTx(ix);
  }

  async updateAuctionHouseTx(
    {
      creator,
      newAuthority,
      treasuryMint,
      treasuryWithdrawalDestination,
      treasuryWithdrawalDestinationOwner,
    }: {
      creator?: PublicKey;
      newAuthority: PublicKey;
      treasuryMint: PublicKey;
      treasuryWithdrawalDestination: PublicKey;
      treasuryWithdrawalDestinationOwner: PublicKey;
    },
    {
      feeBasisPoints,
    }: {
      feeBasisPoints: number;
    }
  ) {
    const [auctionHouse] = await this.findAuctionHousePda(
      creator ?? this._authority,
      treasuryMint
    );
    const ix = await updateAuctionHouseIx(
      {
        auctionHouse,
        authority: this._authority,
        newAuthority,
        treasuryMint,
        treasuryWithdrawalDestination,
        treasuryWithdrawalDestinationOwner,
      },
      {
        feeBasisPoints,
        program: this.program,
      }
    );
    this._authority = newAuthority;
    return ixToTx(ix);
  }

  async withdrawFromTreasury(
    {
      creator,
      treasuryMint,
      treasuryWithdrawalDestination,
    }: {
      creator?: PublicKey;
      treasuryMint: PublicKey;
      treasuryWithdrawalDestination: PublicKey;
    },
    {
      amount,
    }: {
      amount: number;
    }
  ) {
    const [auctionHouse] = await this.findAuctionHousePda(
      creator ?? this._authority,
      treasuryMint
    );
    const ix = await withdrawFromTreasuryIx(
      {
        auctionHouse,
        authority: this._authority,
        treasuryMint,
        treasuryWithdrawalDestination,
      },
      {
        amount,
        program: this.program,
      }
    );
    return ixToTx(ix);
  }

  //
  // FETCH ACCOUNTS
  //

  async fetchAuctionHouse(creator: PublicKey, treasuryMint: PublicKey) {
    const [auctionHouse] = await this.findAuctionHousePda(
      creator,
      treasuryMint
    );
    return {
      account: await this.program.account.auctionHouse.fetch(auctionHouse),
      pubkey: auctionHouse,
    };
  }

  async fetchBettorInfo(bettor: PublicKey, treasuryMint: PublicKey) {
    const [bettorInfo] = await this.findBettorInfoPda(bettor, treasuryMint);
    return {
      account: await this.program.account.bettorInfo.fetch(bettorInfo),
      pubkey: bettorInfo,
    };
  }

  //
  // PDAS
  //

  async findAuctionHousePda(creator: PublicKey, treasuryMint: PublicKey) {
    return findAuctionHousePda(creator, treasuryMint, this.program.programId);
  }

  async findAuctionHouseTreasuryPda(auctionHouse: PublicKey) {
    return findAuctionHouseTreasuryPda(auctionHouse, this.program.programId);
  }

  async findBettorInfoPaymentAccountPda(
    bettor: PublicKey,
    treasuryMint: PublicKey
  ) {
    return findBettorInfoPaymentAccountPda(
      bettor,
      treasuryMint,
      this.program.programId
    );
  }

  async findBettorInfoPda(bettor: PublicKey, treasuryMint: PublicKey) {
    return findBettorInfoPda(bettor, treasuryMint, this.program.programId);
  }
}
