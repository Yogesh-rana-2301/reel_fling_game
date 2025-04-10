/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["image.tmdb.org", "avatars.githubusercontent.com"],
  },
};

module.exports = nextConfig;
