import { motion } from "framer-motion";
import { Bot } from "lucide-react";

const AISearchSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 pt-20"
  >
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10"
    >
      <Bot className="h-8 w-8 text-primary" />
    </motion.div>

    <p className="text-sm font-medium text-muted-foreground">TANDA AI анализирует рынок...</p>

    <div className="w-full space-y-3">
      {[80, 65, 90, 50].map((width, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.2 }}
          className="flex items-center gap-3"
        >
          <div
            className="h-3 animate-skeleton-pulse rounded-full bg-primary/20"
            style={{ width: `${width}%` }}
          />
        </motion.div>
      ))}
    </div>

    <div className="mt-4 grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + i * 0.15 }}
          className="space-y-3 rounded-xl border border-border bg-card p-3"
        >
          <div className="aspect-[16/10] animate-skeleton-pulse rounded-lg bg-muted" />
          <div className="h-3 w-2/3 animate-skeleton-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-skeleton-pulse rounded bg-primary/20" />
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default AISearchSkeleton;
