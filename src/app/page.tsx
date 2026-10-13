import { redirect } from "next/navigation";

// Temporary until the landing hub is built: the bike search lives at /bikes.
export default function Home() {
  redirect("/bikes");
}
