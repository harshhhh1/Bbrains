import { Metadata } from "next";
import { EventsClient } from "@/features/events/ui/EventsClient";

export const metadata: Metadata = {
  title: "Events | Bbrains",
  description: "View and manage college events",
};

export default function EventsPage() {
  return <EventsClient />;
}
