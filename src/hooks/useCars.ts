import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CarDB {
  id: string;
  name: string;
  brand: string;
  price: string;
  price_num: number;
  image: string;
  badge: string | null;
  engine: string;
  transmission: string;
  drive: string;
  specifications: Record<string, string>;
}

export const useCars = (searchQuery?: string) => {
  return useQuery<CarDB[]>({
    queryKey: ["cars", searchQuery],
    queryFn: async () => {
      let query = supabase.from("cars").select("*");

      if (searchQuery?.trim()) {
        const q = `%${searchQuery.trim()}%`;
        query = query.or(
          `name.ilike.${q},brand.ilike.${q},engine.ilike.${q},drive.ilike.${q}`
        );
      }

      const { data, error } = await query.order("price_num", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CarDB[];
    },
  });
};
