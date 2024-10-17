"use client";

import React, { useEffect, useState } from "react";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { base } from "viem/chains";
import referralContractABI from '@/abi/ReferralContractFactory.json';
import { IUser } from "@/types/referral";
import { useRouter } from "next/navigation";
const CONTRACT_ADDRESS = '0xb9f11a289764f699c5913383e59314845d49e118'

export default function ClientContainer() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<string[]>([]);
  const [newName, setNewName] = useState<string>('');
  const [userList, setUserList] = useState<IUser[]>([]);
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [newContractAddress, setNewContractAddress] = useState<string>('');
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toggleAddress = (addressToToggle: string) => {
    if (addresses.includes(addressToToggle)) {
      setAddresses(addresses.filter(addr => addr !== addressToToggle));
    } else {
      setAddresses([...addresses, addressToToggle]);
    }
  };

  const removeAddress = (addressToRemove: string) => {
    setAddresses(addresses.filter(addr => addr !== addressToRemove));
  };

  async function createCampaign() {
    setIsLoading(true);
    setShowPopup(true);

    const publicClient = createPublicClient({
      chain: base,
      transport: http()
    });

    const client = createWalletClient({
      chain: base,
      transport: custom((window as any).ethereum),
    });

    await client.switchChain({ id: base.id })

    const [account] = await client.requestAddresses();

    const hash = await client.writeContract({
      account: account as `0x${string}`,
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: referralContractABI,
      functionName: "createReferralContract",
      args: [addresses.length, addresses],
    });

    console.log(`Transaction hash: ${hash}`);
    setTransactionHash(hash);

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
      setNewContractAddress(newContractAddress);
    } else {
      console.log("ReferralContractCreated event not found in transaction logs.");
    }

    setIsLoading(false);
  }

  const searchUser = async () => {
    try {
      const response = await fetch(process.env.NEXT_PUBLIC_HOST + `/api/get-user-by-name?name=${newName}`);
      const data = await response.json();
      console.log(data)
      setUserList(data.result.users);
    } catch (error) {
      console.error("Error searching user:", error);
    }
  };

  useEffect(() => {
    if (newContractAddress) {
      const addContract = async () => {
        try {
          const response = await fetch(process.env.NEXT_PUBLIC_HOST + `/api/add-contract`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contractAddress: newContractAddress,
            }),
          });
          const data = await response.json();
          console.log(data);
        } catch (error) {
          console.error("Error adding contract:", error);
        }
      };

      addContract();
    }
  }, [newContractAddress]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Create Campaign</h1>
      
      <div className="mb-6">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter Farcaster Username"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          onClick={searchUser}
          className="mt-2 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Search User
        </button>
        <div className="flex flex-col">
          {userList && (
            userList.map((user: IUser) => (
            <div className="mt-4 p-4 bg-gray-100 rounded-md" key={user.fid}>
              <div className="flex items-center">
                <img src={user.pfp_url} alt={user.display_name} className="w-10 h-10 rounded-full mr-2" />
                <p className="font-semibold">{user.display_name}</p>
              </div>
              <p><span className="font-semibold">Username:</span> {user.display_name}</p>
              <p><span className="font-semibold">Fid:</span> {user.fid}</p>
              <p>
                <span className="font-semibold">Custody Address:</span>
                <button 
                  onClick={() => toggleAddress(user.custody_address)}
                  className={`text-blue-500 hover:underline ml-1 flex items-center ${addresses.includes(user.custody_address) ? 'font-bold' : ''}`}
                >
                  {user.custody_address}
                  {addresses.includes(user.custody_address) && (
                    <span>✅</span>
                  )}
                </button>
              </p>
              {
                user.verified_addresses && user.verified_addresses.eth_addresses.map((address: string) => (
                  <p key={address}>
                    <span className="font-semibold">Verified Address:</span>
                    <button 
                      onClick={() => toggleAddress(address)}
                      className={`text-blue-500 hover:underline ml-1 flex items-center ${addresses.includes(address) ? 'font-bold' : ''}`}
                    >
                      {address}
                      {addresses.includes(address) && (
                        <span>✅</span>
                      )}
                    </button>
                  </p>
                ))
              }
            </div>
          ))
        )}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">Addresses</h2>
      <ul className="space-y-2 mb-6">
        {addresses.map((addr, index) => (
          <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
            <span className="text-sm font-mono">{addr}</span>
            <button 
              onClick={() => removeAddress(addr)}
              className="text-red-500 hover:text-red-700"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <button 
        onClick={createCampaign}
        className="w-full bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 transition duration-300 font-semibold"
      >
        Create Campaign
      </button>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Campaign Creation</h2>
            {isLoading ? (
              <div className="text-center">
                <p className="mb-4">Transaction in progress...</p>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : (
              <>
                {transactionHash && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-1">Transaction Hash:</p>
                    <p className="text-xs font-mono break-all">{transactionHash}</p>
                    <a 
                      href={`https://basescan.org/tx/${transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View on BaseScan
                    </a>
                  </div>
                )}
                {newContractAddress && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-1">New Contract Address:</p>
                    <p className="text-xs font-mono break-all">{newContractAddress}</p>
                    <a 
                      href={`https://basescan.org/address/${newContractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm"
                    >
                      View on BaseScan
                    </a>
                  </div>
                )}
              </>
            )}
            <button 
              onClick={() => {
                setShowPopup(false);
                setIsLoading(false);
                setTransactionHash('');
                setNewContractAddress('');
                router.push(`/campaign/${newContractAddress}`);
              }}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 mt-4"
            >
              View Campaign
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
