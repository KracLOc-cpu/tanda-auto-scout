import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import type { Car } from "@/lib/mockData";

interface CarCardProps {
  car: Car;
  index: number;
}

const CarCard = ({ car, index }: CarCardProps) => (
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
      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
        <Plus className="h-4 w-4" />
        Добавить к сравнению
      </button>
    </div>
  </motion.div>
);

export default CarCard;
