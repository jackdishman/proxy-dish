import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold">Welcome to Pumped.LinkedIn</h1>
        <p className="text-lg">
          This is a referral campaign for a new token launch.
        </p>
        <Link href="/create-campaign" className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Create Campaign
        </Link>
      </div>
    </div>
  );
}
