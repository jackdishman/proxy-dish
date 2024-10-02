import { NextRequest, NextResponse } from "next/server";
import { validateMessage } from "@/middleware/farcaster";
import { createReferral, getReferralsByCreatorFid, updateReferral } from "@/middleware/supabase";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // validate message
    const { fid, inputText } = await validateMessage(req);

    if (!inputText) {
      return new NextResponse("Input text is required", { status: 400 });
    }

    // get referral
    const existingReferrals = await getReferralsByCreatorFid(fid);
    const existingReferral = existingReferrals[0];
    const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/add-reference/image?add-reference=${existingReferral.pending_referrals}&accepted_referrals=${existingReferral.accepted_referrals}`;

    const updatedReferral = {
      ...existingReferral,
      pending_referrals: [...existingReferral.pending_referrals, inputText]
    };
    const updatedReferralWithNumberIds = {
      ...updatedReferral,
      pending_referrals: updatedReferral.pending_referrals.map(Number)
    };
    const referral = await updateReferral(updatedReferralWithNumberIds);

    let responseHtml = "";

    if(!referral) {
      return new NextResponse("Error creating referral", { status: 500 });
    }
    if(referral?.pending_referrals?.length >= 3) {
      // referral is full, redirect to referral page
      responseHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Enter Reference</title>
          <meta property="og:title" content="Enter Reference">
          <meta property="og:image" content="${imageUrl}">
          <meta name="fc:frame" content="vNext">
          <meta property="fc:frame:image" content="${imageUrl}">
          <meta property="fc:frame:post_url" content="${process.env["NEXT_PUBLIC_HOST"]}/api/frames/status">
          <meta property="fc:frame:button:1" content="Check Status">
          </head>
        <body>
        </body>
      </html>
    `;
    } else {
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
          <meta property="fc:frame:button:1" content="Create Referral">
          </head>
        <body>
        </body>
      </html>
    `;
    }

    // check if user has launched referral
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
