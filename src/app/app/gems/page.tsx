import { redirect } from "next/navigation";

export default function GemsLegacyRedirect() {
  redirect("/app/discover");
}
