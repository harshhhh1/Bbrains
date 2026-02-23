import React from 'react';
import {
    TrendingUpIcon, ShoppingBagIcon, WalletIcon,
    CalendarIcon, BookIcon, UsersIcon,
    BarChart3Icon, BellIcon
} from '../components/shared/Icons';

export interface Feature {
    id: number;
    title: string;
    icon: React.ReactNode;
    shortDesc: string;
    fullDesc: string;
}

export const ALL_FEATURES: Feature[] = [
    {
        id: 1,
        title: 'Leveling System',
        icon: <TrendingUpIcon />,
        shortDesc: 'Earn XP via academics.',
        fullDesc: 'Students earn Experience Points (XP) for every assignment submitted, grade achieved, and attendance milestone. Level up to unlock campus privileges.'
    },
    {
        id: 2,
        title: 'Marketplace',
        icon: <ShoppingBagIcon />,
        shortDesc: 'Spend currency on perks.',
        fullDesc: "A fully simulated economy. Use your earned 'LearnCoins' to buy hall passes, library overdue waivers, or custom profile cosmetics."
    },
    {
        id: 3,
        title: 'Digital Wallet',
        icon: <WalletIcon />,
        shortDesc: 'Secure transaction tracking.',
        fullDesc: 'Real-time ledger tracking. Experience the flow of money, understand savings, and learn financial responsibility in a safe environment.'
    },
    {
        id: 4,
        title: 'Course Scheduling',
        icon: <CalendarIcon />,
        shortDesc: 'Easily create and manage academic schedules.',
        fullDesc: 'Streamline course planning with an intuitive scheduling system. Manage class times, room assignments, and instructor availability all in one place.'
    },
    {
        id: 5,
        title: 'Gradebook',
        icon: <BookIcon />,
        shortDesc: 'Centralized system for tracking student performance.',
        fullDesc: 'Comprehensive grade tracking with detailed analytics. Monitor student progress, identify trends, and provide timely feedback to support academic success.'
    },
    {
        id: 6,
        title: 'Attendance Tracking',
        icon: <UsersIcon />,
        shortDesc: 'Real-time attendance monitoring and alerts.',
        fullDesc: 'Automated attendance system with instant notifications. Track patterns, generate reports, and ensure accountability across all classes.'
    },
    {
        id: 7,
        title: 'Parent Communication',
        icon: <BellIcon />,
        shortDesc: 'Seamless school-home communication tools.',
        fullDesc: 'Bridge the gap between school and home with instant messaging, progress reports, and event notifications to keep parents engaged.'
    },
    {
        id: 8,
        title: 'Financials Management',
        icon: <WalletIcon />,
        shortDesc: 'Secure tuition, fees, and financial aid handling.',
        fullDesc: 'Complete financial oversight with payment processing, scholarship management, and detailed financial reporting for transparency.'
    },
    {
        id: 9,
        title: 'Reporting & Analytics',
        icon: <BarChart3Icon />,
        shortDesc: 'Gain insights with comprehensive customizable reports.',
        fullDesc: 'Data-driven decision making with powerful analytics. Generate custom reports, visualize trends, and track key performance indicators.'
    },
];

export const LANDING_FEATURES = ALL_FEATURES.slice(0, 3);
