export function EmptyState({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-[1.5rem] border border-dashed border-border/70 p-5">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
    )
}
