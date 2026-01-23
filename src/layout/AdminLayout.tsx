import { useState, useEffect, memo } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, ShoppingBag, Settings, Store, Menu, X } from 'lucide-react';

// Otimização: Memoizamos os itens de menu para evitar re-calculo em cada render
const NavItem = memo(({ item, isActive, onClick }: any) => (
  <Link
    to={item.path}
    onClick={onClick}
    className={`flex items-center gap-3 p-3 rounded-lg transition-colors whitespace-nowrap ${
      isActive 
      ? 'bg-blue-50 text-blue-600 font-semibold' 
      : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {item.icon}
    <span className="font-medium">{item.label}</span>
  </Link>
));

export function AdminLayout() {
  const location = useLocation();
  const isEditorPage = location.pathname.includes('editor');
  const [isOpen, setIsOpen] = useState(!isEditorPage);

  useEffect(() => {
    setIsOpen(!isEditorPage);
  }, [isEditorPage]);

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/paginas', label: 'Minhas Páginas', icon: <FileText size={20} /> },
    { path: '/admin/produtos', label: 'Produtos', icon: <ShoppingBag size={20} /> },
    { path: '/admin/configuracoes', label: 'Configurações', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 overflow-hidden">
      
      {/* Botão Hamburger Otimizado */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-[70] p-2 bg-white border border-gray-200 rounded-lg shadow-md text-gray-600 active:scale-95 transition-transform"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Overlay Otimizado: Removido o blur pesado para poupar GPU */}
      {isOpen && (isEditorPage || window.innerWidth < 1024) && (
        <div 
          className="fixed inset-0 bg-black/10 z-[55] transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar com Aceleração de Hardware */}
      <aside 
        style={{ willChange: 'transform' }} // Força o uso da GPU apenas para a transição
        className={`
          bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-out z-[60]
          ${isEditorPage 
            ? `fixed inset-y-0 left-0 shadow-xl ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}` 
            : `relative ${isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-64 lg:translate-x-0'}`
          }
        `}
      >
        <div className="p-6 border-b flex justify-between items-center shrink-0">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2 whitespace-nowrap">
            <Store size={24} /> StoreBuilder
          </h1>
          {(isEditorPage || window.innerWidth < 1024) && (
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavItem 
              key={item.path} 
              item={item} 
              isActive={location.pathname === item.path}
              isEditorPage={isEditorPage}
              onClick={() => isEditorPage && setIsOpen(false)}
            />
          ))}
        </nav>
      </aside>

      {/* Conteúdo Principal: overflow-x-hidden evita scrolls desnecessários que consomem CPU */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative h-screen">
        <Outlet />
      </main>
    </div>
  );
}