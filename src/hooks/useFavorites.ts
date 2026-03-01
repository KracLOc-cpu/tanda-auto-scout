import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useFavorites() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: favoriteIds = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("favorites")
        .select("car_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data.map((f) => f.car_id);
    },
  });

  const toggle = useMutation({
    mutationFn: async (carId: string) => {
      if (!user) throw new Error("Not authenticated");
      const isFav = favoriteIds.includes(carId);
      if (isFav) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("car_id", carId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("favorites")
          .insert({ user_id: user.id, car_id: carId });
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites", user?.id] }),
  });

  return { favoriteIds, toggleFavorite: toggle.mutate, isFavorite: (id: string) => favoriteIds.includes(id) };
}
