import { BookOpen, ClipboardList, Users, UserCheck } from "lucide-react";

interface AcademicsHeaderProps {
  coursesCount: number;
  studentsCount: number;
  teachersCount: number;
  assignmentsCount: number;
}

export function AcademicsHeader({
  coursesCount,
  studentsCount,
  teachersCount,
  assignmentsCount,
}: AcademicsHeaderProps) {
  const statCards = [
    {
      label: "Courses",
      value: coursesCount,
      icon: BookOpen,
      accent: "from-blue-500/20 to-cyan-500/10 border-blue-500/30",
    },
    {
      label: "Students",
      value: studentsCount,
      icon: Users,
      accent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
    },
    {
      label: "Teachers",
      value: teachersCount,
      icon: UserCheck,
      accent: "from-purple-500/20 to-indigo-500/10 border-purple-500/30",
    },
    {
      label: "Assignments",
      value: assignmentsCount,
      icon: ClipboardList,
      accent: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card via-card to-card/70 p-5 md:p-6">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
      </div>

      <div className="relative space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">Academic Operations</h2>
          <p className="text-sm text-muted-foreground">Manage courses, enrollments, and assignments from one workspace.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`rounded-2xl border bg-gradient-to-br ${stat.accent} p-4 backdrop-blur-sm`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">{stat.label}</p>
                  <Icon className="h-4 w-4 text-foreground/80" />
                </div>
                <p className="mt-2 text-2xl font-black leading-none text-foreground">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}