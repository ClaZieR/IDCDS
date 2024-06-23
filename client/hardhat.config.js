require("@nomicfoundation/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");


//contract url = "https://sepolia.etherscan.io/address/0xaa7e16c4b5640226519d0cd4ed0115f2894d68ab"
//contract address = "0xaa7e16c4b5640226519d0cd4ed0115f2894d68ab"
//contract for students = '0xD83B69B76f8e8a45722BfbeBb4D88b329ac593De'

/*
--------------
 Instructions
--------------
remove ethers
run this 'npm install --save-dev @nomiclabs/hardhat-ethers ethers'
after verify downgrade ether to   ethers@5.6.7  
*/

const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    sepolia: {
      url: process.env.REACT_APP_SEPOLIA_RPC_URL,
      accounts: [process.env.REACT_APP_PRIVATE_KEY]
    },
  },
  etherscan: {
    apiKey: process.env.REACT_APP_ETHERSCAN_KEY
  }
};
