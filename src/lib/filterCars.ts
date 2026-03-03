import type { CarDB } from "@/hooks/useCars";
import type { CarFilters } from "@/hooks/useAIChat";

export function applyFilters(cars: CarDB[], filters: CarFilters): CarDB[] {
  if (!filters || Object.keys(filters).length === 0) return cars;

  return cars.filter((car) => {
    const displayPrice = car.has_promo ? car.best_promo_price! : car.min_price;

    if (filters.price_max && displayPrice > filters.price_max) return false;
    if (filters.price_min && displayPrice < filters.price_min) return false;

    if (filters.brands && filters.brands.length > 0) {
      const matchesBrand = filters.brands.some(
        (b) => car.brand.toLowerCase() === b.toLowerCase()
      );
      if (!matchesBrand) return false;
    }

    // Check drive_type across trims
    if (filters.drive) {
      const hasDrive = car.car_trims?.some(
        (t) => typeof t.drive_type === "string" &&
          t.drive_type.toLowerCase().includes(filters.drive!.toLowerCase())
      );
      if (!hasDrive) return false;
    }

    // Check transmission across trims — exclude matching types
    if (filters.transmission) {
      const val = filters.transmission.toLowerCase();
      // Support "not:" prefix for exclusion e.g. "not:cvt,dct"
      if (val.startsWith("not:")) {
        const excluded = val.slice(4).split(",").map((s) => s.trim());
        const allExcluded = car.car_trims?.every((t) => {
          if (typeof t.transmission !== "string") return false;
          const trans = t.transmission.toLowerCase();
          return excluded.some((ex) => trans.includes(ex));
        });
        if (allExcluded) return false;
      } else {
        const hasTrans = car.car_trims?.some(
          (t) => typeof t.transmission === "string" &&
            t.transmission.toLowerCase().includes(val)
        );
        if (!hasTrans) return false;
      }
    }

    // Clearance from cars table
    if (filters.clearance_min && car.clearance_mm) {
      if (car.clearance_mm < filters.clearance_min) return false;
    }

    // Engine type across trims
    if (filters.engine_type) {
      const hasEngine = car.car_trims?.some(
        (t) => typeof t.engine === "string" &&
          t.engine.toLowerCase().includes(filters.engine_type!.toLowerCase())
      );
      if (!hasEngine) return false;
    }

    return true;
  });
}
