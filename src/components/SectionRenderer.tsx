export function SectionRenderer({ section }: any) {
    if (section.type === "text") {
      return <section className="p-6">{section.content.text}</section>;
    }
  
    if (section.type === "hero") {
      return (
        <section className="p-10 text-center">
          <h1>{section.content.title}</h1>
        </section>
      );
    }
  
    return null;
  }
  