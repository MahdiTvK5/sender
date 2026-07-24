import { GeneratorSection } from "@/components/GeneratorSection";
import { ReceiveSection } from "@/components/ReceiveSection";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PageHeader } from "@/components/PageHeader";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent-cyan" />
          آنلاین · بدون نیاز به ورود
        </span>
        <ThemeToggle />
      </div>

      <PageHeader />

      <GeneratorSection />
      <ReceiveSection />

      <footer className="mt-auto pt-6 text-center text-xs text-slate-500">
        <p>ساخته شده با Next.js · لینک‌ها پس از ۲۴ ساعت منقضی می‌شوند.</p>
      </footer>
    </main>
  );
}
