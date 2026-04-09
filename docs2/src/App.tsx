import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  Moon,
  Calendar,
  Trophy,
  CheckSquare,
  FileText,
  WifiOff,
  Heart,
  BellOff,
  Globe,
  Lock,
  ArrowRight,
  Brain,
  BatteryCharging,
  Baby,
  Wind,
  ShieldCheck,
  ChevronDown,
  Download,
  CheckCircle2,
  Mic,
  Image as ImageIcon,
  Shield,
  Puzzle,
  TrendingUp,
  Github,
  Bug,
  SunMoon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { ThemeToggle } from "../components/ThemeToggle";
import { HeroBackground } from "../components/HeroBackground";
import { LanguageToggle } from "../components/LanguageToggle";
import enMessages from "./locales/en.json";
import caMessages from "./locales/ca.json";

type Language = "ca" | "en";

type IconName =
  | "Moon"
  | "Calendar"
  | "Trophy"
  | "CheckSquare"
  | "FileText"
  | "WifiOff"
  | "Heart"
  | "BellOff"
  | "Globe"
  | "Lock"
  | "Brain"
  | "BatteryCharging"
  | "Baby"
  | "Wind"
  | "ShieldCheck"
  | "SunMoon"
  | "Shield"
  | "Puzzle"
  | "TrendingUp"
  | "CheckCircle2"
  | "Mic"
  | "ImageIcon";

const messages = {
  ca: caMessages,
  en: enMessages,
} as const;

const LANDING_LANG_KEY = "magic-snooze-landing-lang";
const PUBLIC_BASE = import.meta.env.BASE_URL;
const LOGO_SOURCES = [`${PUBLIC_BASE}icon.png?v=20260407`, "/icon.png?v=20260407", "./icon.png?v=20260407"];

const iconMap: Record<IconName, React.ComponentType<{ className?: string }>> = {
  Moon,
  Calendar,
  Trophy,
  CheckSquare,
  FileText,
  WifiOff,
  Heart,
  BellOff,
  Globe,
  Lock,
  Brain,
  BatteryCharging,
  Baby,
  Wind,
  ShieldCheck,
  SunMoon,
  Shield,
  Puzzle,
  TrendingUp,
  CheckCircle2,
  Mic,
  ImageIcon,
};

const getIcon = (name: string | null | undefined) => {
  if (!name) {
    return CheckCircle2;
  }
  return iconMap[name as IconName] ?? CheckCircle2;
};

const BrandLogo = ({ className = "" }: { className?: string }) => {
  const [srcIndex, setSrcIndex] = useState(0);

  return (
    <img
      src={LOGO_SOURCES[srcIndex]}
      alt="Magic Snooze logo"
      className={`object-cover ${className}`}
      onError={() => {
        setSrcIndex((prev) => (prev < LOGO_SOURCES.length - 1 ? prev + 1 : prev));
      }}
    />
  );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-brand-secondary/30 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
      >
        <span className="text-lg font-serif font-medium text-brand-text">{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-brand-secondary flex-shrink-0 ml-4"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-brand-text-muted leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<Language>("en");
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    setIsDark(document.documentElement.classList.contains("dark"));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(LANDING_LANG_KEY);
    if (saved === "ca" || saved === "en") {
      setLang(saved);
      return;
    }

    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("ca")) {
      setLang("ca");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LANDING_LANG_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = messages[lang];
  const privacyPolicyHref = lang === "ca" ? `${PUBLIC_BASE}privacy-policy-ca.html` : `${PUBLIC_BASE}privacy-policy.html`;
  const licenseHref = `${PUBLIC_BASE}license-ca.html`;

  const reveal = (direction: "up" | "left" | "right" = "up", delay = 0) => {
    const distance = prefersReducedMotion ? 0 : 28;
    const x = direction === "left" ? -distance : direction === "right" ? distance : 0;
    const y = direction === "up" ? distance : 0;

    return {
      initial: { opacity: 0, x, y },
      whileInView: { opacity: 1, x: 0, y: 0 },
      viewport: { once: true, margin: "-50px" },
      transition: { duration: prefersReducedMotion ? 0.2 : 0.55, delay, ease: "easeOut" as const },
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-bg-1 via-brand-surface to-brand-bg-2 text-brand-text font-sans selection:bg-brand-bg-2 selection:text-brand-primary">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-surface/90 backdrop-blur-md border-b border-brand-secondary/20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-lg text-brand-primary">
            <BrandLogo className="w-6 h-6" />
            Magic Snooze
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-brand-text-muted">
            <LanguageToggle
              value={lang}
              onChange={setLang}
              labels={{ ca: t.nav.language.ca, en: t.nav.language.en }}
              ariaLabel={t.nav.languageAria}
            />
            <ThemeToggle />
            <a
              href="#download"
              className="bg-brand-primary hover:bg-brand-secondary text-white px-4 py-2 rounded-full transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline-block">{t.nav.download}</span>
            </a>
          </div>
        </div>
      </nav>

      <main className="pb-0">
        <section className="relative pt-36 pb-24 text-center overflow-hidden bg-gradient-to-b from-brand-bg-1 via-brand-bg-3 to-brand-bg-2 dark:from-[#1E3A8A] dark:via-[#374151] dark:to-[#1F2937]">
          <HeroBackground isDark={isDark} />
          <div className="relative z-10 max-w-6xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center justify-center mb-8">
                <BrandLogo className="w-20 h-20 rounded-3xl shadow-md" />
              </div>
              <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-brand-text mb-6 leading-tight">
                {t.hero.titleLine1} <br className="hidden md:block" />
                <span className="text-brand-primary">{t.hero.titleAccent}</span>
              </h1>
              <p className="text-xl text-brand-text-muted mb-10 leading-relaxed max-w-2xl mx-auto">
                {t.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <a
                  href="#download"
                  className="w-full sm:w-auto bg-brand-primary hover:bg-brand-secondary text-white px-8 py-4 rounded-full text-lg font-serif font-medium transition-all hover:shadow-lg hover:shadow-brand-secondary/25 flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  {t.hero.ctaDownload}
                </a>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto bg-brand-surface hover:bg-brand-bg-2 text-brand-text border border-brand-secondary/20 px-8 py-4 rounded-full text-lg font-serif font-medium transition-all flex items-center justify-center gap-2"
                >
                  {t.hero.ctaHow}
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>

              <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                {t.hero.pills.map((feature, i) => {
                  const Icon = getIcon(feature.icon);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="flex items-center gap-2 bg-brand-surface border border-brand-secondary/20 px-4 py-2 rounded-full text-sm font-medium text-brand-text-muted shadow-sm"
                    >
                      <Icon className="w-4 h-4 text-brand-secondary" />
                      {feature.text}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-brand-bg-2 py-24 border-y border-brand-secondary/20 dark:bg-brand-bg-2/50">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-6xl mx-auto px-6"
          >
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-text mb-4">{t.safe.title}</h2>
              <p className="text-lg text-brand-text-muted">{t.safe.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {t.safe.items.map((item, i) => {
                const Icon = getIcon(item.icon);
                return (
                  <motion.div
                    key={i}
                    {...reveal(i % 2 === 0 ? "left" : "right", i * 0.08)}
                    className="bg-brand-surface/60 backdrop-blur-md p-8 rounded-3xl shadow-sm border border-brand-secondary/20"
                  >
                    <div className="w-12 h-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center mb-6 shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold text-brand-text mb-3">{item.title}</h3>
                    <p className="text-brand-text-muted leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        <section className="py-24 px-6 border-y border-brand-secondary/20 bg-brand-bg-2/50 dark:bg-[#1F2937]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-text mb-6">{t.problem.title}</h2>
              <p className="text-lg text-brand-text-muted leading-relaxed">{t.problem.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {t.problem.cards.map((item, i) => (
                <motion.div
                  key={i}
                  {...reveal(i % 2 === 0 ? "left" : "right", i * 0.07)}
                  className="bg-brand-surface/65 dark:bg-brand-surface/30 backdrop-blur-sm p-8 rounded-3xl border border-brand-secondary/15 shadow-sm"
                >
                  <div className="text-sm font-bold tracking-wider text-brand-primary uppercase mb-2">{item.title}</div>
                  <h3 className="text-xl font-serif font-semibold text-brand-text mb-3">{item.subtitle}</h3>
                  <p className="text-brand-text-muted leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section
          id="how-it-works"
          className="bg-gradient-to-br from-brand-bg-2 via-brand-bg-3 to-brand-bg-1 text-brand-text py-24 dark:from-[#1F2937] dark:via-[#312E81]/40 dark:to-[#0F172A]"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-6xl mx-auto px-6"
          >
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">{t.solution.title}</h2>
              <p className="text-lg text-brand-text-muted leading-relaxed mb-8">{t.solution.subtitle}</p>
              <div className="flex flex-wrap justify-center gap-3">
                {t.solution.tags.map((tag, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="bg-brand-primary/10 border border-brand-primary/20 px-4 py-2 rounded-full text-sm font-medium text-brand-primary"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {t.solution.steps.map((item, i) => (
                <motion.div key={i} {...reveal("up", i * 0.1)} className="relative">
                  <div className="w-12 h-12 bg-brand-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 shadow-md">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-serif font-semibold text-brand-text mb-3">{item.title}</h3>
                  <p className="text-brand-text-muted leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="bg-brand-bg-2 py-24 border-y border-brand-secondary/20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-6xl mx-auto px-6"
          >
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-text mb-4">{t.features.title}</h2>
              <p className="text-lg text-brand-text-muted">{t.features.subtitle}</p>
            </div>

            <div className="space-y-24">
              {t.features.sections.map((section, sectionIndex) => {
                const SectionIcon = getIcon(section.icon);
                const useReverseLayout = sectionIndex % 2 === 1;
                const imageOrderClass = useReverseLayout ? "order-2 md:order-2" : "order-2 md:order-1";
                const textOrderClass = useReverseLayout ? "order-1 md:order-1" : "order-1 md:order-2";
                const featureSectionImages = [
                  `${PUBLIC_BASE}guilt-protection.png`,
                  `${PUBLIC_BASE}soft-structure.png`,
                  `${PUBLIC_BASE}smart-notes.png`,
                  `${PUBLIC_BASE}safe-progress.png`,
                ];
                const featureImageSrc = featureSectionImages[sectionIndex] ?? null;

                return (
                  <motion.div key={sectionIndex} {...reveal("up", sectionIndex * 0.06)} className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                      {...reveal(useReverseLayout ? "right" : "left", 0.05)}
                      className={`${imageOrderClass} bg-brand-surface/60 backdrop-blur-md p-2 rounded-3xl shadow-sm border border-brand-secondary/20 aspect-square flex items-center justify-center ${featureImageSrc ? "p-0 overflow-hidden" : "p-8"}`}
                    >
                      {featureImageSrc ? (
                        <img
                          src={featureImageSrc}
                          alt={section.uiLabel}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <div className="text-center">
                          <SectionIcon className="w-24 h-24 text-brand-secondary/20 mx-auto mb-4" />
                          <div className="text-brand-text-muted font-medium">{section.uiLabel}</div>
                        </div>
                      )}
                    </motion.div>

                    <motion.div {...reveal(useReverseLayout ? "left" : "right", 0.1)} className={textOrderClass}>
                      <div className="flex items-center gap-2 text-brand-primary font-semibold mb-4">
                        <SectionIcon className="w-5 h-5" />
                        {section.eyebrow}
                      </div>
                      <h3 className="text-3xl font-bold text-brand-text mb-6">{section.title}</h3>
                      <p className="text-lg text-brand-text-muted mb-8">{section.desc}</p>
                      <ul className="space-y-6">
                        {section.items.map((item, itemIndex) => {
                          const itemIcon = "icon" in item ? item.icon : null;
                          const ItemIcon = getIcon(itemIcon ?? section.listIcon);
                          return (
                            <motion.li key={itemIndex} {...reveal("up", itemIndex * 0.06)} className="flex gap-4">
                              <ItemIcon className="w-6 h-6 text-brand-secondary flex-shrink-0" />
                              <div>
                                <div className="font-semibold text-brand-text mb-1">{item.title}</div>
                                <div className="text-brand-text-muted">{item.desc}</div>
                              </div>
                            </motion.li>
                          );
                        })}
                      </ul>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        <section className="py-24 px-6 bg-brand-surface/45 dark:bg-[#111827]/55">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-text mb-4">{t.who.title}</h2>
              <p className="text-lg text-brand-text-muted">{t.who.subtitle}</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {t.who.items.map((item, i) => {
                const Icon = getIcon(item.icon);
                return (
                  <motion.div
                    key={i}
                    {...reveal(i % 2 === 0 ? "left" : "right", i * 0.08)}
                    className="bg-gradient-to-br from-brand-surface/60 to-brand-bg-1/40 backdrop-blur-md p-8 rounded-3xl border border-brand-secondary/20 shadow-sm"
                  >
                    <Icon className="w-8 h-8 text-brand-secondary mb-6" />
                    <h3 className="text-xl font-serif font-semibold text-brand-text mb-3">{item.title}</h3>
                    <p className="text-brand-text-muted leading-relaxed">{item.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </section>

        <section className="bg-gradient-to-b from-brand-bg-2/55 to-brand-surface/70 dark:from-[#1F2937]/60 dark:to-[#111827]/65 py-24 border-y border-brand-secondary/15">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl mx-auto px-6"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-text mb-4">{t.faq.title}</h2>
            </div>

            <div className="bg-brand-surface/50 dark:bg-brand-surface/25 rounded-3xl p-8">
              {t.faq.items.map((faq, i) => (
                <motion.div key={i} {...reveal("up", i * 0.05)}>
                  <FAQItem question={faq.q} answer={faq.a} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        <section
          id="download"
          className="py-24 px-6 text-center bg-gradient-to-b from-brand-bg-1/45 via-brand-surface/75 to-brand-bg-2/45 dark:from-[#312E81]/25 dark:via-[#1F2937]/40 dark:to-[#0F172A]/70"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
          <div className="inline-flex items-center justify-center mb-8">
            <BrandLogo className="w-20 h-20 rounded-3xl shadow-md" />
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-brand-text mb-6">{t.cta.title}</h2>
          <p className="text-xl text-brand-text-muted mb-10 leading-relaxed max-w-2xl mx-auto">{t.cta.subtitle}</p>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-secondary text-white px-8 py-4 rounded-full text-lg font-serif font-medium transition-all hover:shadow-lg hover:shadow-brand-secondary/35 mb-8"
          >
            <Download className="w-5 h-5" />
            {t.cta.download}
          </a>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-brand-text-muted">
            {t.cta.badges.map((badge, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" /> {badge}
              </motion.span>
            ))}
          </div>
          </motion.div>
        </section>
      </main>

      <footer className="bg-gradient-to-b from-brand-surface to-brand-bg-3 text-brand-text-muted py-12 border-t border-brand-secondary/20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-semibold text-lg text-brand-text">
            <BrandLogo className="w-6 h-6" />
            Magic Snooze
          </div>
          <div className="text-sm text-center md:text-left">{t.footer.tagline}</div>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href={privacyPolicyHref} className="hover:text-brand-primary transition-colors">
              {t.footer.privacy}
            </a>
            <a
              href="https://github.com/FeyaBloom/Magic-Snooze"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-primary transition-colors flex items-center gap-1"
            >
              <Github className="w-4 h-4" /> {t.footer.source}
            </a>
            <a
              href="https://github.com/FeyaBloom/Magic-Snooze/issues/new/choose"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-brand-primary transition-colors flex items-center gap-1"
            >
              <Bug className="w-4 h-4" /> {t.footer.report}
            </a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-8 pt-8 border-t border-brand-secondary/20 text-sm text-center md:text-left flex flex-col md:flex-row justify-between gap-4">
          <div>{t.footer.copyright}</div>
          <a href={licenseHref} className="hover:text-brand-primary transition-colors">
            {t.footer.license}
          </a>
        </div>
      </footer>
    </div>
  );
}
