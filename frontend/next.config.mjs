/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Proxy API calls to the Django backend during development
    return [
      {
        source: "/api/:path*",
        destination: process.env.NEXT_PUBLIC_API_BASE
          ? `${process.env.NEXT_PUBLIC_API_BASE}/api/:path*`
          : "http://127.0.0.1:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
