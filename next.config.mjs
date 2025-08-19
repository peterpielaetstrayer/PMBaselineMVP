/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable proper build checking for production
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Optimize images for production
  images: {
    unoptimized: false,
  },
  // Add output configuration for static export if needed
  output: 'standalone',
}

export default nextConfig
