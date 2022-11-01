pub mod utils;

use {
    crate::utils::*,
    anchor_lang::{
        prelude::*,
        solana_program::{
            program::{invoke, invoke_signed},
            system_instruction,
        },
        AnchorDeserialize, AnchorSerialize,
    },
    anchor_spl::{
        associated_token::AssociatedToken,
        token::{Mint, Token},
    },
};

declare_id!("hamRNY1AjpqcjKqHHMi6ump7rSJafQSKKVKCFzC5oQ7");

const AUCTION_HOUSE: &str = "auction_house";
const BETTOR_INFO: &str = "bettor_info";
const BETTOR_INFO_PAYMENT_ACCOUNT: &str = "bettor_info_payment_account";
const TREASURY: &str = "treasury";

#[program]
pub mod flipper_program {
    use super::*;

    pub fn create_auction_house<'info>(
        ctx: Context<'_, '_, '_, 'info, CreateAuctionHouse<'info>>,
        auction_house_bump: u8,
        treasury_bump: u8,
        fee_basis_points: u16,
    ) -> Result<()> {
        let payer = &ctx.accounts.payer;
        let authority = &ctx.accounts.authority;

        assert_valid_auction_house_authority(authority.key)?;

        let treasury_mint = &ctx.accounts.treasury_mint;
        let auction_house = &mut ctx.accounts.auction_house;
        let auction_house_treasury = &ctx.accounts.auction_house_treasury;
        let treasury_withdrawal_destination_owner =
            &ctx.accounts.treasury_withdrawal_destination_owner;
        let treasury_withdrawal_destination = &ctx.accounts.treasury_withdrawal_destination;

        let token_program = &ctx.accounts.token_program;
        let system_program = &ctx.accounts.system_program;
        let ata_program = &ctx.accounts.ata_program;
        let rent = &ctx.accounts.rent;

        if fee_basis_points > 10000 {
            return Err(ErrorCode::InvalidBasisPoints.into());
        }

        auction_house.bump = auction_house_bump;
        auction_house.treasury_bump = treasury_bump;
        auction_house.fee_basis_points = fee_basis_points;
        auction_house.authority = authority.key();
        auction_house.creator = authority.key();
        auction_house.treasury_mint = treasury_mint.key();
        auction_house.auction_house_treasury = auction_house_treasury.key();
        auction_house.treasury_withdrawal_destination = treasury_withdrawal_destination.key();

        let is_native = treasury_mint.key() == spl_token::native_mint::id();

        let ah_key = auction_house.key();

        let auction_house_treasury_seeds = [TREASURY.as_bytes(), ah_key.as_ref(), &[treasury_bump]];

        create_program_token_account_if_not_present(
            auction_house_treasury,
            system_program,
            &payer,
            token_program,
            &treasury_mint.to_account_info(),
            &auction_house.to_account_info(),
            rent,
            &auction_house_treasury_seeds,
            &[],
            is_native,
        )?;

        if !is_native {
            if treasury_withdrawal_destination.data_is_empty() {
                make_ata(
                    treasury_withdrawal_destination.to_account_info(),
                    treasury_withdrawal_destination_owner.to_account_info(),
                    treasury_mint.to_account_info(),
                    payer.to_account_info(),
                    ata_program.to_account_info(),
                    token_program.to_account_info(),
                    system_program.to_account_info(),
                    rent.to_account_info(),
                    &[],
                )?;
            }

            assert_is_ata(
                &treasury_withdrawal_destination.to_account_info(),
                &treasury_withdrawal_destination_owner.key(),
                &treasury_mint.key(),
            )?;
        } else {
            assert_keys_equal(
                treasury_withdrawal_destination.key(),
                treasury_withdrawal_destination_owner.key(),
            )?;
        }

        Ok(())
    }

    pub fn create_bettor_info<'info>(
        ctx: Context<'_, '_, '_, 'info, CreateBettorInfo<'info>>,
    ) -> Result<()> {
        let bettor_info = &mut ctx.accounts.bettor_info;
        bettor_info.amount = 0;
        bettor_info.bets = 0;
        bettor_info.results = 0;
        bettor_info.num_flips = 0;

        Ok(())
    }

    pub fn flip<'info>(
        ctx: Context<'_, '_, '_, 'info, Flip<'info>>,
        bets: u8,
        results: u8,
    ) -> Result<()> {
        let bettor_info = &mut ctx.accounts.bettor_info;

        if bettor_info.bets != bets {
            return Err(ErrorCode::InvalidBets.into());
        }

        msg!("bets {}", bets);
        msg!("results {}", results);
        bettor_info.results = results;

        Ok(())
    }

    pub fn payout<'info>(
        ctx: Context<'_, '_, '_, 'info, Payout<'info>>,
        bettor_info_payment_account_bump: u8,
    ) -> Result<()> {
        let bettor = &ctx.accounts.bettor;
        let bettor_payment_account = &ctx.accounts.bettor_payment_account;
        let bettor_info = &mut ctx.accounts.bettor_info;
        let bettor_info_payment_account = &ctx.accounts.bettor_info_payment_account;
        let treasury_mint = &ctx.accounts.treasury_mint;
        let token_program = &ctx.accounts.token_program;
        let auction_house_treasury = &ctx.accounts.auction_house_treasury;
        let auction_house = &ctx.accounts.auction_house;

        let system_program = &ctx.accounts.system_program;

        let is_native = treasury_mint.key() == spl_token::native_mint::id();

        if bettor_info.amount == 0 {
            return Err(ErrorCode::InvalidBetAmount.into());
        }

        let amount = bettor_info.amount;

        let bettor_key = bettor.key();
        let treasury_mint_key = treasury_mint.key();
        let bettor_info_payment_account_signer_seeds = [
            BETTOR_INFO_PAYMENT_ACCOUNT.as_bytes(),
            bettor_key.as_ref(),
            treasury_mint_key.as_ref(),
            &[bettor_info_payment_account_bump],
        ];
        let auction_house_key = auction_house.key();
        let auction_house_treasury_signer_seeds = [
            TREASURY.as_bytes(),
            auction_house_key.as_ref(),
            &[auction_house.treasury_bump],
        ];

        if bettor_info.bets == bettor_info.results {
            msg!("Bettor won!");
            // Pay bettor
            if is_native {
                invoke_signed(
                    &system_instruction::transfer(
                        &bettor_info_payment_account.key(),
                        &bettor.key(),
                        amount,
                    ),
                    &[
                        bettor_info_payment_account.to_account_info(),
                        bettor.to_account_info(),
                        system_program.to_account_info(),
                    ],
                    &[&bettor_info_payment_account_signer_seeds],
                )?;

                invoke_signed(
                    &system_instruction::transfer(
                        &auction_house_treasury.key(),
                        &bettor.key(),
                        amount,
                    ),
                    &[
                        auction_house_treasury.to_account_info(),
                        bettor.to_account_info(),
                        system_program.to_account_info(),
                    ],
                    &[&auction_house_treasury_signer_seeds],
                )?;
            } else {
                invoke_signed(
                    &spl_token::instruction::transfer(
                        token_program.key,
                        &bettor_info_payment_account.key(),
                        // TODO: assert ATA
                        &bettor_payment_account.key(),
                        &bettor_info.key(),
                        &[],
                        amount,
                    )?,
                    &[
                        bettor_info_payment_account.to_account_info(),
                        bettor_payment_account.to_account_info(),
                        token_program.to_account_info(),
                        bettor_info.to_account_info(),
                    ],
                    &[&bettor_info_payment_account_signer_seeds],
                )?;

                invoke_signed(
                    &spl_token::instruction::transfer(
                        token_program.key,
                        &auction_house_treasury.key(),
                        // TODO: assert ATA
                        &bettor_payment_account.key(),
                        &bettor_info.key(),
                        &[],
                        amount,
                    )?,
                    &[
                        auction_house_treasury.to_account_info(),
                        bettor_payment_account.to_account_info(),
                        token_program.to_account_info(),
                        bettor_info.to_account_info(),
                    ],
                    &[&auction_house_treasury_signer_seeds],
                )?;
            }
        } else {
            msg!("Bettor lost");
            // Pay treasury
            if is_native {
                invoke_signed(
                    &system_instruction::transfer(
                        &bettor_info_payment_account.key(),
                        &auction_house_treasury.key(),
                        amount,
                    ),
                    &[
                        bettor_info_payment_account.to_account_info(),
                        auction_house_treasury.to_account_info(),
                        system_program.to_account_info(),
                    ],
                    &[&bettor_info_payment_account_signer_seeds],
                )?;
            } else {
                invoke_signed(
                    &spl_token::instruction::transfer(
                        token_program.key,
                        &bettor_info_payment_account.key(),
                        // TODO: assert ATA
                        &auction_house_treasury.key(),
                        &bettor_info.key(),
                        &[],
                        amount,
                    )?,
                    &[
                        bettor_info_payment_account.to_account_info(),
                        auction_house_treasury.to_account_info(),
                        token_program.to_account_info(),
                        bettor_info.to_account_info(),
                    ],
                    &[&bettor_info_payment_account_signer_seeds],
                )?;
            }
        }

        bettor_info.amount = 0;
        bettor_info.bets = 0;
        bettor_info.results = 0;
        bettor_info.num_flips = 0;

        Ok(())
    }

    pub fn place_bet<'info>(
        ctx: Context<'_, '_, '_, 'info, PlaceBet<'info>>,
        bettor_info_payment_account_bump: u8,
        bets: u8,
        amount: u64,
        num_flips: u8,
    ) -> Result<()> {
        if amount == 0 {
            return Err(ErrorCode::InvalidBetAmount.into());
        }

        let bettor = &ctx.accounts.bettor;
        let bettor_info = &mut ctx.accounts.bettor_info;
        let bettor_info_payment_account = &ctx.accounts.bettor_info_payment_account;
        let bettor_payment_account = &ctx.accounts.bettor_payment_account;
        let treasury_mint = &ctx.accounts.treasury_mint;
        let token_program = &ctx.accounts.token_program;
        let transfer_authority = &ctx.accounts.transfer_authority;
        let auction_house = &ctx.accounts.auction_house;
        let auction_house_treasury = &ctx.accounts.auction_house_treasury;

        let system_program = &ctx.accounts.system_program;
        let rent = &ctx.accounts.rent;

        let is_native = treasury_mint.key() == spl_token::native_mint::id();
        let bettor_key = bettor.key();
        let treasury_mint_key = treasury_mint.key();
        let bettor_info_payment_account_signer_seeds = [
            BETTOR_INFO_PAYMENT_ACCOUNT.as_bytes(),
            bettor_key.as_ref(),
            treasury_mint_key.as_ref(),
            &[bettor_info_payment_account_bump],
        ];

        create_program_token_account_if_not_present(
            bettor_info_payment_account,
            system_program,
            bettor,
            token_program,
            &treasury_mint.to_account_info(),
            &bettor_info.to_account_info(),
            rent,
            &bettor_info_payment_account_signer_seeds,
            &[],
            is_native,
        )?;

        if bettor_info.amount > 0 {
            return Err(ErrorCode::MultipleBetsNotAllowed.into());
        }
        if num_flips != 1 {
            return Err(ErrorCode::InvalidNumFlips.into());
        }
        bettor_info.amount = amount;
        bettor_info.bets = bets;
        bettor_info.num_flips = num_flips;

        let fee_basis_points: u64 = auction_house.fee_basis_points.into();
        let fee_amount = (bettor_info.amount * fee_basis_points) / 10_000;

        if is_native {
            assert_keys_equal(bettor.key(), bettor_payment_account.key())?;

            invoke(
                &system_instruction::transfer(
                    &bettor_payment_account.key(),
                    &bettor_info_payment_account.key(),
                    bettor_info.amount,
                ),
                &[
                    bettor_payment_account.to_account_info(),
                    bettor_info_payment_account.to_account_info(),
                    system_program.to_account_info(),
                ],
            )?;

            invoke(
                &system_instruction::transfer(
                    &bettor_payment_account.key(),
                    &auction_house_treasury.key(),
                    fee_amount,
                ),
                &[
                    bettor_payment_account.to_account_info(),
                    auction_house_treasury.to_account_info(),
                    system_program.to_account_info(),
                ],
            )?;
        } else {
            invoke(
                &spl_token::instruction::transfer(
                    &token_program.key(),
                    &bettor_payment_account.key(),
                    &bettor_info_payment_account.key(),
                    &transfer_authority.key(),
                    &[],
                    bettor_info.amount,
                )?,
                &[
                    transfer_authority.to_account_info(),
                    bettor_payment_account.to_account_info(),
                    bettor_info_payment_account.to_account_info(),
                    token_program.to_account_info(),
                ],
            )?;

            invoke(
                &spl_token::instruction::transfer(
                    &token_program.key(),
                    &bettor_payment_account.key(),
                    &auction_house_treasury.key(),
                    &transfer_authority.key(),
                    &[],
                    fee_amount,
                )?,
                &[
                    transfer_authority.to_account_info(),
                    bettor_payment_account.to_account_info(),
                    auction_house_treasury.to_account_info(),
                    token_program.to_account_info(),
                ],
            )?;
        }

        Ok(())
    }

    pub fn update_auction_house<'info>(
        ctx: Context<'_, '_, '_, 'info, UpdateAuctionHouse<'info>>,
        fee_basis_points: Option<u16>,
    ) -> Result<()> {
        let treasury_mint = &ctx.accounts.treasury_mint;
        let authority = &ctx.accounts.authority;
        let new_authority = &ctx.accounts.new_authority;
        let auction_house = &mut ctx.accounts.auction_house;
        let treasury_withdrawal_destination_owner =
            &ctx.accounts.treasury_withdrawal_destination_owner;
        let treasury_withdrawal_destination = &ctx.accounts.treasury_withdrawal_destination;
        let token_program = &ctx.accounts.token_program;
        let system_program = &ctx.accounts.system_program;
        let ata_program = &ctx.accounts.ata_program;
        let rent = &ctx.accounts.rent;
        let is_native = treasury_mint.key() == spl_token::native_mint::id();

        if let Some(fbp) = fee_basis_points {
            if fbp > 10000 {
                return Err(ErrorCode::InvalidBasisPoints.into());
            }

            auction_house.fee_basis_points = fbp;
        }

        auction_house.authority = new_authority.key();
        auction_house.treasury_withdrawal_destination = treasury_withdrawal_destination.key();

        if !is_native {
            if treasury_withdrawal_destination.data_is_empty() {
                make_ata(
                    treasury_withdrawal_destination.to_account_info(),
                    treasury_withdrawal_destination_owner.to_account_info(),
                    treasury_mint.to_account_info(),
                    authority.to_account_info(),
                    ata_program.to_account_info(),
                    token_program.to_account_info(),
                    system_program.to_account_info(),
                    rent.to_account_info(),
                    &[],
                )?;
            }

            assert_is_ata(
                &treasury_withdrawal_destination.to_account_info(),
                &treasury_withdrawal_destination_owner.key(),
                &treasury_mint.key(),
            )?;
        } else {
            assert_keys_equal(
                treasury_withdrawal_destination.key(),
                treasury_withdrawal_destination_owner.key(),
            )?;
        }

        Ok(())
    }

    pub fn withdraw_from_treasury<'info>(
        ctx: Context<'_, '_, '_, 'info, WithdrawFromTreasury<'info>>,
        amount: u64,
    ) -> Result<()> {
        let treasury_mint = &ctx.accounts.treasury_mint;
        let treasury_withdrawal_destination = &ctx.accounts.treasury_withdrawal_destination;
        let auction_house_treasury = &ctx.accounts.auction_house_treasury;
        let auction_house = &ctx.accounts.auction_house;
        let token_program = &ctx.accounts.token_program;
        let system_program = &ctx.accounts.system_program;

        let is_native = treasury_mint.key() == spl_token::native_mint::id();
        let auction_house_seeds = [
            AUCTION_HOUSE.as_bytes(),
            auction_house.creator.as_ref(),
            auction_house.treasury_mint.as_ref(),
            &[auction_house.bump],
        ];

        let ah_key = auction_house.key();
        let auction_house_treasury_seeds = [
            TREASURY.as_bytes(),
            ah_key.as_ref(),
            &[auction_house.treasury_bump],
        ];
        if !is_native {
            invoke_signed(
                &spl_token::instruction::transfer(
                    token_program.key,
                    &auction_house_treasury.key(),
                    &treasury_withdrawal_destination.key(),
                    &auction_house.key(),
                    &[],
                    amount,
                )?,
                &[
                    auction_house_treasury.to_account_info(),
                    treasury_withdrawal_destination.to_account_info(),
                    token_program.to_account_info(),
                    auction_house.to_account_info(),
                ],
                &[&auction_house_seeds],
            )?;
        } else {
            invoke_signed(
                &system_instruction::transfer(
                    &auction_house_treasury.key(),
                    &treasury_withdrawal_destination.key(),
                    amount,
                ),
                &[
                    auction_house_treasury.to_account_info(),
                    treasury_withdrawal_destination.to_account_info(),
                    system_program.to_account_info(),
                ],
                &[&auction_house_treasury_seeds],
            )?;
        }

        Ok(())
    }
}

//
// INSTRUCTION ACCOUNTS
//

#[derive(Accounts)]
#[instruction(auction_house_bump: u8, treasury_bump: u8)]
pub struct CreateAuctionHouse<'info> {
    #[account(init, seeds=[AUCTION_HOUSE.as_bytes(), authority.key().as_ref(), treasury_mint.key().as_ref()], bump, space=AUCTION_HOUSE_SIZE, payer=payer)]
    auction_house: Account<'info, AuctionHouse>,
    #[account(mut, seeds=[TREASURY.as_bytes(), auction_house.key().as_ref()], bump=treasury_bump)]
    auction_house_treasury: UncheckedAccount<'info>,
    authority: UncheckedAccount<'info>,
    #[account(mut)]
    payer: Signer<'info>,
    treasury_mint: Account<'info, Mint>,
    #[account(mut)]
    treasury_withdrawal_destination: UncheckedAccount<'info>,
    treasury_withdrawal_destination_owner: UncheckedAccount<'info>,

    ata_program: Program<'info, AssociatedToken>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,

    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CreateBettorInfo<'info> {
    #[account(mut)]
    bettor: Signer<'info>,
    #[account(init, seeds=[BETTOR_INFO.as_bytes(), bettor.key().as_ref(), treasury_mint.key().as_ref()], bump, space=BETTOR_INFO_SIZE, payer=bettor)]
    bettor_info: Account<'info, BettorInfo>,
    treasury_mint: Account<'info, Mint>,

    system_program: Program<'info, System>,

    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Flip<'info> {
    #[account(seeds=[AUCTION_HOUSE.as_bytes(), auction_house.creator.as_ref(), treasury_mint.key().as_ref()], bump=auction_house.bump, has_one=authority, has_one=treasury_mint)]
    auction_house: Account<'info, AuctionHouse>,
    authority: Signer<'info>,
    bettor: UncheckedAccount<'info>,
    #[account(mut, seeds=[BETTOR_INFO.as_bytes(), bettor.key().as_ref(), treasury_mint.key().as_ref()], bump)]
    bettor_info: Account<'info, BettorInfo>,
    treasury_mint: Account<'info, Mint>,
}

#[derive(Accounts)]
#[instruction(bettor_info_payment_account_bump: u8)]
pub struct Payout<'info> {
    #[account(seeds=[AUCTION_HOUSE.as_bytes(), auction_house.creator.as_ref(), treasury_mint.key().as_ref()], bump=auction_house.bump, has_one=authority, has_one=treasury_mint)]
    auction_house: Account<'info, AuctionHouse>,
    #[account(mut, seeds=[TREASURY.as_bytes(), auction_house.key().as_ref()], bump=auction_house.treasury_bump)]
    auction_house_treasury: UncheckedAccount<'info>,
    authority: Signer<'info>,
    #[account(mut)]
    bettor: UncheckedAccount<'info>,
    #[account(mut, seeds=[BETTOR_INFO.as_bytes(), bettor.key().as_ref(), treasury_mint.key().as_ref()], bump)]
    bettor_info: Account<'info, BettorInfo>,
    #[account(mut, seeds=[BETTOR_INFO_PAYMENT_ACCOUNT.as_bytes(), bettor.key().as_ref(), treasury_mint.key().as_ref()], bump=bettor_info_payment_account_bump)]
    bettor_info_payment_account: UncheckedAccount<'info>,
    #[account(mut)]
    bettor_payment_account: UncheckedAccount<'info>,
    treasury_mint: Account<'info, Mint>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(bettor_info_payment_account_bump: u8)]
pub struct PlaceBet<'info> {
    #[account(seeds=[AUCTION_HOUSE.as_bytes(), auction_house.creator.as_ref(), treasury_mint.key().as_ref()], bump=auction_house.bump, has_one=treasury_mint)]
    auction_house: Account<'info, AuctionHouse>,
    #[account(mut, seeds=[TREASURY.as_bytes(), auction_house.key().as_ref()], bump=auction_house.treasury_bump)]
    auction_house_treasury: UncheckedAccount<'info>,
    #[account(mut)]
    bettor: Signer<'info>,
    #[account(mut, seeds=[BETTOR_INFO.as_bytes(), bettor.key().as_ref(), treasury_mint.key().as_ref()], bump)]
    bettor_info: Account<'info, BettorInfo>,
    #[account(mut, seeds=[BETTOR_INFO_PAYMENT_ACCOUNT.as_bytes(), bettor.key().as_ref(), treasury_mint.key().as_ref()], bump=bettor_info_payment_account_bump)]
    bettor_info_payment_account: UncheckedAccount<'info>,
    #[account(mut)]
    bettor_payment_account: UncheckedAccount<'info>,
    transfer_authority: UncheckedAccount<'info>,
    treasury_mint: Account<'info, Mint>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,

    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct UpdateAuctionHouse<'info> {
    treasury_mint: Account<'info, Mint>,
    authority: Signer<'info>,
    new_authority: UncheckedAccount<'info>,
    #[account(mut)]
    treasury_withdrawal_destination: UncheckedAccount<'info>,
    treasury_withdrawal_destination_owner: UncheckedAccount<'info>,
    #[account(mut, seeds=[AUCTION_HOUSE.as_bytes(), auction_house.creator.as_ref(), treasury_mint.key().as_ref()], bump=auction_house.bump, has_one=authority, has_one=treasury_mint)]
    auction_house: Account<'info, AuctionHouse>,
    token_program: Program<'info, Token>,
    system_program: Program<'info, System>,
    ata_program: Program<'info, AssociatedToken>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct WithdrawFromTreasury<'info> {
    #[account(mut, seeds=[TREASURY.as_bytes(), auction_house.key().as_ref()], bump=auction_house.treasury_bump)]
    auction_house_treasury: UncheckedAccount<'info>,
    #[account(mut, seeds=[AUCTION_HOUSE.as_bytes(), auction_house.creator.as_ref(), treasury_mint.key().as_ref()], bump=auction_house.bump, has_one=authority, has_one=treasury_mint, has_one=treasury_withdrawal_destination, has_one=auction_house_treasury)]
    auction_house: Account<'info, AuctionHouse>,
    authority: Signer<'info>,
    treasury_mint: Account<'info, Mint>,
    #[account(mut)]
    treasury_withdrawal_destination: UncheckedAccount<'info>,

    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
}

//
// ACCOUNT STRUCTS
//

#[account]
pub struct AuctionHouse {
    pub authority: Pubkey,
    pub creator: Pubkey,
    pub treasury_mint: Pubkey,
    pub auction_house_treasury: Pubkey,
    pub treasury_withdrawal_destination: Pubkey,
    pub fee_basis_points: u16,
    pub bump: u8,
    pub treasury_bump: u8,
}

pub const AUCTION_HOUSE_SIZE: usize = 8 + // discriminator
32 + // authority
32 + // creator
32 + // treasury mint
32 + // treasury
32 + // treasury_withdrawal_destination
2 + // fee basis points
1 + // bump
1 + // treasury_bump
128; //padding

#[account]
pub struct BettorInfo {
    pub amount: u64,
    // Bitmask of coin flip predictions. Least significant bit represents the first flip.
    pub bets: u8,
    // Bitmask of coin flip results. Least significant bit represents the first flip.
    pub results: u8,
    pub num_flips: u8,
}

pub const BETTOR_INFO_SIZE: usize = 8 + // discriminator
8 + // amount
1 + // bets
1 + // results
1 + // num_flips
32; // padding

//
// ERRORS
//

#[error_code]
pub enum ErrorCode {
    #[msg("BP must be less than or equal to 10000")]
    InvalidBasisPoints,
    #[msg("UninitializedAccount")]
    UninitializedAccount,
    #[msg("PublicKeyMismatch")]
    PublicKeyMismatch,
    #[msg("IncorrectOwner")]
    IncorrectOwner,
    #[msg("You are only allowed to place one bet at a time")]
    MultipleBetsNotAllowed,
    #[msg("Bet amounts must be greater than 0")]
    InvalidBetAmount,
    #[msg("Number of flips must equal 1")]
    InvalidNumFlips,
    #[msg("Invalid value for bets (may not match on-chain data)")]
    InvalidBets,
    #[msg("Invalid auction house authority")]
    InvalidAuctionHouseAuthority,
}
