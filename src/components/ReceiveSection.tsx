"use client";

import { motion } from "framer-motion";
import { Download, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./Button";
import { useToast } from "./ToastProvider";

const CODE_LENGTH = 5;

export function ReceiveSection() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  function handleChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
  }

  async function handleReceive() {
    if (code.length !== CODE_LENGTH) {
      showToast("کد باید ۵ رقم باشد.", "error");
      return;
    }

    setLoading(true);
    try {
      // Validate existence before navigating for a smoother UX.
      const res = await fetch(`/api/config/${code}`);
      if (res.status === 404) {
        showToast("کانفیگی پیدا نشد.", "error");
        return;
      }
      if (res.status === 410) {
        showToast("این لینک منقضی شده است.", "error");
        return;
      }
      router.push(`/s/${code}`);
    } catch {
      showToast("خطای شبکه. دوباره تلاش کنید.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass space-y-6 p-6 sm:p-8"
    >
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-blue shadow-glow-cyan">
          <Download className="h-5 w-5 text-white" />
        </span>
        <div>
          <h2 className="text-lg font-bold sm:text-xl">دریافت کانفیگ</h2>
          <p className="text-xs text-slate-400">کد ۵ رقمی را وارد کنید تا کانفیگ نمایش داده شود.</p>
        </div>
      </header>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <KeyRound className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <input
            value={code}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReceive()}
            placeholder="کد ۵ رقمی را وارد کنید"
            inputMode="numeric"
            dir="ltr"
            maxLength={CODE_LENGTH}
            className="glass-input pr-11 text-center font-mono text-lg tracking-[0.5em]"
          />
        </div>
        <Button onClick={handleReceive} loading={loading}>
          <Download className="h-4 w-4" />
          دریافت کانفیگ
        </Button>
      </div>
    </motion.section>
  );
}
