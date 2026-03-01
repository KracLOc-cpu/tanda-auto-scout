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
      const { data, error } = await supabase
        .from("cars")
        .select("*")
        .order("price_num", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CarDB[];
    },
    enabled: searchQuery !== "__NO_FETCH__",
  });
};
