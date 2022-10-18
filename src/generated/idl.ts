import { Idl } from "@project-serum/anchor";

const FLIPPER_IDL: Idl = {
  version: "0.1.0",
  name: "flipper_program",
  instructions: [
    {
      name: "createAuctionHouse",
      accounts: [
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "treasuryMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "treasuryWithdrawalDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "treasuryWithdrawalDestinationOwner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "auctionHouse",
          isMut: true,
          isSigner: false,
        },
        {
          name: "auctionHouseTreasury",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "ataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "auctionHouseBump",
          type: "u8",
        },
        {
          name: "treasuryBump",
          type: "u8",
        },
        {
          name: "feeBasisPoints",
          type: "u16",
        },
      ],
    },
    {
      name: "createBettorInfo",
      accounts: [
        {
          name: "bettor",
          isMut: true,
          isSigner: true,
        },
        {
          name: "bettorInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "treasuryMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "flip",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "bettor",
          isMut: false,
          isSigner: false,
        },
        {
          name: "treasuryMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "bettorInfo",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "results",
          type: "u8",
        },
      ],
    },
    {
      name: "payout",
      accounts: [
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "bettor",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bettorPaymentAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "treasuryMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "bettorInfo",
          isMut: true,
          isSigner: false,
        },
        {
          name: "bettorInfoPaymentAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "auctionHouse",
          isMut: false,
          isSigner: false,
        },
        {
          name: "auctionHouseTreasury",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "bettorInfoPaymentAccountBump",
          type: "u8",
        },
      ],
    },
    {
      name: "placeBet",
      accounts: [
        {
          name: "bettor",
          isMut: true,
          isSigner: true,
        },
        {
          name: "bettorInfo",
          isMut: false,
          isSigner: false,
        },
        {
          name: "treasuryMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "bettorInfoPaymentAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "paymentAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "transferAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "bettorInfoPaymentAccountBump",
          type: "u8",
        },
      ],
    },
    {
      name: "updateAuctionHouse",
      accounts: [
        {
          name: "treasuryMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "newAuthority",
          isMut: false,
          isSigner: false,
        },
        {
          name: "treasuryWithdrawalDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "treasuryWithdrawalDestinationOwner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "auctionHouse",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "ataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "feeBasisPoints",
          type: {
            option: "u16",
          },
        },
      ],
    },
    {
      name: "withdrawFromTreasury",
      accounts: [
        {
          name: "treasuryMint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "authority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "treasuryWithdrawalDestination",
          isMut: true,
          isSigner: false,
        },
        {
          name: "auctionHouseTreasury",
          isMut: true,
          isSigner: false,
        },
        {
          name: "auctionHouse",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "AuctionHouse",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "creator",
            type: "publicKey",
          },
          {
            name: "treasuryMint",
            type: "publicKey",
          },
          {
            name: "auctionHouseTreasury",
            type: "publicKey",
          },
          {
            name: "treasuryWithdrawalDestination",
            type: "publicKey",
          },
          {
            name: "feeBasisPoints",
            type: "u16",
          },
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "treasuryBump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "BettorInfo",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "bets",
            type: "u8",
          },
          {
            name: "results",
            type: "u8",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidBasisPoints",
      msg: "BP must be less than or equal to 10000",
    },
    {
      code: 6001,
      name: "InvalidBettorInfoAmount",
      msg: "BetterInfo amount must be greater than 0",
    },
    {
      code: 6002,
      name: "UninitializedAccount",
      msg: "UninitializedAccount",
    },
    {
      code: 6003,
      name: "PublicKeyMismatch",
      msg: "PublicKeyMismatch",
    },
    {
      code: 6004,
      name: "IncorrectOwner",
      msg: "IncorrectOwner",
    },
  ],
};

export default FLIPPER_IDL;
