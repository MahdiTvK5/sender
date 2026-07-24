"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Link2, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./Button";
import { CopyButton } from "./CopyButton";
import { Countdown } from "./Countdown";
import { QRCodeView } from "./QRCodeView";
import { ReadonlyField } from "./ReadonlyField";
import { useToast } from "./ToastProvider";

export interface GeneratedResult {
  code: string;
  shareLink: string;
  expiresAt: number;
  createdAt: number;
}

interface GeneratedCodeCardProps {
  result: GeneratedResult;
  onDeleted: () => void;
}

export function GeneratedCodeCard({ result, onDeleted }: GeneratedCodeCardProps) {
  const [expired, setExpired] = useState(() => result.expiresAt <= Date.now());
  const [deleting, setDeleting] = useState(false);
  const { showToast } = useToast();

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/config/${result.code}`, { method: "DELETE" });
      if (res.ok || res.status === 404) {
        showToast("کانفیگ حذف شد.", "success");
        onDeleted();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error ?? "حذف ناموفق بود.", "error");
      }
    } catch {
      showToast("خطای شبکه هنگام حذف.", "error");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 26 }}
      className="glass space-y-6 p-6 sm:p-8"
    >
      {/* Share link */}
      <ReadonlyField label="لینک مستقیم اشتراک" value={result.shareLink} />

      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="space-y-5 text-center md:text-right">
          <div>
            <p className="mb-2 text-sm text-slate-400">کد اختصاصی شما</p>
            <motion.p
              className="neon-code select-all text-6xl sm:text-7xl"
              dir="ltr"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              {result.code}
            </motion.p>
          </div>

          <div
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold ${
              expired
                ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${expired ? "bg-rose-400" : "bg-emerald-400"}`} />
            {expired ? "منقضی شده" : "فعال"}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="mb-1 text-xs text-slate-400">زمان باقی‌مانده تا انقضا</p>
            <Countdown expiresAt={result.expiresAt} onExpire={() => setExpired(true)} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <QRCodeView value={result.shareLink} />
          <p className="text-xs text-slate-400">اسکن برای باز کردن لینک</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
        <CopyButton value={result.code} label="کپی کد" />
        <CopyButton value={result.shareLink} label="کپی لینک" />
        <a href={result.shareLink} target="_blank" rel="noopener noreferrer" className="btn-ghost">
          <Link2 className="h-4 w-4" />
          باز کردن لینک
        </a>
        <Button variant="ghost" onClick={handleDelete} loading={deleting} className="!text-rose-300 hover:!border-rose-500/50">
          <Trash2 className="h-4 w-4" />
          حذف
        </Button>
      </div>

      <AnimatePresence>
        {expired && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-center text-sm text-rose-300"
          >
            این لینک منقضی شده است.
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
