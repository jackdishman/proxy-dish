import { NextRequest } from "next/server";

export async function validateMessage(req: NextRequest): Promise<{
  fid: number;
  buttonId?: number;
  inputText?: string;
  address?: string;
  castSignerAddress?: string;
  castAuthorFid?: number;
  fname?: string;
  castAuthorFname?: string;
  transactionHash?: string;
}> {
  try {
    // Parse the request body as JSON
    const body = await req.json();
    const neynarUrl = "https://api.neynar.com/v2/farcaster/frame/validate";

    const response = await fetch(neynarUrl, {
      method: "POST",
      headers: {
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY || "",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        cast_reaction_context: true,
        follow_context: false,
        signer_context: true,
        channel_follow_context: true,
        message_bytes_in_hex: body.trustedData.messageBytes,
      }),
    });

    const data = await response.json();

    // Validate data response and frame URL
    if (!data.valid) throw new Error("Unvalidated data!");
    if (!data.action.url.startsWith(process.env.NEXT_PUBLIC_HOST || "")) {
      throw new Error(`Invalid frame URL: ${data.action.url}`);
    }

    // Extract user and cast information
    const address =
      data.action.interactor.verified_addresses.eth_addresses[0] ||
      data.action.interactor.custody_address;
    const castSignerAddress =
      data.action.cast?.author?.verified_addresses.eth_addresses[0] ||
      data.action.cast?.author?.custody_address;

    return {
      fid: data.action.interactor.fid || 0,
      buttonId: data.action.tapped_button?.index,
      inputText: data.action.input?.text || "",
      address,
      castSignerAddress,
      castAuthorFid: data.action.cast?.author?.fid,
      fname: data.action.interactor.username,
      castAuthorFname: data.action.cast?.author?.username,
      transactionHash: data.action.transaction?.hash,
    };
  } catch (error) {
    console.error(
      `Failed to validate message: ${
        error instanceof Error ? error.message : error
      }`
    );
    return { fid: 0 }; // Return default fid in case of error
  }
}
