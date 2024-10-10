import { NextRequest, NextResponse } from "next/server";
import { validateMessage } from "@/middleware/farcaster";
import { createReferral, getReferralsByCreatorFid, updateReferral } from "@/middleware/supabase";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/test.png`;
  try {
    // validate message
    const { fid } = await validateMessage(req);

    // if (!inputText) {
    //   return new NextResponse("Input text is required", { status: 400 });
    // }

    const referral = await createReferral(fid);

    let responseHtml = "";

    if(!referral) {
      return new NextResponse("Error creating referral", { status: 500 });
    }

    responseHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Enter Reference</title>
        <meta property="og:title" content="Enter Reference">
        <meta property="og:image" content="${imageUrl}">
        <meta name="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="${imageUrl}">
        <meta property="fc:frame:post_url" content="${process.env["NEXT_PUBLIC_HOST"]}/api/frames/add-reference">
        <meta property="fc:frame:input:text" content="Enter fname of reference">
        <meta property="fc:frame:button:1" content="Add Reference">
        </head>
      <body>
      </body>
    </html>
  `;

    return new NextResponse(responseHtml, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error generating image", { status: 500 });
  }
}

export async function GET(): Promise<NextResponse> {
  return new NextResponse("Method not allowed", { status: 405 });
}
