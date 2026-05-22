"use client";

import { useState } from "react";
import { landingData, Feature } from "@/data/landing";
import { cn } from "@/lib/utils";
import Image from "next/image";

import studentDashboardPreview from "../images/student-dashboard-preview.png";
import xpAndLevelling from "../images/xp-and-levelling.png";
import digitalWallet from "../images/digital-wallet.png";
import campusMarket from "../images/campus-market.png";
import leaderboard from "../images/leaderboard.png";
import coursesAndAssignment from "../images/courses-and-assignment.png";
import realTimeChat from "../images/real-time-chat.png";
import assignmentGrading from "../images/assignment-grading.png";
import studentTracking from "../images/student-tracking.png";
import auditlog from "../images/auditlog.png";
import rolesAndPermission from "../images/roles-and-permission.png";
import analyticsDashboard from "../images/analytics-dashboard.png";
import academicsManagement from "../images/academics-management.png";
import financeTracking from "../images/finance-tracking.png";
import institutionSettings from "../images/institution-settings.png";
import userManagement from "../images/user-management.png";

const featureImages: Record<string, any> = {
  "dashboard": studentDashboardPreview,
  "gamification": xpAndLevelling,
  "wallet": digitalWallet,
  "market": campusMarket,
  "leaderboard": leaderboard,
  "courses": coursesAndAssignment,
  "chat": realTimeChat,
  "grading": assignmentGrading,
  "students-view": studentTracking,
  "audit-log": auditlog,
  "roles-permissions": rolesAndPermission,
  "analytics": analyticsDashboard,
  "academics": academicsManagement,
  "finance": financeTracking,
  "institution": institutionSettings,
  "user-management": userManagement,
};

export function RoleSwitcher() {
  const roles = landingData.roles.filter(r => r.id !== 'managers');
  const [activeRole, setActiveRole] = useState(roles[0].id);
  const currentRole = roles.find(r => r.id === activeRole)!;

  return (
    <section id="features" className="py-24 px-6 bg-hand-cream/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="font-kalam text-hand-red text-lg">Explore Features</span>
          <h2 className="font-kalam text-4xl md:text-5xl font-bold text-hand-pencil mt-2">
            Built for Every User
          </h2>
          <p className="font-patrick text-xl text-hand-pencil/70 mt-4 max-w-2xl mx-auto">
            Click on a role to explore the features designed specifically for them.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {roles.map((role) => {
            const Icon = role.icon;
            const isActive = activeRole === role.id;
            
            return (
              <button
                key={role.id}
                onClick={() => setActiveRole(role.id)}
                className={cn(
                  "flex items-center gap-3 px-6 py-4 rounded-wobbly transition-all duration-200 font-kalam text-lg",
                  isActive 
                    ? "bg-hand-pencil text-white shadow-lg scale-105" 
                    : "bg-white text-hand-pencil hover:bg-hand-pencil/10 border-2 border-hand-pencil/20 hover:border-hand-pencil"
                )}
              >
                <Icon className="w-6 h-6" />
                {role.label}
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-wobblyMd border-2 border-hand-pencil/20 p-8">
          <div className="text-center mb-8">
            <p className="font-patrick text-xl text-hand-pencil/80">
              {currentRole.description}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentRole.features.map((feature: Feature) => {
              const Icon = feature.icon;
              const isComingSoon = feature.isComingSoon;
              
              return (
                <div
                  key={feature.id}
                  className={cn(
                    "p-6 rounded-wobbly border-2 border-hand-pencil/20 transition-all duration-200 hover:shadow-lg group cursor-pointer",
                    feature.cardStyle,
                    "hover:-translate-y-1 hover:scale-[1.02]",
                    isComingSoon && "opacity-75 hover:opacity-100 border-dashed animate-pulse"
                  )}
                  style={isComingSoon ? { animationDuration: '4s' } : undefined}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-3 rounded-wobbly",
                      feature.iconBg
                    )}>
                      <Icon className={cn(
                        "w-6 h-6",
                        feature.iconColor
                      )} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-kalam text-xl font-bold text-hand-pencil">
                        {feature.title}
                      </h3>
                      <p className="font-patrick text-hand-pencil/70 mt-1">
                        {feature.shortDescription}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-hand-pencil/10">
                    <ul className="space-y-2">
                      {feature.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 font-patrick text-sm text-hand-pencil/80">
                          <span className="text-hand-blue mt-1">•</span>
                          <span><strong className="text-hand-pencil">{detail.title}:</strong> {detail.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {!isComingSoon && featureImages[feature.id] && (
                    <div className="mt-6 rounded-lg overflow-hidden border-2 border-hand-pencil/20 relative shadow-md">
                      <Image 
                        src={featureImages[feature.id]} 
                        alt={feature.screenshotAlt}
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}