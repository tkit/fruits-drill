"use client";

import { useEffect, useRef } from "react";
import { getWebInstrumentations, initializeFaro, Faro } from "@grafana/faro-web-sdk";
import { TracingInstrumentation } from "@grafana/faro-web-tracing";

export function FaroInitializer() {
  const faroRef = useRef<Faro | null>(null);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_FARO_URL;
    const appName = process.env.NEXT_PUBLIC_FARO_APP_NAME;
    const appVersion = process.env.NEXT_PUBLIC_FARO_APP_VERSION || "1.0.0";
    const appEnv = process.env.NEXT_PUBLIC_FARO_APP_ENV || "production";

    // Skip if no URL provided (e.g. local dev without env vars)
    // Also skip in development environment to avoid console errors
    if (!url || faroRef.current || process.env.NODE_ENV === "development") return;

    try {
      faroRef.current = initializeFaro({
        url,
        app: {
          name: appName || "fruits-drill",
          version: appVersion,
          environment: appEnv,
        },
        instrumentations: [...getWebInstrumentations(), new TracingInstrumentation()],
      });
    } catch (error) {
      console.error("Faro initialization failed", error);
    }
  }, []);

  return null;
}
