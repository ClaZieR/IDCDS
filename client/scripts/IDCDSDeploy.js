const hre = require("hardhat");

async function main() {
  const IDCDS = await hre.ethers.getContractFactory("IDCDS");
  const idcds = await IDCDS.deploy();
  console.log("IDCDS deployed to:", idcds.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
