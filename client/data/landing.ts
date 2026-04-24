import { 
  Star, 
  Wallet,
  Trophy, 
  Users, 
  BarChart3, 
  MessageCircle, 
  GraduationCap,
  ClipboardCheck,
  Settings,
  Shield,
  BookOpen,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  LayoutDashboard,
  UserCog,
  FileText,
  UsersRound,
  Building2,
  Phone,
  Sparkles
} from "lucide-react";

export type FeatureDetail = {
  title: string;
  description: string;
};

export type Feature = {
  id: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  shortDescription: string;
  details: FeatureDetail[];
  screenshotAlt: string;
  cardStyle: string;
  cardDecoration: string;
  isComingSoon?: boolean;
};

export type Role = {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
  features: Feature[];
};

const comingSoonFeature: Feature = {
  id: "coming-soon",
  icon: Sparkles,
  iconBg: "bg-hand-pencil/20",
  iconColor: "text-hand-pencil",
  title: "More Coming Soon",
  shortDescription: "New features on the way",
  details: [
    { title: "Stay Tuned", description: "We're always adding new features to improve your experience" },
    { title: "Your Suggestions", description: "Have an idea? We love hearing from our users" },
    { title: "Regular Updates", description: "Check back often for the latest improvements" }
  ],
  screenshotAlt: "Coming Soon",
  cardStyle: "bg-hand-cream border-dashed",
  cardDecoration: "tape",
  isComingSoon: true
};

export const landingData = {
  navbar: {
    brand: "BBrains",
    links: [
      { text: "Features", url: "/#features" },
      { text: "Contact", url: "/#contact" }
    ],
    cta: {
      text: "Login",
      url: "/auth/login"
    }
  },
  hero: {
    title: {
      part1: "The LMS That Makes Students",
      part2: "Actually Want to",
      highlight: "Learn"
    },
    subtitle: "Transform your college with gamified learning. Students earn XP, level up, compete on leaderboards, and unlock rewards while you get real-time analytics.",
    primaryCta: { text: "Request Demo", url: "/#contact" },
    secondaryCta: { text: "See Student Experience", url: "/#features" },
    floatingCard: {
      title: "+50 XP Earned!",
      subtitle: "Complete assignment to level up",
      buttonText: "Start Learning"
    }
  },
  stats: [
    { value: "10,000+", label: "Active Students" },
    { value: "50+", label: "Partner Colleges" },
    { value: "1M+", label: "XP Earned" },
    { value: "95%", label: "Student Engagement" }
  ],
  roles: [
    {
      id: "students",
      label: "Students",
      icon: GraduationCap,
      description: "Learn, earn, compete, and grow with gamified education",
      features: [
        {
          id: "dashboard",
          icon: LayoutDashboard,
          iconBg: "bg-hand-blue",
          iconColor: "text-white",
          title: "Dashboard",
          shortDescription: "Your command center for academic success",
          details: [
            { title: "Quick Stats", description: "Current level, study streak, class rank at a glance" },
            { title: "Momentum Board", description: "Daily widgets and desk notes for organization" },
            { title: "Achievement Progress", description: "Track milestones and unlock badges" }
          ],
          screenshotAlt: "Student Dashboard Preview",
          cardStyle: "bg-white rotate-1",
          cardDecoration: "tape"
        },
        {
          id: "gamification",
          icon: Star,
          iconBg: "bg-hand-yellow",
          iconColor: "text-hand-pencil",
          title: "XP & Leveling",
          shortDescription: "Earn experience points and level up",
          details: [
            { title: "XP System", description: "Earn XP from assignments, quizzes, and streaks" },
            { title: "Daily Rewards", description: "7-day reward cycle with increasing bonuses" },
            { title: "Achievements", description: "Unlock badges for milestones and accomplishments" }
          ],
          screenshotAlt: "XP and Leveling System",
          cardStyle: "-rotate-1",
          cardDecoration: "tack"
        },
        {
          id: "wallet",
          icon: Wallet,
          iconBg: "bg-hand-green",
          iconColor: "text-white",
          title: "Digital Wallet",
          shortDescription: "Your B-Coins for campus spending",
          details: [
            { title: "B-Coins Balance", description: "Track your virtual currency earned from academics" },
            { title: "Transaction History", description: "Complete record of earnings and spending" },
            { title: "Send Money", description: "Peer-to-peer transfers with PIN security" }
          ],
          screenshotAlt: "Digital Wallet Preview",
          cardStyle: "bg-white -rotate-1",
          cardDecoration: "tape"
        },
        {
          id: "market",
          icon: ShoppingBag,
          iconBg: "bg-hand-red",
          iconColor: "text-white",
          title: "Campus Market",
          shortDescription: "Spend coins on real rewards",
          details: [
            { title: "Product Catalog", description: "Physical and digital products with ratings" },
            { title: "Shopping Cart", description: "Add items, checkout with PIN authentication" },
            { title: "Digital Library", description: "Access purchased digital products instantly" }
          ],
          screenshotAlt: "Campus Marketplace",
          cardStyle: "rotate-1",
          cardDecoration: "tack"
        },
        {
          id: "leaderboard",
          icon: Trophy,
          iconBg: "bg-hand-yellow",
          iconColor: "text-hand-pencil",
          title: "Leaderboard",
          shortDescription: "Compete with your classmates",
          details: [
            { title: "Campus Rankings", description: "See how you stack up across the entire college" },
            { title: "Class Rankings", description: "Compete with your specific class section" },
            { title: "Real-time Updates", description: "Live position updates as you earn XP" }
          ],
          screenshotAlt: "Leaderboard Rankings",
          cardStyle: "bg-white rotate-2",
          cardDecoration: "tape"
        },
        {
          id: "courses",
          icon: BookOpen,
          iconBg: "bg-hand-blue",
          iconColor: "text-white",
          title: "Courses & Assignments",
          shortDescription: "Access courses and submit work",
          details: [
            { title: "Course Enrollment", description: "Browse and enroll in available courses" },
            { title: "Assignment Submission", description: "Submit work with file uploads and track status" },
            { title: "Results & Grades", description: "View your academic results and progress" }
          ],
          screenshotAlt: "Courses and Assignments",
          cardStyle: "-rotate-1",
          cardDecoration: "tack"
        },
        {
          id: "chat",
          icon: MessageCircle,
          iconBg: "bg-hand-green",
          iconColor: "text-white",
          title: "Real-time Chat",
          shortDescription: "Connect with your campus community",
          details: [
            { title: "Global Chat Room", description: "Campus-wide real-time messaging" },
            { title: "File Sharing", description: "Share images and files in conversations" },
            { title: "@Mentions", description: "Tag classmates and get notified" }
          ],
          screenshotAlt: "Campus Chat",
          cardStyle: "bg-white rotate-1",
          cardDecoration: "tape"
        },
        comingSoonFeature
      ]
    },
    {
      id: "teachers",
      label: "Teachers",
      icon: Users,
      description: "Manage classes, track progress, and save time",
      features: [
        {
          id: "grading",
          icon: ClipboardCheck,
          iconBg: "bg-hand-blue",
          iconColor: "text-white",
          title: "Assignment Grading",
          shortDescription: "Review and grade student submissions",
          details: [
            { title: "Submission Queue", description: "View all pending submissions in one place" },
            { title: "File Preview", description: "Review images, videos, and PDFs directly" },
            { title: "Feedback System", description: "Add remarks and mark complete/incomplete" }
          ],
          screenshotAlt: "Teacher Grading System",
          cardStyle: "bg-white rotate-1",
          cardDecoration: "tape"
        },
        {
          id: "students-view",
          icon: UsersRound,
          iconBg: "bg-hand-yellow",
          iconColor: "text-hand-pencil",
          title: "Student Tracking",
          shortDescription: "Monitor your students' progress",
          details: [
            { title: "Enrolled Students", description: "View and manage your class roster" },
            { title: "Progress Tracking", description: "Monitor XP, grades, and engagement" },
            { title: "Performance Insights", description: "Identify students who need help" }
          ],
          screenshotAlt: "Student Tracking View",
          cardStyle: "-rotate-1",
          cardDecoration: "tack"
        },
        {
          id: "audit-log",
          icon: FileText,
          iconBg: "bg-hand-red",
          iconColor: "text-white",
          title: "Audit Log",
          shortDescription: "Track all your actions",
          details: [
            { title: "Action History", description: "Complete log of all changes made" },
            { title: "Category Filtering", description: "Filter logs by action type" },
            { title: "Compliance Ready", description: "Maintain records for accountability" }
          ],
          screenshotAlt: "Teacher Audit Log",
          cardStyle: "bg-white -rotate-1",
          cardDecoration: "tape"
        },
        comingSoonFeature
      ]
    },
    {
      id: "admins",
      label: "Admins",
      icon: Shield,
      description: "Full control over users, academics, and analytics",
      features: [
        {
          id: "user-management",
          icon: Users,
          iconBg: "bg-hand-blue",
          iconColor: "text-white",
          title: "User Management",
          shortDescription: "Manage all users and roles",
          details: [
            { title: "User Directory", description: "View, create, edit, and delete users" },
            { title: "Role Assignment", description: "Assign and change user roles easily" },
            { title: "User Stats", description: "Distribution by role at a glance" }
          ],
          screenshotAlt: "Admin User Management",
          cardStyle: "bg-white rotate-1",
          cardDecoration: "tape"
        },
        {
          id: "roles-permissions",
          icon: UserCog,
          iconBg: "bg-hand-green",
          iconColor: "text-white",
          title: "Roles & Permissions",
          shortDescription: "Configure access control",
          details: [
            { title: "Role Matrix", description: "Visual permission configuration" },
            { title: "Sidebar Access", description: "Control navigation per role" },
            { title: "Custom Roles", description: "Student, Teacher, Admin, Staff, Manager" }
          ],
          screenshotAlt: "Roles and Permissions",
          cardStyle: "-rotate-1",
          cardDecoration: "tack"
        },
        {
          id: "analytics",
          icon: BarChart3,
          iconBg: "bg-hand-yellow",
          iconColor: "text-hand-pencil",
          title: "Analytics Dashboard",
          shortDescription: "Data-driven insights",
          details: [
            { title: "Key Metrics", description: "Students, teachers, courses, attendance stats" },
            { title: "Enrollment Trends", description: "Charts showing growth over time" },
            { title: "Gender Distribution", description: "Student demographics visualization" }
          ],
          screenshotAlt: "Admin Analytics Dashboard",
          cardStyle: "bg-white -rotate-1",
          cardDecoration: "tape"
        },
        {
          id: "academics",
          icon: BookOpen,
          iconBg: "bg-hand-red",
          iconColor: "text-white",
          title: "Academics Management",
          shortDescription: "Courses, assignments, enrollments",
          details: [
            { title: "Course Management", description: "Create, edit, and delete courses" },
            { title: "Teacher Assignment", description: "Assign instructors to courses" },
            { title: "Assignment Control", description: "View and manage all assignments" }
          ],
          screenshotAlt: "Academics Management",
          cardStyle: "rotate-1",
          cardDecoration: "tack"
        },
        {
          id: "finance",
          icon: CreditCard,
          iconBg: "bg-hand-blue",
          iconColor: "text-white",
          title: "Finance & Payments",
          shortDescription: "Fees and Razorpay integration",
          details: [
            { title: "Transaction View", description: "All payments in one place" },
            { title: "Razorpay Integration", description: "Card, UPI, netbanking support" },
            { title: "Payment Verification", description: "Secure signature verification" }
          ],
          screenshotAlt: "Finance Management",
          cardStyle: "bg-white rotate-2",
          cardDecoration: "tape"
        },
        {
          id: "institution",
          icon: Building2,
          iconBg: "bg-hand-green",
          iconColor: "text-white",
          title: "Institution Settings",
          shortDescription: "College branding and configuration",
          details: [
            { title: "College Profile", description: "Name, logo, and branding" },
            { title: "System Settings", description: "Configure platform behavior" },
            { title: "Config Variables", description: "System-wide settings and toggles" }
          ],
          screenshotAlt: "Institution Settings",
          cardStyle: "bg-white -rotate-1",
          cardDecoration: "tack"
        },
        comingSoonFeature
      ]
    },
    {
      id: "managers",
      label: "Managers",
      icon: Settings,
      description: "Oversee classes, schedules, and operations",
      features: [
        {
          id: "classes",
          icon: UsersRound,
          iconBg: "bg-hand-blue",
          iconColor: "text-white",
          title: "Class Management",
          shortDescription: "Organize classes and schedules",
          details: [
            { title: "Class CRUD", description: "Create, edit, and delete classes" },
            { title: "Timetable Builder", description: "Visual schedule creation" },
            { title: "Class Statistics", description: "Enrollment and performance metrics" }
          ],
          screenshotAlt: "Class Management",
          cardStyle: "bg-white rotate-1",
          cardDecoration: "tape"
        },
        {
          id: "teacher-overview",
          icon: Users,
          iconBg: "bg-hand-yellow",
          iconColor: "text-hand-pencil",
          title: "Teacher Overview",
          shortDescription: "Manage assigned teachers",
          details: [
            { title: "Teacher List", description: "View all assigned teachers" },
            { title: "Assignment Tracking", description: "See which teachers teach which classes" },
            { title: "Performance Monitoring", description: "Track teaching metrics" }
          ],
          screenshotAlt: "Teacher Overview",
          cardStyle: "-rotate-1",
          cardDecoration: "tack"
        },
        {
          id: "student-overview",
          icon: GraduationCap,
          iconBg: "bg-hand-green",
          iconColor: "text-white",
          title: "Student Overview",
          shortDescription: "Monitor enrolled students",
          details: [
            { title: "Student Directory", description: "All students by class" },
            { title: "Enrollment Status", description: "Track enrollment and attendance" },
            { title: "Progress Reports", description: "Individual student metrics" }
          ],
          screenshotAlt: "Student Overview",
          cardStyle: "bg-white -rotate-1",
          cardDecoration: "tape"
        },
        {
          id: "transactions",
          icon: CreditCard,
          iconBg: "bg-hand-red",
          iconColor: "text-white",
          title: "Transaction History",
          shortDescription: "Financial oversight",
          details: [
            { title: "All Transactions", description: "Complete financial history" },
            { title: "Filter by Date", description: "Range-based filtering" },
            { title: "Export Reports", description: "Downloadable financial data" }
          ],
          screenshotAlt: "Manager Transactions",
          cardStyle: "rotate-1",
          cardDecoration: "tack"
        },
        comingSoonFeature
      ]
    }
  ],
  ctaSection: {
    titleLine1: "Ready to transform your",
    titleLine2: "college's learning experience?",
    subtitle: "See how bBrains can engage students, save time for teachers, and give administrators real insights. Request a personalized demo today.",
    namePlaceholder: "Your Name",
    emailPlaceholder: "College Email",
    organizationPlaceholder: "College/Organization Name",
    buttonText: "Request Demo"
  },
  trustBadges: {
    title: "Built for Modern Education",
    badges: [
      { label: "FERPA Compliant", icon: Shield },
      { label: "Mobile PWA", icon: Phone },
      { label: "Real-time Updates", icon: TrendingUp },
      { label: "Secure Payments", icon: CreditCard }
    ]
  },
  footer: {
    brand: {
      name: "BBrains Inc.",
      description: "Empowering students to learn smarter."
    },
    sections: [
      {
        title: "Product",
        links: [
          { text: "Features", url: "/#features" },
          { text: "Pricing", url: "#" },
          { text: "Changelog", url: "#" },
        ]
      },
      {
        title: "Company",
        links: [
          { text: "About", url: "#" },
          { text: "Contact", url: "/#contact" },
        ]
      },
      {
        title: "Resources",
        links: [
          { text: "Documentation", url: "#" },
          { text: "Help Center", url: "#" },
          { text: "API Reference", url: "#" },
        ]
      }
    ],
    legal: {
      builtWith: "Built with care to learn better.",
      copyright: "© 2026 bBrains."
    }
  }
};