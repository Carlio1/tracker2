// En tu archivo: next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {

  output: 'export', 

  // El resto de tu configuración se queda igual
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;