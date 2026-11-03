import { ConditionsWorkspace } from "@/components/conditions/conditions-workspace";

export const metadata = {
  title: "Live Weather & Road Conditions • Yatrion Karnataka",
  description: "Live Open-Meteo weather telemetry and verified road disruption feeds for Karnataka travel.",
};

export default function WeatherPage() {
  return <ConditionsWorkspace />;
}

