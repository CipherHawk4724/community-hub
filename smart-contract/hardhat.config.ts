import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

import { HardhatUserConfig } from "hardhat/types";

const config: HardhatUserConfig = {
  solidity: "0.8.21",
  networks: {
    shardeum: {
      url: process.env.SHARDEUM_RPC_URL || "https://api-unstable.shardeum.org",
      accounts: [process.env.PRIVATE_KEY || "72a717bb6911c33672619acc44b3da9555064f74b5d257ffc718407ffe3a6d76"], // safer than hardcoding private key
      chainId: 8080,
    },
  },
};

export default config;
