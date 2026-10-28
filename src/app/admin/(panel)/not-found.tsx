import Link from "next/link";
import { Empty } from "@/components/admin/ui";

export default function AdminNotFound() {
  return (
    <Empty>
      Dit item bestaat niet (meer).{" "}
      <Link href="/admin" className="text-leaf-dark underline">
        Naar het dashboard
      </Link>
    </Empty>
  );
}
