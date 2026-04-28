import * as Sentry from "@sentry/nextjs";

export function generateMetadata() {
  return {
    title: "StallHQ — Run your business. Skip the spreadsheet.",
    description: "StallHQ helps Nigerian entrepreneurs sell, track inventory, send invoices, and grow — all in one place.",
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
      ],
    },
    openGraph: {
      title: "StallHQ — Run your business. Skip the spreadsheet.",
      description: "The simplest way for Nigerian entrepreneurs to sell, track inventory, send invoices, and grow.",
      type: "website",
    },
    other: {
      ...Sentry.getTraceData(),
    },
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
