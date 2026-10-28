import { redirect } from "next/navigation";

// /cart bestond op de oude Shopify-site; de winkelwagen is nu een zijpaneel, dus door naar de checkout.
export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  redirect(`/${(await params).locale}/checkout`);
}
