import { tr } from "@/components/admin/ui";

type C = { id: string; title: unknown; parentId: string | null; group: string; sortOrder: number };

/** Categorieën als platte, ingesprongen boomlijst (privati eerst, dan aziende; subcategorieën onder hun parent). */
export function flattenCategoryTree(cats: C[]) {
  const ids = new Set(cats.map((c) => c.id));
  const sorted = [...cats].sort((a, b) => a.sortOrder - b.sortOrder);
  const isRoot = (c: C) => !c.parentId || !ids.has(c.parentId);
  const out: { id: string; label: string; depth: number; group: string }[] = [];
  const walk = (c: C, depth: number, rootGroup: string) => {
    if (out.some((o) => o.id === c.id)) return; // bescherming tegen cycli
    out.push({ id: c.id, label: tr(c.title), depth, group: rootGroup });
    for (const child of sorted.filter((x) => x.parentId === c.id)) walk(child, depth + 1, rootGroup);
  };
  for (const g of ["private", "company"]) for (const c of sorted.filter((x) => isRoot(x) && x.group === g)) walk(c, 0, g);
  for (const c of sorted) if (!out.some((o) => o.id === c.id)) walk(c, 0, c.group);
  return out;
}
