import { Plus, Check, Car } from "lucide-react";
import { motion } from "framer-motion";
import type { Car as CarType } from "@/lib/mockData";
import { useComparison } from "@/context/ComparisonContext";

interface CarCardProps {
  car: CarType;
  index: number;
}

const CarCard = ({ car, index }: CarCardProps) => {
  const { toggleCar, isSelected } = useComparison();
  const selected = isSelected(car.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.4 }}
      className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={car.image}
          alt={`${car.brand} ${car.name}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {car.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-[hsl(120_100%_55%/0.15)] px-3 py-1 text-xs font-semibold text-[hsl(120_100%_30%)] dark:text-[hsl(120_100%_55%)]">
            {car.badge}
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm text-muted-foreground">{car.brand}</p>
        <h3 className="text-lg font-bold text-foreground">{car.name}</h3>
        <p className="mt-1 text-xl font-bold text-primary">{car.price}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded bg-secondary px-2 py-0.5">{car.engine}</span>
          <span className="rounded bg-secondary px-2 py-0.5">{car.transmission}</span>
          <span className="rounded bg-secondary px-2 py-0.5">{car.drive}</span>
        </div>

        <button
          onClick={() => window.open("https://wa.me/77001234567?text=Хочу записаться на тест-драйв " + car.brand + " " + car.name, "_blank")}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Car className="h-4 w-4" />
          Записаться на тест-драйв
        </button>

        <button
          onClick={() => toggleCar(car)}
          className={`mt-2 flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition-colors ${
            selected
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-foreground hover:bg-secondary"
          }`}
        >
          {selected ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {selected ? "В сравнении" : "Добавить к сравнению"}
        </button>
      </div>
    </motion.div>
  );
};

export default CarCard;
