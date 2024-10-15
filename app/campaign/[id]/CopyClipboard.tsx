'use client'
import React from 'react'

export default function CopyClipboard({ campaignId }: { campaignId: string }) {
    const copyLink = () => {
      const url = `${process.env.NEXT_PUBLIC_HOST}/campaign/${campaignId}`;
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard');
    };
  return (
    <div>
      <button onClick={copyLink}>Copy URL and paste into cast, tag the users you need referrals from</button>
    </div>
  )
}
