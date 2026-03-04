import { useState } from "react";
import { Plus, Check, Car, Heart, BadgePercent, ShieldCheck, GitCompare } from "lucide-react";
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
  onOpenDetail?: (car: CarDB) => void;
}

const formatPrice = (price: number) => {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)} млн ₸`;
  return `${price.toLocaleString("ru-RU")} ₸`;
};

const formatPriceMobile = (price: number) => {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)} млн`;
  return `${price.toLocaleString("ru-RU")}`;
};

const FALLBACK_IMG = "https://placehold.co/640x400/1a1a2e/4a9eff?text=TANDA";

const CarCard = ({ car, index, highlighted, onOpenDetail }: CarCardProps) => {
  const { toggleCar, isSelected } = useComparison();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const selected = isSelected(car.id);
  const [showTestDrive, setShowTestDrive] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fav = isFavorite(String(car.id));
  const firstTrim = car.car_trims?.[0];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(0.04 * index, 0.3), duration: 0.35 }}
        whileHover={{ y: -3 }}
        className={`group overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:shadow-lg ${
          highlighted
            ? "border-primary ring-2 ring-primary/30 shadow-md shadow-primary/10"
            : "border-border"
        }`}
      >
        {/* Фото */}
        <div
          className="relative cursor-pointer overflow-hidden bg-muted"
          style={{ aspectRatio: "16/10" }}
          onClick={() => onOpenDetail?.(car)}
        >
          <img
            src={imgError ? FALLBACK_IMG : (car.image_url || FALLBACK_IMG)}
            alt={`${car.brand} ${car.model}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />

          {/* Чипы поверх фото */}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {car.year && (
              <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                {car.year}
              </span>
            )}
          </div>

          {/* AI рекомендация — справа сверху */}
          {highlighted && (
            <span className="absolute right-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground md:px-3 md:text-xs">
              ✨ AI
            </span>
          )}

          {/* Акция — справа снизу */}
          {car.has_promo && (
            <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-semibold text-white">
              <BadgePercent className="h-2.5 w-2.5" />
              Акция
            </span>
          )}

          {/* Избранное — только для авторизованных */}
          {user && (
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavorite(String(car.id)); }}
              className="absolute left-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background"
            >
              <Heart className={`h-3.5 w-3.5 transition-colors ${fav ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
            </button>
          )}
        </div>

        {/* Контент */}
        <div
          className="cursor-pointer px-3 pb-1 pt-2.5 md:px-4 md:pt-3"
          onClick={() => onOpenDetail?.(car)}
        >
          {/* Бренд */}
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground md:text-xs">
            {car.brand}
          </p>

          {/* Модель */}
          <h3 className="mt-0.5 truncate text-sm font-bold leading-tight text-foreground md:text-base">
            {car.model}
          </h3>

          {/* Цена */}
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <p className="text-base font-bold text-primary md:text-xl">
              {/* мобиль — короткий формат, десктоп — полный */}
              <span className="md:hidden">
                {car.has_promo ? formatPriceMobile(car.best_promo_price!) : formatPriceMobile(car.min_price)} ₸
              </span>
              <span className="hidden md:inline">
                {car.has_promo ? formatPrice(car.best_promo_price!) : formatPrice(car.min_price)}
              </span>
            </p>
            {car.has_promo && (
              <p className="text-[11px] text-muted-foreground line-through md:text-sm">
                <span className="md:hidden">{formatPriceMobile(car.min_price)}</span>
                <span className="hidden md:inline">{formatPrice(car.min_price)}</span>
              </p>
            )}
          </div>

          {/* Теги — только 2 на мобиле */}
          <div className="mt-1.5 flex flex-wrap gap-1">
            {firstTrim?.transmission && (
              <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground md:text-xs">
                {firstTrim.transmission}
              </span>
            )}
            {firstTrim?.drive_type && (
              <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground md:text-xs">
                {firstTrim.drive_type}
              </span>
            )}
            {/* На десктопе показываем больше */}
            {firstTrim?.engine && (
              <span className="hidden rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground md:inline">
                {firstTrim.engine}
              </span>
            )}
            {car.body_type && (
              <span className="hidden rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground md:inline">
                {car.body_type}
              </span>
            )}
          </div>

          {/* Проверено — очень мелко */}
          {car.last_verified_at && (
            <div className="mt-1.5 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-success" />
              <span className="text-[10px] text-success md:text-xs">
                Проверено {car.last_verified_by || "TANDA"}
              </span>
            </div>
          )}
        </div>

        {/* Нижняя панель действий */}
        <div className="flex items-center gap-1.5 border-t border-border px-3 py-2 md:hidden">
          {/* Тест-драйв — иконка */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowTestDrive(true); }}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary text-[11px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Car className="h-3.5 w-3.5" />
            Тест-драйв
          </button>

          {/* Сравнение — иконка */}
          <button
            onClick={() => toggleCar(car)}
            className={`flex h-8 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
              selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:bg-secondary"
            }`}
          >
            {selected ? <Check className="h-4 w-4" /> : <GitCompare className="h-4 w-4" />}
          </button>
        </div>

        {/* Десктоп кнопки */}
        <div className="hidden space-y-2 px-4 pb-4 pt-2 md:block">
          <button
            onClick={() => setShowTestDrive(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Car className="h-4 w-4" />
            Записаться на тест-драйв
          </button>
          <button
            onClick={() => toggleCar(car)}
            className={`flex w-full items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition-colors ${
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
