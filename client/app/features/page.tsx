"use client"
import { useState } from 'react';

import Link from 'next/link';
import { TrendingUpIcon, ShoppingBagIcon, WalletIcon, CalendarIcon, BookIcon, UsersIcon, BarChart3Icon, BellIcon, ArrowRightIcon } from '../components/shared/Icons';
import Navbar from '../components/landing/Navbar';
import LandingFooter from '../components/landing/LandingFooter';
import FeatureDetailModal from '../components/landing/FeatureDetailModal';
import ToastNotification from '../components/shared/ToastNotification';
import { useTheme } from '../context/ThemeContext';

import { ALL_FEATURES } from '../config/features';

const specialEliteFont = { fontFamily: '"Special Elite", cursive' };

const FeaturesPage: React.FC = () => {
  const { isDarkMode, setIsDarkMode, isDarkModeUnlocked, coins } = useTheme();
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const iconColor = isDarkMode ? 'text-white' : 'text-black';
  const dark = isDarkMode;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const handleDarkModeToggle = () => {
    if (!isDarkModeUnlocked) { showToast('Purchase Dark Mode from the home page!'); return; }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`relative min-h-screen w-full overflow-y-auto font-sans transition-colors duration-500 flex flex-col ${dark ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-black'}`}>
      <ToastNotification message={toast} isDarkMode={dark} />
      <Navbar {...{ isDarkMode, setIsDarkMode, handleDarkModeToggle, isDarkModeUnlocked, coins, specialEliteFont, iconColor }} animatingCoins={false} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 relative z-10">
        <Link href="/" className={`inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-lg border transition-all hover:scale-105
          ${dark ? 'bg-[#161316]/60 border-white/20 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-black hover:border-indigo-500 hover:shadow-md'}`}>
          <div className="rotate-180"><ArrowRightIcon /></div>
          <span className="font-semibold">Back to Home</span>
        </Link>

        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${iconColor}`} style={specialEliteFont}>All Features</h1>
          <p className={`text-lg ${dark ? 'text-white/70' : 'text-slate-600'}`}>Discover all the powerful features that make Bbrains the ultimate educational platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ALL_FEATURES.map((feature) => (
            <div
              key={feature.id}
              onClick={() => setSelectedFeature(feature)}
              className={`group p-6 rounded-2xl border cursor-pointer backdrop-blur-md min-h-50 flex flex-col justify-between hover:scale-105 transition-all duration-300
                ${dark ? 'bg-[#161316]/60 border-white/20 hover:border-[#54A388] hover:shadow-lg hover:shadow-[#54A388]/20' : 'bg-white/80 border-slate-200 hover:border-indigo-500 shadow-sm hover:shadow-xl hover:shadow-indigo-500/20'}`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${dark ? 'bg-[#43256E] text-white' : 'bg-indigo-50 text-black'}`}>{feature.icon}</div>
              <div>
                <h3 className={`text-xl font-bold mb-2 ${iconColor}`} style={specialEliteFont}>{feature.title}</h3>
                <p className={`text-sm leading-relaxed ${dark ? 'text-white/70' : 'text-slate-500'}`}>{feature.shortDesc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <FeatureDetailModal feature={selectedFeature} onClose={() => setSelectedFeature(null)} {...{ isDarkMode, iconColor, specialEliteFont }} />
      <LandingFooter {...{ isDarkMode, iconColor }} />
    </div>
  );
};

export default FeaturesPage;
