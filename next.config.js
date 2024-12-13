/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime !== "nodejs") return config;
    return {
      ...config,
      externals: [
        ...config.externals,
        'everything-json',
      ],
    }
  }
};

module.exports = nextConfig;
