import { motion } from "framer-motion";
import { SiteNav } from "./SiteNav";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="dawn-bg relative min-h-dvh overflow-x-hidden">
      <SiteNav />
      <motion.main
        initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -16, filter: "blur(8px)" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 pt-24"
      >
        {children}
      </motion.main>
    </div>
  );
}
