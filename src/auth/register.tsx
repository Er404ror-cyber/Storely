import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Store, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const navigate = useNavigate();

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      // 1. Criar Usuário
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      
      if (authError) alert(authError.message);
      else if (authData.user) {
        // 2. Criar Loja para o novo usuário
        const slug = storeName.toLowerCase().replace(/ /g, '-');
        const { error: storeError } = await supabase.from('stores').insert([
          { owner_id: authData.user.id, name: storeName, slug }
        ]);
        
        if (storeError) alert("Erro ao criar loja: " + storeError.message);
        else navigate('/admin');
      }
    } else {
      // Login Simples
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else navigate('/admin');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 text-white">
            <Store size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isSignUp ? 'Criar sua Loja' : 'Aceder ao Painel'}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {isSignUp ? 'Comece a vender em poucos minutos' : 'Bem-vindo de volta!'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Loja</label>
              <input 
                type="text" required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Minha Boutique" value={storeName} onChange={e => setStoreName(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Palavra-passe</label>
            <input 
              type="password" required className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? <UserPlus size={20}/> : <LogIn size={20}/>)}
            {isSignUp ? 'Criar Conta' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 font-semibold hover:underline"
          >
            {isSignUp ? 'Já tem conta? Faça Login' : 'Não tem conta? Registe-se'}
          </button>
        </div>
      </div>
    </div>
  );
}