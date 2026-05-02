"use client";

import React, { useState } from "react";
import {
  Users, BookOpen, Calendar, TrendingUp, Shield,
  Award, Clock, Zap, Target, Layout, Video,
  MessageSquare, FileText, CheckCircle
} from "lucide-react";
import { Navbar } from "@/app/_components/landing/Navbar";
import { FooterSection } from "@/app/_components/landing/FooterSection";
import { CtaSection } from "@/app/_components/landing/CtaSection";

// --- Components merged from FeaturesPageClient ---

const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <div className="bg-card text-card-foreground rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const RoleCard = ({ title, features, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full text-left p-6 rounded-xl border transition-all ${
      active ? 'bg-primary/5 border-primary shadow-sm' : 'bg-card hover:bg-accent/50'
    }`}
  >
    <h3 className={`text-xl font-semibold mb-4 ${active ? 'text-primary' : ''}`}>{title}</h3>
    <ul className="space-y-3">
      {features.map((feature: any, index: number) => (
        <li key={index} className="flex items-start gap-3">
          <CheckCircle className={`h-5 w-5 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className="text-sm">{feature}</span>
        </li>
      ))}
    </ul>
  </button>
);

export default function FeaturesPage() {
  const [activeRole, setActiveRole] = useState(0);

  const roles = [
    {
      title: "For Students",
      features: [
        "Interactive dashboard with real-time progress tracking",
        "Gamified learning with XP, badges, and achievements",
        "Personalized study schedules and assignment reminders",
        "Direct communication with teachers and peers",
        "Access to digital library and study materials"
      ]
    },
    {
      title: "For Teachers",
      features: [
        "Automated attendance tracking and grading systems",
        "Course material management and assignment distribution",
        "Detailed analytics on student performance and engagement",
        "Built-in communication tools for classes and individuals",
        "Classroom calendar and event management"
      ]
    },
    {
      title: "For Administrators",
      features: [
        "Comprehensive institution overview and analytics",
        "User role and permission management",
        "Financial tracking and report generation",
        "Curriculum and department organization",
        "System-wide announcements and communication"
      ]
    }
  ];

  const coreFeatures = [
    {
      icon: Layout,
      title: "Intuitive Dashboard",
      description: "A clean, customizable interface that brings everything you need to know into one centralized view."
    },
    {
      icon: BookOpen,
      title: "Course Management",
      description: "Organize materials, track progress, and deliver content effectively with our comprehensive course tools."
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Never miss a class or deadline with integrated calendars that sync across all your devices."
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Detailed insights and visualizations to track academic progress and identify areas for improvement."
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Enterprise-grade security ensuring your institution's data remains safe and compliant."
    },
    {
      icon: Award,
      title: "Gamification Engine",
      description: "Keep students engaged with customizable achievement systems, XP tracking, and leaderboards."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Everything you need to run <br className="hidden md:block" />
            <span className="text-primary">your institution</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            BBrains combines learning management, administrative tools, and student engagement into one powerful, unified platform.
          </p>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 bg-accent/30 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Core Features</h2>
            <p className="text-muted-foreground">Powerful tools designed for modern education</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Features by Role */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tailored for Every Role</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're learning, teaching, or managing, BBrains provides the specific tools you need to succeed.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <RoleCard
                key={index}
                {...role}
                active={activeRole === index}
                onClick={() => setActiveRole(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
      <FooterSection />
    </div>
  );
}
