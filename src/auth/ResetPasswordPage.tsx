import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Store } from "lucide-react";
import { toast } from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { useTranslate } from "../context/LanguageContext";

export function ResetPasswordPage() {
  const { t } = useTranslate();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let mounted = true;

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && mounted) {
        setSessionReady(true);
      }
    });

    async function prepareRecoverySession() {
      try {
        const hash = window.location.hash.replace(/^#/, "");
        const search = window.location.search.replace(/^\?/, "");

        const hashParams = new URLSearchParams(hash);
        const queryParams = new URLSearchParams(search);

        const access_token =
          hashParams.get("access_token") || queryParams.get("access_token");
        const refresh_token =
          hashParams.get("refresh_token") || queryParams.get("refresh_token");
        const type = hashParams.get("type") || queryParams.get("type");

        if (type === "recovery" && access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (error) throw error;
        }

        const { data } = await supabase.auth.getSession();

        if (data.session && mounted) {
          setSessionReady(true);
        }
      } catch (error: any) {
        toast.error(error?.message || t("auth_reset_invalid_link"));
      }
    }

    void prepareRecoverySession();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [t]);

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    if (!password.trim() || !confirmPassword.trim()) {
      toast.error(t("auth_reset_fill_both"));
      return;
    }

    if (password.length < 6) {
      toast.error(t("auth_password_min_length"));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("auth_reset_password_mismatch"));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast.success(t("auth_reset_success"));
      navigate("/auth", { replace: true });
    } catch (error: any) {
      toast.error(error?.message || t("auth_reset_save_error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09131b] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/img/freepik-video-upscaler-480.jpg"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/img/freepik-video-upscaler-480.webm" type="video/webm" />
          <source src="/img/freepik-video-upscaler-480.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-slate-950/78" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.16),transparent_30%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/50 to-slate-950/88" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-[470px] px-0 py-2 sm:py-4 lg:rounded-[34px] lg:border lg:border-white/10 lg:bg-black/30 lg:p-6 lg:backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
            {t("auth_brand")}
          </p>

          <div className="mt-5">
            <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/22 px-4 py-2">
              <div className="rounded-xl bg-cyan-400 p-2 text-slate-950">
                <Store size={18} />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.18em]">
                Storely
              </span>
            </div>

            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">
              {t("auth_reset_label")}
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">
              {t("auth_reset_title")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-white/66">
              {t("auth_reset_description")}
            </p>
          </div>

          {!sessionReady ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin" size={26} />
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label className="ml-1 text-[11px] font-black uppercase tracking-[0.22em] text-white/70">
                  {t("auth_reset_new_password")}
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/22 px-4">
                  <Lock size={18} className="text-white/40" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="h-14 w-full bg-transparent text-base text-white outline-none placeholder:text-white/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="shrink-0 text-white/55 transition hover:text-white"
                    aria-label={showPassword ? t("auth_hide_password") : t("auth_show_password")}
                    title={showPassword ? t("auth_hide_password") : t("auth_show_password")}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-[11px] font-black uppercase tracking-[0.22em] text-white/70">
                  {t("auth_reset_confirm_password")}
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/22 px-4">
                  <Lock size={18} className="text-white/40" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="********"
                    className="h-14 w-full bg-transparent text-base text-white outline-none placeholder:text-white/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="shrink-0 text-white/55 transition hover:text-white"
                    aria-label={showConfirmPassword ? t("auth_hide_password") : t("auth_show_password")}
                    title={showConfirmPassword ? t("auth_hide_password") : t("auth_show_password")}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <p className="px-1 text-xs text-white/45">
                {t("auth_password_hint_min")}
              </p>

              <button
                type="submit"
                disabled={loading}
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-cyan-400 font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  t("auth_reset_save_password")
                )}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}