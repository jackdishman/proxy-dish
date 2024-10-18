import React from 'react'
import { Metadata } from 'next'
import { getCampaign } from '@/middleware/supabase';
import CopyClipboard from './CopyClipboard';
import CampaignContainer from './CampaignContainer';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const campaign = await getCampaign(params.id)
  
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:image": `${process.env.NEXT_PUBLIC_HOST}/test.png`,
    "fc:frame:post_url": `${process.env.NEXT_PUBLIC_HOST}/api/frames/campaign-response?id=${params.id}`,
    "fc:frame:button:1": `Accept`,
    "fc:frame:button:1:action": `tx`,
    "fc:frame:button:1:target": `${process.env.NEXT_PUBLIC_HOST}/api/frames/campaign-response?id=${params.id}`,
  };

  return {
    title: `Campaign ${params.id}`,
    description: `Campaign ${params.id}`,
    openGraph: {
      title: `Campaign ${params.id}`,
      description: `Campaign ${params.id}`,
    },
    other: {
      ...fcMetadata
    }
  }
}

export default async function CampaignRoute({ params }: { params: { id: string } }) {
  const campaign = await getCampaign(params.id)

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Campaign: {campaign.contract_address}</h1>
      <a 
        href={`https://basescan.org/address/${campaign.contract_address}`}
        className="text-blue-600 hover:text-blue-800 underline mb-4 inline-block"
        target="_blank"
        rel="noopener noreferrer"
      >
        View on Basescan
      </a>
      {/* Add more campaign details as needed */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Share this campaign</h2>
        <CopyClipboard campaignId={campaign.contract_address} />
      </div>
      <CampaignContainer contractAddress={campaign.contract_address} />
    </div>
  )
}
