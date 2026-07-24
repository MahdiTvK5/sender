import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { AnimatedBackground } from "@/components/AnimatedBackground";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-vazir",
  display: "swap",
});

export const metadata: Metadata = {
  title: "پلتفرم ارسال کانفیگ",
  description: "کانفیگ خود را بارگذاری کرده و لینک اشتراک بسازید.",
  applicationName: "پلتفرم ارسال کانفیگ",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable} suppressHydrationWarning>
      <head>
        <script
          // Apply the persisted theme before hydration to avoid a flash.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t:'dark';document.documentElement.classList.remove('light','dark');document.documentElement.classList.add(d);}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <AnimatedBackground />
            <div className="relative z-10">{children}</div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
