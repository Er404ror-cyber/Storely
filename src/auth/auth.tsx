import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  HelpCircle,
  Loader2,
  Lock,
  Mail,
  Store,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { useTranslate } from "../context/LanguageContext";

type AuthMode = "signup" | "login" | "forgot";
type SlugStatus = "idle" | "checking" | "available" | "taken" | "invalid";

type SlugCacheEntry = {
  exists: boolean;
  expiresAt: number;
};

const SLUG_CACHE_TTL_MS = 1000 * 60 * 20;
const SLUG_MIN_LENGTH = 3;
const SLUG_MAX_LENGTH = 20;
const STORE_NAME_MAX_LENGTH = 15;
const PASSWORD_MIN_LENGTH = 6;

const memorySlugCache = new Map<string, SlugCacheEntry>();
const inflightSlugChecks = new Map<string, Promise<boolean>>();

const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "blog",
  "dashboard",
  "help",
  "login",
  "register",
  "reset-password",
  "settings",
  "store",
  "stores",
  "support",
  "privacy",
  "terms",
  "about",
  "contact",
  "home",
]);

function slugifyStoreName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function readSlugCache(slug: string): SlugCacheEntry | null {
  if (!slug) return null;

  const memory = memorySlugCache.get(slug);
  if (memory && memory.expiresAt > Date.now()) return memory;

  try {
    const raw = sessionStorage.getItem(`storely:slug:${slug}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as SlugCacheEntry;
    if (parsed.expiresAt > Date.now()) {
      memorySlugCache.set(slug, parsed);
      return parsed;
    }

    sessionStorage.removeItem(`storely:slug:${slug}`);
  } catch {
    // ignore
  }

  return null;
}

function writeSlugCache(slug: string, exists: boolean) {
  const entry: SlugCacheEntry = {
    exists,
    expiresAt: Date.now() + SLUG_CACHE_TTL_MS,
  };

  memorySlugCache.set(slug, entry);

  try {
    sessionStorage.setItem(`storely:slug:${slug}`, JSON.stringify(entry));
  } catch {
    // ignore
  }
}

async function fetchSlugExists(slug: string): Promise<boolean> {
  const cached = readSlugCache(slug);
  if (cached) return cached.exists;

  const pending = inflightSlugChecks.get(slug);
  if (pending) return pending;

  const promise = (async () => {
    const { data, error } = await supabase
      .from("stores")
      .select("id")
      .eq("slug", slug)
      .limit(1);

    if (error) throw error;

    const exists = Array.isArray(data) && data.length > 0;
    writeSlugCache(slug, exists);
    return exists;
  })();

  inflightSlugChecks.set(slug, promise);

  try {
    return await promise;
  } finally {
    inflightSlugChecks.delete(slug);
  }
}

function isValidSlug(slug: string) {
  if (!slug) return false;
  if (slug.length < SLUG_MIN_LENGTH) return false;
  if (slug.length > SLUG_MAX_LENGTH) return false;
  if (!/^[a-z0-9-]+$/.test(slug)) return false;
  if (RESERVED_SLUGS.has(slug)) return false;
  return true;
}

export function AuthPage() {
  const { t } = useTranslate();
  const navigate = useNavigate();

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

  const debounceRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);

  const slug = useMemo(() => slugifyStoreName(storeName), [storeName]);

  const isSignUp = mode === "signup";
  const isLogin = mode === "login";
  const isForgot = mode === "forgot";

  const passwordMeetsMin = password.trim().length >= PASSWORD_MIN_LENGTH;
  const storeNameTrimmed = storeName.trim();
  const storeNameLength = storeNameTrimmed.length;
  const storeNameValidLength =
    storeNameLength >= 2 && storeNameLength <= STORE_NAME_MAX_LENGTH;

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

  useEffect(() => {
    if (lastError) setLastError(null);
    if (showLoginSuggestion) {
      setShowLoginSuggestion(false);
      setLoginSuggestionText("");
    }
  }, [email, password, storeName]);

  const verifySlug = useCallback(
    async (nextSlug: string) => {
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

      if (!/^[a-z0-9-]+$/.test(nextSlug)) {
        setSlugStatus("invalid");
        setSlugMessage(t("auth_slug_invalid_chars"));
        return;
      }

      if (RESERVED_SLUGS.has(nextSlug)) {
        setSlugStatus("taken");
        setSlugMessage(t("auth_slug_reserved"));
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
    },
    [isSignUp, storeNameValidLength, t]
  );

  useEffect(() => {
    if (!isSignUp) return;

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    if (!storeNameTrimmed) {
      setSlugStatus("idle");
      setSlugMessage("");
      return;
    }

    debounceRef.current = window.setTimeout(() => {
      void verifySlug(slug);
    }, 650);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [isSignUp, slug, storeNameTrimmed, verifySlug]);

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    clearFeedback();

    if (!email.trim()) {
      toast.error(t("auth_enter_email_first"));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast.success(t("auth_reset_email_sent"));
      setMode("login");
    } catch (error: any) {
      const message = error?.message || t("auth_reset_email_error");
      setLastError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    clearFeedback();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!storeNameTrimmed) {
          throw new Error(t("auth_store_required"));
        }

        if (!storeNameValidLength) {
          throw new Error(t("auth_store_name_length_invalid"));
        }

        if (!slug || !isValidSlug(slug)) {
          throw new Error(t("auth_store_invalid"));
        }

        if (!passwordMeetsMin) {
          throw new Error(t("auth_password_min_length"));
        }

        if (slugStatus === "checking") {
          throw new Error(t("auth_slug_wait"));
        }

        if (slugStatus === "taken") {
          throw new Error(t("auth_slug_taken"));
        }

        if (slugStatus !== "available") {
          const exists = await fetchSlugExists(slug);

          if (exists) {
            setSlugStatus("taken");
            setSlugMessage(t("auth_slug_taken"));
            throw new Error(t("auth_slug_taken"));
          }

          setSlugStatus("available");
          setSlugMessage(t("auth_slug_available"));
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          const errorMessage = String(error.message || "").toLowerCase();

          if (
            errorMessage.includes("already registered") ||
            errorMessage.includes("user already registered") ||
            errorMessage.includes("already exists")
          ) {
            setShowLoginSuggestion(true);
            setLoginSuggestionText(t("auth_existing_email_go_login"));
          }

          throw error;
        }

        const userId = data.user?.id;

        if (!userId) {
          throw new Error(t("auth_user_missing"));
        }

        const { error: storeError } = await supabase.from("stores").insert([
          {
            owner_id: userId,
            name: storeNameTrimmed,
            slug,
          },
        ]);

        if (storeError) {
          if (
            typeof storeError.message === "string" &&
            storeError.message.toLowerCase().includes("duplicate")
          ) {
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
        if (!passwordMeetsMin) {
          throw new Error(t("auth_password_min_length"));
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        toast.success(t("auth_login_success"));
        navigate("/admin", { replace: true });
      }
    } catch (error: any) {
      const message = error?.message || t("auth_generic_error");
      setLastError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const signupReady =
    !!email.trim() &&
    storeNameValidLength &&
    !!slug &&
    isValidSlug(slug) &&
    slugStatus === "available" &&
    passwordMeetsMin;

  const loginReady =
    !!email.trim() &&
    !!password.trim() &&
    passwordMeetsMin;

  const forgotReady = !!email.trim();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#09131b] text-white">
      <AuthVideoBackground />

      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-4 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/20 backdrop-blur-md transition hover:bg-black/30"
        >
          <ArrowLeft size={20} />
        </button>

        <button
          type="button"
          onClick={() => {
            const phoneNumber = "917696553844";
            const text = encodeURIComponent(
              `Storely Support\nPath: ${window.location.pathname}\nTime: ${new Date().toLocaleString()}\nError: ${
                lastError || "Manual support request"
              }`
            );
            window.open(`https://wa.me/${phoneNumber}?text=${text}`, "_blank");
          }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-bold text-white/90 backdrop-blur-md transition hover:bg-black/30"
        >
          <HelpCircle size={16} />
          {t("auth_support")}
        </button>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-7xl items-center px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,440px)] xl:gap-14">
          <section className="order-2 hidden lg:order-1 lg:flex lg:items-center">
            <div className="max-w-[540px]">
              <p className="text-sm font-black uppercase tracking-[0.24em] text-cyan-300">
                {t("auth_brand")}
              </p>

              <h1 className="mt-4 text-5xl font-black leading-[0.9] tracking-tight xl:text-6xl">
                {t("auth_desktop_big_title_line1")}
                <br />
                {t("auth_desktop_big_title_line2")}
                <br />
                <span className="text-white/92">
                  {t("auth_desktop_big_title_line3")}
                </span>
              </h1>

              <p className="mt-6 max-w-[450px] text-base leading-7 text-white/72">
                {t("auth_desktop_subtitle_compact")}
              </p>

              <div className="mt-8 space-y-4">
                <DesktopPoint text={t("auth_desktop_point_1")} />
                <DesktopPoint text={t("auth_desktop_point_2")} />
                <DesktopPoint text={t("auth_desktop_point_3")} />
              </div>
            </div>
          </section>

          <section className="order-1 flex items-center justify-center lg:order-2 lg:justify-end">
            <div className="w-full max-w-[440px]">
              <div className="px-0 py-2 sm:py-4 lg:rounded-[34px] lg:border lg:border-white/10 lg:bg-black/28 lg:p-6 lg:shadow-[0_25px_90px_rgba(0,0,0,0.38)] lg:backdrop-blur-xl">
                <div className="lg:hidden">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">
                    {t("auth_brand")}
                  </p>

                  <h1 className="mt-4 text-[2.2rem] font-black leading-[0.92] tracking-tight sm:text-[2.45rem]">
                    {t("auth_mobile_title_line1")}
                    <br />
                    <span className="text-white/92">
                      {t("auth_mobile_title_line2")}
                    </span>
                  </h1>

                  <p className="mt-3 max-w-[30rem] text-sm leading-6 text-white/70">
                    {t("auth_mobile_subtitle_professional")}
                  </p>
                </div>

                {!isForgot ? (
                  <div className="mt-6 grid grid-cols-2 rounded-2xl border border-white/10 bg-black/22 p-1 lg:mt-0">
                    <button
                      type="button"
                      onClick={() => setMode("signup")}
                      className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                        isSignUp
                          ? "bg-cyan-400 text-slate-950"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      {t("auth_create_account")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className={`rounded-2xl px-4 py-3 text-sm font-black transition ${
                        isLogin
                          ? "bg-cyan-400 text-slate-950"
                          : "text-white/70 hover:text-white"
                      }`}
                    >
                      {t("auth_login")}
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 lg:mt-0">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-sm font-black text-cyan-300 transition hover:text-cyan-200"
                    >
                      ← {t("auth_back_to_login")}
                    </button>
                  </div>
                )}

                <div className="mt-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/45">
                    {isForgot
                      ? t("auth_recovery_label")
                      : isSignUp
                      ? t("auth_start_here")
                      : t("auth_welcome_back_small")}
                  </p>

                  <h2 className="mt-2 text-3xl font-black tracking-tight">
                    {isForgot
                      ? t("auth_forgot_title")
                      : isSignUp
                      ? t("auth_heading_signup")
                      : t("auth_heading_login")}
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/66">
                    {isForgot
                      ? t("auth_forgot_description")
                      : isSignUp
                      ? t("auth_signup_description_short")
                      : t("auth_login_description_short")}
                  </p>
                </div>

                {showLoginSuggestion ? (
                  <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
                    <p className="text-sm font-bold text-amber-200">
                      {t("auth_account_found_title")}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-amber-100/85">
                      {loginSuggestionText}
                    </p>
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="mt-3 text-sm font-black text-cyan-300 transition hover:text-cyan-200"
                    >
                      {t("auth_go_to_login")}
                    </button>
                  </div>
                ) : null}

                {lastError ? (
                  <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
                    <p className="text-sm font-bold text-red-200">
                      {t("auth_error_title")}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-red-100/85">
                      {lastError}
                    </p>
                  </div>
                ) : null}

                <form
                  onSubmit={isForgot ? handleForgotPassword : handleSubmit}
                  className="mt-5 space-y-4"
                >
                  <div className="space-y-2">
                    <label className="ml-1 text-[11px] font-black uppercase tracking-[0.22em] text-white/70">
                      {t("auth_email_label")}
                    </label>

                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/22 px-4">
                      <Mail size={18} className="text-white/40" />
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("auth_email_placeholder")}
                        className="h-14 w-full bg-transparent text-base text-white outline-none placeholder:text-white/25"
                      />
                    </div>
                  </div>

                  {isSignUp ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3 px-1">
                        <label className="text-[11px] font-black uppercase tracking-[0.22em] text-white/70">
                          {t("auth_store_name_label")}
                        </label>
                        <span className="text-xs text-white/45">
                          {storeNameLength}/{STORE_NAME_MAX_LENGTH}
                        </span>
                      </div>

                      <div
                        className={`rounded-2xl border px-4 ${
                          slugStatus === "taken"
                            ? "border-red-400/30 bg-red-500/10"
                            : slugStatus === "available"
                            ? "border-emerald-400/30 bg-emerald-500/10"
                            : "border-white/10 bg-black/22"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Store size={18} className="text-white/40" />
                          <input
                            type="text"
                            required
                            maxLength={STORE_NAME_MAX_LENGTH}
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            onBlur={() => {
                              if (slug && isValidSlug(slug) && storeNameValidLength) {
                                void verifySlug(slug);
                              }
                            }}
                            placeholder={t("auth_store_name_placeholder")}
                            className="h-14 w-full bg-transparent text-base text-white outline-none placeholder:text-white/25"
                          />
                        </div>
                      </div>

                      {storeNameTrimmed ? (
                        <div className="flex items-start justify-between gap-3 px-1">
                          <p className="text-xs text-white/45">
                            {t("auth_store_url_preview")}:{" "}
                            <span className="font-medium text-white/78">
                              /{slug || "your-store"}
                            </span>
                          </p>
                          <p
                            className={`text-right text-xs font-semibold ${
                              slugStatus === "taken"
                                ? "text-red-300"
                                : slugStatus === "available"
                                ? "text-emerald-300"
                                : slugStatus === "invalid"
                                ? "text-amber-300"
                                : "text-white/55"
                            }`}
                          >
                            {slugMessage}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {!isForgot ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[11px] font-black uppercase tracking-[0.22em] text-white/70">
                          {t("auth_password_label")}
                        </label>

                        {isLogin ? (
                          <button
                            type="button"
                            onClick={() => setMode("forgot")}
                            className="text-xs font-bold text-cyan-300 transition hover:text-cyan-200"
                          >
                            {t("auth_forgot_password")}
                          </button>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/22 px-4">
                        <Lock size={18} className="text-white/40" />
                        <input
                          type={showPassword ? "text" : "password"}
                          required={!isForgot}
                          autoComplete={isSignUp ? "new-password" : "current-password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="********"
                          className="h-14 w-full bg-transparent text-base text-white outline-none placeholder:text-white/25"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="shrink-0 text-white/55 transition hover:text-white"
                          aria-label={
                            showPassword
                              ? t("auth_hide_password")
                              : t("auth_show_password")
                          }
                          title={
                            showPassword
                              ? t("auth_hide_password")
                              : t("auth_show_password")
                          }
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      <p className="px-1 text-xs text-white/45">
                        {t("auth_password_hint_min")}
                      </p>
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={
                      isForgot
                        ? !forgotReady || loading
                        : isSignUp
                        ? !signupReady || loading
                        : !loginReady || loading
                    }
                    className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 font-black uppercase tracking-[0.18em] text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <span>
                          {isForgot
                            ? t("auth_send_reset_link")
                            : isSignUp
                            ? t("auth_create_account")
                            : t("auth_login")}
                        </span>
                        <ChevronRight
                          size={18}
                          className="transition group-hover:translate-x-0.5"
                        />
                      </>
                    )}
                  </button>
                </form>

                {!isForgot ? (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/18 p-4">
                    {isSignUp ? (
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white/88">
                          {t("auth_switch_login_title")}
                        </p>
                        <button
                          type="button"
                          onClick={() => setMode("login")}
                          className="text-sm font-black text-cyan-300 transition hover:text-cyan-200"
                        >
                          {t("auth_go_to_login")}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white/88">
                          {t("auth_switch_signup_title")}
                        </p>
                        <button
                          type="button"
                          onClick={() => setMode("signup")}
                          className="text-sm font-black text-cyan-300 transition hover:text-cyan-200"
                        >
                          {t("auth_go_to_signup")}
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}

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

function DesktopPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-xl bg-cyan-400/12 p-2 text-cyan-300">
        <CheckCircle2 size={16} />
      </div>
      <p className="text-base font-semibold text-white/90">{text}</p>
    </div>
  );
}

function AuthVideoBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 hidden lg:block">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/img/freepik-video-upscaler-480.jpg"
          className="h-full w-full object-cover"
        >
          <source src="/img/freepik-video-upscaler-480.webm" type="video/webm" />
          <source src="/img/freepik-video-upscaler-480.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="absolute inset-x-0 top-0 h-[42vh] lg:hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/img/freepik-video-upscaler-480.jpg"
          className="h-full w-full object-cover"
        >
          <source src="/img/freepik-video-upscaler-480.webm" type="video/webm" />
          <source src="/img/freepik-video-upscaler-480.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="absolute inset-0 bg-slate-950/72 lg:bg-slate-950/68" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.16),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_30%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/45 to-slate-950/92 lg:from-slate-950/10 lg:via-slate-950/50 lg:to-slate-950/82" />
    </div>
  );
}