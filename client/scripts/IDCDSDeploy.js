const hre = require("hardhat");

async function main() {
  const IDCDS = await hre.ethers.getContractFactory("IDCDS");
  const idcds = await IDCDS.deploy();
  console.log("IDCDS deployed to:", idcds.address);
}

const runMain = async() => {
  try {
    await main();
    process.exit(0);
  } catch(error) {
    console.log(error);
    process.exit(1);
  }
}

runMain();