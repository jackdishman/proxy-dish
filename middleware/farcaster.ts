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
}> {
  let body: any;
  let data: any;
  let address: string;
  let castSignerAddress: string | undefined;
  let castAuthorFid: number | undefined;
  let castAuthorFname: string | undefined;
  let fname: string | undefined;

  try {
    body = await req.json(); // Parse the request body as JSON
    const neynarUrl = "https://api.neynar.com/v2/farcaster/frame/validate";
    const response = await fetch(neynarUrl, {
      method: "POST",
      headers: new Headers({
        accept: "application/json",
        api_key: process.env.NEYNAR_API_KEY || '',
        "content-type": "application/json",
      }),
      body: JSON.stringify({
        cast_reaction_context: true,
        follow_context: false,
        signer_context: true,
        channel_follow_context: true,
        message_bytes_in_hex: body.trustedData.messageBytes,
      }),
    });
    data = await response.json();
    fname = data.action.interactor.username;
    address =
      data.action.interactor.verified_addresses.eth_addresses[0] ??
      data.action.interactor.custody_address;
    if (data.action.cast.author) {
      castSignerAddress =
        data.action.cast.author.verified_addresses.eth_addresses[0] ??
        data.action.cast.author.custody_address;
      castAuthorFid = data.action.cast.author.fid;
      castAuthorFname = data.action.cast.author.username;
    }
    if (!data.valid) {
      throw new Error("Unvalidated data!");
    }

    if (!data.action.url.startsWith(process.env["NEXT_PUBLIC_HOST"] || "")) {
      throw new Error(`Invalid frame URL: ${data.action.url}`);
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error(`Failed to validate message: ${e.message}`);
    } else {
      console.error(`An unexpected error occurred: ${e}`);
    }
    return { fid: 0 };
  }

  // Extract fid, buttonId, and inputText
  let fid = 0,
    buttonId,
    inputText;

  if (data.valid) {
    buttonId = data.action.tapped_button
      ? data.action.tapped_button.index
      : undefined;
    fid = data.action.interactor.fid || 0;
    inputText = data.action.input?.text || "";
  } else {
    // todo: handle invalid data
    buttonId = data.action.tapped_button.index;
    fid = data.action.interactor.fid || 0;
    inputText = data.action.input.text;
  }

  return {
    fid,
    buttonId,
    inputText,
    address,
    castSignerAddress,
    castAuthorFid,
    fname,
    castAuthorFname,
  };
}
