import { NextRequest, NextResponse } from "next/server";
import { validateMessage } from "@/middleware/farcaster";
import { getReferralsByCreatorFid, updateReferral } from "@/middleware/supabase";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { fid, inputText } = await validateMessage(req);

    if (!inputText) {
      return new NextResponse("Input text is required", { status: 400 });
    }

    const [existingReferral] = await getReferralsByCreatorFid(fid);
    
    const updatedReferral = {
      ...existingReferral,
      pending_referrals: [...existingReferral.pending_referrals, Number(inputText)]
    };

    const imageUrl = `${process.env.NEXT_PUBLIC_HOST}/api/frames/add-reference/image?pending_referrals=${updatedReferral.pending_referrals}&accepted_referrals=${updatedReferral.accepted_referrals}`;

    const referral = await updateReferral(updatedReferral);

    if (!referral) {
      return new NextResponse("Error updating referral", { status: 500 });
    }

    const isReferralFull = referral.pending_referrals.length >= 3;
    const responseHtml = generateResponseHtml(imageUrl, isReferralFull);

    return new NextResponse(responseHtml, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error processing request", { status: 500 });
  }
}

function generateResponseHtml(imageUrl: string, isReferralFull: boolean): string {
  const baseHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Enter Reference</title>
        <meta property="og:title" content="Enter Reference">
        <meta property="og:image" content="${imageUrl}">
        <meta name="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="${imageUrl}">
        ${isReferralFull ? `` : `
          <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_HOST}/api/frames/add-reference">
          <meta property="fc:frame:input:text" content="Enter fname of reference">
          <meta property="fc:frame:button:1" content="Create Referral">
        `}
      </head>
      <body></body>
    </html>
  `;
  return baseHtml.trim();
}

export async function GET(): Promise<NextResponse> {
  return new NextResponse("Method not allowed", { status: 405 });
}
