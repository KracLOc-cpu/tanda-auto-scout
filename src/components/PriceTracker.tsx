import { useState } from "react";
import { LineChart as LineChartIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { mockPriceData } from "@/lib/mockData";

const PriceTracker = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-0 top-1/2 z-40 -translate-y-1/2 rounded-r-lg border border-l-0 border-border bg-card p-2.5 shadow-md transition-colors hover:bg-secondary"
        aria-label="Open price tracker"
      >
        <LineChartIcon className="h-5 w-5 text-primary" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 z-50 flex h-full w-[min(400px,90vw)] flex-col border-r border-border bg-background shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-base font-bold text-foreground">Динамика цен</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-full p-1 transition-colors hover:bg-secondary"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="px-5 pt-4">
                <input
                  type="text"
                  placeholder="Поиск модели..."
                  className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </div>

              <div className="flex-1 px-2 pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockPriceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v) => `${v}м`}
                      tickLine={false}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "hsl(var(--foreground))",
                      }}
                      formatter={(value: number) => [`${value} млн ₸`]}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="tucson"
                      name="Tucson"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="tiggo"
                      name="Tiggo 7 Pro"
                      stroke="hsl(120 100% 40%)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sportage"
                      name="Sportage"
                      stroke="hsl(35 100% 50%)"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* AI Insight */}
              <div className="mx-5 mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-semibold text-primary">🤖 AI Анализ</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Цены на данные модели стабилизировались. Хорошее время для покупки.
                </p>
              </div>

              <div className="px-5 pb-4 text-xs text-muted-foreground">
                * Данные в миллионах тенге. Источник: дилеры Алматы.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PriceTracker;
