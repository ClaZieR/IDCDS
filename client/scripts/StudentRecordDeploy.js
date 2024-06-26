async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
  
    const IDCDS = await ethers.getContractFactory("IDCDS");
    const idcds = await IDCDS.deploy();  // Deployment happens here
  
    console.log("StudentRecord deployed to:", idcds.address);
  }
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
  
  runMain();