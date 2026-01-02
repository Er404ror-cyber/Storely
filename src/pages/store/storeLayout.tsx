import { Outlet, useParams } from "react-router-dom";

export default function StoreLayout() {
  const { storeSlug } = useParams();

  return (
    <>
      <header className="p-4 border-b flex gap-4">
        <a href={`/${storeSlug}`}>Home</a>
        <a href={`/${storeSlug}/catalogo`}>Catálogo</a>
        <a href={`/${storeSlug}/contacto`}>Contacto</a>
      </header>

      <Outlet />

      <footer className="p-4 border-t text-center">
        © Loja
      </footer>
    </>
  );
}
