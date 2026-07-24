export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-16 w-16">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent-purple/40" />
          <span className="absolute inset-2 animate-spin rounded-full border-4 border-transparent border-t-accent-purple border-r-accent-fuchsia" />
        </div>
        <p className="gradient-text text-sm font-bold">در حال بارگذاری...</p>
      </div>
    </div>
  );
}
