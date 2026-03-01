import type { CarDB } from "@/hooks/useCars";
import type { CarFilters } from "@/hooks/useAIChat";

const PANORAMA_KEYS = ["панорам", "panoram", "люк", "sunroof"];

function specHasFeature(specs: Record<string, string>, keywords: string[]): boolean {
  for (const [key, val] of Object.entries(specs)) {
    const kLow = key.toLowerCase();
    const vLow = (val ?? "").toString().toLowerCase();
    for (const kw of keywords) {
      if ((kLow.includes(kw) || vLow.includes(kw)) && vLow !== "нет" && vLow !== "no" && vLow !== "false") {
        return true;
      }
    }
  }
  return false;
}

export function applyFilters(cars: CarDB[], filters: CarFilters): CarDB[] {
  if (!filters || Object.keys(filters).length === 0) return cars;

  return cars.filter((car) => {
    if (filters.price_max && car.price_num > filters.price_max) return false;
    if (filters.price_min && car.price_num < filters.price_min) return false;

    if (filters.brands && filters.brands.length > 0) {
      const matchesBrand = filters.brands.some(
        (b) => car.brand.toLowerCase() === b.toLowerCase()
      );
      if (!matchesBrand) return false;
    }

    if (filters.drive) {
      if (!car.drive.toLowerCase().includes(filters.drive.toLowerCase())) return false;
    }

    if (filters.transmission) {
      if (!car.transmission.toLowerCase().includes(filters.transmission.toLowerCase())) return false;
    }

    if (filters.clearance_min && car.specifications) {
      const specs = car.specifications as Record<string, string>;
      const clearanceKey = Object.keys(specs).find((k) =>
        k.toLowerCase().includes("клиренс") || k.toLowerCase().includes("clearance") || k.toLowerCase().includes("дорожный просвет")
      );
      if (clearanceKey) {
        const clearanceVal = parseInt(specs[clearanceKey], 10);
        if (!isNaN(clearanceVal) && clearanceVal < filters.clearance_min) return false;
      }
    }

    if (filters.engine_type) {
      if (!car.engine.toLowerCase().includes(filters.engine_type.toLowerCase())) return false;
    }

    return true;
  });
}
