/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the WebSocket driver out of the webpack bundle — bundling `ws`
  // breaks its WebSocket connections to Neon (manifests as
  // "Connection terminated unexpectedly" after a long hang).
  experimental: {
    serverComponentsExternalPackages: ["@neondatabase/serverless", "ws"],
  },
};

export default nextConfig;
