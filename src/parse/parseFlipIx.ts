import { PartiallyDecodedInstruction } from "@solana/web3.js";
import decodeFlipperIx from "parse/decodeFlipperIx";

const IX_NAME = "flip";

const AUCTION_HOUSE_ACCOUNT_POSITION = 0;
const BETTOR_ACCOUNT_POSITION = 2;
const TREASURY_MINT_ACCOUNT_POSITION = 4;

export default function parseFlipIx(ix: PartiallyDecodedInstruction) {
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
      bets: ixData.bets as number,
      results: ixData.results as number,
    },
  };
}
