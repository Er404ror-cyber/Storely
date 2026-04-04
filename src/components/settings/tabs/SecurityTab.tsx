import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, RefreshCw } from "lucide-react";
import { useTranslate } from "../../../context/LanguageContext";
import { supabase } from "../../../lib/supabase";
import { notify } from "../../../utils/toast";
import { SectionInfo } from "../AdminSettingsComponents";

type SecurityTabProps = {
  store: {
    email?: string | null;
  } | null;
  isRecoveryMode: boolean;
};

const PASSWORD_MIN_LENGTH = 6;

export function SecurityTab({
  store,
  isRecoveryMode,
}: SecurityTabProps) {
  const { t } = useTranslate();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const newPasswordValid = newPassword.trim().length >= PASSWORD_MIN_LENGTH;
  const passwordsMatch =
    !!newPassword.trim() &&
    !!confirmPassword.trim() &&
    newPassword === confirmPassword;

  const canSubmit = useMemo(() => {
    if (isRecoveryMode) {
      return newPasswordValid && passwordsMatch;
    }

    return (
      !!currentPassword.trim() &&
      newPasswordValid &&
      passwordsMatch
    );
  }, [currentPassword, isRecoveryMode, newPasswordValid, passwordsMatch]);

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      if (!newPassword.trim() || newPassword.trim().length < PASSWORD_MIN_LENGTH) {
        throw new Error(
          t("security_password_min_error")
        );
      }

      if (newPassword !== confirmPassword) {
        throw new Error(
          t("security_passwords_not_match")
        );
      }

      if (!isRecoveryMode) {
        if (!currentPassword.trim()) {
          throw new Error(
            t("security_current_password_required")
          );
        }

        const email = store?.email?.trim();
        if (!email) {
          throw new Error(
            t("security_email_missing")
          );
        }

        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
        });

        if (authError) {
          throw new Error(
            t("security_current_password_incorrect")
          );
        }
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      notify.success(
        isRecoveryMode
          ? t("security_reset_success")
          : t("password_update_success")
      );

      if (isRecoveryMode) {
        navigate("/admin/configuracoes", { replace: true });
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    },
    onError: (err: Error) => {
      notify.error(err.message);
    },
  });

  async function handleSendResetEmail() {
    if (isResetting) return;

    const email = store?.email?.trim();

    if (!email) {
      notify.error(t("security_email_missing"));
      return;
    }

    setIsResetting(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      notify.success(t("security_reset_email_sent"));
    } catch (error: any) {
      notify.error(
        error?.message || t("security_reset_email_error")
      );
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="animate-in slide-in-from-right-4 space-y-8">
      <SectionInfo
        title={
          isRecoveryMode
            ? t("security_recovery_title")
            : t("section_crypto_title")
        }
        subtitle={
          isRecoveryMode
            ? t("security_recovery_subtitle")
            : t("section_crypto_subtitle")
        }
      />

      <div className="relative overflow-hidden rounded-[2rem] border border-indigo-100 bg-white p-6 shadow-xl md:p-8">
        {isRecoveryMode ? (
          <div className="mb-6 rounded-2xl bg-indigo-600 px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white">
            {t("security_recovery_mode_active")}
          </div>
        ) : null}

        <div className="space-y-5">
          {!isRecoveryMode ? (
            <PasswordField
              label={t("security_current_password")}
              value={currentPassword}
              onChange={setCurrentPassword}
              visible={showCurrentPassword}
              onToggleVisible={() =>
                setShowCurrentPassword((prev) => !prev)
              }
            />
          ) : null}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <PasswordField
              label={t("security_new_password")}
              value={newPassword}
              onChange={setNewPassword}
              visible={showNewPassword}
              onToggleVisible={() => setShowNewPassword((prev) => !prev)}
              hint={t("security_password_min_hint")}
            />

            <PasswordField
              label={t("security_confirm_password")}
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={showConfirmPassword}
              onToggleVisible={() =>
                setShowConfirmPassword((prev) => !prev)
              }
              error={
                confirmPassword && !passwordsMatch
                  ? t("security_passwords_not_match")
                  : ""
              }
            />
          </div>

          <div className="flex flex-col gap-4 pt-2 md:flex-row md:items-center md:justify-between">
            {!isRecoveryMode ? (
              <button
                type="button"
                onClick={handleSendResetEmail}
                disabled={isResetting}
                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em] text-indigo-600 transition hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isResetting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                {isResetting
                  ? t("security_sending_email")
                  : t("security_forgot_password")}
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              disabled={updatePasswordMutation.isPending || !canSubmit}
              onClick={() => updatePasswordMutation.mutate()}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-indigo-600 px-8 text-[11px] font-black uppercase tracking-[0.14em] text-white shadow-lg transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updatePasswordMutation.isPending ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                t("security_save_new_password")
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  hint?: string;
  error?: string;
};

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggleVisible,
  hint,
  error,
}: PasswordFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
        {label}
      </label>

      <div className="flex items-center gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-14 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
          placeholder={label}
        />

        <button
          type="button"
          onClick={onToggleVisible}
          className="shrink-0 text-slate-500 transition hover:text-slate-700"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error ? (
        <p className="text-xs font-semibold text-red-500">{error}</p>
      ) : hint ? (
        <p className="text-xs font-semibold text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}