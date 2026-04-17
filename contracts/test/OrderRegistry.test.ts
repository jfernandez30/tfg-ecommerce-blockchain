import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";

describe("OrderRegistry", () => {
  it("debe desplegar el contrato correctamente", async () => {
    const { viem } = await hre.network.connect();
    const contract = await viem.deployContract("OrderRegistry");
    const [owner] = await viem.getWalletClients();
    const contractOwner = await contract.read.owner();
    assert.equal(contractOwner.toLowerCase(), owner.account.address.toLowerCase());
  });

  it("debe registrar un pedido correctamente", async () => {
    const { viem } = await hre.network.connect();
    const contract = await viem.deployContract("OrderRegistry");
    const [, buyer] = await viem.getWalletClients();

    await contract.write.registerOrder(["order-123", 9999n], {
      account: buyer.account
    });

    const exists = await contract.read.orderExists(["order-123"]);
    assert.equal(exists, true);
  });

  it("debe devolver los datos del pedido correctamente", async () => {
    const { viem } = await hre.network.connect();
    const contract = await viem.deployContract("OrderRegistry");
    const [, buyer] = await viem.getWalletClients();

    await contract.write.registerOrder(["order-456", 4999n], {
      account: buyer.account
    });

    const [returnedId, returnedBuyer, returnedTotal] = await contract.read.getOrder(["order-456"]);
    assert.equal(returnedId, "order-456");
    assert.equal(returnedBuyer.toLowerCase(), buyer.account.address.toLowerCase());
    assert.equal(returnedTotal, 4999n);
  });

  it("no debe permitir registrar el mismo pedido dos veces", async () => {
    const { viem } = await hre.network.connect();
    const contract = await viem.deployContract("OrderRegistry");
    const [, buyer] = await viem.getWalletClients();

    await contract.write.registerOrder(["order-789", 1999n], {
      account: buyer.account
    });

    await assert.rejects(
      async () => await contract.write.registerOrder(["order-789", 1999n], {
        account: buyer.account
      }),
      /El pedido ya esta registrado/
    );
  });

  it("debe incrementar el contador de pedidos", async () => {
    const { viem } = await hre.network.connect();
    const contract = await viem.deployContract("OrderRegistry");
    const [, buyer] = await viem.getWalletClients();

    await contract.write.registerOrder(["order-001", 1000n], { account: buyer.account });
    await contract.write.registerOrder(["order-002", 2000n], { account: buyer.account });

    const total = await contract.read.getTotalOrders();
    assert.equal(total, 2n);
  });
});
