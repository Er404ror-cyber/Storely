import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Loader2, ArrowLeft, HelpCircle, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [lastError, setLastError] = useState<string | null>(null); // Captura o erro do terminal
  const navigate = useNavigate();
  const [failedAttempts, setFailedAttempts] = useState(0);

  // Função de Suporte Organizada
  const handleSupport = (errorDetail?: string | null) => {
    const phoneNumber = "917696553844";
    const pathName = window.location.pathname;
    
    const reportTitle = "🚨 *TECH SUPPORT REPORT*";
    const divider = "--------------------------------------";
    
    let message = `${reportTitle}\n`;
    message += `Sent via *Storely*\n`;

    message += `${divider}\n`;
    message += `📍 *Path:* ${pathName}\n`;
    message += `⏰ *Time:* ${new Date().toLocaleTimeString()}\n`;
    
    if (errorDetail) {
      // Formatação de código para o erro do terminal
      message += `❌ *Terminal Error:* \n\`\`\`${errorDetail}\`\`\`\n`;
    } else {
      message += `❓ *Issue:* Manual support requested.\n`;
    }

    message += `${divider}\n`;
    message += `✍️ *USER MESSAGE:* \n(Please describe what happened here):\n`;

    // Encode para URL
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    
    setLoading(true);
    setLastError(null); // Reseta erro anterior

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          const slug = storeName.toLowerCase().trim().replace(/\s+/g, '-');
          const { error: storeError } = await supabase.from('stores').insert([{ owner_id: data.user.id, name: storeName, slug }]);
          if (storeError) throw storeError;
          toast.success('Store created!');
          navigate('/admin');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/admin');
      }
    } catch (error: any) {
      const technicalError = error.message || JSON.stringify(error);
      setLastError(technicalError);
      setFailedAttempts(prev => prev + 1); // Incrementa falhas
      toast.error(technicalError);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center font-sans overflow-hidden bg-black">
      <Toaster position="top-center" />
      
      {/* GPU Optimization: Background with decoding async */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img 
          src="/img/loginof.jpg" 
          alt="" 
          loading="eager"
          decoding="async"
          className="w-full h-full object-cover scale-105"
          style={{ willChange: 'transform' }} 
        />
        <div className="absolute inset-0 bg-black/40 transition-opacity duration-700" />
      </div>

      {/* Header - Fixed hardware acceleration */}
      <div className="absolute top-0 w-full p-6 sm:p-10 flex justify-between items-center z-20">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all active:scale-95 shadow-2xl"
          style={{ transform: 'translateZ(0)' }}
        >
          <ArrowLeft size={24} />
        </button>
        
        <button 
                  onClick={() => handleSupport(lastError)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white text-sm font-bold transition-all shadow-lg"
        >
          <HelpCircle size={18} />
          <span>Support</span>
        </button>
      </div>

      <main className="relative z-10 w-full max-w-7xl px-8 flex flex-col lg:flex-row items-center justify-between gap-16">
        
        {/* Left Side: Marketing Content */}
        <div className="flex-1 text-white space-y-6 hidden lg:block animate-in fade-in slide-in-from-left-10 duration-1000">
          <div className="flex items-center gap-3 mb-8">
             <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
                <Store size={24} className="text-white" />
             </div>
             <span className="text-xl font-black tracking-tighter uppercase italic">Storely</span>
          </div>
          
          <h1 className="text-7xl font-black leading-[0.9] tracking-tighter mb-6">
            BUILD YOUR <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">DIGITAL STORE</span>
            
          </h1>

          <div className="max-w-md space-y-6">
            <p className="text-xl font-medium text-white/90 leading-tight">
              Simply, quickly, and for free. Start selling today with the best platform for entrepreneurs.
            </p>
            
            <ul className="space-y-3 pt-4">
              {[
                'Instant Configuration',
                'Intuitive Admin Panel',
                'Expert Support'
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/80 font-medium">
                  <CheckCircle2 className="text-blue-400" size={20} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side: Form with Repaint Isolation */}
        <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-700" style={{ transform: 'translateZ(0)' }}>
          <div className="bg-[#111]/0 dark:bg-[#111]/70 border border-white/10 rounded-[2.5rem] p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-sm dark:backdrop-blur-none isolation-isolate">
          
            
            <div className="flex items-center gap-3 mb-4 lg:hidden">
             <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
                <Store size={24} className="text-white" />
             </div>
             <span className="text-xl text-white font-black tracking-tighter uppercase italic">Storely</span>
          </div>
             
               

            <form onSubmit={handleAuth} className="space-y-6">
            {lastError && (
  <button 
    type="button"
    onClick={() => handleSupport(lastError)}
    className="w-full flex flex-col gap-1 p-4 rounded-2xl bg-black/40 border border-red-500/20 text-red-500 text-xs text-left transition-all hover:bg-red-500/20 group"
  >
    <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
      <AlertCircle size={16} />
      <span>Are you having trouble?</span>
    </div>
    
    <p className="opacity-80 hidden leading-relaxed mt-1">
  {failedAttempts >= 3 
    ? "Multiple failures detected. Click to get direct help from our team!" 
    : "An error occurred. Would you like to report this via WhatsApp?"}
</p>
    
    <span className="text-[10px] mt-2 font-black text-red-500 group-hover:text-red-400 transition-colors">
      CLICK TO SEND ERROR REPORT →
    </span>
  </button>
)}
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] ml-1">Email Address</label>
                <input 
                  type="email" required 
                  className="w-full bg-white/5 border border-white/5 p-3 rounded-xl text-white placeholder:text-white/20 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all sm:text-sm text-base"
                  placeholder="name@company.com" 
                  value={email} onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              {isSignUp && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                  <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] ml-1">Store Name</label>
                  <input 
                    type="text" required 
                    className="w-full bg-white/5 border border-white/5 p-3  rounded-xl text-white placeholder:text-white/20 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all sm:text-sm text-base"
                    placeholder="Ex: My Luxury Boutique" 
                    value={storeName} onChange={e => setStoreName(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">Password</label>
                  {!isSignUp && (
                    <button type="button" className="text-[10px] text-white/50 hover:text-white transition-colors font-bold">Forgot password?</button>
                  )}
                </div>
                <input 
                  type="password" required 
                  className="w-full bg-white/5 border border-white/5 p-3 rounded-xl text-white placeholder:text-white/20 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all sm:text-sm text-base"
                  placeholder="**********" 
                  value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              <button 
                disabled={loading}
                className="group w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 uppercase tracking-widest text-xs mt-4 transform-gpu"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black"><span className="bg-transparent px-4 text-white/30">or</span></div>
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-white/50">
                  {isSignUp ? 'Already have an account?' : 'Are you new here?'}
                  <button 
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="ml-2 text-white font-black hover:text-blue-400 transition-colors underline-offset-8 hover:underline"
                  >
                    {isSignUp ? 'Sign In' : 'Create an Account'}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-6 w-full text-center px-4 pointer-events-none opacity-40">
        <p className="text-[10px] text-white font-bold uppercase tracking-[0.4em]">
          © {new Date().getFullYear()} Storely • Privacy • Terms
        </p>
      </footer>
    </div>
  );
}