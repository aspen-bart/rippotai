import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-display text-8xl text-sprout">404</p>
      <h1 className="mt-4 font-display text-4xl text-forest">Pagina non trovata · Page not found</h1>
      <p className="mt-3 text-muted">Questo germoglio non è ancora spuntato. · This sprout hasn&apos;t come up yet.</p>
      <Link href="/it-it" className="btn-primary mt-8">
        Home
      </Link>
    </section>
  );
}
