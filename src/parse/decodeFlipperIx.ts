import { Instruction } from "@project-serum/anchor";
import { PartiallyDecodedInstruction } from "@solana/web3.js";
import { FLIPPER_PROGRAM_ID } from "constants/ProgramIds";
import { FLIPPER_IDL } from "generated";
import decodeIxWithIdl from "parse/decodeIxWithIdl";
import { Maybe } from "types/UtilityTypes";
import arePublicKeysEqual from "utils/solana/arePublicKeysEqual";

export default function decodeFlipperIx(
  ix: PartiallyDecodedInstruction
): Maybe<Instruction> {
  if (!arePublicKeysEqual(ix.programId, FLIPPER_PROGRAM_ID)) {
    return null;
  }

  return decodeIxWithIdl(ix, FLIPPER_IDL);
}
