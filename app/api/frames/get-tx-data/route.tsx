import { NextRequest, NextResponse } from "next/server";
// import { parseEther } from "ethers/lib/utils";
import { parseAbiItem } from "viem";

// ABI for FairLaunch contract
const fairLaunchAbi = [
  parseAbiItem(
    "function fairLaunch(string name, string symbol) external payable"
  ),
];

// Replace with the actual FairLaunch contract address
const fairLaunchAddress = "0xYourFairLaunchContractAddress";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Assuming Signature Packet is passed in the body for connected wallet
    const { address } = await req.json(); // Extract wallet address if needed

    // Example values for the transaction
    const name = "MyToken";
    const symbol = "MTK";
    const ethAmount = "0.1"; // ETH amount to send

    // Prepare transaction data
    let callData;

    const response = {
      method: "eth_sendTransaction",
      chainId: "eip155:1", // Assuming this is for Ethereum mainnet
      params: {
        abi: fairLaunchAbi,
        to: fairLaunchAddress,
        data: callData,
        // value: parseEther(ethAmount).toString(), // Convert ETH amount to Wei
      },
    };

    return new NextResponse(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error building transaction data", error);
    return new NextResponse("Error processing request", { status: 500 });
  }
}
