import * as Sentry from '@sentry/nextjs';

export function generateMetadata() {
  return {
    title: "Oja — Business Dashboard",
    description: "Simple business management for Nigerian entrepreneurs",
    other: {
      ...Sentry.getTraceData()
    }
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}