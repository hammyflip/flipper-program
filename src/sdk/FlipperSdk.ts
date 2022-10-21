import { AnchorProvider, Idl, Program } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { FLIPPER_PROGRAM_ID } from "constants/ProgramIds";
import { Flipper, FLIPPER_IDL, FlipperProgram } from "generated";
import createAuctionHouseIx from "sdk/instructions/createAuctionHouseIx";
import createBettorInfoIx from "sdk/instructions/createBettorInfoIx";
import flipIx from "sdk/instructions/flipIx";
import payoutIx from "sdk/instructions/payoutIx";
import placeBetIx from "sdk/instructions/placeBetIx";
import updateAuctionHouseIx from "sdk/instructions/updateAuctionHouseIx";
import withdrawFromTreasuryIx from "sdk/instructions/withdrawFromTreasuryIx";
import invariant from "tiny-invariant";
import AnchorWallet from "types/AnchorWallet";
import findAuctionHousePda from "utils/pdas/findAuctionHousePda";
import findAuctionHouseTreasuryPda from "utils/pdas/findAuctionHouseTreasuryPda";
import findBettorInfoPaymentAccountPda from "utils/pdas/findBettorInfoPaymentAccountPda";
import findBettorInfoPda from "utils/pdas/findBettorInfoPda";
import getWalletIfNativeElseAta from "utils/solana/getWalletIfNativeElseAta";
import ixToTx from "utils/solana/ixToTx";

export default class FlipperSdk {
  private _connection: Connection;

  public program: FlipperProgram;

  private _authority: PublicKey;

  constructor({
    authority,
    connection,
    wallet,
  }: {
    authority: PublicKey;
    connection: Connection;
    wallet: AnchorWallet;
  }) {
    this._connection = connection;

    this._authority = authority ?? authority;

    const provider = new AnchorProvider(connection, wallet, {
      preflightCommitment: "recent",
    });

    this.program = new Program<Flipper>(
      FLIPPER_IDL as any,
      FLIPPER_PROGRAM_ID,
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
      payer: PublicKey;
      treasuryMint: PublicKey;
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

  async createBettorInfoTx({
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

  async flipTx(
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
      results,
    }: {
      results: number;
    }
  ) {
    const [auctionHouse] = await this.findAuctionHousePda(
      creator ?? this._authority,
      treasuryMint
    );
    const ix = await flipIx(
      {
        auctionHouse,
        authority: this._authority,
        bettor,
        treasuryMint,
      },
      {
        program: this.program,
        results,
      }
    );
    return ixToTx(ix);
  }

  async payoutTx({
    bettor,
    creator,
    treasuryMint,
  }: {
    bettor: PublicKey;
    creator?: PublicKey;
    treasuryMint: PublicKey;
  }) {
    const [auctionHouse] = await this.findAuctionHousePda(
      creator ?? this._authority,
      treasuryMint
    );
    const ix = await payoutIx(
      {
        auctionHouse,
        authority: this._authority,
        bettor,
        bettorPaymentAccount: await getWalletIfNativeElseAta(
          bettor,
          treasuryMint
        ),
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
      numFlips,
    }: {
      amount: number;
      bets: number;
      numFlips: number;
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
        bettorPaymentAccount: await getWalletIfNativeElseAta(
          bettor,
          treasuryMint
        ),
        treasuryMint,
      },
      {
        amount,
        bets,
        numFlips,
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
