"use client";

import { motion } from "framer-motion";
import { FileCode2, TimerOff } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { CopyButton } from "./CopyButton";
import { Countdown } from "./Countdown";
import { QRCodeView } from "./QRCodeView";
import { ReadonlyField } from "./ReadonlyField";

interface ConfigViewerProps {
  code: string;
  config: string;
  shareLink: string;
  createdAt: number;
  expiresAt: number;
}

function formatDate(ts: number): string {
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(ts));
  } catch {
    return new Date(ts).toISOString();
  }
}

export function ConfigViewer({ code, config, shareLink, createdAt, expiresAt }: ConfigViewerProps) {
  const [expired, setExpired] = useState(() => expiresAt <= Date.now());

  if (expired) {
    return (
      <div className="glass flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl border border-amber-500/30 bg-amber-500/10 text-amber-300">
          <TimerOff className="h-8 w-8" />
        </span>
        <p className="text-lg font-bold text-amber-300">این لینک منقضی شده است.</p>
        <Link href="/" className="btn-gradient mt-2">
          <ArrowRight className="h-4 w-4" />
          بازگشت به صفحه اصلی
        </Link>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass space-y-6 p-6 sm:p-8"
    >
      <header className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-gradient shadow-glow">
          <FileCode2 className="h-5 w-5 text-white" />
        </span>
        <div>
          <h1 className="text-lg font-bold sm:text-xl">کانفیگ اشتراکی</h1>
          <p className="text-xs text-slate-400">
            کد <span className="gradient-text font-bold" dir="ltr">{code}</span>
          </p>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="mb-1 text-xs text-slate-400">زمان باقی‌مانده تا انقضا</p>
            <Countdown expiresAt={expiresAt} onExpire={() => setExpired(true)} />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="mb-1 text-slate-500">ایجاد شده در</p>
              <p className="font-medium text-slate-200">{formatDate(createdAt)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="mb-1 text-slate-500">انقضا در</p>
              <p className="font-medium text-slate-200">{formatDate(expiresAt)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <QRCodeView value={shareLink} />
          <p className="text-xs text-slate-400">اسکن برای اشتراک‌گذاری</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-300">محتوای کانفیگ</label>
          <CopyButton value={config} label="کپی کانفیگ" compact />
        </div>
        <pre
          dir="ltr"
          className="max-h-96 overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs leading-relaxed text-slate-100 sm:text-sm"
        >
          {config}
        </pre>
      </div>

      <ReadonlyField label="لینک مستقیم اشتراک" value={shareLink} />

      <div className="flex flex-wrap gap-3">
        <CopyButton value={config} label="کپی کانفیگ" />
        <CopyButton value={shareLink} label="کپی لینک" />
      </div>
    </motion.section>
  );
}
