async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
  
    const StudentRecord = await ethers.getContractFactory("StudentRecord");
    const studentRecord = await StudentRecord.deploy();  // Deployment happens here
  
    console.log("StudentRecord deployed to:", studentRecord.address);
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