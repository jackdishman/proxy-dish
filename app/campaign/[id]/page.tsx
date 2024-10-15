import React from 'react'
import { Metadata } from 'next'
import { getCampaign } from '@/middleware/supabase';
import CopyClipboard from './CopyClipboard';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const campaign = await getCampaign(params.id)
  
  console.log(campaign)
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:image": `${process.env.NEXT_PUBLIC_HOST}/test.png`,
    "fc:frame:post_url": `${process.env.NEXT_PUBLIC_HOST}/api/frames/campaign-response?id=${params.id}`,
    "fc:frame:button:1": `Accept`,
    "fc:frame:button:1:action": `tx`,
    "fc:frame:button:1:target": `${process.env.NEXT_PUBLIC_HOST}/api/frames/campaign-response?id=${params.id}`,
    "fc:frame:button:2": `Accept`,
    "fc:frame:button:2:action": `tx`,
    "fc:frame:button:2:target": `${process.env.NEXT_PUBLIC_HOST}/api/frames/campaign-response?id=${params.id}`,
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
    <div>
      <h1>Campaign: {campaign.contract_address}</h1>
      <a href={`https://basescan.org/address/${campaign.contract_address}`}>View on Basescan</a>
      <p>Description: {campaign.id}</p>
      {/* Add more campaign details as needed */}
      {/* copy URL to clipboard */}
      <CopyClipboard campaignId={campaign.id} />
    </div>
  )
}
