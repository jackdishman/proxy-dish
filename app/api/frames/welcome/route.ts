import { NextRequest, NextResponse } from "next/server";
import { validateMessage } from "@/middleware/farcaster";
import { getReferralsByCreatorFid, updateReferral } from "@/middleware/supabase";
import { prepareTransaction } from "@/middleware/crypto";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/test.png`;
  try {
    // validate message
    const { fid, inputText } = await validateMessage(req);

    console.log(fid, inputText);

    // check if user has launched referral
    const res = await getReferralsByCreatorFid(fid);

    if (!res || res.length === 0) {
      // no referrals, go to create referral frame
      const responseHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Enter Reference</title>
          <meta property="og:title" content="Enter Reference">
          <meta property="og:image" content="${imageUrl}">
          <meta name="fc:frame" content="vNext">
          <meta property="fc:frame:image" content="${imageUrl}">
          <meta property="fc:frame:post_url" content="${process.env["NEXT_PUBLIC_HOST"]}/api/frames/new-referral}">
          <meta property="fc:frame:input:text" content="Enter fname of reference">
          <meta property="fc:frame:button:1" content="Create Referral">
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

    const referral = res[0];
    console.log(referral);

    let responseHtml: string | null = null;

    // init referral fields if null
    if (!referral.pending_referrals) {
      await updateReferral({ ...referral, pending_referrals: [] });
    }
    if (!referral.accepted_referrals) {
      await updateReferral({ ...referral, accepted_referrals: [] });
    }

    if (referral) {
      // user has launched referral
      if (referral.accepted_referrals.length >= 2) {
        // user has 3 accepted referrals, trigger transaction
        responseHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Enter Reference</title>
            <meta property="og:title" content="Enter Reference">
            <meta property="og:image" content="${imageUrl}">
            <meta name="fc:frame" content="vNext">
            <meta property="fc:frame:image" content="${imageUrl}">
            <meta property="fc:frame:post_url" content="${process.env["NEXT_PUBLIC_HOST"]}/api/frames/get-tx-data}">
            <meta property="fc:frame:button:1" content="Send Transaction">
            </head>
          <body>
          </body>
        </html>
      `;
      }

      if (referral.pending_referrals.length <= 2) {
        // show add referral frame
        responseHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Enter Reference</title>
            <meta property="og:title" content="Enter Reference">
            <meta property="og:image" content="${imageUrl}">
            <meta name="fc:frame" content="vNext">
            <meta property="fc:frame:image" content="${imageUrl}">
            <meta property="fc:frame:post_url" content="${process.env["NEXT_PUBLIC_HOST"]}/api/frames/add-reference}">
            <meta property="fc:frame:input:text" content="Enter fname of reference">
            <meta property="fc:frame:button:1" content="Submit">
            </head>
          <body>
          </body>
        </html>
      `;
      }
    }

    // get open

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
