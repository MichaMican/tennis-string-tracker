import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

interface Props {
  value: string;
  size?: number;
  /** File name (without extension) used when downloading the QR code. */
  downloadName?: string;
  showDownload?: boolean;
}

export function QrCode({
  value,
  size = 180,
  downloadName = "tracker-qr",
  showDownload = true,
}: Props) {
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
    <div className="stack" style={{ alignItems: "center", gap: "0.75rem" }}>
      <div className="qr-box" ref={ref}>
        <QRCodeCanvas value={value} size={size} marginSize={2} />
      </div>
      {showDownload && (
        <button type="button" className="btn-sm" onClick={download}>
          Download QR code
        </button>
      )}
    </div>
  );
}
