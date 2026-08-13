import Link from "next/link";
import VehicleConsole from "@/components/VehicleConsole";
import DashboardNav from "@/components/DashboardNav";

export default function DashboardPage() {
  return <main className="app-shell"><DashboardNav /><VehicleConsole /></main>;
}
