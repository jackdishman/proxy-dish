import { getCampaign } from "@/middleware/supabase";
import { NextRequest, NextResponse } from "next/server";
import { encodeFunctionData } from "viem";
import referralContractABI from '@/abi/ReferralContract.json';
import { validateMessage } from "@/middleware/farcaster";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "No campaign id provided" }, { status: 400 });
  }

  const { transactionHash } = await validateMessage(req);

  // if transaction hash is provided, return a response with the transaction hash
  if (transactionHash) {
    const img = `${process.env.NEXT_PUBLIC_HOST}/test.png`;
    const responseHtml = `
      <!DOCTYPE html>
        <html>
          <head>
            <title>Transaction Submitted</title>
            <meta property="og:title" content="Transaction Submitted">
            <meta property="og:image" content="${img}">
            <meta name="fc:frame" content="vNext">
            <meta property="fc:frame:image" content="${img}">
            <meta property="fc:frame:button:1" content="View Transaction">
            <meta property="fc:frame:button:1:action" content="link">
            <meta property="fc:frame:button:1:target" content="https://basescan.org/tx/${transactionHash}">
          </head>
          <body>
          </body>
        </html>
      `;

    return new NextResponse(responseHtml, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
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