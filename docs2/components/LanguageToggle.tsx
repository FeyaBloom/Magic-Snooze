import { motion } from "motion/react";

type Language = "ca" | "en";

type LanguageToggleProps = {
  value: Language;
  onChange: (lang: Language) => void;
  labels: {
    ca: string;
    en: string;
  };
  ariaLabel: string;
};

export const LanguageToggle = ({
  value,
  onChange,
  labels,
  ariaLabel,
}: LanguageToggleProps) => {
  return (
    <div
      className="relative w-20 h-8 rounded-full bg-brand-bg-2 border border-brand-secondary/30 p-1 flex items-center"
      role="group"
      aria-label={ariaLabel}
    >
      <motion.div
        className="absolute top-1 left-1 w-9 h-6 rounded-full bg-brand-surface shadow-sm"
        animate={{ x: value === "ca" ? 0 : 36 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      <button
        type="button"
        onClick={() => onChange("ca")}
        className={`relative z-10 w-9 h-6 text-[11px] font-semibold transition-colors ${
          value === "ca" ? "text-brand-secondary" : "text-brand-text-muted"
        }`}
        aria-pressed={value === "ca"}
      >
        {labels.ca}
      </button>
      <button
        type="button"
        onClick={() => onChange("en")}
        className={`relative z-10 w-9 h-6 text-[11px] font-semibold transition-colors ${
          value === "en" ? "text-brand-secondary" : "text-brand-text-muted"
        }`}
        aria-pressed={value === "en"}
      >
        {labels.en}
      </button>
    </div>
  );
};
