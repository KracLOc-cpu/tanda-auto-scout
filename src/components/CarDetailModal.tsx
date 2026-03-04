import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronLeft, ChevronRight, Check, Zap, Gauge, Fuel,
  ArrowUpDown, Users, BadgePercent, Car, Shield, Star, Images
} from "lucide-react";
import type { CarDB, CarTrim } from "@/hooks/useCars";

interface CarDetailModalProps {
  car: CarDB | null;
  onClose: () => void;
}

const formatPrice = (price: number) =>
  price >= 1_000_000
    ? `${(price / 1_000_000).toFixed(1)} млн ₸`
    : `${price.toLocaleString("ru-RU")} ₸`;

const PLACEHOLDER = "https://placehold.co/800x500/1a1a2e/4a9eff?text=TANDA";

export default function CarDetailModal({ car, onClose }: CarDetailModalProps) {
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedTrim, setSelectedTrim] = useState<CarTrim | null>(null);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const thumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (car) {
      setImgIdx(0);
      setImgErrors(new Set());
      setSelectedTrim(car.car_trims?.[0] ?? null);
    }
  }, [car]);

  // Скролл к активному тумбнейлу
  useEffect(() => {
    if (thumbsRef.current) {
      const active = thumbsRef.current.children[imgIdx] as HTMLElement;
      active?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [imgIdx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setImgIdx((i) => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setImgIdx((i) => Math.min(images.length - 1, i + 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!car) return null;

  // Собираем галерею: images[] из БД + image_url как запасной
  const rawImages: string[] = [];
  if (Array.isArray((car as any).images) && (car as any).images.length > 0) {
    rawImages.push(...(car as any).images);
  } else if (car.image_url) {
    rawImages.push(car.image_url);
  }
  if (rawImages.length === 0) rawImages.push(PLACEHOLDER);
  const images = rawImages;

  const now = new Date().toISOString().split("T")[0];
  const trims = car.car_trims ?? [];

  const getTrimPrice = (t: CarTrim) => {
    const promoActive = t.promo_price && (!t.promo_until || t.promo_until >= now);
    return { effective: promoActive ? t.promo_price! : t.price, isPromo: !!promoActive };
  };

  const features: string[] = (selectedTrim?.features as any)?.list ?? [];

  const specs = [
    car.clearance_mm && { icon: <ArrowUpDown className="h-4 w-4" />, label: "Клиренс", value: `${car.clearance_mm} мм` },
    car.fuel_consumption_mixed && { icon: <Fuel className="h-4 w-4" />, label: "Расход", value: `${car.fuel_consumption_mixed} л/100 км` },
    car.body_type && { icon: <Car className="h-4 w-4" />, label: "Кузов", value: car.body_type },
    car.fuel_type && { icon: <Zap className="h-4 w-4" />, label: "Топливо", value: car.fuel_type },
    selectedTrim?.engine && { icon: <Gauge className="h-4 w-4" />, label: "Двигатель", value: selectedTrim.engine },
    selectedTrim?.transmission && { icon: <Gauge className="h-4 w-4" />, label: "КПП", value: selectedTrim.transmission },
    selectedTrim?.drive_type && { icon: <Gauge className="h-4 w-4" />, label: "Привод", value: selectedTrim.drive_type },
    selectedTrim?.seats && { icon: <Users className="h-4 w-4" />, label: "Мест", value: String(selectedTrim.seats) },
  ].filter(Boolean) as { icon: JSX.Element; label: string; value: string }[];

  const getImgSrc = (idx: number) =>
    imgErrors.has(idx) ? PLACEHOLDER : (images[idx] || PLACEHOLDER);

  const handleImgError = (idx: number) => {
    setImgErrors((prev) => new Set([...prev, idx]));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full sm:max-w-3xl max-h-[92dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card border border-border shadow-2xl"
        >
          {/* Закрыть */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border border-border transition-colors hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>

          {/* ── КАРУСЕЛЬ ── */}
          <div className="relative aspect-[16/9] overflow-hidden bg-muted rounded-t-2xl select-none">
            <AnimatePresence mode="wait">
              <motion.img
                key={imgIdx}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                src={getImgSrc(imgIdx)}
                alt={`${car.brand} ${car.model} — фото ${imgIdx + 1}`}
                className="h-full w-full object-cover"
                onError={() => handleImgError(imgIdx)}
                draggable={false}
              />
            </AnimatePresence>

            {/* Градиент снизу */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Стрелки — только если фото > 1 */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 backdrop-blur-sm"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70 backdrop-blur-sm"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Счётчик фото */}
                <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white backdrop-blur-sm">
                  <Images className="h-3 w-3" />
                  {imgIdx + 1} / {images.length}
                </div>
              </>
            )}

            {/* Бейджи */}
            {car.has_promo && (
              <span className="absolute left-3 bottom-14 flex items-center gap-1 rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-white">
                <BadgePercent className="h-3 w-3" /> Акция
              </span>
            )}

            {/* Название поверх */}
            <div className="absolute bottom-4 left-4">
              <p className="text-sm text-white/70 font-medium">{car.brand}</p>
              <h2 className="text-2xl font-bold text-white leading-tight">{car.model}</h2>
            </div>

            {/* Ликвидность */}
            {car.liquidity_score && (
              <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-xs text-yellow-400">
                <Star className="h-3 w-3 fill-yellow-400" />
                {car.liquidity_score}/10 ликвидность
              </div>
            )}
          </div>

          {/* ── ТУМБНЕЙЛЫ ── */}
          {images.length > 1 && (
            <div
              ref={thumbsRef}
              className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-hide"
              style={{ scrollbarWidth: "none" }}
            >
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`relative shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    i === imgIdx
                      ? "border-primary ring-1 ring-primary/50"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  style={{ width: 72, height: 48 }}
                >
                  <img
                    src={imgErrors.has(i) ? PLACEHOLDER : src}
                    alt={`фото ${i + 1}`}
                    className="h-full w-full object-cover"
                    onError={() => handleImgError(i)}
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          )}

          {/* ── КОНТЕНТ ── */}
          <div className="p-4 sm:p-6 space-y-6">

            {/* Характеристики */}
            {specs.length > 0 && (
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Характеристики
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {specs.map((s, i) => (
                    <div key={i} className="flex flex-col gap-1 rounded-xl bg-secondary/50 p-3">
                      <span className="text-muted-foreground">{s.icon}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{s.label}</span>
                      <span className="text-sm font-semibold text-foreground leading-tight">{s.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Комплектации */}
            {trims.length > 0 && (
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Комплектации
                </h3>
                <div className="space-y-2">
                  {trims.map((t) => {
                    const { effective, isPromo } = getTrimPrice(t);
                    const isActive = selectedTrim?.id === t.id;
                    return (
                      <motion.button
                        key={t.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedTrim(t)}
                        className={`w-full flex items-center justify-between rounded-xl border p-3 text-left transition-all ${
                          isActive
                            ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                            : "border-border bg-secondary/30 hover:bg-secondary/60"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground truncate">{t.trim_name}</span>
                            {isPromo && (
                              <span className="shrink-0 text-[10px] rounded-full bg-destructive/20 text-destructive px-2 py-0.5 font-medium">
                                АКЦИЯ
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                            {t.engine && <span>{t.engine}</span>}
                            {t.transmission && <span>· {t.transmission}</span>}
                            {t.drive_type && <span>· {t.drive_type}</span>}
                          </div>
                        </div>
                        <div className="ml-3 text-right shrink-0">
                          <p className={`text-base font-bold ${isPromo ? "text-destructive" : "text-primary"}`}>
                            {formatPrice(effective)}
                          </p>
                          {isPromo && t.promo_price && (
                            <p className="text-xs text-muted-foreground line-through">{formatPrice(t.price)}</p>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Опции выбранной комплектации */}
            {features.length > 0 && (
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Опции: {selectedTrim?.trim_name}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Плюсы / Минусы */}
            {(car.pros || car.cons) && (
              <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {car.pros && (
                  <div className="rounded-xl bg-green-500/8 border border-green-500/20 p-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-green-500">Плюсы</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">{car.pros}</p>
                  </div>
                )}
                {car.cons && (
                  <div className="rounded-xl bg-destructive/8 border border-destructive/20 p-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-destructive">Минусы</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">{car.cons}</p>
                  </div>
                )}
              </section>
            )}

            {/* Гарантия */}
            <div className="flex items-center gap-3 rounded-xl bg-secondary/40 border border-border p-3">
              <Shield className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm text-foreground/80">5 лет заводской гарантии или 150 000 км пробега</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
