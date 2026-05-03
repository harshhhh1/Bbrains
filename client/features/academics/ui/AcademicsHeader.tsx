interface AcademicsHeaderProps {}

export function AcademicsHeader(_props: AcademicsHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold text-foreground">Academics</h1>
      <p className="text-muted-foreground text-sm">
        Manage courses, enrollments, and academic assessments.
      </p>
    </div>
  );
}