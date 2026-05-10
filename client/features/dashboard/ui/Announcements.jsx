import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { timeAgo } from "@/features/dashboard/model/utils";

export function Announcements({ announcements }) {
  return (
    <Card className="col-span-3 min-h-87.5">
      <CardHeader>
        <CardTitle>Announcements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {announcements.length > 0 ? (
            announcements.map((a) => (
              <div key={a.id} className="border-l-4 border-primary pl-3">
                <p className="text-sm font-semibold text-foreground">
                  {a.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {timeAgo(a.createdAt)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No announcements
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
