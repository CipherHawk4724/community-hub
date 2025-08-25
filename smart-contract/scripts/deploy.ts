import hre from "hardhat";

async function main() {
  console.log("Deploying CommunityHub...");

  // Get contract factory
  const CommunityHubFactory = await hre.ethers.getContractFactory("CommunityHub");

  // Deploy contract (ethers v6 auto-awaits deployment)
  const communityHub = await CommunityHubFactory.deploy();

  console.log("CommunityHub deployed to:", communityHub.target); // use .target in ethers v6
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
