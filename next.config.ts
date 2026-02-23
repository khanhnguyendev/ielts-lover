import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Build Sentry CSP report URI from DSN
// DSN format: https://<key>@<org>.ingest.sentry.io/<project_id>
function buildCspReportUri(): string | null {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return null;
  try {
    const url = new URL(dsn);
    const projectId = url.pathname.replace("/", "");
    return `https://${url.host}/api/${projectId}/security/?sentry_key=${url.username}`;
  } catch {
    return null;
  }
}

const cspReportUri = buildCspReportUri();

const nextConfig: NextConfig = {
  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.supabase.co",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://api.openai.com https://api.cloudinary.com https://va.vercel-scripts.com https://*.ingest.sentry.io",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];

    if (cspReportUri) {
      cspDirectives.push(`report-uri ${cspReportUri}`);
      cspDirectives.push(`report-to csp-endpoint`);
    }

    const headers = [
      {
        key: "Content-Security-Policy",
        value: cspDirectives.join("; "),
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];

    // Report-To header (modern replacement for report-uri)
    if (cspReportUri) {
      headers.push({
        key: "Report-To",
        value: JSON.stringify({
          group: "csp-endpoint",
          max_age: 86400,
          endpoints: [{ url: cspReportUri }],
        }),
      });
    }

    return [
      {
        source: "/(.*)",
        headers,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Suppress Sentry logs during build
  silent: true,

  // Upload source maps for readable stack traces
  widenClientFileUpload: true,

  // Delete source maps after upload (hides from client bundles)
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Tree-shake Sentry debug logging in production
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
