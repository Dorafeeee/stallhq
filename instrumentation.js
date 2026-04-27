import * as Sentry from "@sentry/nextjs";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    Sentry.init({
      dsn: "https://17a43ecc9a3b5928b43b5823dea9fa82@o4511291596537856.ingest.de.sentry.io/4511291700936784",
      sendDefaultPii: true,
    });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: "https://17a43ecc9a3b5928b43b5823dea9fa82@o4511291596537856.ingest.de.sentry.io/4511291700936784",
      sendDefaultPii: true,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;