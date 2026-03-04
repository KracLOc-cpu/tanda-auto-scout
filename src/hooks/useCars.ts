import { useQuery } from "@tanstack/react-query";
import { externalSupabase } from "@/integrations/supabase/externalClient";

export interface CarTrim {
  id: number;
  car_id: number;
  trim_name: string;
  engine: string;
  transmission: string;
  drive_type: string;
  seats: number | null;
  price: number;
  promo_price: number | null;
  promo_until: string | null;
  car_year: number | null;
  features: Record<string, unknown> | null;
  is_available: boolean;
}

export interface CarDB {
  id: number;
  brand: string;
  model: string;
  body_type: string | null;
  fuel_type: string | null;
  year: number | null;
  image_url: string;
  engine_options: Record<string, unknown> | null;
  length_mm: number | null;
  width_mm: number | null;
  height_mm: number | null;
  wheelbase_mm: number | null;
  clearance_mm: number | null;
  cargo_volume_l: number | null;
  fuel_tank_l: number | null;
  max_speed_kmh: number | null;
  fuel_consumption_city: number | null;
  fuel_consumption_highway: number | null;
  fuel_consumption_mixed: number | null;
  range_km: number | null;
  pros: string | null;
  cons: string | null;
  description: string | null;
  liquidity_score: number | null;
  seats_options: number[] | null;
  last_verified_by: string | null;
  last_verified_at: string | null;
  city: string | null;
  is_available: boolean;
  images: string[] | null;
  car_trims: CarTrim[];
  min_price: number;
  best_promo_price: number | null;
  has_promo: boolean;
}

function sanitizeTrim(t: any): CarTrim {
  return {
    ...t,
    transmission: typeof t.transmission === "string" ? t.transmission : "",
    drive_type: typeof t.drive_type === "string" ? t.drive_type : "",
    engine: typeof t.engine === "string" ? t.engine : "",
    trim_name: typeof t.trim_name === "string" ? t.trim_name : "",
  };
}

function computeCarPrices(
  car: Omit<CarDB, "min_price" | "best_promo_price" | "has_promo">
): CarDB {
  const trims = (car.car_trims || []).map(sanitizeTrim);
  // Sort trims by price ascending
  trims.sort((a, b) => a.price - b.price);

  const prices = trims.map((t) => t.price).filter(Boolean);
  const min_price = prices.length > 0 ? Math.min(...prices) : 0;

  const now = new Date().toISOString().split("T")[0];
  const activePromos = trims.filter(
    (t) => t.promo_price && (!t.promo_until || t.promo_until >= now)
  );
  const promoPrices = activePromos.map((t) => t.promo_price!);
  const best_promo_price =
    promoPrices.length > 0 ? Math.min(...promoPrices) : null;

  return {
    ...car,
    car_trims: trims,
    min_price,
    best_promo_price,
    has_promo: best_promo_price !== null && best_promo_price < min_price,
  };
}

export const useCars = (searchQuery?: string) => {
  return useQuery<CarDB[]>({
    queryKey: ["cars", searchQuery],
    staleTime: 5 * 60 * 1000, // 5 минут — не перезапрашивать при каждом сообщении в чат
    queryFn: async () => {
      const { data, error } = await externalSupabase
        .from("cars")
        .select("*, car_trims(*)")
        .eq("is_available", true)
        .order("id", { ascending: true });
      if (error) throw error;
      return ((data ?? []) as any[]).map(computeCarPrices);
    },
    enabled: searchQuery !== "__NO_FETCH__",
  });
};
