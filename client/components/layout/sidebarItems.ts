import { title } from "process";

export const sidebarItems = [
    {
        "title": "Dashboard",
        "icon": "Home",
        "access": ["student", "teacher", "admin", "staff", "manager", "superadmin", "bbrains_official"],
        "isDashboard": true
    },
    { "title": "Announcements", "url": "/announcements", "icon": "Megaphone", "access": ["student", "teacher", "admin", "staff", "manager", "superadmin", "bbrains_official"] },
    { "title": "Assignments", "url": "/assignments", "icon": "Book", "access": ["student", "teacher", "admin", "staff", "manager", "superadmin", "bbrains_official"] },
    { "title": "Results", "url": "/results", "icon": "Trophy", "access": ["student"] },
    { "title": "Leaderboard", "url": "/leaderboard", "icon": "Trophy", "access": ["student", "teacher", "admin", "staff", "manager", "superadmin", "bbrains_official"] },
    { "title": "Chat", "url": "/chat", "icon": "MessageSquare", "access": ["student", "teacher", "admin", "staff", "manager", "superadmin", "bbrains_official"] },
    {
        "title": "My Transactions",
        "url": "/transactions",
        "icon": "ArrowUpDown",
        "access": ["student", "teacher", "staff", "manager"]
    },
    {
        "title": "Wallet",
        "url": "/wallet",
        "icon": "Wallet",
        "access": ["student", "teacher", "admin", "staff", "manager", "superadmin", "bbrains_official"],
        "subItems": [{ "title": "Payment History", "url": "/wallet/payments", "icon": "CreditCard" }]
    },
    {
        "title": "Market",
        "url": "/market",
        "icon": "ShoppingCart",
        "access": ["student", "teacher", "admin", "staff", "manager", "superadmin", "bbrains_official"],
        "subItems": [
            { "title": "Browse", "url": "/market", "icon": "ShoppingCart" },
            { "title": "My Products", "url": "/products", "icon": "ShoppingBag" },
            { "title": "Library", "url": "/library", "icon": "Library" },
            { "title": "Orders", "url": "/orders", "icon": "FileText" }
        ]
    },
    { "title": "Tools", "url": "/tools", "icon": "Wrench", "access": ["student", "teacher", "admin", "staff", "manager", "superadmin", "bbrains_official"] },
    { "title": "Suggestions", "url": "/suggestions", "icon": "MessageSquarePlus", "access": ["student", "teacher", "admin", "staff", "manager", "superadmin", "bbrains_official"] },
    { "title": "Settings", "url": "/settings", "icon": "Settings", "access": ["student", "teacher", "admin", "staff", "manager", "superadmin", "bbrains_official"] },

    { "title": "Manage Users", "url": "/admin/users", "icon": "UserCog", "access": ["admin", "superadmin"] },
    // { "title": "Teachers", "url": "/admin/teachers", "icon": "UserCheck", "access": ["admin", "superadmin"] },
    // { "title": "Students", "url": "/admin/students", "icon": "Users", "access": ["admin", "superadmin", "teacher", "manager"] },
    { "title": "Roles & Access", "url": "/admin/roles", "icon": "Shield", "access": ["admin", "superadmin"] },
    { "title": "Academics", "url": "/admin/academics", "icon": "GraduationCap", "access": ["admin", "superadmin"] },
    { "title": "Assignments", "url": "/admin/assignments", "icon": "BookOpen", "access": ["admin", "superadmin"] },
    { "title": "Announcements", "url": "/admin/announcements", "icon": "Megaphone", "access": ["admin", "superadmin"] },
    { "title": "Products", "url": "/admin/products", "icon": "ShoppingBag", "access": ["admin", "superadmin"] },
    // { "title": "Statistics", "url": "/admin/stats", "icon": "BarChart3", "access": ["admin", "superadmin"] },
    { "title": "Audit Log", "url": "/admin/audit-log", "icon": "FileText", "access": ["admin", "superadmin", "teacher"] },
    { "title": "Transactions", "url": "/admin/transactions", "icon": "ArrowUpDown", "access": ["admin", "superadmin", "manager"] },
    // { "title": "System Config", "url": "/admin/config", "icon": "Settings2", "access": ["admin", "superadmin", "bbrains_official"] },
    { "title": "Suggestions", "url": "/admin/suggestions", "icon": "MessageSquarePlus", "access": ["admin", "superadmin", "teacher"] },

    { "title": "Tests & Exams", "url": "/teacher/assignments", "icon": "BookOpen", "access": ["teacher"] },
    // { "title": "Grading", "url": "/teacher/grading", "icon": "CheckSquare", "access": ["teacher"] },
    { "title": "Attendance", "url": "/teacher/attendance", "icon": "Calendar", "access": ["teacher"] },
    // { "title": "Announcements", "url": "/teacher/announcements", "icon": "Megaphone", "access": ["teacher"] },
    { "title": "Products", "url": "/teacher/products", "icon": "ShoppingBag", "access": ["teacher"] },

    { "title": "Classes", "url": "/manager/classes", "icon": "BookOpen", "access": ["manager"] },
    { "title": "Teachers", "url": "/manager/teachers", "icon": "UserCheck", "access": ["manager"] },

    { "title": "Achievements", "url": "/admin/achievements", "icon": "Trophy", "access": ["bbrains_official"] },
    { "title": "XP & Levels", "url": "/admin/xpconfig", "icon": "Trophy", "access": ["bbrains_official"] }
]
