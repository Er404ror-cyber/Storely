import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useStore } from "../hooks/useStore";

export default function Appearance() {
  const queryClient = useQueryClient();
  const { data: store } = useStore();

  const storeId = store?.id;

  const [header, setHeader] = useState<any>(null);
  const [footer, setFooter] = useState<any>(null);

  /* =========================
     QUERIES
  ========================= */

  const { data: headerData } = useQuery({
    queryKey: ["store-header", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data } = await supabase
        .from("store_header")
        .select("*")
        .eq("store_id", storeId!)
        .single();
      return data;
    },
  });

  const { data: footerData } = useQuery({
    queryKey: ["store-footer", storeId],
    enabled: !!storeId,
    queryFn: async () => {
      const { data } = await supabase
        .from("store_footer")
        .select("*")
        .eq("store_id", storeId!)
        .single();
      return data;
    },
  });

  /* =========================
     MUTATIONS
  ========================= */

  const saveHeader = useMutation({
    mutationFn: async () =>
      supabase.from("store_header").upsert({
        ...header,
        store_id: storeId,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["store-header"] }),
  });

  const saveFooter = useMutation({
    mutationFn: async () =>
      supabase.from("store_footer").upsert({
        ...footer,
        store_id: storeId,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["store-footer"] }),
  });

  /* =========================
     EFFECTS
  ========================= */

  useEffect(() => {
    if (headerData) {
      setHeader(headerData);
    } else if (storeId) {
      setHeader({
        store_id: storeId,
        logo_url: "",
        background_color: "#ffffff",
        text_color: "#000000",
        links: [],
      });
    }
  }, [headerData, storeId]);

  useEffect(() => {
    if (footerData) {
      setFooter(footerData);
    } else if (storeId) {
      setFooter({
        store_id: storeId,
        text: "",
        background_color: "#f5f5f5",
        text_color: "#000000",
      });
    }
  }, [footerData, storeId]);

  if (!header || !footer) {
    return <div>Carregando aparência...</div>;
  }

  /* =========================
     UI
  ========================= */

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Aparência</h1>

      {/* ================= HEADER ================= */}

      <section className="border p-4 rounded space-y-4">
        <h2 className="font-semibold text-lg">Header</h2>

        <input
          className="border p-2 w-full"
          placeholder="URL do logo"
          value={header.logo_url || ""}
          onChange={(e) =>
            setHeader({ ...header, logo_url: e.target.value })
          }
        />

        <div className="flex gap-4">
          <div>
            <label className="text-sm">Cor de fundo</label>
            <input
              type="color"
              value={header.background_color}
              onChange={(e) =>
                setHeader({
                  ...header,
                  background_color: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="text-sm">Cor do texto</label>
            <input
              type="color"
              value={header.text_color}
              onChange={(e) =>
                setHeader({ ...header, text_color: e.target.value })
              }
            />
          </div>
        </div>

        {/* LINKS */}
        <div className="space-y-2">
          <h3 className="font-medium">Links do menu</h3>

          {header.links.map((link: any, index: number) => (
            <div key={index} className="flex gap-2">
              <input
                className="border p-2 flex-1"
                placeholder="Texto"
                value={link.label}
                onChange={(e) => {
                  const links = [...header.links];
                  links[index].label = e.target.value;
                  setHeader({ ...header, links });
                }}
              />

              <input
                className="border p-2 flex-1"
                placeholder="Página (home, catalogo, contacto)"
                value={link.page}
                onChange={(e) => {
                  const links = [...header.links];
                  links[index].page = e.target.value;
                  setHeader({ ...header, links });
                }}
              />
            </div>
          ))}

          <button
            className="text-blue-600 text-sm"
            onClick={() =>
              setHeader({
                ...header,
                links: [...header.links, { label: "", page: "" }],
              })
            }
          >
            + Adicionar link
          </button>
        </div>

        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={() => saveHeader.mutate()}
        >
          Salvar Header
        </button>
      </section>

      {/* ================= FOOTER ================= */}

      <section className="border p-4 rounded space-y-4">
        <h2 className="font-semibold text-lg">Footer</h2>

        <textarea
          className="border p-2 w-full"
          rows={3}
          placeholder="Texto do footer"
          value={footer.text || ""}
          onChange={(e) => setFooter({ ...footer, text: e.target.value })}
        />

        <div className="flex gap-4">
          <div>
            <label className="text-sm">Cor de fundo</label>
            <input
              type="color"
              value={footer.background_color}
              onChange={(e) =>
                setFooter({
                  ...footer,
                  background_color: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="text-sm">Cor do texto</label>
            <input
              type="color"
              value={footer.text_color}
              onChange={(e) =>
                setFooter({ ...footer, text_color: e.target.value })
              }
            />
          </div>
        </div>

        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={() => saveFooter.mutate()}
        >
          Salvar Footer
        </button>
      </section>
    </div>
  );
}
