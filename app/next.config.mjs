import createNextIntlPlugin from "next-intl/plugin";
import { withSentryConfig } from "@sentry/nextjs";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

/**
 * Security headers for production deployment
 * These headers provide defense in depth against common web attacks
 */
const securityHeaders = [
  // Prevent MIME type sniffing
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // Prevent clickjacking
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // Control referrer information
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // Restrict browser features
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "camera=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "usb=()",
    ].join(", "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Disable type checking during build (we do this in CI)
  typescript: {
    ignoreBuildErrors: false,
  },

  // Disable eslint during build (we do this in CI)
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Compress output
  compress: true,

  // Production source maps (disable for smaller builds)
  productionBrowserSourceMaps: false,

  webpack: (config, { isServer, dev, nextRuntime }) => {
    // Ignore opentelemetry warnings
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      {
        module: /@opentelemetry\/instrumentation\/build\/esm\/platform\/node\/instrumentation\.js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    // Optimize chunk size for server
    if (isServer && !dev) {
      config.optimization = {
        ...config.optimization,
        minimize: true,
        usedExports: true,
        sideEffects: false,
      };
    }

    return config;
  },

  // Security headers
  async headers() {
    const headers = [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },
    ];

    // HSTS in production (only on HTTPS)
    if (process.env.NODE_ENV === "production") {
      headers[0].headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }

    return headers;
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },

  experimental: {
    // Optimize package imports to reduce bundle size
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "react-syntax-highlighter",
      "@solana/web3.js",
      "@solana/wallet-adapter-react",
    ],
    // Enable server components external packages
    serverComponentsExternalPackages: [
      "@prisma/client",
      "prisma",
    ],
  },

  // Powered by header
  poweredByHeader: false,
};

// Apply next-intl plugin
const withIntlConfig = withNextIntl(nextConfig);

// Only wrap with Sentry if DSN is configured (opt-in)
const finalConfig = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(withIntlConfig, {
      silent: true,
      disableLogger: true,
      hideSourceMaps: true,
      widenClientFileUpload: false,
    })
  : withIntlConfig;

export default finalConfig;
