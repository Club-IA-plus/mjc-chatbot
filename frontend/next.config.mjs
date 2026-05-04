/** @type {import('next').NextConfig} */
const internalBackend =
  process.env.BACKEND_INTERNAL_URL || "http://backend:8000";

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${internalBackend.replace(/\/$/, "")}/:path*`,
      },
    ];
  },
};

export default nextConfig;
