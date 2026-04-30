import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useTranslate } from "../../../context/LanguageContext";
import { supabase } from "../../../lib/supabase";
import { notify } from "../../../utils/toast";
import { SectionInfo } from "../AdminSettingsComponents";

export function AccountTab({ store, isConfirmed }: { store: any; isConfirmed: boolean }) {
  const { t } = useTranslate();
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (!timer) return;
    const id = setTimeout(() => setTimer((v) => Math.max(v - 1, 0)), 1000);
    return () => clearTimeout(id);
  }, [timer]);

  const updateEmail = useMutation({
    mutationFn: async () => {
      if (!email.trim()) throw new Error(t("account_error_new_email_required"));
      if (!password) throw new Error(t("account_error_password_required"));

      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: store?.email || "",
        password,
      });
      if (loginError) throw new Error(t("account_error_wrong_password"));

      const { error } = await supabase.auth.updateUser(
        { email: email.trim() },
        { emailRedirectTo: `${window.location.origin}/auth/callback` }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      notify.success(t("account_success_email_link_sent"));
      setTimer(60);
      setEmail("");
      setPassword("");
      qc.invalidateQueries({ queryKey: ["admin-full-settings"] });
    },
    onError: (e: Error) => notify.error(e.message),
  });

  const resendEmail = useMutation({
    mutationFn: async () => {
      if (!store?.new_email_pending) throw new Error(t("account_error_no_pending_email"));

      const { error } = await supabase.auth.resend({
        type: "email_change",
        email: store.new_email_pending,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      notify.success(t("account_success_email_link_resent"));
      setTimer(60);
    },
    onError: (e: Error) => notify.error(e.message),
  });

  const card =
    "w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4";
  const label =
    "mb-1 block truncate text-[10px] font-black uppercase tracking-wide text-slate-500";
  const input =
    "w-full min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 font-bold outline-none focus:border-indigo-500";
  const btn =
    "inline-flex w-full items-center justify-center rounded-2xl px-5 py-3 text-[11px] font-black uppercase text-white transition disabled:opacity-40 sm:w-auto";

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden space-y-6">
      <SectionInfo title={t("section_email_title")} subtitle={t("section_email_subtitle")} />

      <section className="w-full min-w-0 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="space-y-5">
          {isConfirmed && !store?.new_email_pending && (
            <InfoBox
              icon={<CheckCircle2 size={20} />}
              title={t("account_email_updated_title")}
              text={t("account_email_updated_desc")}
              color="green"
            />
          )}

          {store?.new_email_pending && (
            <div className={`${card} border-amber-300 bg-amber-50`}>
              <div className="flex min-w-0 gap-3">
                <IconBox>
                  <Send size={18} />
                </IconBox>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-black uppercase text-amber-700">
                    {t("account_email_pending_title")}
                  </p>
                  <p className="break-all text-sm font-bold text-amber-900">
                    {store.new_email_pending}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={resendEmail.isPending || timer > 0}
                onClick={() => resendEmail.mutate()}
                className={`${btn} mt-4 bg-amber-500 hover:bg-amber-600`}
              >
                {resendEmail.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : timer ? (
                  t("account_wait_seconds").replace("{seconds}", String(timer))
                ) : (
                  t("account_resend_link")
                )}
              </button>
            </div>
          )}

          <div className={card}>
            <div className="flex min-w-0 gap-3">
              <IconBox>
                <Mail size={20} />
              </IconBox>

              <div className="min-w-0 flex-1">
                <p className={label}>{t("label_current_email")}</p>
                <p className="break-all text-sm font-bold text-slate-800">
                  {store?.email || t("account_email_not_available")}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className={label}>{t("label_new_email")}</label>
            <input
              className={input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("account_new_email_placeholder")}
            />
          </div>

          <div>
            <label className={label}>{t("account_confirm_password")}</label>
            <input
              className={input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("account_password_placeholder")}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!email.trim() || !password || updateEmail.isPending}
              onClick={() => updateEmail.mutate()}
              className={`${btn} bg-slate-900 hover:bg-indigo-600`}
            >
              {updateEmail.isPending ? <Loader2 size={16} className="animate-spin" /> : t("btn_update_email")}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="shrink-0 rounded-xl bg-white p-2.5 text-indigo-600">
      {children}
    </div>
  );
}

function InfoBox({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  color: "green";
}) {
  return (
    <div className="flex min-w-0 gap-3 overflow-hidden rounded-2xl border border-green-200 bg-green-50 p-4">
      <IconBox>{icon}</IconBox>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-black uppercase text-green-700">
          {title}
        </p>
        <p className="break-words text-sm font-bold text-green-900">{text}</p>
      </div>
    </div>
  );
}