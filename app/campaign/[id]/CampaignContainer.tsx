"use client"
import React, { useEffect, useState } from 'react';
import { createPublicClient, http, getContract } from 'viem';
import { base } from 'viem/chains';
import referralContractABI from '@/abi/ReferralContract.json';

export default function CampaignContainer({ contractAddress }: { contractAddress: string }) {
  const [campaignData, setCampaignData] = useState({
    isComplete: false,
    acceptedReferrals: [] as string[],
    ownerAddress: '',
    signatureGoal: 0,
    pendingAddresses: [] as string[],
  });

  useEffect(() => {
    fetchCampaignData();
  }, [contractAddress]);

  const fetchCampaignData = async () => {
    try {
      const publicClient = createPublicClient({
        chain: base,
        transport: http(),
      });

      const contract = getContract({
        address: contractAddress as `0x${string}`,
        abi: referralContractABI,
        client: publicClient, 
      });

      const [isComplete, acceptedReferrals, owner, signatureGoal] = await Promise.all([
        contract.read.isComplete(),
        contract.read.getAcceptedReferrals(),
        contract.read.owner(),
        contract.read.signatureGoal(),
      ]);

      let pendingAddresses: string[] = [];
      if (!isComplete) {
        const referralPromises = Array.from(
          { length: Number(signatureGoal) - (acceptedReferrals as string[]).length },
          (_, i) => contract.read.referralList([BigInt((acceptedReferrals as string[]).length + i)])
        );
        pendingAddresses = (await Promise.all(referralPromises)) as string[];
      }

      setCampaignData({
        isComplete: isComplete as boolean,
        acceptedReferrals: acceptedReferrals as string[],
        ownerAddress: owner as string,
        signatureGoal: Number(signatureGoal),
        pendingAddresses,
      });
    } catch (error) {
      console.error('Failed to read contract data:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Campaign: {contractAddress}</h1>
      <div className="space-y-4">
        <StatusBadge isComplete={campaignData.isComplete} />
        <InfoItem label="Owner" value={campaignData.ownerAddress} />
        <InfoItem label="Signature Goal" value={campaignData.signatureGoal} />
        <InfoItem label="Accepted Referrals" value={campaignData.acceptedReferrals.length} />
        <ReferralList title="Accepted Referrals" addresses={campaignData.acceptedReferrals} />
        {!campaignData.isComplete && (
          <ReferralList title="Pending Referrals" addresses={campaignData.pendingAddresses} />
        )}
      </div>
    </div>
  );
}

const StatusBadge = ({ isComplete }: { isComplete: boolean }) => (
  <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
    isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }`}>
    {isComplete ? 'Complete' : 'In Progress'}
  </span>
);

const InfoItem = ({ label, value }: { label: string; value: string | number }) => (
  <p className="text-gray-700">
    <span className="font-semibold">{label}:</span> {value}
  </p>
);

const ReferralList = ({ title, addresses }: { title: string; addresses: string[] }) => (
  <div>
    <h2 className="text-lg font-semibold mb-2">{title}</h2>
    <ul className="list-disc list-inside space-y-1">
      {addresses.map((address, index) => (
        <li key={index} className="text-gray-600 truncate">{address}</li>
      ))}
    </ul>
  </div>
);
