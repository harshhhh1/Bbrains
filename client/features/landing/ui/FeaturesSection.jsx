import { Star, Wallet, ShoppingBag, Trophy, Award, Zap } from "lucide-react";
import {
  HandCard,
  HandCardContent,
  HandCardHeader,
  HandCardTitle,
  HandCardDescription,
} from "@/components/hand-drawn/card";

const gamificationFeatures = [
  {
    icon: Star,
    iconBg: "bg-hand-yellow",
    iconColor: "text-hand-pencil",
    title: "XP System",
    description: "Level up your education",
    content:
      "Earn Experience Points from every academic activity. Complete assignments, attend classes, and maintain streaks to climb the leaderboard.",
    cardStyle: "bg-white rotate-1",
    cardDecoration: "tape",
    cardVariant: "default",
  },
  {
    icon: Wallet,
    iconBg: "bg-hand-blue",
    iconColor: "text-white",
    title: "B-Coins Wallet",
    description: "Your digital currency",
    content:
      "Convert your academic achievements into B-Coins. Track your balance, send money to friends, and manage your campus finances.",
    cardStyle: "rotate-1",
    cardDecoration: "tack",
    cardVariant: "yellow",
  },
  {
    icon: Trophy,
    iconBg: "bg-hand-yellow",
    iconColor: "text-hand-pencil",
    title: "Leaderboards",
    description: "Compete and excel",
    content:
      "Campus-wide and class-specific rankings. See where you stand, compete with classmates, and earn bragging rights.",
    cardStyle: "bg-white -rotate-1",
    cardDecoration: "tape",
    cardVariant: "default",
  },
  {
    icon: Award,
    iconBg: "bg-hand-green",
    iconColor: "text-white",
    title: "Achievements",
    description: "Unlock badges & milestones",
    content:
      "Collect badges for reaching milestones. First login, 7-day streak, top of the class - celebrate every accomplishment.",
    cardStyle: "rotate-1",
    cardDecoration: "tack",
    cardVariant: "default",
  },
  {
    icon: ShoppingBag,
    iconBg: "bg-hand-red",
    iconColor: "text-white",
    title: "Campus Market",
    description: "Spend & redeem rewards",
    content:
      "Use your B-Coins in the marketplace. Unlock premium parking, dining credits, merchandise, and digital products.",
    cardStyle: "bg-white -rotate-1",
    cardDecoration: "tape",
    cardVariant: "default",
  },
  {
    icon: Zap,
    iconBg: "bg-hand-yellow",
    iconColor: "text-hand-pencil",
    title: "Daily Rewards",
    description: "Build your momentum",
    content:
      "Log in daily to earn bonus XP. The longer your streak, the bigger the rewards - up to 200 XP on day 7!",
    cardStyle: "rotate-1",
    cardDecoration: "tack",
    cardVariant: "yellow",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 px-6 max-w-6xl mx-auto relative z-10">
      <div className="text-center mb-12">
        <span className="font-kalam text-hand-red text-lg">Gamification</span>
        <h2 className="font-kalam text-4xl md:text-5xl font-bold text-hand-pencil mt-2">
          Make Learning Fun
        </h2>
        <p className="font-patrick text-lg text-hand-pencil/70 mt-4 max-w-2xl mx-auto">
          Our gamification system keeps students engaged and motivated
          throughout their academic journey.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gamificationFeatures.map((feature, idx) => {
          const IconComponent = feature.icon;
          return (
            <HandCard
              key={idx}
              variant={feature.cardVariant}
              decoration={feature.cardDecoration}
              className={feature.cardStyle}
            >
              <HandCardHeader>
                <div
                  className={`w-12 h-12 rounded-wobbly ${feature.iconBg} ${feature.iconColor} flex items-center justify-center mb-4 border-2 border-hand-pencil shadow-hard-sm`}
                >
                  <IconComponent className="w-6 h-6" />
                </div>
                <HandCardTitle>{feature.title}</HandCardTitle>
                <HandCardDescription>{feature.description}</HandCardDescription>
              </HandCardHeader>
              <HandCardContent>
                <p className="font-patrick text-base text-hand-pencil/80">
                  {feature.content}
                </p>
              </HandCardContent>
            </HandCard>
          );
        })}
      </div>
    </section>
  );
}
