import Link from "next/link";
import { ArrowRight, FileWarning, TimerOff } from "lucide-react";
import { getConfigByCode } from "@/lib/store";
import { isValidCode } from "@/lib/validation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ConfigViewer } from "@/components/ConfigViewer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface SharePageProps {
  params: Promise<{ code: string }>;
}

function StateShell({
  icon,
  title,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  tone: "error" | "warning";
}) {
  const ring =
    tone === "error" ? "border-rose-500/30 bg-rose-500/10" : "border-amber-500/30 bg-amber-500/10";
  const text = tone === "error" ? "text-rose-300" : "text-amber-300";
  return (
    <div className={`glass flex flex-col items-center gap-4 p-10 text-center`}>
      <span className={`flex h-16 w-16 items-center justify-center rounded-3xl border ${ring} ${text}`}>
        {icon}
      </span>
      <p className={`text-lg font-bold ${text}`}>{title}</p>
      <Link href="/" className="btn-gradient mt-2">
        <ArrowRight className="h-4 w-4" />
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}

export default async function SharePage({ params }: SharePageProps) {
  const { code } = await params;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-center justify-between">
        <Link href="/" className="btn-ghost">
          <ArrowRight className="h-4 w-4" />
          صفحه اصلی
        </Link>
        <ThemeToggle />
      </div>

      <SharePageBody code={code} />
    </main>
  );
}

async function SharePageBody({ code }: { code: string }) {
  if (!isValidCode(code)) {
    return (
      <StateShell icon={<FileWarning className="h-8 w-8" />} title="کانفیگی پیدا نشد." tone="error" />
    );
  }

  const record = getConfigByCode(code);

  if (!record) {
    return (
      <StateShell icon={<FileWarning className="h-8 w-8" />} title="کانفیگی پیدا نشد." tone="error" />
    );
  }

  if (record.status === "expired") {
    return (
      <StateShell
        icon={<TimerOff className="h-8 w-8" />}
        title="این لینک منقضی شده است."
        tone="warning"
      />
    );
  }

  return (
    <ConfigViewer
      code={record.code}
      config={record.config}
      shareLink={record.shareLink}
      createdAt={record.createdAt}
      expiresAt={record.expiresAt}
    />
  );
}
