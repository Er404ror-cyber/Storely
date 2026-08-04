import React from "react";

interface AuthAlertsProps {
  showLoginSuggestion: boolean;
  loginSuggestionText: string;
  lastError: string | null;
  setMode: (mode: "login" | "signup" | "forgot") => void;
  t: (key: any) => string;
}

const AuthAlertsComponent = ({ showLoginSuggestion, loginSuggestionText, lastError, setMode, t }: AuthAlertsProps) => {
  return (
    <>
      {showLoginSuggestion && (
        <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
          <p className="text-sm font-bold text-amber-200">{t("auth_account_found_title") || "Conta existente encontrada"}</p>
          <p className="mt-1 text-sm leading-6 text-amber-100/85">{loginSuggestionText}</p>
          <button type="button" onClick={() => setMode("login")} className="mt-3 text-sm font-black text-cyan-300 transition hover:text-cyan-200">
            {t("auth_go_to_login") || "Ir para o Login"}
          </button>
        </div>
      )}

      {lastError && (
        <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
          <p className="text-sm font-bold text-red-200">{t("auth_error_title") || "Erro na autenticação"}</p>
          <p className="mt-1 text-sm leading-6 text-red-100/85">{lastError}</p>
        </div>
      )}
    </>
  );
};

export const AuthAlerts = React.memo(AuthAlertsComponent);