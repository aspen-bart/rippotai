"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { str } from "@/lib/admin/common";

const status = z.enum(["pending", "paid", "shipped", "completed", "cancelled"]);

export async function setOrderStatus(form: FormData) {
  await requireUser();
  const id = str(form, "id");
  const parsed = status.safeParse(str(form, "status"));
  if (!parsed.success) return;
  await db.order.update({ where: { id }, data: { status: parsed.data } }).catch(() => null);
  revalidatePath("/admin", "layout");
}
