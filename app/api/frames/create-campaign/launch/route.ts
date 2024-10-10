import { NextRequest, NextResponse } from "next/server";
import { validateMessage } from "@/middleware/farcaster";
import { encodeFunctionData, isAddress, createPublicClient, http, TransactionReceipt } from "viem";
import { base } from "viem/chains";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Validate the input message
    const { address, transactionHash, inputText } = await validateMessage(req);
    console.log(`transactionHash: ${transactionHash}`);

    // Initialize the public client
    const publicClient = createPublicClient({
      chain: base,
      transport: http(),
    });

    // Get contract address from transaction hash
    let contractAddress = null;
    if (transactionHash) {
      const hash = transactionHash as `0x${string}`;
      const receipt = await publicClient.getTransactionReceipt({ hash }).catch((error) => {
        console.error("Error fetching transaction receipt:", error);
      });
      if (receipt && receipt.contractAddress) {
        contractAddress = receipt.contractAddress;
        console.log(`Contract Address: ${contractAddress}`);
      }
    }

    // Create HTML response with contract address if available
    if (transactionHash) {
      const img = `${process.env.NEXT_PUBLIC_HOST}/test.png`;
      const responseHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Enter amount to contribute</title>
            <meta property="og:title" content="Contribute">
            <meta property="og:image" content="${img}">
            <meta name="fc:frame" content="vNext">
            <meta property="fc:frame:image" content="${img}">
            <meta property="fc:frame:input:text" content="3">
            <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_HOST}/api/frames/create-campaign/add-referral">
            <meta property="fc:frame:button:1" content="Add Referral">
            <meta property="fc:frame:button:1:action" content="tx">
            <meta property="fc:frame:button:1:target" content="${process.env.NEXT_PUBLIC_HOST}/api/frames/create-campaign/add-referral">
            <meta property="fc:frame:button:2" content="Contract">
            <meta property="fc:frame:button:2:action" content="link">
            <meta property="fc:frame:button:2:target" content="https://basescan.org/tx/${transactionHash}">
            ${contractAddress ? `<meta property="fc:frame:contract" content="${contractAddress}">` : ""}
          </head>
          <body>
          </body>
        </html>
      `;

      return NextResponse.json({ html: responseHtml }, { status: 200 });
    }

    // Check if the address is valid
    if (!address || !isAddress(address)) {
      throw new Error(`Invalid or missing address: ${address}`);
    }

    // Referral Contract Address
    const referralContractAddress = "0x9f9297c6f87C30F2cd7fF3Ed55a2af2109d81FF5";

    // Referral Contract ABI
    const referralContractABI = [
      {
        name: "createReferralContract",
        type: "function",
        stateMutability: "nonpayable",
        inputs: [
          { name: "_signatureGoal", type: "uint256" }
        ],
        outputs: [],
      }
    ];

    // Encode the calldata for the createReferralContract function
    const createReferralData = encodeFunctionData({
      abi: referralContractABI,
      functionName: "createReferralContract",
      args: [parseInt(inputText || "3", 10)],
    });

    // Prepare the transaction data for creating a referral contract
    const transactionData = {
      method: "eth_sendTransaction",
      chainId: "eip155:8453", // Base chain id
      params: {
        from: address,
        to: referralContractAddress,
        data: createReferralData,
      },
    };

    return NextResponse.json(transactionData, { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse(
      `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return new NextResponse("Method not allowed", { status: 405 });
}