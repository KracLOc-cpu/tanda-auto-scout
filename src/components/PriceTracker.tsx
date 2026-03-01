import { useState } from "react";
import { LineChart as LineChartIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { mockPriceData, mockPricePredicted } from "@/lib/mockData";
import { useIsMobile } from "@/hooks/use-mobile";

const PriceTracker = () => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ x: 4 }}
        className="fixed left-0 top-1/2 z-40 -translate-y-1/2 rounded-r-lg border border-l-0 border-border bg-card p-2.5 shadow-md transition-colors hover:bg-secondary"
        aria-label="Open price tracker"
      >
        <LineChartIcon className="h-5 w-5 text-primary" />
      </motion.button>

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
              className={`fixed left-0 top-0 z-50 flex h-full flex-col border-r border-border bg-background shadow-xl ${
                isMobile ? "w-full" : "w-[400px]"
              }`}
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

              {/* Main chart */}
              <div className="flex-1 overflow-y-auto px-2 pt-6">
                <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">Реальные цены (2024-2026)</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={mockPriceData}>
                    <defs>
                      <linearGradient id="gradTucson" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v) => `${v}м`}
                      tickLine={false}
                      width={36}
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
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area
                      type="monotone"
                      dataKey="tucson"
                      name="Tucson"
                      stroke="hsl(var(--primary))"
                      fill="url(#gradTucson)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="tiggo"
                      name="Tiggo 7 Pro"
                      stroke="hsl(var(--success))"
                      fill="hsl(var(--success))"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="sportage"
                      name="Sportage"
                      stroke="hsl(35 100% 50%)"
                      fill="hsl(35 100% 50%)"
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                {/* Predicted chart */}
                <p className="mb-2 mt-6 px-3 text-xs font-medium text-muted-foreground">Прогноз (+2% тренд)</p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={mockPricePredicted}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(v) => `${v}м`}
                      tickLine={false}
                      width={36}
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
                    <Line type="monotone" dataKey="tucson" name="Tucson" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                    <Line type="monotone" dataKey="tiggo" name="Tiggo 7 Pro" stroke="hsl(var(--success))" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                    <Line type="monotone" dataKey="sportage" name="Sportage" stroke="hsl(35 100% 50%)" strokeWidth={2} strokeDasharray="6 3" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* AI Insight */}
              <div className="mx-5 mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-semibold text-primary">🤖 AI Анализ</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Цены на данные модели стабилизировались. Хорошее время для покупки. Прогноз показывает умеренный рост ~2% в квартал.
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
