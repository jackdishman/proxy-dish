import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {

  const imageUrl = `${process.env["NEXT_PUBLIC_HOST"]}/test.png`;
  console.log("imageUrl", imageUrl);
  const fcMetadata: Record<string, string> = {
    "fc:frame": "vNext",
    "fc:frame:post_url": `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/create-campaign/launch`,
    "fc:frame:image": imageUrl,
    "fc:frame:button:1": `Launch Referral`,
    "fc:frame:input:text": `# referrals?`,
    "fc:frame:button:1:action": "tx",
    "fc:frame:button:1:target": `${process.env["NEXT_PUBLIC_HOST"]}/api/frames/create-campaign/launch`,
  };

  return {
    title: "Referral",
    openGraph: {
      title: "Manage referrals",
      description: "Manage referrals",
      images: [{ url: imageUrl }],
    },
    other: {
      ...fcMetadata,
    },
    metadataBase: new URL(process.env["NEXT_PUBLIC_HOST"] || ""),
  };
}

export default async function Page() {
  return <div>Page</div>;
}
