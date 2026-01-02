import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useStore() {
  return useQuery({
    queryKey: ["my-store"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged");

      const { data } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", user.id)
        .single();

      return data;
    }
  });
}
