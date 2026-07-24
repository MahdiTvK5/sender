"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./Button";
import { GeneratedCodeCard, type GeneratedResult } from "./GeneratedCodeCard";
import { useToast } from "./ToastProvider";

export function GeneratorSection() {
  const [config, setConfig] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const { showToast } = useToast();

  async function handleGenerate() {
    if (config.trim().length === 0) {
      showToast("کانفیگ نمی‌تواند خالی باشد.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error ?? "خطا در ساخت لینک.", "error");
        return;
      }

      setResult({
        code: data.code,
        shareLink: data.shareLink,
        expiresAt: data.expiresAt,
        createdAt: data.createdAt,
      });
      showToast("لینک هوشمند ساخته شد.", "success");
    } catch {
      showToast("خطای شبکه. دوباره تلاش کنید.", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setConfig("");
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass space-y-6 p-6 sm:p-8"
    >
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-gradient shadow-glow">
          <Wand2 className="h-5 w-5 text-white" />
        </span>
        <div>
          <h2 className="text-lg font-bold sm:text-xl">سازنده لینک هوشمند</h2>
          <p className="text-xs text-slate-400">کانفیگ خود را وارد کنید و لینک اختصاصی بگیرید.</p>
        </div>
      </header>

      <div className="space-y-3">
        <textarea
          value={config}
          onChange={(e) => setConfig(e.target.value)}
          placeholder="کانفیگ خود را وارد کنید..."
          dir="ltr"
          rows={7}
          className="glass-input resize-y font-mono text-xs sm:text-sm"
        />
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{config.length.toLocaleString("fa-IR")} کاراکتر</span>
          <span className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-accent-purple" />
            اعتبار ۲۴ ساعته
          </span>
        </div>
      </div>

      <Button onClick={handleGenerate} loading={loading} className="w-full sm:w-auto">
        <Sparkles className="h-4 w-4" />
        ساخت لینک هوشمند
      </Button>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.code}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="h-px bg-gradient-to-l from-transparent via-white/10 to-transparent" />
            <GeneratedCodeCard result={result} onDeleted={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
