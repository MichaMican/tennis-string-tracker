import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { useI18n } from "../i18n/useI18n";

interface QrScannerProps {
  onScan: (text: string) => void;
  onClose: () => void;
}

/**
 * Camera-based QR code scanner. Continuously grabs video frames and decodes
 * them with jsQR until a code is found or the scanner is closed.
 */
export function QrScanner({ onScan, onClose }: QrScannerProps) {
  const { t } = useI18n();
  const videoRef = useRef<HTMLVideoElement>(null);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let rafId = 0;
    let stopped = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    const tick = () => {
      if (stopped) return;
      const video = videoRef.current;
      if (video && ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(image.data, image.width, image.height, {
          inversionAttempts: "dontInvert",
        });
        if (code && code.data) {
          stopped = true;
          onScanRef.current(code.data);
          return;
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((mediaStream) => {
        if (stopped) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = mediaStream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = mediaStream;
          void video.play();
          rafId = requestAnimationFrame(tick);
        }
      })
      .catch(() => setError("camera"));

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="stack">
      {error ? (
        <p className="error">{t("stringer.scanCameraError")}</p>
      ) : (
        <video
          ref={videoRef}
          muted
          playsInline
          style={{ width: "100%", maxWidth: 420, borderRadius: 8 }}
        />
      )}
      <div className="row">
        <button type="button" className="btn-sm" onClick={onClose}>
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
}
