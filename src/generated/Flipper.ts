export type FlipperProgram = {
  accounts: [
    {
      name: "auctionHouse";
      type: {
        fields: [
          {
            name: "authority";
            type: "publicKey";
          },
          {
            name: "creator";
            type: "publicKey";
          },
          {
            name: "treasuryMint";
            type: "publicKey";
          },
          {
            name: "auctionHouseTreasury";
            type: "publicKey";
          },
          {
            name: "treasuryWithdrawalDestination";
            type: "publicKey";
          },
          {
            name: "feeBasisPoints";
            type: "u16";
          },
          {
            name: "bump";
            type: "u8";
          },
          {
            name: "treasuryBump";
            type: "u8";
          }
        ];
        kind: "struct";
      };
    },
    {
      name: "bettorInfo";
      type: {
        fields: [
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "bets";
            type: "u8";
          },
          {
            name: "results";
            type: "u8";
          },
          {
            name: "numFlips";
            type: "u8";
          }
        ];
        kind: "struct";
      };
    }
  ];
  errors: [
    {
      code: 6000;
      msg: "BP must be less than or equal to 10000";
      name: "InvalidBasisPoints";
    },
    {
      code: 6001;
      msg: "UninitializedAccount";
      name: "UninitializedAccount";
    },
    {
      code: 6002;
      msg: "PublicKeyMismatch";
      name: "PublicKeyMismatch";
    },
    {
      code: 6003;
      msg: "IncorrectOwner";
      name: "IncorrectOwner";
    },
    {
      code: 6004;
      msg: "You are only allowed to place one bet at a time";
      name: "MultipleBetsNotAllowed";
    },
    {
      code: 6005;
      msg: "Bet amounts must be greater than 0";
      name: "InvalidBetAmount";
    },
    {
      code: 6006;
      msg: "Number of flips must equal 1";
      name: "InvalidNumFlips";
    },
    {
      code: 6007;
      msg: "Invalid value for bets (may not match on-chain data)";
      name: "InvalidBets";
    }
  ];
  instructions: [
    {
      accounts: [
        {
          isMut: true;
          isSigner: false;
          name: "auctionHouse";
        },
        {
          isMut: true;
          isSigner: false;
          name: "auctionHouseTreasury";
        },
        {
          isMut: false;
          isSigner: false;
          name: "authority";
        },
        {
          isMut: true;
          isSigner: true;
          name: "payer";
        },
        {
          isMut: false;
          isSigner: false;
          name: "treasuryMint";
        },
        {
          isMut: true;
          isSigner: false;
          name: "treasuryWithdrawalDestination";
        },
        {
          isMut: false;
          isSigner: false;
          name: "treasuryWithdrawalDestinationOwner";
        },
        {
          isMut: false;
          isSigner: false;
          name: "ataProgram";
        },
        {
          isMut: false;
          isSigner: false;
          name: "systemProgram";
        },
        {
          isMut: false;
          isSigner: false;
          name: "tokenProgram";
        },
        {
          isMut: false;
          isSigner: false;
          name: "rent";
        }
      ];
      args: [
        {
          name: "auctionHouseBump";
          type: "u8";
        },
        {
          name: "treasuryBump";
          type: "u8";
        },
        {
          name: "feeBasisPoints";
          type: "u16";
        }
      ];
      name: "createAuctionHouse";
    },
    {
      accounts: [
        {
          isMut: true;
          isSigner: true;
          name: "bettor";
        },
        {
          isMut: true;
          isSigner: false;
          name: "bettorInfo";
        },
        {
          isMut: false;
          isSigner: false;
          name: "treasuryMint";
        },
        {
          isMut: false;
          isSigner: false;
          name: "systemProgram";
        },
        {
          isMut: false;
          isSigner: false;
          name: "rent";
        }
      ];
      args: [];
      name: "createBettorInfo";
    },
    {
      accounts: [
        {
          isMut: false;
          isSigner: false;
          name: "auctionHouse";
        },
        {
          isMut: false;
          isSigner: true;
          name: "authority";
        },
        {
          isMut: false;
          isSigner: false;
          name: "bettor";
        },
        {
          isMut: true;
          isSigner: false;
          name: "bettorInfo";
        },
        {
          isMut: false;
          isSigner: false;
          name: "treasuryMint";
        }
      ];
      args: [
        {
          name: "bets";
          type: "u8";
        },
        {
          name: "results";
          type: "u8";
        }
      ];
      name: "flip";
    },
    {
      accounts: [
        {
          isMut: false;
          isSigner: false;
          name: "auctionHouse";
        },
        {
          isMut: true;
          isSigner: false;
          name: "auctionHouseTreasury";
        },
        {
          isMut: false;
          isSigner: true;
          name: "authority";
        },
        {
          isMut: true;
          isSigner: false;
          name: "bettor";
        },
        {
          isMut: true;
          isSigner: false;
          name: "bettorInfo";
        },
        {
          isMut: true;
          isSigner: false;
          name: "bettorInfoPaymentAccount";
        },
        {
          isMut: true;
          isSigner: false;
          name: "bettorPaymentAccount";
        },
        {
          isMut: false;
          isSigner: false;
          name: "treasuryMint";
        },
        {
          isMut: false;
          isSigner: false;
          name: "systemProgram";
        },
        {
          isMut: false;
          isSigner: false;
          name: "tokenProgram";
        }
      ];
      args: [
        {
          name: "bettorInfoPaymentAccountBump";
          type: "u8";
        }
      ];
      name: "payout";
    },
    {
      accounts: [
        {
          isMut: false;
          isSigner: false;
          name: "auctionHouse";
        },
        {
          isMut: true;
          isSigner: false;
          name: "auctionHouseTreasury";
        },
        {
          isMut: true;
          isSigner: true;
          name: "bettor";
        },
        {
          isMut: true;
          isSigner: false;
          name: "bettorInfo";
        },
        {
          isMut: true;
          isSigner: false;
          name: "bettorInfoPaymentAccount";
        },
        {
          isMut: true;
          isSigner: false;
          name: "bettorPaymentAccount";
        },
        {
          isMut: false;
          isSigner: false;
          name: "transferAuthority";
        },
        {
          isMut: false;
          isSigner: false;
          name: "treasuryMint";
        },
        {
          isMut: false;
          isSigner: false;
          name: "systemProgram";
        },
        {
          isMut: false;
          isSigner: false;
          name: "tokenProgram";
        },
        {
          isMut: false;
          isSigner: false;
          name: "rent";
        }
      ];
      args: [
        {
          name: "bettorInfoPaymentAccountBump";
          type: "u8";
        },
        {
          name: "bets";
          type: "u8";
        },
        {
          name: "amount";
          type: "u64";
        },
        {
          name: "numFlips";
          type: "u8";
        }
      ];
      name: "placeBet";
    },
    {
      accounts: [
        {
          isMut: false;
          isSigner: false;
          name: "treasuryMint";
        },
        {
          isMut: false;
          isSigner: true;
          name: "authority";
        },
        {
          isMut: false;
          isSigner: false;
          name: "newAuthority";
        },
        {
          isMut: true;
          isSigner: false;
          name: "treasuryWithdrawalDestination";
        },
        {
          isMut: false;
          isSigner: false;
          name: "treasuryWithdrawalDestinationOwner";
        },
        {
          isMut: true;
          isSigner: false;
          name: "auctionHouse";
        },
        {
          isMut: false;
          isSigner: false;
          name: "tokenProgram";
        },
        {
          isMut: false;
          isSigner: false;
          name: "systemProgram";
        },
        {
          isMut: false;
          isSigner: false;
          name: "ataProgram";
        },
        {
          isMut: false;
          isSigner: false;
          name: "rent";
        }
      ];
      args: [
        {
          name: "feeBasisPoints";
          type: {
            option: "u16";
          };
        }
      ];
      name: "updateAuctionHouse";
    },
    {
      accounts: [
        {
          isMut: true;
          isSigner: false;
          name: "auctionHouseTreasury";
        },
        {
          isMut: true;
          isSigner: false;
          name: "auctionHouse";
        },
        {
          isMut: false;
          isSigner: true;
          name: "authority";
        },
        {
          isMut: false;
          isSigner: false;
          name: "treasuryMint";
        },
        {
          isMut: true;
          isSigner: false;
          name: "treasuryWithdrawalDestination";
        },
        {
          isMut: false;
          isSigner: false;
          name: "systemProgram";
        },
        {
          isMut: false;
          isSigner: false;
          name: "tokenProgram";
        }
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        }
      ];
      name: "withdrawFromTreasury";
    }
  ];
  name: "flipper_program";
  version: "0.1.0";
};

export const IDL: FlipperProgram = {
  accounts: [
    {
      name: "auctionHouse",
      type: {
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
        kind: "struct",
      },
    },
    {
      name: "bettorInfo",
      type: {
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
          {
            name: "numFlips",
            type: "u8",
          },
        ],
        kind: "struct",
      },
    },
  ],
  errors: [
    {
      code: 6000,
      msg: "BP must be less than or equal to 10000",
      name: "InvalidBasisPoints",
    },
    {
      code: 6001,
      msg: "UninitializedAccount",
      name: "UninitializedAccount",
    },
    {
      code: 6002,
      msg: "PublicKeyMismatch",
      name: "PublicKeyMismatch",
    },
    {
      code: 6003,
      msg: "IncorrectOwner",
      name: "IncorrectOwner",
    },
    {
      code: 6004,
      msg: "You are only allowed to place one bet at a time",
      name: "MultipleBetsNotAllowed",
    },
    {
      code: 6005,
      msg: "Bet amounts must be greater than 0",
      name: "InvalidBetAmount",
    },
    {
      code: 6006,
      msg: "Number of flips must equal 1",
      name: "InvalidNumFlips",
    },
    {
      code: 6007,
      msg: "Invalid value for bets (may not match on-chain data)",
      name: "InvalidBets",
    },
  ],
  instructions: [
    {
      accounts: [
        {
          isMut: true,
          isSigner: false,
          name: "auctionHouse",
        },
        {
          isMut: true,
          isSigner: false,
          name: "auctionHouseTreasury",
        },
        {
          isMut: false,
          isSigner: false,
          name: "authority",
        },
        {
          isMut: true,
          isSigner: true,
          name: "payer",
        },
        {
          isMut: false,
          isSigner: false,
          name: "treasuryMint",
        },
        {
          isMut: true,
          isSigner: false,
          name: "treasuryWithdrawalDestination",
        },
        {
          isMut: false,
          isSigner: false,
          name: "treasuryWithdrawalDestinationOwner",
        },
        {
          isMut: false,
          isSigner: false,
          name: "ataProgram",
        },
        {
          isMut: false,
          isSigner: false,
          name: "systemProgram",
        },
        {
          isMut: false,
          isSigner: false,
          name: "tokenProgram",
        },
        {
          isMut: false,
          isSigner: false,
          name: "rent",
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
      name: "createAuctionHouse",
    },
    {
      accounts: [
        {
          isMut: true,
          isSigner: true,
          name: "bettor",
        },
        {
          isMut: true,
          isSigner: false,
          name: "bettorInfo",
        },
        {
          isMut: false,
          isSigner: false,
          name: "treasuryMint",
        },
        {
          isMut: false,
          isSigner: false,
          name: "systemProgram",
        },
        {
          isMut: false,
          isSigner: false,
          name: "rent",
        },
      ],
      args: [],
      name: "createBettorInfo",
    },
    {
      accounts: [
        {
          isMut: false,
          isSigner: false,
          name: "auctionHouse",
        },
        {
          isMut: false,
          isSigner: true,
          name: "authority",
        },
        {
          isMut: false,
          isSigner: false,
          name: "bettor",
        },
        {
          isMut: true,
          isSigner: false,
          name: "bettorInfo",
        },
        {
          isMut: false,
          isSigner: false,
          name: "treasuryMint",
        },
      ],
      args: [
        {
          name: "bets",
          type: "u8",
        },
        {
          name: "results",
          type: "u8",
        },
      ],
      name: "flip",
    },
    {
      accounts: [
        {
          isMut: false,
          isSigner: false,
          name: "auctionHouse",
        },
        {
          isMut: true,
          isSigner: false,
          name: "auctionHouseTreasury",
        },
        {
          isMut: false,
          isSigner: true,
          name: "authority",
        },
        {
          isMut: true,
          isSigner: false,
          name: "bettor",
        },
        {
          isMut: true,
          isSigner: false,
          name: "bettorInfo",
        },
        {
          isMut: true,
          isSigner: false,
          name: "bettorInfoPaymentAccount",
        },
        {
          isMut: true,
          isSigner: false,
          name: "bettorPaymentAccount",
        },
        {
          isMut: false,
          isSigner: false,
          name: "treasuryMint",
        },
        {
          isMut: false,
          isSigner: false,
          name: "systemProgram",
        },
        {
          isMut: false,
          isSigner: false,
          name: "tokenProgram",
        },
      ],
      args: [
        {
          name: "bettorInfoPaymentAccountBump",
          type: "u8",
        },
      ],
      name: "payout",
    },
    {
      accounts: [
        {
          isMut: false,
          isSigner: false,
          name: "auctionHouse",
        },
        {
          isMut: true,
          isSigner: false,
          name: "auctionHouseTreasury",
        },
        {
          isMut: true,
          isSigner: true,
          name: "bettor",
        },
        {
          isMut: true,
          isSigner: false,
          name: "bettorInfo",
        },
        {
          isMut: true,
          isSigner: false,
          name: "bettorInfoPaymentAccount",
        },
        {
          isMut: true,
          isSigner: false,
          name: "bettorPaymentAccount",
        },
        {
          isMut: false,
          isSigner: false,
          name: "transferAuthority",
        },
        {
          isMut: false,
          isSigner: false,
          name: "treasuryMint",
        },
        {
          isMut: false,
          isSigner: false,
          name: "systemProgram",
        },
        {
          isMut: false,
          isSigner: false,
          name: "tokenProgram",
        },
        {
          isMut: false,
          isSigner: false,
          name: "rent",
        },
      ],
      args: [
        {
          name: "bettorInfoPaymentAccountBump",
          type: "u8",
        },
        {
          name: "bets",
          type: "u8",
        },
        {
          name: "amount",
          type: "u64",
        },
        {
          name: "numFlips",
          type: "u8",
        },
      ],
      name: "placeBet",
    },
    {
      accounts: [
        {
          isMut: false,
          isSigner: false,
          name: "treasuryMint",
        },
        {
          isMut: false,
          isSigner: true,
          name: "authority",
        },
        {
          isMut: false,
          isSigner: false,
          name: "newAuthority",
        },
        {
          isMut: true,
          isSigner: false,
          name: "treasuryWithdrawalDestination",
        },
        {
          isMut: false,
          isSigner: false,
          name: "treasuryWithdrawalDestinationOwner",
        },
        {
          isMut: true,
          isSigner: false,
          name: "auctionHouse",
        },
        {
          isMut: false,
          isSigner: false,
          name: "tokenProgram",
        },
        {
          isMut: false,
          isSigner: false,
          name: "systemProgram",
        },
        {
          isMut: false,
          isSigner: false,
          name: "ataProgram",
        },
        {
          isMut: false,
          isSigner: false,
          name: "rent",
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
      name: "updateAuctionHouse",
    },
    {
      accounts: [
        {
          isMut: true,
          isSigner: false,
          name: "auctionHouseTreasury",
        },
        {
          isMut: true,
          isSigner: false,
          name: "auctionHouse",
        },
        {
          isMut: false,
          isSigner: true,
          name: "authority",
        },
        {
          isMut: false,
          isSigner: false,
          name: "treasuryMint",
        },
        {
          isMut: true,
          isSigner: false,
          name: "treasuryWithdrawalDestination",
        },
        {
          isMut: false,
          isSigner: false,
          name: "systemProgram",
        },
        {
          isMut: false,
          isSigner: false,
          name: "tokenProgram",
        },
      ],
      args: [
        {
          name: "amount",
          type: "u64",
        },
      ],
      name: "withdrawFromTreasury",
    },
  ],
  name: "flipper_program",
  version: "0.1.0",
};
