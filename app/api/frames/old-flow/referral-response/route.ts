import { NextRequest, NextResponse } from "next/server";
import { validateMessage } from "@/middleware/farcaster";
import { createReferral, getMyPendingReferrals, getReferralsByCreatorFid, updateReferral } from "@/middleware/supabase";
import { IReferral } from "@/types/referral";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // validate message
    const { fid, buttonId } = await validateMessage(req);
    const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/test.png`;

    const myPendingReferrals = await getMyPendingReferrals(fid);

    const hasPendingReferrals = myPendingReferrals && myPendingReferrals.length > 0;
    if(!hasPendingReferrals) {
      return new NextResponse("No pending referrals", { status: 400 });
    }

    const referral = myPendingReferrals?.[0];

    if(buttonId === 1) {
      // Accept
      const newReferral: IReferral = {
        id: referral.id,
        creator_fid: referral.creator_fid,
        pending_referrals: referral.pending_referrals.filter((pendingFid) => pendingFid !== fid),
        accepted_referrals: [...referral.accepted_referrals, fid],
      };
      await updateReferral(newReferral);
    } else if(buttonId === 2) {
      // Reject
      const newReferral: IReferral = {
        id: referral.id,
        creator_fid: referral.creator_fid,
        pending_referrals: referral.pending_referrals.filter((fid) => fid !== fid),
        accepted_referrals: referral.accepted_referrals,
      };
      await updateReferral(newReferral);
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
        <meta property="fc:frame:post_url" content="${process.env["NEXT_PUBLIC_HOST"]}/api/frames/welcome">
        <meta property="fc:frame:button:1" content="Referral Recorded">
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
