import { useQuery } from "@tanstack/react-query";
import { externalSupabase } from "@/integrations/supabase/externalClient";

export interface CarDB {
  id: number;
  brand: string;
  model: string;
  price: number;
  year: number;
  image_url: string;
  description: string | null;
  is_available: boolean;
  city: string | null;
  specifications: {
    drive?: string;
    engine?: string;
    transmission?: string;
    power?: string;
    fuel_consumption?: string;
    liquidity_score?: number;
    features?: string[];
    [key: string]: unknown;
  } | null;
}

export const useCars = (searchQuery?: string) => {
  return useQuery<CarDB[]>({
    queryKey: ["cars", searchQuery],
    staleTime: 0,
    queryFn: async () => {
      const { data, error } = await externalSupabase
        .from("cars")
        .select("*")
        .order("price", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CarDB[];
    },
    enabled: searchQuery !== "__NO_FETCH__",
  });
};
