/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone is for production images only. Enabling it for every build pollutes
  // `.next/` with production artifacts that corrupt a concurrent `next dev`.
  ...(process.env.NODE_ENV === 'production' ? { output: 'standalone' } : {}),
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
