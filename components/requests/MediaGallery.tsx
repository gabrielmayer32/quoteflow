"use client";

import { useEffect, useMemo, useState } from "react";

interface MediaGalleryProps {
  mediaRefs: string[]; // "r2:<key>" OR "/uploads/..."
}

type ResolvedMedia = { url: string; kind: "image" | "video" };

export function MediaGallery({ mediaRefs }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [resolved, setResolved] = useState<string[]>([]);

  useEffect(() => {
  let cancelled = false;

  async function resolveUrls() {
    if (!mediaRefs?.length) {
      setResolved([]);
      return;
    }

    const needsResolve = mediaRefs.some((r) => typeof r === "string" && r.startsWith("r2:"));
    if (!needsResolve) {
      setResolved(mediaRefs);
      return;
    }

    try {
      const resp = await fetch("/api/media-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refs: mediaRefs }),
      });

      const text = await resp.text();
      console.log("media-url status:", resp.status);
      console.log("media-url raw response:", text);

      if (!resp.ok) {
        setResolved([]);
        return;
      }

      const data = JSON.parse(text) as { urls?: (string | null)[] };
      const urls = data.urls ?? [];

      // Keep only valid strings for rendering
      const onlyStrings = urls.filter((u): u is string => typeof u === "string" && u.length > 0);

      if (!cancelled) setResolved(onlyStrings);
    } catch (err) {
      console.error("resolveUrls error:", err);
      if (!cancelled) setResolved([]);
    }
  }

  resolveUrls();
  return () => {
    cancelled = true;
  };
}, [mediaRefs]);


  const isVideo = (url: string) => url.match(/\.(mp4|webm|ogg|mov)$/i);

  const items: ResolvedMedia[] = useMemo(
    () =>
      resolved.map((url) => ({
        url,
        kind: isVideo(url) ? "video" : "image",
      })),
    [resolved]
  );

  if (!items.length) return null;

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Media Attachments ({items.length})
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer group"
            onClick={() => setSelectedIndex(index)}
          >
            {item.kind === "video" ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-900">
                <span className="text-white text-sm">Video</span>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-opacity flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                    Click to view
                  </span>
                </div>
              </div>
            ) : (
              <>
                <img src={item.url} alt={`Media ${index + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-opacity" />
              </>
            )}
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
            onClick={() => setSelectedIndex(null)}
          >
            ×
          </button>

          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            {items[selectedIndex].kind === "video" ? (
              <video src={items[selectedIndex].url} controls className="max-w-full max-h-[80vh] rounded-lg" />
            ) : (
              <img
                src={items[selectedIndex].url}
                alt={`Media ${selectedIndex + 1}`}
                className="max-w-full max-h-[80vh] rounded-lg object-contain"
              />
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 rounded-full px-4 py-2">
              <button
                onClick={() => setSelectedIndex(Math.max(0, selectedIndex - 1))}
                disabled={selectedIndex === 0}
                className="text-white disabled:opacity-30 hover:text-gray-300"
              >
                ← Previous
              </button>
              <span className="text-white text-sm">
                {selectedIndex + 1} / {items.length}
              </span>
              <button
                onClick={() => setSelectedIndex(Math.min(items.length - 1, selectedIndex + 1))}
                disabled={selectedIndex === items.length - 1}
                className="text-white disabled:opacity-30 hover:text-gray-300"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
