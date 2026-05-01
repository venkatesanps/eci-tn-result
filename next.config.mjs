const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const assetPrefix = basePath || '';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix,
};

export default nextConfig;
