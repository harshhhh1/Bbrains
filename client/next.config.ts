import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'bbrains.vercel.app',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'bbrains.onrender.com',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;
