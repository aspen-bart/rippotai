import type { WhatsAppSettings } from "@/lib/settings-defaults";
import type { Lang } from "@/lib/i18n";
import { IconWhatsApp } from "./icons";

// Zwevende WhatsApp-knop; instelbaar via /admin/whatsapp.
export function WhatsAppButton({ settings, lang }: { settings: WhatsAppSettings; lang: Lang }) {
  if (!settings.enabled || !settings.phone) return null;
  const phone = settings.phone.replace(/\D/g, "");
  const href = `https://wa.me/${phone}?text=${encodeURIComponent(settings.message[lang] || settings.message.it)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group fixed bottom-5 z-[55] flex items-center gap-2 rounded-full bg-[#25d366] p-3 text-white shadow-lg shadow-black/20 transition hover:shadow-xl md:pr-5 ${
        settings.position === "left" ? "left-5" : "right-5"
      } ${settings.showOnMobile ? "" : "max-md:hidden"}`}
      aria-label={settings.label[lang]}
    >
      <IconWhatsApp />
      <span className="hidden text-sm font-semibold md:inline">{settings.label[lang]}</span>
    </a>
  );
}
