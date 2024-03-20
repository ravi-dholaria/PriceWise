/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "*" }],
  },
  serverRuntimeConfig: {
    runtime: process.env.RUNTIME,
  },
};

export default nextConfig;
