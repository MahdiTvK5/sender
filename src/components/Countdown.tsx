"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface CountdownProps {
  expiresAt: number;
  onExpire?: () => void;
}

function format(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function Countdown({ expiresAt, onExpire }: CountdownProps) {
  const [remaining, setRemaining] = useState(() => expiresAt - Date.now());

  useEffect(() => {
    setRemaining(expiresAt - Date.now());
    const timer = setInterval(() => {
      const left = expiresAt - Date.now();
      setRemaining(left);
      if (left <= 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const expired = remaining <= 0;
  const label = useMemo(() => (expired ? "00:00:00" : format(remaining)), [remaining, expired]);

  return (
    <div className="flex items-center justify-center gap-3">
      <Clock className={`h-5 w-5 ${expired ? "text-rose-400" : "text-accent-cyan"}`} />
      <motion.span
        key={label}
        initial={{ opacity: 0.5, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        dir="ltr"
        className={`font-mono text-2xl font-bold tabular-nums tracking-widest ${
          expired ? "text-rose-400" : "text-accent-cyan"
        }`}
        style={{ textShadow: expired ? "none" : "0 0 18px rgba(6,182,212,0.5)" }}
      >
        {label}
      </motion.span>
    </div>
  );
}
