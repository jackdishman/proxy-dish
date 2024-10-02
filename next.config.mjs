/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    HUB_URL: process.env["HUB_URL"],
    SUPABASE_URL: process.env["SUPABASE_URL"],
    SUPABASE_KEY: process.env["SUPABASE_KEY"],
    SUPABASE_SERVICE_ROLE_KEY: process.env["SUPABASE_SERVICE_ROLE_KEY"],
    NEXT_PUBLIC_HOST: process.env["NEXT_PUBLIC_HOST"],
    NEYNAR_API_KEY: process.env["NEYNAR_API_KEY"],
  },
};

export default nextConfig;
