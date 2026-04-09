import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useTranslate } from "../context/LanguageContext";

type CallbackStatus = "loading" | "success" | "error";

export function AuthCallback() {
  const { t } = useTranslate();
  const navigate = useNavigate();

  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState(
    t("auth_callback_loading_message")
  );

  const redirectTimeoutRef = useRef<number | null>(null);
  const handledRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    function clearRedirectTimer() {
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    }

    function safeSetState(nextStatus: CallbackStatus, nextMessage: string) {
      if (!mounted) return;
      setStatus(nextStatus);
      setMessage(nextMessage);
    }

    function scheduleRedirect(path: string, delay = 1800) {
      clearRedirectTimer();
      redirectTimeoutRef.current = window.setTimeout(() => {
        navigate(path, { replace: true });
      }, delay);
    }

    async function handleCallback() {
      if (handledRef.current) return;
      handledRef.current = true;

      try {
        const url = new URL(window.location.href);

        const queryParams = url.searchParams;
        const hashParams = new URLSearchParams(url.hash.replace(/^#/, ""));

        const accessToken =
          hashParams.get("access_token") || queryParams.get("access_token");
        const refreshToken =
          hashParams.get("refresh_token") || queryParams.get("refresh_token");
        const type = hashParams.get("type") || queryParams.get("type");

        const errorCode = queryParams.get("error") || hashParams.get("error");
        const errorDescription =
          queryParams.get("error_description") ||
          hashParams.get("error_description");

        if (errorCode) {
          safeSetState(
            "error",
            errorDescription || t("auth_callback_link_error")
          );
          scheduleRedirect("/auth", 3000);
          return;
        }

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) throw error;
        }

        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const hasSession = !!sessionData.session;

        // CASO 1: RECUPERAÇÃO DE SENHA -> NOVA LÓGICA
        if (type === "recovery") {
          safeSetState("success", t("auth_callback_recovery_success"));
          scheduleRedirect("/auth/reset-password", 1400);
          return;
        }

        // CASO 2: TROCA DE EMAIL -> MANTER LÓGICA ANTIGA
        if (type === "email_change") {
          safeSetState("success", t("auth_callback_email_change_success"));
          scheduleRedirect(
            "/admin/configuracoes?tab=account&email_updated=true",
            1800
          );
          return;
        }

        // CASO 3: LOGIN PADRÃO
        if (hasSession) {
          safeSetState("success", t("auth_callback_login_success"));
          scheduleRedirect("/admin/dashboard", 900);
          return;
        }

        // CASO 4: SEM SESSÃO
        safeSetState("error", t("auth_callback_no_session"));
        scheduleRedirect("/auth", 2600);
      } catch (error: any) {
        safeSetState(
          "error",
          error?.message || t("auth_callback_generic_error")
        );
        scheduleRedirect("/auth", 3000);
      }
    }

    void handleCallback();

    return () => {
      mounted = false;
      clearRedirectTimer();
    };
  }, [navigate, t]);

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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(103,232,249,0.16),transparent_28%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/50 to-slate-950/88" />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-[32px] border border-white/10 bg-black/28 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.38)]  sm:p-8">
            <p className="text-center text-[11px] font-black uppercase tracking-[0.28em] text-cyan-300">
              Storely
            </p>

            {status === "loading" ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-5 rounded-2xl bg-cyan-400/15 p-4 text-cyan-300">
                  <Loader2 className="animate-spin" size={32} />
                </div>

                <h1 className="text-2xl font-black tracking-tight">
                  {t("auth_callback_loading_title")}
                </h1>

                <p className="mt-2 max-w-sm text-sm leading-6 text-white/70">
                  {message}
                </p>
              </div>
            ) : null}

            {status === "success" ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-5 rounded-full bg-emerald-500/15 p-4 text-emerald-300">
                  <CheckCircle2 size={34} />
                </div>

                <h1 className="text-2xl font-black tracking-tight">
                  {t("auth_callback_success_title")}
                </h1>

                <p className="mt-2 max-w-sm text-sm leading-6 text-white/72">
                  {message}
                </p>

                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.24em] text-white/38">
                  {t("auth_callback_redirecting")}
                </p>
              </div>
            ) : null}

            {status === "error" ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-5 rounded-full bg-red-500/15 p-4 text-red-300">
                  <XCircle size={34} />
                </div>

                <h1 className="text-2xl font-black tracking-tight">
                  {t("auth_callback_error_title")}
                </h1>

                <p className="mt-2 max-w-sm text-sm leading-6 text-white/72">
                  {message}
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/auth", { replace: true })}
                  className="mt-6 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/15"
                >
                  {t("auth_callback_back_login")}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}