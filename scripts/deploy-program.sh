#!/bin/bash
set -e 
set -o pipefail

ENVIRONMENT=$1
SKIP_CHECKS_FLAG=$2
SHOULD_SKIP_CHECKS=true

PROGRAM_ID="hamRNY1AjpqcjKqHHMi6ump7rSJafQSKKVKCFzC5oQ7"

if [[ "$SKIP_CHECKS_FLAG" == "skip-checks" ]]; then
  echo -e "\nSkipping pre-deploy checks before deployment!"
  SHOULD_SKIP_CHECKS=true
fi

if [ $SHOULD_SKIP_CHECKS == false ]; then
  # Run build and tests first.
  echo -e "\nRunning tests prior to $ENVIRONMENT deployment...\n"
  yarn build-program
  yarn test || { echo -e "\nTests failed! Please ensure tests are passing before attempting to deploy the program.\n"; exit 1; }

  echo -e "All checks passed! Building program...\n"
fi

echo -e "\nBuilding program ID $PROGRAM_ID for Solana $ENVIRONMENT.\n"

# Build program.
cargo +bpf build --package flipper-program --target bpfel-unknown-unknown --release
echo -e "\nBuild finished!\n"

DEPLOYER_ADDRESS=$(solana-keygen pubkey keys/devnet/deployer-keypair.json)
DEPLOYER_ADDRESS_BALANCE=$(solana balance $DEPLOYER_ADDRESS -u $ENVIRONMENT)
echo -e "Deployer address $DEPLOYER_ADDRESS has $DEPLOYER_ADDRESS_BALANCE\n"

read -p "Enter y/Y to confirm and proceed with the $ENVIRONMENT program deployment to program ID $PROGRAM_ID" -n 1 -r
echo    # (optional) move to a new line.
if [[ $REPLY =~ ^[Yy]$ ]]
then
  # Deploy program.
  echo -e "Calling solana program deploy target/deploy/formfn_candy_machine.so -u $ENVIRONMENT -k ./keys/$ENVIRONMENT/deployer-keypair.json --program-id ./keys/$ENVIRONMENT/program-keypair.json\n"
  echo -e "This will take a moment...\n"
  solana program deploy ./target/deploy/flipper_program.so -u $ENVIRONMENT -k ./keys/$ENVIRONMENT/deployer-keypair.json --program-id ./keys/$ENVIRONMENT/program-keypair.json --max-len 5000000

  echo -e "Program deploy to $ENVIRONMENT finished successfully!\n"
  exit 0
fi

echo -e "\nAborting deployment...\n"
exit 1
