"use client";

import { useEffect, useState } from "react";

/**
 * Service Initializer Component
 * Ensures backend services are started when the app loads
 */
export default function ServiceInitializer() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initializeServices() {
      try {
        const response = await fetch("/api/startup", {
          method: "GET",
          cache: "no-store",
        });

        if (mounted) {
          if (response.ok) {
            setInitialized(true);
            console.log(
              "[ServiceInitializer] Services initialized successfully"
            );
          } else {
            console.warn("[ServiceInitializer] Services initialization failed");
          }
        }
      } catch (error) {
        if (mounted) {
          console.error(
            "[ServiceInitializer] Error initializing services:",
            error
          );
        }
      }
    }

    // Call initialization after a short delay to avoid blocking initial render
    const timer = setTimeout(() => {
      if (mounted) {
        initializeServices();
      }
    }, 1000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}
