import { Metadata } from "next";
import { SprintPage } from "@/features/sprints";

export const metadata: Metadata = {
  title: "Sprints | KPI Digest",
  description: "Manage your sprints.",
};

export default function Sprints() {
  return <SprintPage />;
}
