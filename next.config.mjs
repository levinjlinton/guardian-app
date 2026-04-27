/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Stripe webhook to receive raw body
  experimental: {
    serverComponentsExternalPackages: ['stripe'],
  },
};

export default nextConfig;
