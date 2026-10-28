import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveUpload, UploadError } from "@/lib/admin/upload";

export const runtime = "nodejs";

// Afbeelding uploaden vanuit het beheer. Geeft { url: "/uploads/<naam>" } terug.
export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Geen bestand ontvangen" }, { status: 400 });
    const url = await saveUpload(file);
    return NextResponse.json({ url });
  } catch (e) {
    if (e instanceof UploadError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("upload mislukt", e);
    return NextResponse.json({ error: "Upload mislukt" }, { status: 500 });
  }
}
