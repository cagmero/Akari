import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: [
    "@kamino-finance/klend-sdk",
    "@kamino-finance/kliquidity-sdk",
    "@orca-so/whirlpools-core",
    "@solana/web3.js"
  ],
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      os: false,
      path: false,
      crypto: false,
    };
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      topLevelAwait: true,
      layers: true,
    };
    return config;
  },
};

export default nextConfig;
