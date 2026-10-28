"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { str } from "@/lib/admin/common";

export async function setMessageRead(form: FormData) {
  await requireUser();
  await db.contactMessage.update({ where: { id: str(form, "id") }, data: { read: str(form, "read") === "1" } }).catch(() => null);
  revalidatePath("/admin", "layout");
}

export async function markAllMessagesRead() {
  await requireUser();
  await db.contactMessage.updateMany({ where: { read: false }, data: { read: true } });
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(form: FormData) {
  await requireUser();
  await db.contactMessage.delete({ where: { id: str(form, "id") } }).catch(() => null);
  revalidatePath("/admin", "layout");
}

export async function deleteSubscriber(form: FormData) {
  await requireUser();
  await db.newsletterSubscriber.delete({ where: { id: str(form, "id") } }).catch(() => null);
  revalidatePath("/admin", "layout");
}
