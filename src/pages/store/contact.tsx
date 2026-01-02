import { supabase } from "../../lib/supabase";
import { useQuery } from "@tanstack/react-query";

export default function Contact() {
  const { data } = useQuery({
    queryKey: ["contact"],
    queryFn: async () => {
      const { data } = await supabase
        .from("page_sections")
        .select("*")
        .eq("page_slug", "contacto")
        .single();
      return data;
    }
  });

  return (
    <iframe
      className="w-full h-64"
      src={`https://maps.google.com/maps?q=${data?.content?.address}&output=embed`}
    />
  );
}
