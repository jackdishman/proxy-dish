import { NextRequest, NextResponse } from "next/server";
import { validateMessage } from "@/middleware/farcaster";
import { createReferral, getMyPendingReferrals, getReferralsByCreatorFid, updateReferral } from "@/middleware/supabase";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // validate message
    const { fid } = await validateMessage(req);
    const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/pending-referrals/image?fid=${fid}`;

    const myPendingReferrals = await getMyPendingReferrals(fid);

    const hasPendingReferrals = myPendingReferrals && myPendingReferrals.length > 0;
    if(!hasPendingReferrals) {
      return new NextResponse("No pending referrals", { status: 400 });
    }

    const responseHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Respond to Reference Request</title>
        <meta property="og:title" content="Respond to Reference Request">
        <meta property="og:image" content="${imageUrl}">
        <meta name="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="${imageUrl}">
        <meta property="fc:frame:post_url" content="${process.env["NEXT_PUBLIC_HOST"]}/api/frames/referral-response">
        <meta property="fc:frame:button:1" content="Accept">
        <meta property="fc:frame:button:2" content="Reject">
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
