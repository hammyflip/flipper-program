import { PartiallyDecodedInstruction } from "@solana/web3.js";
import decodeFlipperIx from "parse/decodeFlipperIx";

const IX_NAME = "createBettorInfo";

const BETTOR_ACCOUNT_POSITION = 0;
const TREASURY_MINT_ACCOUNT_POSITION = 2;

export default function parseCreateBettorInfoIx(
  ix: PartiallyDecodedInstruction
) {
  const decodedIx = decodeFlipperIx(ix);
  if (decodedIx == null || decodedIx.name !== IX_NAME) {
    return null;
  }

  return {
    accounts: {
      bettor: ix.accounts[BETTOR_ACCOUNT_POSITION],
      treasuryMint: ix.accounts[TREASURY_MINT_ACCOUNT_POSITION],
    },
  };
}
