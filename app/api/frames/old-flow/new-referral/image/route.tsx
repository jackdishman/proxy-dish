import sharp from "sharp";
import satori from "satori";
import { join } from "path";
import * as fs from "fs";
import { NextRequest, NextResponse } from "next/server";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
const fontData = fs.readFileSync(fontPath);

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);
    
    // Parse pending_referrals
    const pendingReferrals = searchParams.get('pending_referrals')?.split(',').filter(Boolean) || [];
    
    // Parse accepted_referrals
    const acceptedReferrals = searchParams.get('accepted_referrals')?.split(',').filter(Boolean) || [];

    console.log('Pending Referrals:', pendingReferrals);
    console.log('Accepted Referrals:', acceptedReferrals);

    const svg = await satori(
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#222",
          padding: "20px",
          border: "10px solid #ffcc00",
          fontFamily: "Roboto",
          color: "#fff",
          boxShadow: "0 0 20px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-30px",
            backgroundColor: "#ffcc00",
            padding: "5px 20px",
            color: "#000",
            fontSize: "16px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
        </div>
        <h2
          style={{
            fontSize: "96px",
            fontWeight: "bold",
            marginBottom: "20px",
            textShadow: "2px 2px #000",
          }}
        >
          Referral Frame
        </h2>
        <h3
          style={{
            fontSize: "48px",
            fontWeight: "normal",
            color: "#ffcc00",
            textShadow: "1px 1px #000",
          }}
        >
        </h3>
      </div>,
      {
        width: 1148, // 600 * 1.91
        height: 600, // 1.91:1 aspect ratio
        fonts: [
          {
            data: fontData,
            name: "Roboto",
            style: "normal",
            weight: 400,
          },
        ],
      }
    );

    const pngBuffer = await sharp(Buffer.from(svg)).toFormat("png").toBuffer();

    return new NextResponse(pngBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "max-age=10", // Set max-age to 10 seconds
      },
    });
  } catch (error) {
    return new NextResponse("Error generating image", { status: 500 });
  }
}

export async function POST() {
  return new NextResponse("Not implemented", { status: 501 });
}
