import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store as StoreIcon, X, Menu, LogOut, Loader2, Check, Edit2, Clock, ExternalLink 
} from 'lucide-react';
// Importação de tipo específica corrigida abaixo:
import type { UseMutationResult } from '@tanstack/react-query';

// --- Interfaces Estritas ---
interface Store {
  id: string;
  name: string;
  slug: string;
  updated_at_name: string | null;
}

interface Page {
  id: string;
  title: string;
}

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  store: Store | undefined;
  pages: Page[];
  location: { pathname: string };
  isEditingName: boolean;
  setIsEditingName: (val: boolean) => void;
  newName: string;
  setNewName: (val: string) => void;
  timeLeft: string;
  // Usando 'any' nos generics do MutationResult para evitar conflitos de Schema complexos, 
  // mas mantendo a estrutura de tipo correta.
  updateStoreMutation: UseMutationResult<any, Error, string, any>;
  confirmLogout: boolean;
  setConfirmLogout: (val: boolean) => void;
  handleLogout: () => Promise<void>;
  storeUrl: string;
  menuItems: MenuItem[];
}

const NavItem = memo(({ item, isActive, onClick, badge }: { item: MenuItem; isActive: boolean; onClick: () => void; badge?: number }) => (
  <Link
    to={item.path}
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
      isActive 
      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 scale-[1.02]' 
      : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
    }`}
  >
    <div className="flex items-center gap-3">
      <div className={`${isActive ? 'scale-110' : 'group-hover:rotate-12 transition-transform'}`}>
        {item.icon}
      </div>
      <span className="font-bold text-[14px] tracking-tight">{item.label}</span>
    </div>
    {badge !== undefined && badge > 0 && !isActive && (
      <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-lg">{badge}</span>
    )}
  </Link>
));

export function AdminSidebar({ 
  isOpen, setIsOpen, store, pages, location, isEditingName, 
  setIsEditingName, newName, setNewName, timeLeft, 
  updateStoreMutation, confirmLogout, setConfirmLogout, handleLogout, 
  storeUrl, menuItems 
}: SidebarProps) {
  
  const isNameTaken = updateStoreMutation.error?.message.includes("taken");

  // Função para cancelar a edição e resetar o estado de erro
  const handleCancel = () => {
    setIsEditingName(false);
    updateStoreMutation.reset(); // Limpa o erro do mutation
  };
  return (
    <>
      {/* Overlay - Z-INDEX 80 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[80] lg:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar - Z-INDEX 90 */}
      <aside className={`fixed inset-y-0 left-0 z-[90] w-[295px] bg-white border-r border-slate-100 flex flex-col transition-all duration-500 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3 font-black text-lg tracking-tighter uppercase italic">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <StoreIcon size={18} />
            </div>
            Storelyy
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-slate-400">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => (
            <NavItem 
              key={item.path} 
              item={item} 
              badge={item.path === '/admin/paginas' ? pages?.length : undefined} 
              isActive={location.pathname === item.path} 
              onClick={() => setIsOpen(false)} 
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50 bg-slate-50/50">
          <div className="flex flex-col gap-2">
            <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm uppercase shrink-0">
                  {store?.name?.charAt(0)}
                </div>
                
                <div className="flex flex-col min-w-0 flex-1">
                  {isEditingName ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <input 
                          autoFocus
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className={`text-[13px] font-black text-slate-900 bg-slate-50 px-2 py-1 rounded-lg w-full border outline-none ${isNameTaken ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200 focus:border-indigo-600'}`}
                        />
                       {/* Botão Confirmar */}
                      <button 
                        disabled={updateStoreMutation.isPending} 
                        onClick={() => updateStoreMutation.mutate(newName)} 
                        className="text-emerald-500 hover:bg-emerald-50 p-1 rounded-md transition-colors disabled:opacity-50"
                        title="Salvar"
                      >
                        {updateStoreMutation.isPending ? (
                          <Loader2 size={16} className="animate-spin"/>
                        ) : (
                          <Check size={18} strokeWidth={3}/>
                        )}
                      </button>

                      {/* Botão Cancelar (O X que você pediu) */}
                      <button 
                        onClick={handleCancel}
                        className="text-slate-400 hover:bg-slate-100 p-1 rounded-md transition-colors"
                        title="Cancelar"
                      >
                        <X size={18} />
                      </button>
                      </div>
                      {isNameTaken && (
                        <span className="text-[9px] text-red-600 font-black uppercase tracking-tighter block animate-pulse">
                          Nome indisponível!
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between gap-1">
                        <div 
                          onClick={() => { 
                            if (!timeLeft && store) { 
                              setNewName(store.name); 
                              setIsEditingName(true); 
                            }
                          }}
                          className={`flex items-center gap-1.5 min-w-0 group ${!timeLeft ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                        >
                          <span className={`text-[13px] font-black uppercase italic truncate ${!timeLeft ? 'hover:text-indigo-600' : 'text-slate-400'}`}>
                            {store?.name}
                          </span>
                          {!timeLeft ? <Edit2 size={10} className="text-slate-300 shrink-0" /> : <Clock size={10} className="text-slate-300" />}
                        </div>
                        <a href={storeUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-indigo-600 shrink-0">
                          <ExternalLink size={14} />
                        </a>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                        {timeLeft ? `${timeLeft} left` : store?.slug}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!confirmLogout ? (
              <button onClick={() => setConfirmLogout(true)} className="flex items-center justify-center gap-2 w-full p-3.5 rounded-2xl text-slate-400 font-bold text-[11px] uppercase tracking-widest hover:bg-red-50 hover:text-red-600 transition-all">
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleLogout} className="flex-1 p-3.5 bg-red-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest italic">Exit</button>
                <button onClick={() => setConfirmLogout(false)} className="p-3.5 bg-slate-200 text-slate-600 rounded-2xl font-black text-[11px] uppercase tracking-widest">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}