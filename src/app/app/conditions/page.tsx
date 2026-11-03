import { redirect } from "next/navigation";

export default function ConditionsLegacyRedirect() {
  redirect("/app/weather");
}
