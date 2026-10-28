import { requireUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { WhatsAppForm } from "@/components/admin/forms/WhatsAppForm";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "WhatsApp" };

export default async function WhatsAppPage() {
  await requireUser();
  const settings = await getSetting("whatsapp");
  return (
    <>
      <PageHeader title="WhatsApp" description="Zwevende WhatsApp-knop op de website" />
      <WhatsAppForm initial={settings} />
    </>
  );
}
