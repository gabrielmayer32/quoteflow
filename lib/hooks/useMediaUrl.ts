"use client";

import { useEffect, useState } from "react";

/**
 * Hook to resolve media URLs (handles r2: prefix)
 * @param ref - Media reference (r2:key or /uploads/path)
 * @returns Resolved URL or null if loading
 */
export function useMediaUrl(ref: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!ref) {
      setUrl(null);
      return;
    }

    // If it's a local path, use it directly
    if (!ref.startsWith("r2:")) {
      setUrl(ref);
      return;
    }

    // Resolve R2 URL
    let cancelled = false;

    async function resolve() {
      try {
        const response = await fetch("/api/media-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refs: [ref] }),
        });

        if (!response.ok || cancelled) {
          setUrl(null);
          return;
        }

        const data = await response.json();
        const resolvedUrl = data.urls?.[0];

        if (!cancelled && resolvedUrl) {
          setUrl(resolvedUrl);
        }
      } catch (error) {
        console.error("Failed to resolve media URL:", error);
        if (!cancelled) {
          setUrl(null);
        }
      }
    }

    resolve();

    return () => {
      cancelled = true;
    };
  }, [ref]);

  return url;
}
