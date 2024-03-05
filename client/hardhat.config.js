//require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");

//when deploying for the first time comment out the second line of requrie and uncomment the first line
//after the first deployment comment out the first line of require and uncomment the second line of require to verify the contract on etherscan

//contract url = "https://sepolia.etherscan.io/address/0xaa7e16c4b5640226519d0cd4ed0115f2894d68ab"
//contract address = "0xaa7e16c4b5640226519d0cd4ed0115f2894d68ab"

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
