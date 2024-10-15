import { getCampaign } from "@/middleware/supabase";
import { NextRequest, NextResponse } from "next/server";
import { encodeFunctionData } from "viem";
import referralContractABI from '@/abi/ReferralContract.json';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "No campaign id provided" }, { status: 400 });
  }

  // get campaign from db
  const campaign = await getCampaign(id);

  if (!campaign) {
    return NextResponse.json({ message: "Campaign not found" }, { status: 404 });
  }

  const contractAddress = campaign.contract_address;
  
  const createReferralData = encodeFunctionData({
    abi: referralContractABI,
    functionName: "acceptReferral",
  });

  const transactionData = {
    method: "eth_sendTransaction",
    chainId: "eip155:8453", // Base chain id
    params: {
      to: contractAddress,
      data: createReferralData,
    },
  };
    return NextResponse.json(transactionData, { status: 200 });
}