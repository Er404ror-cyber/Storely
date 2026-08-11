import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronRight, Eye, EyeOff, Loader2, Lock, Mail, Store } from "lucide-react";
import { toast } from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { useTranslate } from "../context/LanguageContext";

import type { AuthMode, SlugStatus } from "./authUtils";
import {
  STORE_NAME_MAX_LENGTH, PASSWORD_MIN_LENGTH,
  SLUG_MIN_LENGTH, isValidEmailFormat, slugifyStoreName, 
  isValidSlug, fetchSlugExists, writeSlugCache
} from "./authUtils";

import { useAuthCooldown } from "./useAuthCooldown";
import { AuthVideoBackground } from "./AuthVideoBackground";
import { DesktopHero } from "./DesktopHero";
import { AuthHeader } from "./AuthHeader";
import { AuthAlerts } from "./AuthAlerts";

export function AuthPage() {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<AuthMode>("signup");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugMessage, setSlugMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [lastError, setLastError] = useState<string | null>(null);
  const [showLoginSuggestion, setShowLoginSuggestion] = useState(false);
  const [loginSuggestionText, setLoginSuggestionText] = useState("");
  
  // ANTI-SPAM GENÉRICO: Guarda a última combinação exata de dados que falhou
  const [lastFailedAttempt, setLastFailedAttempt] = useState<string | null>(null);
  
  // PROTEÇÃO DE API SUPABASE: Guarda o email que sabemos que já tem conta
  const [knownTakenEmail, setKnownTakenEmail] = useState<string | null>(null);

  const debounceRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const slug = useMemo(() => slugifyStoreName(storeName), [storeName]);

  const isSignUp = mode === "signup";
  const isLogin = mode === "login";
  const isForgot = mode === "forgot";

  const passwordMeetsMin = password.trim().length >= PASSWORD_MIN_LENGTH;
  const storeNameTrimmed = storeName.trim();
  const storeNameLength = storeNameTrimmed.length;
  const storeNameValidLength = storeNameLength >= 2 && storeNameLength <= STORE_NAME_MAX_LENGTH;

  // COOLDOWN APENAS PARA RECUPERAÇÃO DE SENHA
  const { cooldown: forgotCooldown, triggerCooldown: triggerForgotCooldown } = useAuthCooldown("forgot", 600);
  const activeCooldown = isForgot ? forgotCooldown : 0;

  const clearFeedback = useCallback(() => {
    setLastError(null);
    setShowLoginSuggestion(false);
    setLoginSuggestionText("");
  }, []);

  useEffect(() => {
    clearFeedback();
    setShowPassword(false);
    if (!isSignUp) {
      setSlugStatus("idle");
      setSlugMessage("");
    }
  }, [mode, isSignUp, clearFeedback]);

  // Limpa os erros de UI quando o utilizador digita.
  // SE o email for o que já sabemos que está em uso, mantemos a sugestão amarela visível!
  useEffect(() => {
    setLastError(null);
    if (email.trim() !== knownTakenEmail) {
      setShowLoginSuggestion(false);
      setLoginSuggestionText("");
    }
  }, [email, password, storeName, knownTakenEmail]);

  const verifySlug = useCallback(async (nextSlug: string) => {
    if (!isSignUp) return;
    if (!nextSlug) {
      setSlugStatus("idle");
      setSlugMessage("");
      return;
    }
    if (!storeNameValidLength) {
      setSlugStatus("invalid");
      setSlugMessage(t("auth_store_name_length_invalid"));
      return;
    }
    if (nextSlug.length < SLUG_MIN_LENGTH) {
      setSlugStatus("invalid");
      setSlugMessage(t("auth_slug_min_chars"));
      return;
    }
    if (!isValidSlug(nextSlug)) {
      setSlugStatus("invalid");
      setSlugMessage(t("auth_slug_invalid_chars"));
      return;
    }

    const requestId = ++requestIdRef.current;
    setSlugStatus("checking");
    setSlugMessage(t("auth_slug_checking"));

    try {
      const exists = await fetchSlugExists(nextSlug);
      if (requestId !== requestIdRef.current) return;
      if (exists) {
        setSlugStatus("taken");
        setSlugMessage(t("auth_slug_taken"));
      } else {
        setSlugStatus("available");
        setSlugMessage(t("auth_slug_available"));
      }
    } catch {
      if (requestId !== requestIdRef.current) return;
      setSlugStatus("idle");
      setSlugMessage("");
    }
  }, [isSignUp, storeNameValidLength, t]);

  useEffect(() => {
    if (!isSignUp) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!storeNameTrimmed) {
      setSlugStatus("idle");
      setSlugMessage("");
      return;
    }
    debounceRef.current = window.setTimeout(() => void verifySlug(slug), 650);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [isSignUp, slug, storeNameTrimmed, verifySlug]);

  const handleContactSupport = () => {
    const phoneNumber = "917696553844";
    const terminalError = lastError ? `\nTerminal Error: ${lastError}` : (showLoginSuggestion ? "\nError: User Already Exists" : "");
    const text = encodeURIComponent(
      `Storely Support\nPath: ${location.pathname}\nUser hit rate limits or needs help.\nTime: ${new Date().toLocaleString()}${terminalError}`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, "_blank");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return toast.error(t("auth_enter_email_first"));
    if (!isValidEmailFormat(trimmedEmail)) return toast.error(t("auth_email_invalid_format"));
    
    const currentAttempt = `forgot:${trimmedEmail}`;
    if (lastFailedAttempt === currentAttempt) {
      toast.error(t("auth_change_data_try_again") || "Por favor, altere os dados antes de tentar novamente.");
      return;
    }

    if (forgotCooldown > 0) return toast.error(t("auth_cooldown_wait"));

    clearFeedback();
    setLoading(true);
    triggerForgotCooldown();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      toast.success(t("auth_reset_email_sent"));
      setMode("login");
      setLastFailedAttempt(null);
    } catch (error: any) {
      const message = error?.message || t("auth_reset_email_error");
      setLastError(message);
      setLastFailedAttempt(currentAttempt);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const trimmedEmail = email.trim();
    
    // INTERCEÇÃO DE API 1: Se já sabemos que o email existe, não faz sentido chamar o Supabase
    if (isSignUp && trimmedEmail === knownTakenEmail) {
      const msg = t("auth_existing_email_go_login") || "Este endereço de email já está registado no Storely.";
      setShowLoginSuggestion(true);
      setLoginSuggestionText(msg);
      toast.error(msg); // AGORA DÁ FEEDBACK VISUAL PELO TOAST
      return;
    }
    
    // INTERCEÇÃO DE API 2: Assinatura genérica (mesmos dados exatos que falharam antes)
    const currentAttempt = isSignUp 
      ? `signup:${trimmedEmail}:${password}:${storeNameTrimmed}`
      : `login:${trimmedEmail}:${password}`;

    if (lastFailedAttempt === currentAttempt) {
      toast.error(t("auth_change_data_try_again") || "Por favor, altere os dados antes de tentar novamente.");
      return;
    }

    if (!isValidEmailFormat(trimmedEmail)) return toast.error(t("auth_email_invalid_format"));

    clearFeedback();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!storeNameTrimmed) throw new Error(t("auth_store_required"));
        if (!storeNameValidLength) throw new Error(t("auth_store_name_length_invalid"));
        if (!slug || !isValidSlug(slug)) throw new Error(t("auth_store_invalid"));
        if (!passwordMeetsMin) throw new Error(t("auth_password_min_length"));
        if (slugStatus === "checking") throw new Error(t("auth_slug_wait"));
        
        if (slugStatus !== "available") {
          const exists = await fetchSlugExists(slug);
          if (exists) {
            setSlugStatus("taken");
            setSlugMessage(t("auth_slug_taken"));
            throw new Error(t("auth_slug_taken"));
          }
        }

        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        });

        if (error) {
          const errorMessage = String(error.message || "").toLowerCase();
          if (errorMessage.includes("already registered") || errorMessage.includes("already exists") || errorMessage.includes("user already exists")) {
            setKnownTakenEmail(trimmedEmail); // Memoriza o email para poupar a API nas próximas tentativas
            setShowLoginSuggestion(true);
            setLoginSuggestionText(t("auth_existing_email_go_login") || "Este endereço de email já está registado no Storely.");
            throw new Error("ALREADY_EXISTS");
          }
          throw error;
        }

        const userId = data.user?.id;
        if (!userId) throw new Error(t("auth_user_missing"));

        const { error: storeError } = await supabase.from("stores").insert([
          { owner_id: userId, name: storeNameTrimmed, slug },
        ]);

        if (storeError) {
          if (String(storeError.message).toLowerCase().includes("duplicate")) {
            writeSlugCache(slug, true);
            setSlugStatus("taken");
            setSlugMessage(t("auth_slug_taken"));
            throw new Error(t("auth_slug_taken"));
          }
          throw storeError;
        }

        writeSlugCache(slug, true);
        toast.success(t("auth_signup_success"));
        navigate("/admin", { replace: true });
        return;
      }

      if (isLogin) {
        if (!passwordMeetsMin) throw new Error(t("auth_password_min_length"));
        const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        if (error) throw error;
        
        toast.success(t("auth_login_success"));
        setLastFailedAttempt(null);
        navigate("/admin", { replace: true });
      }
    } catch (error: any) {
      if (error.message === "ALREADY_EXISTS") {
        setLoading(false);
        const msg = t("auth_existing_email_go_login") || "Este endereço de email já está registado no Storely.";
        toast.error(msg); // AGORA DÁ O TOAST NA PRIMEIRA VEZ QUE A API REJEITA!
        return; 
      }

      let message = error?.message || t("auth_generic_error");
      
      if (message.toLowerCase().includes("invalid login credentials")) {
        message = t("auth_invalid_credentials") || "Email ou palavra-passe incorretos.";
      }
      
      setLastError(message);
      setLastFailedAttempt(currentAttempt); // Guarda a tentativa genérica para evitar clique duplo
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const signupReady = !!email.trim() && storeNameValidLength && !!slug && isValidSlug(slug) && slugStatus === "available" && passwordMeetsMin;
  const loginReady = !!email.trim() && !!password.trim() && passwordMeetsMin;
  const forgotReady = !!email.trim();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09131b] text-white">
      <AuthVideoBackground />
      <AuthHeader t={t} lastError={lastError} />

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-7xl items-center px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,440px)] xl:gap-14">
          <DesktopHero t={t} />

          <section className="order-1 flex items-center justify-center lg:order-2 lg:justify-end">
            <div className="w-full max-w-[440px]">
              <div className="px-0 py-2 sm:py-4 lg:rounded-[34px] lg:border lg:border-white/10 lg:bg-black/28 lg:p-6 lg:shadow-[0_25px_90px_rgba(0,0,0,0.38)] lg:backdrop-blur-md">
                
                <div className="lg:hidden">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">{t("auth_brand")}</p>
                  <h1 className="mt-4 text-[2.2rem] font-black leading-[0.92] tracking-tight sm:text-[2.45rem]">
                    {t("auth_mobile_title_line1")}<br /><span className="text-white/92">{t("auth_mobile_title_line2")}</span>
                  </h1>
                  <p className="mt-3 max-w-[30rem] text-sm leading-6 text-white/70">{t("auth_mobile_subtitle_professional")}</p>
                </div>

                {!isForgot ? (
                  <div className="mt-6 grid grid-cols-2 rounded-2xl border border-white/10 bg-black/22 p-1 lg:mt-0">
                    <button type="button" onClick={() => setMode("signup")} className={`rounded-2xl px-4 py-3 text-sm font-black transition ${isSignUp ? "bg-cyan-400 text-slate-950" : "text-white/70 hover:text-white"}`}>
                      {t("auth_create_account")}
                    </button>
                    <button type="button" onClick={() => setMode("login")} className={`rounded-2xl px-4 py-3 text-sm font-black transition ${isLogin ? "bg-cyan-400 text-slate-950" : "text-white/70 hover:text-white"}`}>
                      {t("auth_login")}
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 lg:mt-0">
                    <button type="button" onClick={() => setMode("login")} className="text-sm font-black text-cyan-300 transition hover:text-cyan-200">
                      ← {t("auth_back_to_login")}
                    </button>
                  </div>
                )}

                <div className="mt-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">
                    {isForgot ? t("auth_recovery_label") : isSignUp ? t("auth_start_here") : t("auth_welcome_back_small")}
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight">
                    {isForgot ? t("auth_forgot_title") : isSignUp ? t("auth_heading_signup") : t("auth_heading_login")}
                  </h2>
                </div>

                <AuthAlerts 
                  showLoginSuggestion={showLoginSuggestion}
                  loginSuggestionText={loginSuggestionText}
                  lastError={lastError}
                  setMode={setMode}
                  t={t}
                />

                <form onSubmit={isForgot ? handleForgotPassword : handleSubmit} className="mt-5 space-y-4">
                  <div className="space-y-2">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-[0.22em] text-white/70">{t("auth_email_label")}</label>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/22 px-4">
                      <Mail size={18} className="text-white/40" />
                      <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("auth_email_placeholder")} className="h-14 w-full bg-transparent text-base text-white outline-none placeholder:text-white/25" />
                    </div>
                  </div>

                  {isSignUp && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3 px-1">
                        <label className="text-[11px] font-black uppercase tracking-[0.22em] text-white/70">{t("auth_store_name_label")}</label>
                        <span className="text-xs text-white/45">{storeNameLength}/{STORE_NAME_MAX_LENGTH}</span>
                      </div>
                      <div className={`rounded-2xl border px-4 ${slugStatus === "taken" ? "border-red-400/30 bg-red-500/10" : slugStatus === "available" ? "border-emerald-400/30 bg-emerald-500/10" : "border-white/10 bg-black/22"}`}>
                        <div className="flex items-center gap-3">
                          <Store size={18} className="text-white/40" />
                          <input type="text" required maxLength={STORE_NAME_MAX_LENGTH} value={storeName} onChange={(e) => setStoreName(e.target.value)} onBlur={() => { if (slug && isValidSlug(slug) && storeNameValidLength) void verifySlug(slug); }} placeholder={t("auth_store_name_placeholder")} className="h-14 w-full bg-transparent text-base text-white outline-none placeholder:text-white/25" />
                        </div>
                      </div>
                      {storeNameTrimmed && (
                        <div className="flex items-start justify-between gap-3 px-1">
                          <p className="text-xs text-white/45">{t("auth_store_url_preview")}: <span className="font-medium text-white/78">/{slug || "your-store"}</span></p>
                          <p className={`text-right text-xs font-semibold ${slugStatus === "taken" ? "text-red-300" : slugStatus === "available" ? "text-emerald-300" : slugStatus === "invalid" ? "text-amber-300" : "text-white/55"}`}>{slugMessage}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!isForgot && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[11px] font-black uppercase tracking-[0.22em] text-white/70">{t("auth_password_label")}</label>
                        {isLogin && <button type="button" onClick={() => setMode("forgot")} className="text-xs font-bold text-cyan-300 transition hover:text-cyan-200">{t("auth_forgot_password")}</button>}
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/22 px-4">
                        <Lock size={18} className="text-white/40" />
                        <input type={showPassword ? "text" : "password"} required={!isForgot} autoComplete={isSignUp ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" className="h-14 w-full bg-transparent text-base text-white outline-none placeholder:text-white/25" />
                        <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="shrink-0 text-white/55 transition hover:text-white">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeCooldown > 0 && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-center">
                      <p className="text-sm font-medium text-amber-200">
                        {t("auth_cooldown_message") || `Aguarde ${formatTime(activeCooldown)} antes de tentar de novo.`}
                      </p>
                      <button 
                        type="button" 
                        onClick={handleContactSupport}
                        className="mt-2 text-xs font-bold text-amber-300 hover:text-amber-100 underline decoration-amber-500/30 underline-offset-4 transition"
                      >
                        {t("auth_cooldown_support") || "Precisa de ajuda? Fale com o suporte."}
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      (isForgot && (!forgotReady || loading || forgotCooldown > 0)) || 
                      (isSignUp && (!signupReady || loading)) || 
                      (isLogin && (!loginReady || loading))
                    }
                    className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (
                      <>
                        <span>{isForgot ? t("auth_send_reset_link") : isSignUp ? t("auth_create_account") : t("auth_login")}</span>
                        {!activeCooldown && <ChevronRight size={18} className="transition group-hover:translate-x-0.5" />}
                      </>
                    )}
                  </button>
                </form>

                {!isForgot && (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/18 p-4 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white/88">
                      {isSignUp ? t("auth_switch_login_title") : t("auth_switch_signup_title")}
                    </p>
                    <button type="button" onClick={() => setMode(isSignUp ? "login" : "signup")} className="text-sm font-black text-cyan-300 transition hover:text-cyan-200">
                      {isSignUp ? t("auth_go_to_login") : t("auth_go_to_signup")}
                    </button>
                  </div>
                )}
                
                <p className="mt-5 text-center text-[11px] font-bold uppercase tracking-[0.22em] text-white/38">
                  © {new Date().getFullYear()} Storely · {t("footer_rights")}
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}