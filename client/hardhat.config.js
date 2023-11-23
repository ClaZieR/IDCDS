//require("@nomicfoundation/hardhat-toolbox");
//require("@nomiclabs/hardhat-etherscan");

//contract url = "https://sepolia.etherscan.io/address/0x327575E4cD763D7171602FB55c8C98f2A5acee1F#code"
//contract address = "0x327575E4cD763D7171602FB55c8C98f2A5acee1F"

const dotenv = require("dotenv");

dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {   
    hardhat: {},
    SEPOLIA: {
      url: process.env.REACT_APP_SEPOLIA_RPC_URL,
      accounts: [process.env.REACT_APP_PRIVATE_KEY]
    },
  },  
  etherscan: {
    apiKey: process.env.REACT_APP_ETHERSCAN_KEY
  }
};
