// get all campaigns from the database

import { supabase } from '@/middleware/supabase';
import Link from 'next/link';
import React from 'react'

export default async function Page() {
  const res = await supabase.from('referral_campaigns').select('*');
  console.log(res);
  const campaigns = res.data;

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-xl text-gray-600">No campaigns found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Referral Campaigns</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <Link
            href={`/campaign/${campaign.contract_address}`}
            key={campaign.id}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <h2 className="text-xl font-semibold mb-2 truncate">{campaign.contract_address}</h2>
            {/* Add more campaign details here if available */}
            <p className="text-sm text-gray-600">Click to view details</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
