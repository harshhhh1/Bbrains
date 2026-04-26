import { title } from "process";

export const sidebarItems = [
    {
        "title": "Dashboard",
        "icon": "Home",
        "access": ["student", "teacher", "admin", "staff", "manager","superadmin"],
        "isDashboard": true
    },
    { "title": "Announcements", "url": "/announcements", "icon": "Megaphone", "access": ["student", "teacher", "admin", "staff", "manager",] },
    { "title": "Events", "url": "/events", "icon": "Calendar", "access": ["student", "teacher", "admin", "staff", "manager",] },
    { "title": "Assignments", "url": "/assignments", "icon": "Book", "access": ["student", "teacher", "admin", "manager"] },
    { "title": "Results", "url": "/results", "icon": "Trophy", "access": ["student"] },
    { "title": "Leaderboard", "url": "/leaderboard", "icon": "Trophy", "access": ["student", "teacher", "admin", "staff", "manager",] },
    { "title": "Chat", "url": "/chat", "icon": "MessageSquare", "access": ["student", "teacher", "admin", "staff", "manager",] },
    {
        "title": "Transactions",
        "url": "/transactions",
        "icon": "ArrowUpDown",
        "access": ["student", "teacher", "admin", "staff", "manager",]
    },
    {
        "title": "Wallet",
        "url": "/wallet",
        "icon": "Wallet",
        "access": ["student", "teacher", "admin", "staff", "manager",],
        "subItems": [{ "title": "Payment History", "url": "/wallet/payments", "icon": "CreditCard" }]
    },
    {
        "title": "Market",
        "url": "/market",
        "icon": "ShoppingCart",
        "access": ["student", "teacher", "admin", "staff", "manager",],
        "subItems": [
            { "title": "Browse", "url": "/market", "icon": "ShoppingCart" },
            { "title": "My Products", "url": "/products", "icon": "ShoppingBag" },
            { "title": "Library", "url": "/library", "icon": "Library" },
            { "title": "Orders", "url": "/orders", "icon": "FileText" }
        ]
    },
    { "title": "Tools", "url": "/tools", "icon": "Wrench", "access": ["student"] },
    { "title": "Suggestions", "url": "/suggestions", "icon": "MessageSquarePlus", "access": ["student", "teacher", "admin", "staff", "manager"] },
    { "title": "Settings", "url": "/settings", "icon": "Settings", "access": ["student", "teacher", "admin", "staff", "manager"] },

    { "title": "Manage Users", "url": "/users", "icon": "UserCog", "access": ["admin"] },
    { "title": "Colleges", "url": "/colleges", "icon": "Building2", "access": ["superadmin"] },
    { "title": "Roles & Access", "url": "/admin/roles", "icon": "Shield", "access": ["admin"] },
    { "title": "Sidebar Config", "url": "/admin/config/sidebar-access", "icon": "Settings2", "access": ["admin"] },
    { "title": "Academics", "url": "/admin/academics", "icon": "GraduationCap", "access": ["admin", "manager"] },
    { "title": "Products", "url": "/products", "icon": "ShoppingBag", "access": ["admin", "teacher", "manager"] },
    // { "title": "Statistics", "url": "/admin/stats", "icon": "BarChart3", "access": ["admin",  ] },
    { "title": "Audit Log", "url": "/admin/audit-log", "icon": "FileText", "access": ["admin", , "teacher"] },
    // { "title": "System Config", "url": "/admin/config", "icon": "Settings2", "access": ["admin",  , "bbrains_official"] },
    // { "title": "Grading", "url": "/teacher/grading", "icon": "CheckSquare", "access": ["teacher"] },
    { "title": "Attendance", "url": "/teacher/attendance", "icon": "Calendar", "access": ["teacher"] },
    // { "title": "Announcements", "url": "/teacher/announcements", "icon": "Megaphone", "access": ["teacher"] },

    { "title": "Classes", "url": "/manager/classes", "icon": "BookOpen", "access": ["manager"] },
    { "title": "Teachers", "url": "/manager/teachers", "icon": "UserCheck", "access": ["manager"] },

    { "title": "Achievements", "url": "/admin/achievements", "icon": "Trophy", "access": ["bbrains_official"] },
    { "title": "XP & Levels", "url": "/admin/xpconfig", "icon": "Trophy", "access": ["bbrains_official"] }
]
