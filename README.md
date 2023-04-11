![](hammyflip-banner.jpg)

<div align="center">
  <h1>Hammyflip: A Solana Coin Flip Program</h1>
  <a href="#overview">Overview</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#repo-structure">Repo Structure</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#development">Development</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#deployment">Deployment</a>
  <br />
  <hr />
</div>

## Overview

This is the Solana program that powers [hammyflip.com](https://hammyflip.com/). 

- **Devnet address**: `hamRNY1AjpqcjKqHHMi6ump7rSJafQSKKVKCFzC5oQ7`
- **Live website (uses devnet)**: [hammyflip.com](https://hammyflip.com/)
- **[Frontend code for Hammyflip](https://github.com/hammyflip/flipper-frontend)**
- **[Backend code for Hammyflip](https://github.com/hammyflip/flipper-api)**


This Solana program implements a coin flipping app. Each coin flip is broken up into 2 transactions, and each transaction contains at most 2 instructions.

- Transaction 1
    - Instruction 1 [optional]: `create_bettor_info`. Creates a `BettorInfo` account, which is a PDA of `[bettor,treasury_mint]` (so that arbitrary SPL tokens, and not just SOL, can be supported). If the `BettorInfo` account already exists, this instruction can be omitted.
    - Instruction 2: `place_bet`. This modifies the `BettorInfo` account with the bettor's bet, and transfers funds from the bettor to an escrow account.
    - Signers: `bettor`
- Transaction 2
    - Instruction 1: `flip`. This modifies the `BettorInfo` account with the result of the coin flip. The `results` argument is calculated randomly **off-chain** (see [here](https://github.com/hammyflip/flipper-api/blob/main/src/api/post/processFlip.ts#L99) for more details).
    - Instruction 2: `payout`. This will either transfer the escrowed amount to the bettor or the treasury account depending on `BettorInfo.results` and `BettorInfo.bets`.
    - Signers: `authority`

2 transactions are used instead of just 1 to prevent people from [gaming the system](https://ethernaut.openzeppelin.com/level/3). For example, if the same transaction was responsible for placing the bet, determining the result, and sending the payout, it would be possible for someone to simulate the transaction before sending it to determine if they would win or lose. While it's possible to mitigate this issue, separating the flow into 2 transactions is the most foolproof way to make things secure.

### Accounts
- **`AuctionHouse`**: This account stores settings that will be applied to all coinflips for a given currency, like the fee percentage and the treasury withdrawal destination. A new `AuctionHouse` account should be created for each supported currency. For example, if you only need to support SOL coin flips, you can create a single auction house where `AuctionHouse.treasury_mint` is the native mint. If you want to support SPL token coin flips, you can create more auction houses where `AuctionHouse.treasury_mint` is set to the SPL token mint.  `AuctionHouse.fee_basis_points` controls the fees taken for each flip. For example, if `AuctionHouse.fee_basis_points` is `300`, then betting 1 SOL will charge the bettor an additional .03 SOL. Since each currency has a unique `AuctionHouse` account, each currency can charage a different fee.
- **`BettorInfo`**: This account stores information about a specific bettor—for example, when a bettor flips a coin, `BettorInfo.bets` is populated with their guess. A new `BettorInfo` account is created for each combination of bettor and treasury mint. For example, the first time a user does a SOL coin flip, a `BettorInfo` account will be created. If they do another SOL coin flip, the existing `BettorInfo` account will be used. The account's address is a PDA of `bettor` and `treasury_mint`.

### Instructions
- `create_auction_house`: This instruction creates a new `AuctionHouse` account.
- `create_bettor_info`: This instruction creates a new `BettorInfo` account.
- `place_bet`: This instruction modifies the `BettorInfo` account with the bettor's bet, and transfers funds from the bettor to an escrow account.
- `flip`: This instruction writes the results of a coin flip to the `BettorInfo` account.
- `payout`: This instruction will either transfer the escrowed amount to the bettor or the treasury account depending on `BettorInfo.results` and `BettorInfo.bets`. 
- `update_auction_house`: This instruction updates the auction house account, e.g. with different fees.
- `withdraw_from_treasury`: This instruction withdraws from the program's treasury.

## Repo Structure

This repo contains the Solana program source code and the source code for a TypeScript SDK, in addition to some client-side program tests written in TypeScript.

```.
├── keys                # Program keypairs
├── programs            # Solana program source code
├── scripts             # Some helper bash scripts
├── src                 # TypeScript source folder
│   ├── generated       # Generated program IDL and type definitions
│   ├── sdk             # Gumdrop program TypeScript SDK
│   └── tests           # Program tests
├── ...                 # Other misc. project config files
└── README.md
```

## Development

Use the same version of Anchor CLI as `.github/workflows/release-package.yml`

I.e. run `avm use 0.24.2`

### Prerequisites

- Install Rust, Solana, Anchor: https://book.anchor-lang.com/chapter_2/installation.html
  - Helpful [resources for installing on M1 Mac](https://twitter.com/friedbrioche/status/1494075962874499075)
- Install the [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools#use-solanas-install-tool)


### Setup Steps

1. Run `yarn`
2. Run `yarn test`

If everything is set up correctly, all tests should pass and you should be ready to start developing!

## Deployment

### Solana Program

Run `yarn deploy-program devnet`.

### TypeScript SDK

Follow the following steps to publish a new version of the TypeScript SDK:

1. Run `yarn version` and enter a new appropriate [semver version](https://docs.npmjs.com/about-semantic-versioning) for the npm package. That will create a new tag and commit.
2. Run `git push origin NEW_TAG`.
3. `git push` the new commit as well.

This will push the new release tag to GitHub and trigger the release pipeline, after which clients can install the latest SDK with `yarn add @hammyflip/flipper-sdk@latest`.