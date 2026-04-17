import hre from "hardhat";

async function main() {
  console.log("Desplegando OrderRegistry en Polygon Amoy...");

  const { viem } = await hre.network.connect();
  const [deployer] = await viem.getWalletClients();

  console.log("Desplegando con la cuenta:", deployer.account.address);

  const contract = await viem.deployContract("OrderRegistry");

  console.log("OrderRegistry desplegado en:", contract.address);
  console.log("Guarda esta dirección para configurar el frontend.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
