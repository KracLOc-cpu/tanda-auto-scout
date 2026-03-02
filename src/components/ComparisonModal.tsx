import { useState } from "react";
import { X, Bot, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useComparison } from "@/context/ComparisonContext";
import type { CarDB } from "@/hooks/useCars";

interface SpecRow {
  label: string;
  key: string;
  highlight?: boolean;
}

const specs: SpecRow[] = [
  { label: "Бренд", key: "brand" },
  { label: "Кузов", key: "body_type" },
  { label: "Двигатель", key: "engine" },
  { label: "Трансмиссия", key: "transmission", highlight: true },
  { label: "Привод", key: "drive_type", highlight: true },
  { label: "Клиренс", key: "clearance_mm" },
  { label: "Расход (смеш.)", key: "fuel_consumption_mixed" },
  { label: "Цена от", key: "price" },
];

const formatPrice = (price: number) => {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)} млн ₸`;
  return `${price.toLocaleString("ru-RU")} ₸`;
};

const getBestValue = (key: string, values: string[]) => {
  if (key === "drive_type") {
    if (values.includes("Полный")) return "Полный";
  }
  return null;
};

const generateVerdict = (cars: CarDB[]) => {
  if (cars.length < 2) return "";
  const cheapest = cars.reduce((a, b) => (a.min_price < b.min_price ? a : b));
  const fullDrive = cars.find(c => c.car_trims?.some(t => t.drive_type === "Полный"));
  let text = `По совокупности характеристик, **${cheapest.brand} ${cheapest.model}** предлагает лучшую цену.`;
  if (fullDrive) text += ` **${fullDrive.brand} ${fullDrive.model}** — единственный с полным приводом.`;
  return text;
};

interface ComparisonModalProps {
  open: boolean;
  onClose: () => void;
}

const ComparisonModal = ({ open, onClose }: ComparisonModalProps) => {
  const { selectedCars } = useComparison();
  const [onlyDiff, setOnlyDiff] = useState(false);

  const getValue = (car: CarDB, key: string) => {
    if (key === "brand") return car.brand;
    if (key === "body_type") return car.body_type || "—";
    if (key === "clearance_mm") return car.clearance_mm ? `${car.clearance_mm} мм` : "—";
    if (key === "fuel_consumption_mixed") return car.fuel_consumption_mixed ? `${car.fuel_consumption_mixed} л` : "—";
    if (key === "price") return formatPrice(car.has_promo ? car.best_promo_price! : car.min_price);
    // Trim-level specs: show from first trim
    const trim = car.car_trims?.[0];
    if (key === "engine") return trim?.engine || "—";
    if (key === "transmission") return trim?.transmission || "—";
    if (key === "drive_type") return trim?.drive_type || "—";
    return "—";
  };

  const isRowIdentical = (spec: SpecRow) => {
    const values = selectedCars.map((c) => String(getValue(c, spec.key)));
    return values.every((v) => v === values[0]);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[85vh] overflow-auto rounded-xl border border-border bg-card shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
              <h2 className="text-lg font-bold text-foreground">Сравнение моделей</h2>
              <div className="flex items-center gap-2">
                {selectedCars.length >= 2 && (
                  <button
                    onClick={() => setOnlyDiff(!onlyDiff)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      onlyDiff
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Только различия
                  </button>
                )}
                <button onClick={onClose} className="rounded-full p-1 transition-colors hover:bg-secondary">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>

            {selectedCars.length < 2 ? (
              <div className="p-8 text-center text-muted-foreground">
                Добавьте минимум 2 автомобиля для сравнения
              </div>
            ) : (
              <>
                <div className="mx-5 mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-primary">AI Вердикт</span>
                  </div>
                  <p className="text-sm text-foreground whitespace-pre-line">
                    {generateVerdict(selectedCars)}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="sticky left-0 z-[5] bg-card px-4 py-3 text-left font-medium text-muted-foreground min-w-[140px]">
                          Параметр
                        </th>
                        {selectedCars.map((car) => (
                          <th key={car.id} className="px-4 py-3 text-left font-semibold text-foreground min-w-[160px]">
                            {car.brand} {car.model}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence initial={false}>
                        {specs.map((spec) => {
                          const identical = isRowIdentical(spec);
                          if (onlyDiff && identical) return null;

                          const values = selectedCars.map((c) => String(getValue(c, spec.key)));
                          const allSame = identical;
                          const best = spec.highlight ? getBestValue(spec.key, values) : null;

                          return (
                            <motion.tr
                              key={spec.key}
                              initial={onlyDiff ? { opacity: 0, height: 0 } : false}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25 }}
                              className="border-b border-border last:border-0"
                            >
                              <td className="sticky left-0 z-[5] bg-card px-4 py-3 font-medium text-muted-foreground">
                                {spec.label}
                              </td>
                              {values.map((val, i) => {
                                const isBest = spec.highlight && !allSame && val === best;
                                return (
                                  <td
                                    key={i}
                                    className={`px-4 py-3 text-foreground ${
                                      isBest
                                        ? "border-l-4 border-l-success bg-success/10"
                                        : ""
                                    }`}
                                  >
                                    {val}
                                  </td>
                                );
                              })}
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComparisonModal;
