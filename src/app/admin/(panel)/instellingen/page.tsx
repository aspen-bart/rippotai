import { requireUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { CurrencyForm } from "@/components/admin/forms/CurrencyForm";
import { StoreForm } from "@/components/admin/forms/StoreForm";
import { PageHeader } from "@/components/admin/ui";

export const metadata = { title: "Winkel & valuta" };

export default async function SettingsPage() {
  await requireUser();
  const [store, currency] = await Promise.all([getSetting("store"), getSetting("currency")]);
  return (
    <>
      <PageHeader title="Winkel & valuta" description="Aankondiging, verzending, bedrijfsgegevens, sociale links en valuta" />
      <div className="grid gap-10">
        <StoreForm initial={store} />
        <CurrencyForm initial={currency.currencies} />
      </div>
    </>
  );
}
