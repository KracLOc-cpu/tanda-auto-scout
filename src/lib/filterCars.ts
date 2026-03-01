import type { CarDB } from "@/hooks/useCars";
import type { CarFilters } from "@/hooks/useAIChat";

export function applyFilters(cars: CarDB[], filters: CarFilters): CarDB[] {
  if (!filters || Object.keys(filters).length === 0) return cars;

  return cars.filter((car) => {
    if (filters.price_max && car.price > filters.price_max) return false;
    if (filters.price_min && car.price < filters.price_min) return false;

    if (filters.brands && filters.brands.length > 0) {
      const matchesBrand = filters.brands.some(
        (b) => car.brand.toLowerCase() === b.toLowerCase()
      );
      if (!matchesBrand) return false;
    }

    const specs = car.specifications;

    if (filters.drive && specs?.drive) {
      if (!specs.drive.toLowerCase().includes(filters.drive.toLowerCase())) return false;
    }

    if (filters.transmission && specs?.transmission) {
      if (!specs.transmission.toLowerCase().includes(filters.transmission.toLowerCase())) return false;
    }

    if (filters.clearance_min && specs) {
      const clearanceKey = Object.keys(specs).find((k) =>
        k.toLowerCase().includes("клиренс") || k.toLowerCase().includes("clearance") || k.toLowerCase().includes("дорожный просвет")
      );
      if (clearanceKey) {
        const clearanceVal = parseInt(String(specs[clearanceKey]), 10);
        if (!isNaN(clearanceVal) && clearanceVal < filters.clearance_min) return false;
      }
    }

    if (filters.engine_type && specs?.engine) {
      if (!specs.engine.toLowerCase().includes(filters.engine_type.toLowerCase())) return false;
    }

    return true;
  });
}
