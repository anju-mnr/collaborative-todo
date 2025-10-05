import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure client-side code works properly in production
  reactStrictMode: true,
  
  // WebSocket and serverless optimizations
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '*.vercel.app', '*.vercel.com']
    }
  },
  
  // Explicitly pass environment variables to client
  env: {
    NEXT_PUBLIC_AIRSTATE_APP_ID: process.env.NEXT_PUBLIC_AIRSTATE_APP_ID,
  },
  
  // Optimize for deployment and WebSocket connections
  poweredByHeader: false,
  compress: false, // Can interfere with WebSocket upgrades
  
  // Handle WebSocket and CORS issues
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // WebSocket support headers
          {
            key: 'Connection',
            value: 'Upgrade',
          },
          {
            key: 'Upgrade',
            value: 'websocket',
          },
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // CORS headers for WebSocket
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, Upgrade, Connection',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
