import { NextRequest, NextResponse } from "next/server";
import { validateMessage } from "@/middleware/farcaster";
import { getReferralsByCreatorFid } from "@/middleware/supabase";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { fid } = await validateMessage(req);
    const referrals = await getReferralsByCreatorFid(fid);
    const referral = referrals?.[0];

    let imageUrl: string;
    let postUrl: string;
    let buttonText: string | undefined;
    let inputText: string | undefined;

    if (!referral) {
      // No referrals, go to create referral frame
      imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/welcome/image`;
      postUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/new-referral`;
      buttonText = "Create Referral";
    } else if (referral.accepted_referrals.length >= 3) {
      // User has 3 accepted referrals, trigger transaction
      imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/add-reference/image?pending_referrals=${referral.pending_referrals?.join(',')}&accepted_referrals=${referral.accepted_referrals?.join(',')}`;
      postUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/get-tx-data`;
      buttonText = "Send Transaction";
    } else if (referral.pending_referrals.length < 3) {
      // Show add referral frame
      imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/add-reference/image?pending_referrals=${referral.pending_referrals?.join(',')}&accepted_referrals=${referral.accepted_referrals?.join(',')}`;
      postUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/add-reference`;
      buttonText = "Submit";
      inputText = "Enter fname of reference";
    } else {
      // User has 3 pending referrals, hide buttons
      imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/add-reference/image?pending_referrals=${referral.pending_referrals?.join(',')}&accepted_referrals=${referral.accepted_referrals?.join(',')}`;
      postUrl = `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/welcome/image`;
    }

    const responseHtml = generateFrameHtml(imageUrl, postUrl, buttonText, inputText);
    return new NextResponse(responseHtml, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Error processing request", { status: 500 });
  }
}

function generateFrameHtml(imageUrl: string, postUrl: string, buttonText?: string, inputText?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Enter Reference</title>
        <meta property="og:title" content="Enter Reference">
        <meta property="og:image" content="${imageUrl}">
        <meta name="fc:frame" content="vNext">
        <meta property="fc:frame:image" content="${imageUrl}">
        <meta property="fc:frame:post_url" content="${postUrl}">
        ${buttonText ? `<meta property="fc:frame:button:1" content="${buttonText}">` : ''}
        ${inputText ? `<meta property="fc:frame:input:text" content="${inputText}">` : ''}
      </head>
      <body></body>
    </html>
  `;
}

export async function GET(): Promise<NextResponse> {
  return new NextResponse("Method not allowed", { status: 405 });
}
