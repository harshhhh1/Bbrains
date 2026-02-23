import {
  ArrowRight, BarChart3, Bell, BookOpen, Calculator, Calendar,
  CircleDollarSign, Clock3, Gift, Globe, GraduationCap, LayoutDashboard,
  Lightbulb, Lock, Menu, Moon, PanelTop, Pencil, Ruler, ShoppingBag,
  Sun, Trophy, TrendingUp, Users, Wallet, X, Sparkles,
} from 'lucide-react';

import { LucideProps } from 'lucide-react';

export const DashboardIcon = (p: LucideProps) => <LayoutDashboard size={24} {...p} />;
export const TrendingUpIcon = (p: LucideProps) => <TrendingUp size={28} {...p} />;
export const ShoppingBagIcon = (p: LucideProps) => <ShoppingBag size={28} {...p} />;
export const WalletIcon = (p: LucideProps) => <Wallet size={28} {...p} />;
export const ArrowRightIcon = (p: LucideProps) => <ArrowRight size={20} {...p} />;
export const XIcon = (p: LucideProps) => <X size={24} {...p} />;
export const SunIcon = (p: LucideProps) => <Sun size={20} {...p} />;
export const MoonIcon = (p: LucideProps) => <Moon size={20} {...p} />;
export const MenuIcon = (p: LucideProps) => <Menu size={24} {...p} />;
export const CoinIcon = ({ size = 20, ...p }: LucideProps) => <CircleDollarSign size={size} {...p} />;
export const LockIcon = (p: LucideProps) => <Lock size={14} {...p} />;
export const GiftIcon = (p: LucideProps) => <Gift size={24} {...p} />;
export const BellIcon = (p: LucideProps) => <Bell size={20} {...p} />;
export const TrophyIcon = (p: LucideProps) => <Trophy size={20} {...p} />;
export const ClockIcon = (p: LucideProps) => <Clock3 size={16} {...p} />;
export const SparklesIcon = (p: LucideProps) => <Sparkles size={20} {...p} />;
export const CalendarIcon = (p: LucideProps) => <Calendar size={28} {...p} />;
export const UsersIcon = (p: LucideProps) => <Users size={28} {...p} />;
export const BarChart3Icon = (p: LucideProps) => <BarChart3 size={28} {...p} />;

// Floating bg icons
export const PencilIcon = (p: LucideProps) => <Pencil size={24} strokeWidth={1.5} {...p} />;
export const BookIcon = (p: LucideProps) => <BookOpen size={24} strokeWidth={1.5} {...p} />;
export const BoardIcon = (p: LucideProps) => <PanelTop size={24} strokeWidth={1.5} {...p} />;
export const CalculatorIcon = (p: LucideProps) => <Calculator size={24} strokeWidth={1.5} {...p} />;
export const GlobeIcon = (p: LucideProps) => <Globe size={24} strokeWidth={1.5} {...p} />;
export const LightbulbIcon = (p: LucideProps) => <Lightbulb size={24} strokeWidth={1.5} {...p} />;
export const RulerIcon = (p: LucideProps) => <Ruler size={24} strokeWidth={1.5} {...p} />;
export const GraduationIcon = (p: LucideProps) => <GraduationCap size={24} strokeWidth={1.5} {...p} />;
