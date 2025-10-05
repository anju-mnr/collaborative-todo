import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure client-side code works properly in production
  reactStrictMode: true,
  
  // Handle WebSocket connections and serverless limitations
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app', '*.vercel.com']
    }
  },
  
  // Explicitly pass environment variables to client
  env: {
    NEXT_PUBLIC_AIRSTATE_APP_ID: process.env.NEXT_PUBLIC_AIRSTATE_APP_ID,
  },
  
  // Optimize for deployment
  poweredByHeader: false,
  
  // Handle potential CORS issues
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
