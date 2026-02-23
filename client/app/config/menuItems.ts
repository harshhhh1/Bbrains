export interface MenuItem {
    name: string;
    path: string;
    label: string;
    category: string;
    roles?: string[];
}

export const menuitems: MenuItem[] = [
    {
        name: 'Dashboard',
        path: '/dashboard',
        label: 'dashboard',
        category: 'Core',
        roles: ['admin', 'student', 'teacher']
    },
    {
        name: "Announcements",
        path: '/announcements',
        label: 'announcement',
        category: 'Information'
    },
    {
        name: "Wallet",
        path: '/wallet',
        label: 'wallet',
        category: 'Finance',
        roles: ['admin', 'student', 'teacher']
    },
    {
        name: "Exams",
        path: '/exams',
        label: 'exams',
        category: 'Academics',
        roles: ['admin', 'student', 'teacher']
    },
    {
        name: "Chat",
        path: '/dashboard/chat',
        label: 'chat',
        category: 'Communication',
        roles: ['admin', 'student', 'teacher']
    },
    {
        name: "Attendance",
        path: '/attendance',
        label: 'attendance',
        category: 'Academics',
        roles: ['admin', 'teacher']
    },
    {
        name: "Payment History",
        path: '/payment-history',
        label: 'payment-history',
        category: 'Finance'
    }
];