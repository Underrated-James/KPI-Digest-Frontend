import { Metadata } from "next";
import { UserPage } from "@/features/users";

export const metadata: Metadata = {
  title: "Users | KPI Digest",
  description: "Manage your team and users.",
};

export default function Users() {
  return <UserPage />;
}
