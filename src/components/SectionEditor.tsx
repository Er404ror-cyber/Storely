import { supabase } from "../lib/supabase";
import { useState } from "react";

export default function SectionEditor({ section, onSave }: any) {
  const [text, setText] = useState(section.content.text || "");

  const save = async () => {
    await supabase
      .from("page_sections")
      .update({ content: { text } })
      .eq("id", section.id);

    onSave();
  };

  return (
    <div className="border p-4 mb-3">
      <h3 className="font-semibold">Secção: {section.type}</h3>

      {section.type === "text" && (
        <textarea
          className="w-full border mt-2"
          value={text}
          onChange={e => setText(e.target.value)}
        />
      )}

      <button className="btn mt-2" onClick={save}>
        Salvar
      </button>
    </div>
  );
}
