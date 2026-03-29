import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users | KPI Digest",
  description: "Manage your users in KPI Digest",
};

export default function Page() {
  return (
    <div>
      <h1>Users</h1>

      <h1>User List</h1>
      <ul>
        <li>User 1</li>
        <li>User 2</li>
        <li>User 3</li>
      </ul>
    </div>
  );
}
