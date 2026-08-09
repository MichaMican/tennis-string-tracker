import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useI18n } from "../i18n/useI18n";

interface Props {
  value: string;
  size?: number;
  /** File name (without extension) used when downloading the QR code. */
  downloadName?: string;
}

/** Downloads a QR code without showing it, using an off-screen canvas. */
export function QrDownloadButton({
  value,
  size = 180,
  downloadName = "tracker-qr",
}: Props) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  const download = () => {
    const canvas = ref.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${downloadName}.png`;
    link.click();
  };

  return (
    <>
      <button type="button" className="btn-sm" onClick={download}>
        {t("qr.download")}
      </button>
      <div
        ref={ref}
        aria-hidden="true"
        style={{
          position: "absolute",
          width: 0,
          height: 0,
          overflow: "hidden",
          visibility: "hidden",
          pointerEvents: "none",
        }}
      >
        <QRCodeCanvas value={value} size={size} marginSize={2} />
      </div>
    </>
  );
}
