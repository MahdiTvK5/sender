import Link from "next/link";
import { ArrowRight, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-4">
      <div className="glass flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl border border-rose-500/30 bg-rose-500/10 text-rose-300">
          <SearchX className="h-8 w-8" />
        </span>
        <p className="text-lg font-bold text-rose-300">کانفیگی پیدا نشد.</p>
        <Link href="/" className="btn-gradient mt-2">
          <ArrowRight className="h-4 w-4" />
          بازگشت به صفحه اصلی
        </Link>
      </div>
    </main>
  );
}
