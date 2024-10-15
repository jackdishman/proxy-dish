"use client";

import React, { useEffect, useState } from "react";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { base } from "viem/chains";

const CONTRACT_ADDRESS = '0x9a753226a630c97913f2de7f25e25d0481a9eedf'

export default function ClientContainer() {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newAddress, setNewAddress] = useState<string>('');

  const addAddress = () => {
    if (newAddress && !addresses.includes(newAddress)) {
      setAddresses([...addresses, newAddress]);
      setNewAddress('');
    }
  };

  const removeAddress = (addressToRemove: string) => {
    setAddresses(addresses.filter(addr => addr !== addressToRemove));
  };

  async function createCampaign() {
  const publicClient = createPublicClient({
    chain: base,
    transport: http()
  });

  const client = createWalletClient({
    chain: base,
    transport: custom((window as any).ethereum),
  });

  const [account] = await client.requestAddresses();
  console.log(account);

  const referralContractABI = require('@/abi/ReferralContractFactory.json');
  console.log(referralContractABI);

  const hash = await client.writeContract({
    account: account as `0x${string}`,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: referralContractABI,
    functionName: "createReferralContract",
    args: [addresses.length, addresses],
  });

  console.log(`Transaction hash: ${hash}`);

  // Polling function to check for transaction receipt
  async function waitForTransaction() {
    let receipt;
    while (!receipt) {
      try {
        receipt = await publicClient.getTransactionReceipt({ hash });
      } catch (error) {
        console.log("Transaction pending...");
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds
      }
    }
    return receipt;
  }

  const tx = await waitForTransaction();

  // Parse the logs to find the new contract address
  const referralContractCreatedEvent = tx.logs.find(log => 
    log.topics[0] === "0x2a81dffe5748269fbdb105f1da962e54e461c37dbc3d6a783bd867824629b6ca" // Event signature hash for ReferralContractCreated
  );

  if (referralContractCreatedEvent) {
    // Extract new contract address from data field (non-indexed parameter)
    const data = referralContractCreatedEvent.data;
    const newContractAddress = "0x" + data.slice(26, 66); // Grab the last 40 hex characters after the '0x'
    console.log(`New contract address: ${newContractAddress}`);
  } else {
    console.log("ReferralContractCreated event not found in transaction logs.");
  }
  }

  return (
    <div>
      <div>
        <input
          type="text"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          placeholder="Enter address"
        />
        <button onClick={addAddress}>Add Address</button>
      </div>
      <ul>
        {addresses.map((addr, index) => (
          <li key={index}>
            {addr}
            <button onClick={() => removeAddress(addr)}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={createCampaign}>Create Campaign</button>
    </div>
  );
}
