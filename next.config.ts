import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  compress: true,
  // Explicitly expose environment variables to the browser
  env: {
    NEXT_PUBLIC_AGORA_APP_ID: process.env.NEXT_PUBLIC_AGORA_APP_ID,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'totfmiywcmwjjblhrjdw.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)\\.(woff2|woff|eot|ttf|otf|svg|png|jpg|jpeg|gif|webp|js|css|map)$',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      }
    ];
  }
};

export default nextConfig;
