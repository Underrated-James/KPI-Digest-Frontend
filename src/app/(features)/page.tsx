import { Metadata } from "next/dist/lib/metadata/types/metadata-interface";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to KPI Digest",
}

export default function Home() {
  return (
    <div>
      <h1>Home</h1>
    </div>
  );
}
