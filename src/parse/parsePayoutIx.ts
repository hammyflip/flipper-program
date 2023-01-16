import { PartiallyDecodedInstruction } from "@solana/web3.js";
import decodeFlipperIx from "parse/decodeFlipperIx";

const IX_NAME = "payout";

const AUCTION_HOUSE_ACCOUNT_POSITION = 0;
const BETTOR_ACCOUNT_POSITION = 3;
const TREASURY_MINT_ACCOUNT_POSITION = 7;

export default function parsePayoutIx(ix: PartiallyDecodedInstruction) {
  const decodedIx = decodeFlipperIx(ix);
  if (decodedIx == null || decodedIx.name !== IX_NAME) {
    return null;
  }

  const ixData = decodedIx.data as any;

  return {
    accounts: {
      auctionHouse: ix.accounts[AUCTION_HOUSE_ACCOUNT_POSITION],
      bettor: ix.accounts[BETTOR_ACCOUNT_POSITION],
      treasuryMint: ix.accounts[TREASURY_MINT_ACCOUNT_POSITION],
    },
    data: {
      results: ixData.results as number,
    },
  };
}
