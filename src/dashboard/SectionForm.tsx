import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export default function SectionForm({ pageId }: { pageId: string }) {
  const queryClient = useQueryClient();
  const [type, setType] = useState("hero");
  const [content, setContent] = useState("{}");

  const create = useMutation({
    mutationFn: async () =>
      supabase.from("page_sections").insert({
        page_id: pageId,
        section_type: type,
        content: JSON.parse(content),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["sections", pageId] }),
  });

  return (
    <div className="border p-4 rounded">
      <h3 className="font-semibold mb-2">Adicionar Seção</h3>

      <select
        className="border p-2 w-full mb-2"
        value={type}
        onChange={(e) => setType(e.target.value)}
      >
        <option value="hero">Hero</option>
        <option value="text">Texto</option>
        <option value="products">Produtos</option>
        <option value="contact">Contacto</option>
      </select>

      <textarea
        className="border p-2 w-full mb-2"
        rows={4}
        placeholder="Conteúdo JSON"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button
        className="bg-black text-white px-4 py-2 rounded"
        onClick={() => create.mutate()}
      >
        Adicionar
      </button>
    </div>
  );
}
