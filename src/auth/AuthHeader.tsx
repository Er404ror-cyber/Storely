import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, HelpCircle } from "lucide-react";

interface AuthHeaderProps {
  t: (key: any) => string;
  lastError: string | null;
}

const AuthHeaderComponent = ({ t, lastError }: AuthHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSupport = () => {
    const phoneNumber = "917696553844";
    const terminalError = lastError ? `\nTerminal Error: ${lastError}` : "";
    const text = encodeURIComponent(
      `Storely Support\nPath: ${location.pathname}\nTime: ${new Date().toLocaleString()}${terminalError}`
    );
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, "_blank");
  };

  return (
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
        onClick={handleSupport}
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-bold text-white/90 backdrop-blur-md transition hover:bg-black/30"
      >
        <HelpCircle size={16} />
        {t("auth_support") || "Suporte"}
      </button>
    </header>
  );
};

export const AuthHeader = React.memo(AuthHeaderComponent);