import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/useLanguage";

type LanguageToggleProps = {
  className?: string;
};

const LanguageToggle: React.FC<LanguageToggleProps> = ({ className }) => {
  const { language, setLanguage } = useLanguage();

  const buttonBase = "h-8 px-3 text-xs sm:text-sm rounded-none h-full";
  const active = "bg-slate-200 text-slate-900 hover:bg-slate-200";
  const inactive = "text-slate-300 hover:text-slate-900 hover:bg-slate-300";

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-slate-600 overflow-hidden",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        type="button"
        aria-pressed={language === "ru"}
        onClick={() => setLanguage("ru")}
        className={cn(buttonBase, language === "ru" ? active : inactive)}
      >
        RU
      </Button>
      <Button
        variant="ghost"
        size="sm"
        type="button"
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
        className={cn(buttonBase, language === "en" ? active : inactive)}
      >
        EN
      </Button>
    </div>
  );
};

export default LanguageToggle;
