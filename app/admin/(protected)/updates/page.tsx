import type { Metadata } from "next";
import AdminUpdatesManager from "@/components/AdminUpdatesManager";

export const metadata: Metadata = {
  title: "Manage Admin Updates",
  robots: { index: false, follow: false },
};

export default function ManageUpdatesPage() {
  return <AdminUpdatesManager />;
}
