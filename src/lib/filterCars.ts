import type { CarDB } from "@/hooks/useCars";
import type { CarFilters } from "@/hooks/useAIChat";

// Безопасное приведение к строке — защита от null/undefined/object из БД
function safeStr(val: unknown): string {
  if (typeof val === "string") return val;
  return "";
}

export function applyFilters(cars: CarDB[], filters: CarFilters): CarDB[] {
  if (!filters || Object.keys(filters).length === 0) return cars;

  return cars.filter((car) => {
    const displayPrice = car.has_promo ? car.best_promo_price! : car.min_price;

    if (filters.price_max && displayPrice > filters.price_max) return false;
    if (filters.price_min && displayPrice < filters.price_min) return false;

    if (filters.brands && filters.brands.length > 0) {
      const matchesBrand = filters.brands.some(
        (b) => safeStr(car.brand).toLowerCase() === safeStr(b).toLowerCase()
      );
      if (!matchesBrand) return false;
    }

    if (filters.drive) {
      const driveLower = safeStr(filters.drive).toLowerCase();
      const hasDrive = car.car_trims?.some((t) => {
        const v = safeStr(t.drive_type).toLowerCase();
        return v !== "" && v.includes(driveLower);
      });
      if (!hasDrive) return false;
    }

    if (filters.transmission) {
      const val = safeStr(filters.transmission).toLowerCase();

      if (val.startsWith("not:")) {
        // Исключить машины где ВСЕ трансмиссии из запрещённого списка
        const excluded = val.slice(4).split(",").map((s) => s.trim()).filter(Boolean);
        const allExcluded = car.car_trims?.every((t) => {
          const trans = safeStr(t.transmission).toLowerCase();
          if (trans === "") return true; // null трансмиссию считаем исключённой
          return excluded.some((ex) => trans.includes(ex));
        });
        if (allExcluded) return false;
      } else {
        const hasTrans = car.car_trims?.some((t) => {
          const trans = safeStr(t.transmission).toLowerCase();
          return trans !== "" && trans.includes(val);
        });
        if (!hasTrans) return false;
      }
    }

    if (filters.clearance_min && car.clearance_mm) {
      if (car.clearance_mm < filters.clearance_min) return false;
    }

    if (filters.engine_type) {
      const engLower = safeStr(filters.engine_type).toLowerCase();
      const hasEngine = car.car_trims?.some((t) => {
        const eng = safeStr(t.engine).toLowerCase();
        return eng !== "" && eng.includes(engLower);
      });
      if (!hasEngine) return false;
    }

    return true;
  });
}
