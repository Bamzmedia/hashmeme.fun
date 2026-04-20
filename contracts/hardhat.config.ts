import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

// Load env vars, e.g., TESTNET_OPERATOR_PRIVATE_KEY
// require('dotenv').config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hedera_testnet: {
        url: "https://testnet.hashio.io/api",
        chainId: 296,
        accounts: process.env.TESTNET_OPERATOR_PRIVATE_KEY ? [process.env.TESTNET_OPERATOR_PRIVATE_KEY] : []
    }
  }
};

export default config;
