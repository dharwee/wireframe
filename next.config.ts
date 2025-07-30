/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'zvblupxcbmbinhsvkbdt.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // ✅ ADD THIS NEW BLOCK for Google profile pictures
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;