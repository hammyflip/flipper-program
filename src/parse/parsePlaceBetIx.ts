import { PartiallyDecodedInstruction } from "@solana/web3.js";
import decodeFlipperIx from "parse/decodeFlipperIx";

const IX_NAME = "placeBet";

const AUCTION_HOUSE_ACCOUNT_POSITION = 0;
const BETTOR_ACCOUNT_POSITION = 2;
const TREASURY_MINT_ACCOUNT_POSITION = 7;

export default function parsePlaceBetIx(ix: PartiallyDecodedInstruction) {
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
      amount: ixData.amount.toNumber(),
      bets: ixData.bets,
      numFlips: ixData.numFlips,
    },
  };
}
