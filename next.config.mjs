/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // App Router routes are typed; broken internal links fail the build.
  typedRoutes: true,
  experimental: {
    // Server Actions are the default mutation path; keep the body cap explicit.
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  async headers() {
    // Server-first product: authenticated pages carry confidential data and
    // must never be cached by the browser or intermediaries.
    return [
      {
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, no-cache, no-store, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
