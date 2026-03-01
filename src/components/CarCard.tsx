import { useState } from "react";
import { Plus, Check, Car, Heart } from "lucide-react";
import { motion } from "framer-motion";
import type { CarDB } from "@/hooks/useCars";
import { useComparison } from "@/context/ComparisonContext";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/hooks/useAuth";
import TestDriveModal from "./TestDriveModal";

interface CarCardProps {
  car: CarDB;
  index: number;
  highlighted?: boolean;
}

const formatPrice = (price: number) => {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)} млн ₸`;
  return `${price.toLocaleString("ru-RU")} ₸`;
};

const CarCard = ({ car, index, highlighted }: CarCardProps) => {
  const { toggleCar, isSelected } = useComparison();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const selected = isSelected(car.id);
  const [showTestDrive, setShowTestDrive] = useState(false);
  const fav = isFavorite(String(car.id));

  const specs = car.specifications;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 * index, duration: 0.4 }}
        whileHover={{ y: -4 }}
        className={`group overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-xl ${
          highlighted
            ? "border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/10"
            : "border-border"
        }`}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <img
            src={car.image_url}
            alt={`${car.brand} ${car.model}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {car.year && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="absolute left-3 top-3 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success glow-success"
            >
              {car.year}
            </motion.span>
          )}
          {highlighted && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-3 top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground"
            >
              ✨ Рекомендация AI
            </motion.span>
          )}
          {user && (
            <button
              onClick={() => toggleFavorite(String(car.id))}
              className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${fav ? "fill-destructive text-destructive" : "text-muted-foreground"}`}
              />
            </button>
          )}
        </div>
        <div className="p-4">
          <p className="text-sm text-muted-foreground">{car.brand}</p>
          <h3 className="text-lg font-bold text-foreground md:text-base">{car.model}</h3>
          <p className="mt-1 text-2xl font-bold text-primary md:text-xl">{formatPrice(car.price)}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {specs?.engine && <span className="rounded bg-secondary px-2 py-0.5">{specs.engine}</span>}
            {specs?.transmission && <span className="rounded bg-secondary px-2 py-0.5">{specs.transmission}</span>}
            {specs?.drive && <span className="rounded bg-secondary px-2 py-0.5">{specs.drive}</span>}
          </div>

          <button
            onClick={() => setShowTestDrive(true)}
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

      <TestDriveModal
        open={showTestDrive}
        onClose={() => setShowTestDrive(false)}
        carName={`${car.brand} ${car.model}`}
      />
    </>
  );
};

export default CarCard;
