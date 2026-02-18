import { useCallback, useEffect, useId, useRef, useState } from "react";

/**
 * QR scanner wrapper. Uses html5-qrcode; loads dynamically so a failure doesn't crash the page.
 * fullScreen: camera fills viewport as background; otherwise constrained box.
 */
export function QrScanner({ onScan, onError, fullScreen = false }) {
  const containerRef = useRef(null);
  const elementId = "qr-reader-" + useId().replace(/:/g, "");
  const [loadError, setLoadError] = useState(null);
  const [starting, setStarting] = useState(true);
  const scannerRef = useRef(null);

  const handleSuccess = useCallback(
    (decodedText) => {
      onScan?.(decodedText);
    },
    [onScan]
  );

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    async function init() {
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (cancelled) return;

        const scanner = new Html5Qrcode(elementId);
        if (cancelled) return;
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 5, qrbox: fullScreen ? undefined : { width: 250, height: 250 } },
          (text) => handleSuccess(text),
          () => {}
        );
        if (cancelled) {
          scanner.stop().catch(() => {});
        } else {
          setStarting(false);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err?.message || "Camera unavailable";
          setLoadError(message);
          onError?.(err);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner && typeof scanner.stop === "function") {
        scanner.stop().catch(() => {});
      }
    };
  }, [elementId, fullScreen, handleSuccess, onError]);

  if (loadError) {
    return (
      <div className="w-full max-w-[280px] rounded-2xl bg-black/40 border border-white/20 p-6 text-center">
        <p className="text-white/90 text-sm font-medium">Camera unavailable</p>
        <p className="text-white/60 text-xs mt-1">{loadError}</p>
      </div>
    );
  }

  const wrapperClass = fullScreen
    ? "qr-scanner-fullscreen fixed inset-0 z-0 w-full h-full overflow-hidden"
    : "relative w-full max-w-[280px] overflow-hidden rounded-2xl bg-black";
  const innerClass = fullScreen
    ? "absolute inset-0 w-full h-full [&_video]:!absolute [&_video]:!inset-0 [&_video]:!w-full [&_video]:!h-full [&_video]:!object-cover [&_*]:!max-w-none [&_*]:!max-h-none"
    : "w-full h-full [&_video]:!rounded-2xl [&_video]:!object-cover";

  return (
    <div className={wrapperClass} style={fullScreen ? undefined : { minHeight: 250 }}>
      <div
        id={elementId}
        ref={containerRef}
        className={innerClass}
      />
      {starting && (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-black/80 ${fullScreen ? "" : "rounded-2xl"}`}
        >
          <span className="text-white/90 text-sm">Starting camera…</span>
        </div>
      )}
    </div>
  );
}
