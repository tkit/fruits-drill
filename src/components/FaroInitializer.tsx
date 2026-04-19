"use client";

import { useEffect } from "react";

const faroUrl = process.env.NEXT_PUBLIC_FARO_URL;
const faroAppName = process.env.NEXT_PUBLIC_FARO_APP_NAME || "fruits-drill";
const faroAppVersion = process.env.NEXT_PUBLIC_FARO_APP_VERSION || "unknown";
const faroAppEnvironment =
  process.env.NEXT_PUBLIC_FARO_APP_ENV || process.env.NODE_ENV || "production";
const faroTracingDisabled = process.env.NEXT_PUBLIC_FARO_DISABLE_TRACING === "true";

export function FaroInitializer() {
  useEffect(() => {
    if (!faroUrl) {
      return;
    }

    let cancelled = false;

    const init = async () => {
      try {
        const [{ faro, getWebInstrumentations, initializeFaro }, { TracingInstrumentation }] =
          await Promise.all([import("@grafana/faro-web-sdk"), import("@grafana/faro-web-tracing")]);

        if (cancelled || faro.api) {
          return;
        }

        initializeFaro({
          url: faroUrl,
          app: {
            name: faroAppName,
            version: faroAppVersion,
            environment: faroAppEnvironment,
          },
          instrumentations: [
            ...getWebInstrumentations(),
            ...(!faroTracingDisabled ? [new TracingInstrumentation()] : []),
          ],
        });
      } catch (error) {
        if (process.env.NODE_ENV !== "production") {
          console.error("Faro initialization failed", error);
        }
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
