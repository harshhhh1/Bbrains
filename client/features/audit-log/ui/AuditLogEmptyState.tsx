import { FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface AuditLogEmptyStateProps {
    searchQuery: string
}

export function AuditLogEmptyState({ searchQuery }: AuditLogEmptyStateProps) {
    return (
        <Card className="border-dashed border-border/70">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center text-sm text-muted-foreground">
                <FileText className="size-8 mb-2 opacity-40" />
                {searchQuery ? "No logs match your search." : "No audit logs found."}
            </CardContent>
        </Card>
    )
}
