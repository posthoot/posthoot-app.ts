/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  redirects: async () => {
    return [
      {
        source: "/login",
        destination: "/auth/login",
        permanent: true,
      },
      {
        source: "/signup",
        destination: "/auth/signup",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        hostname: "**",
      },
    ],
  },
  output: "standalone",
  webpack: (config, { nextRuntime }) => {
    if (nextRuntime !== "nodejs") return config;
    return {
      ...config,
      externals: [...config.externals, "everything-json"],
    };
  },
};

module.exports = nextConfig;
