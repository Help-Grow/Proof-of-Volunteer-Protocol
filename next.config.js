/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["antd-mobile"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.ipfs.w3s.link",
      },
      {
        protocol: "https",
        hostname: "arweave.net",
      },
    ],
  },
};

module.exports = nextConfig;
