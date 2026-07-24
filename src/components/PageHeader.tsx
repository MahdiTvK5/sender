"use client";

import { motion } from "framer-motion";
import { Rocket } from "lucide-react";

export function PageHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-gradient shadow-glow-lg"
      >
        <Rocket className="h-8 w-8 text-white" />
      </motion.div>
      <h1 className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
        <span className="gradient-text animate-pulse-glow">پلتفرم ارسال کانفیگ</span>
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400 sm:text-base">
        کانفیگ خود را بارگذاری کرده و لینک اشتراک بسازید.
      </p>
    </motion.header>
  );
}
