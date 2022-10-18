import { Program } from "@project-serum/anchor";
import { FlipperProgram as Flipper } from "generated/Flipper";
import FLIPPER_IDL from "generated/idl";

export { FLIPPER_IDL };

export { Flipper };

export type FlipperProgram = Program<Flipper>;
