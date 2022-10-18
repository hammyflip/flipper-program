import { DEVNET_ACCOUNTS, LOCALNET_ACCOUNTS, MAINNET_ACCOUNTS, TESTNET_ACCOUNTS } from "constants/AccountConstants";
import Environment from "types/enums/Environment";
import assertUnreachable from "utils/assertUnreachable";

export default function getAccountsForEnvironment(environment: Environment) {
  switch (environment) {
    case Environment.Local:
      return LOCALNET_ACCOUNTS;
    case Environment.Testnet:
      return TESTNET_ACCOUNTS;
    case Environment.Development:
      return DEVNET_ACCOUNTS;
    case Environment.Production:
      return MAINNET_ACCOUNTS;
    default:
      return assertUnreachable(environment);
  }
}
