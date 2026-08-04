import React from "react";
import { CheckCircle2 } from "lucide-react";

interface DesktopHeroProps {
  t: (key: any) => string;
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

const DesktopHeroComponent = ({ t }: DesktopHeroProps) => {
  return (
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
  );
};

export const DesktopHero = React.memo(DesktopHeroComponent);