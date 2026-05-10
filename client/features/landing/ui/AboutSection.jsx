import { BookOpen, Users, BarChart3, Zap } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Course Management",
    description: "Organize courses, assignments, and resources in one place",
  },
  {
    icon: Users,
    title: "Multi-Role System",
    description:
      "Separate experiences for students, teachers, admins, and managers",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track engagement, enrollment, and performance metrics",
  },
  {
    icon: Zap,
    title: "Gamification",
    description: "XP, leaderboards, and rewards that drive engagement",
  },
];

export function AboutSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <span className="font-kalam text-hand-red text-lg">Why bBrains</span>
        <h2 className="font-kalam text-4xl md:text-5xl font-bold text-hand-pencil mt-2 mb-12">
          Everything Your College Needs
        </h2>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="flex gap-4 p-6 rounded-wobbly border-2 border-hand-pencil/10 hover:border-hand-pencil/30 hover:shadow-lg transition-all"
              >
                <div className="p-3 bg-hand-cream rounded-wobbly shrink-0">
                  <Icon className="w-6 h-6 text-hand-blue" />
                </div>
                <div>
                  <h3 className="font-kalam text-xl font-bold text-hand-pencil">
                    {feature.title}
                  </h3>
                  <p className="font-patrick text-hand-pencil/70 mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
