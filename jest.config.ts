import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  moduleDirectories: ["node_modules", "src"],
  modulePathIgnorePatterns: ["programs", "migrations", "target"],
  preset: "ts-jest",
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup/setup.ts"],
  testEnvironment: "node",
  testTimeout: 180_000,
  verbose: true,
};

export default config;
