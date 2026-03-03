import { useState } from "react";
import { LineChart as LineChartIcon, X, ChevronDown } from "lucide-react";
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
  ResponsiveContainer,
} from "recharts";
import { mockPriceData, mockPricePredicted } from "@/lib/mockData";
import { useIsMobile } from "@/hooks/use-mobile";

const modelOptions = [
  { value: "all", label: "Все модели" },
  { value: "tucson", label: "Hyundai Tucson" },
  { value: "tiggo4", label: "Chery Tiggo 4" },
  { value: "sportage", label: "Kia Sportage" },
];

const PriceTracker = () => {
  const [open, setOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("all");
  const isMobile = useIsMobile();

  const showTucson = selectedModel === "all" || selectedModel === "tucson";
  const showTiggo = selectedModel === "all" || selectedModel === "tiggo4";
  const showSportage = selectedModel === "all" || selectedModel === "sportage";

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ x: 4 }}
        className="fixed left-0 top-1/2 z-40 -translate-y-1/2 rounded-r-lg border border-l-0 border-border bg-card p-2.5 shadow-md transition-colors hover:bg-secondary hidden md:flex"
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
                <div>
                  <h2 className="text-base font-bold text-foreground">Динамика цен</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Данные дилеров Алматы · млн ₸</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-lg border border-border bg-secondary p-2 transition-colors hover:bg-muted"
                  aria-label="Close price tracker"
                >
                  <X className="h-5 w-5 text-foreground" />
                </button>
              </div>

              {/* Model selector */}
              <div className="px-5 pt-4">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Модель
                </label>
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-border bg-card px-3 py-2.5 pr-8 text-sm text-foreground outline-none focus:border-primary"
                  >
                    {modelOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-2 pt-5">
                <p className="mb-2 px-3 text-xs font-medium text-muted-foreground">
                  Исторические цены (2024–2026)
                </p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={mockPriceData}>
                    <defs>
                      <linearGradient id="gradTucson" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}м`} tickLine={false} width={36} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }}
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = { tucson: "Tucson", tiggo4: "Tiggo 4", sportage: "Sportage" };
                        return [`${value} млн ₸`, labels[name] || name];
                      }}
                    />
                    {showTucson && <Area type="monotone" dataKey="tucson" name="tucson" stroke="hsl(var(--primary))" fill="url(#gradTucson)" strokeWidth={2} />}
                    {showTiggo && <Area type="monotone" dataKey="tiggo4" name="tiggo4" stroke="hsl(var(--success))" fill="hsl(var(--success))" fillOpacity={0.1} strokeWidth={2} />}
                    {showSportage && <Area type="monotone" dataKey="sportage" name="sportage" stroke="hsl(35 100% 50%)" fill="hsl(35 100% 50%)" fillOpacity={0.1} strokeWidth={2} />}
                  </AreaChart>
                </ResponsiveContainer>

                <p className="mb-2 mt-6 px-3 text-xs font-medium text-muted-foreground">Прогноз (тренд +2%)</p>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={mockPricePredicted}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickFormatter={(v) => `${v}м`} tickLine={false} width={36} />
                    <Tooltip
                      contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12, color: "hsl(var(--foreground))" }}
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = { tucson: "Tucson", tiggo4: "Tiggo 4", sportage: "Sportage" };
                        return [`${value} млн ₸`, labels[name] || name];
                      }}
                    />
                    {showTucson && <Line type="monotone" dataKey="tucson" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="6 3" dot={false} />}
                    {showTiggo && <Line type="monotone" dataKey="tiggo4" stroke="hsl(var(--success))" strokeWidth={2} strokeDasharray="6 3" dot={false} />}
                    {showSportage && <Line type="monotone" dataKey="sportage" stroke="hsl(35 100% 50%)" strokeWidth={2} strokeDasharray="6 3" dot={false} />}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mx-5 mb-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs font-semibold text-primary">🤖 AI Анализ</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Цены на популярные модели умеренно растут. Hyundai Tucson и Kia Sportage сохраняют высокую ликвидность при перепродаже. Chery Tiggo 4 — лучший бюджетный вариант.
                </p>
              </div>

              <div className="px-5 pb-4 text-xs text-muted-foreground">
                * Ориентировочные данные. Актуальные цены уточняйте у дилеров.
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PriceTracker;
