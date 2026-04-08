import { Metadata } from "next";
import { ProjectPage } from "@/features/projects";

export const metadata: Metadata = {
  title: "Users | KPI Digest",
  description: "Manage your team and users.",
};

export default function Projects() {
  return <ProjectPage />;
}
