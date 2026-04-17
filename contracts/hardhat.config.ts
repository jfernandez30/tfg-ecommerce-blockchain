import type { HardhatUserConfig } from "hardhat/config";
import toolboxViem from "@nomicfoundation/hardhat-toolbox-viem";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  plugins: [toolboxViem],
  networks: process.env.ALCHEMY_URL && process.env.PRIVATE_KEY ? {
    amoy: {
      type: "http",
      url: process.env.ALCHEMY_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  } : {},
};

export default config;
