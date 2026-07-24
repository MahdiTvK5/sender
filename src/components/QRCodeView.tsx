"use client";

import { motion } from "framer-motion";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface QRCodeViewProps {
  value: string;
  size?: number;
}

export function QRCodeView({ value, size = 176 }: QRCodeViewProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: { dark: "#0d1117", light: "#ffffff" },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl(null);
      });
    return () => {
      active = false;
    };
  }, [value, size]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="inline-flex items-center justify-center rounded-2xl bg-white p-3 shadow-glow"
      style={{ width: size + 24, height: size + 24 }}
    >
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={dataUrl} alt="QR code لینک اشتراک" width={size} height={size} />
      ) : (
        <div className="h-full w-full animate-pulse rounded-xl bg-slate-200" />
      )}
    </motion.div>
  );
}
