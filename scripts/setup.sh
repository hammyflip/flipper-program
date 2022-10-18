#!/bin/bash

echo "Copying generated program IDL and types to src/generated directory."

cp target/types/flipper_program.ts src/generated/Flipper.ts

printf 'import { Idl } from "@project-serum/anchor"\n\nconst FLIPPER_IDL: Idl = {' > src/generated/idl.ts
tail -n +2 'target/idl/flipper_program.json' >> src/generated/idl.ts
printf '\n\nexport default FLIPPER_IDL;' >> src/generated/idl.ts

npx prettier --write src/generated
npx eslint --fix src/generated