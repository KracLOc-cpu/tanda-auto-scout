import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useComparison } from "@/context/ComparisonContext";

interface SpecRow {
  label: string;
  key: string;
  highlight?: boolean;
}

const specs: SpecRow[] = [
  { label: "Бренд", key: "brand" },
  { label: "Двигатель", key: "engine" },
  { label: "Трансмиссия", key: "transmission", highlight: true },
  { label: "Привод", key: "drive" },
  { label: "Зимний пакет", key: "winterPackage", highlight: true },
  { label: "Вентиляция сидений", key: "ventilation", highlight: true },
  { label: "Цена", key: "price" },
];

const extraData: Record<string, Record<string, string>> = {
  "1": { winterPackage: "Да", ventilation: "Да" },
  "2": { winterPackage: "Нет", ventilation: "Нет" },
  "3": { winterPackage: "Да", ventilation: "Нет" },
};

const getBestValue = (key: string, values: string[]) => {
  if (key === "winterPackage" || key === "ventilation") return "Да";
  return null;
};

interface ComparisonModalProps {
  open: boolean;
  onClose: () => void;
}

const ComparisonModal = ({ open, onClose }: ComparisonModalProps) => {
  const { selectedCars } = useComparison();

  const getValue = (carId: string, key: string) => {
    const car = selectedCars.find((c) => c.id === carId);
    if (!car) return "";
    if (key in car) return (car as any)[key];
    return extraData[carId]?.[key] ?? "—";
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
            className="relative w-full max-w-3xl max-h-[80vh] overflow-auto rounded-xl border border-border bg-card shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-4">
              <h2 className="text-lg font-bold text-foreground">Сравнение моделей</h2>
              <button onClick={onClose} className="rounded-full p-1 transition-colors hover:bg-secondary">
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {selectedCars.length < 2 ? (
              <div className="p-8 text-center text-muted-foreground">
                Добавьте минимум 2 автомобиля для сравнения
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="sticky left-0 z-[5] bg-card px-4 py-3 text-left font-medium text-muted-foreground min-w-[140px]">
                        Параметр
                      </th>
                      {selectedCars.map((car) => (
                        <th key={car.id} className="px-4 py-3 text-left font-semibold text-foreground min-w-[160px]">
                          {car.brand} {car.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {specs.map((spec) => {
                      const values = selectedCars.map((c) => getValue(c.id, spec.key));
                      const allSame = values.every((v) => v === values[0]);
                      const best = spec.highlight ? getBestValue(spec.key, values) : null;

                      return (
                        <tr key={spec.key} className="border-b border-border last:border-0">
                          <td className="sticky left-0 z-[5] bg-card px-4 py-3 font-medium text-muted-foreground">
                            {spec.label}
                          </td>
                          {values.map((val, i) => {
                            const isBest = spec.highlight && !allSame && val === best;
                            return (
                              <td
                                key={i}
                                className={`px-4 py-3 text-foreground ${
                                  isBest ? "bg-[hsl(120_60%_90%)] dark:bg-[hsl(120_40%_15%)]" : ""
                                }`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComparisonModal;
