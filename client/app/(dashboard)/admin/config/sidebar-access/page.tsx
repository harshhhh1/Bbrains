import SidebarAccessClient from "@/features/admin/config/sidebar-access/ui/SidebarAccessClient";

export const metadata = {
    title: "Sidebar Access Control | BBrains",
    description: "Manage sidebar visibility for different roles.",
};

export default function SidebarAccessPage() {
    return <SidebarAccessClient />;
}
