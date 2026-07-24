"use client";

import { CopyButton } from "./CopyButton";

interface ReadonlyFieldProps {
  label: string;
  value: string;
  dir?: "ltr" | "rtl";
}

export function ReadonlyField({ label, value, dir = "ltr" }: ReadonlyFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">{label}</label>
      <div className="flex items-center gap-2">
        <input
          readOnly
          dir={dir}
          value={value}
          onFocus={(e) => e.currentTarget.select()}
          className="glass-input flex-1 font-mono text-xs sm:text-sm"
        />
        <CopyButton value={value} compact />
      </div>
    </div>
  );
}
