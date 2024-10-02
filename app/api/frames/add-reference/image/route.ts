import sharp from "sharp";
import satori from "satori";
import { join } from "path";
import * as fs from "fs";
import { NextRequest, NextResponse } from "next/server";

const fontPath = join(process.cwd(), "Roboto-Regular.ttf");
const fontData = fs.readFileSync(fontPath);

export async function GET(req: NextRequest) {
  console.log("hereeee /api/frames/2-send-reference/image");
  return new NextResponse("ok", { status: 200 });
}

export async function POST() {
  return new NextResponse("Not implemented", { status: 501 });
}
