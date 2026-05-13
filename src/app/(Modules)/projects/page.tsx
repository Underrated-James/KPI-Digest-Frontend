import { Metadata } from "next";
import { ProjectPage } from "@/features/projects";

export const metadata: Metadata = {
  title: "Projects | KPI Digest",
  description: "Manage your projects.",
};

export default function Projects() {
  return <ProjectPage />;
}
