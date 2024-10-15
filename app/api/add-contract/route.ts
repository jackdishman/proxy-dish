import { supabase } from '@/middleware/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const { contractAddress } = await req.json();

    // Add the contract address to the referral_campaigns table
    const { data, error } = await supabase
        .from('referral_campaigns')
        .insert({ contract_address: contractAddress })
        .select();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data[0].id });
}
