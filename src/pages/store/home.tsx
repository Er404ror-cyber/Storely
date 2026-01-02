import { supabase } from "../../lib/supabase";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data } = useQuery({
    queryKey: ["home"],
    queryFn: async () => {
      const { data } = await supabase
        .from("page_sections")
        .select("*")
        .eq("page_slug", "home")
        .single();
      return data;
    }
  });

  return <div className="p-10 text-xl">{data?.content?.text}</div>;
}
