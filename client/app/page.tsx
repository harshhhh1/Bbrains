"use client"

import { useState } from 'react';
import { TrendingUpIcon, ShoppingBagIcon, WalletIcon } from './components/shared/Icons';
import Navbar from './components/landing/Navbar';
import FloatingIconsLayer from './components/landing/FloatingIconsLayer';
import HeroSection from './components/landing/HeroSection';
import FeaturesGrid from './components/landing/FeaturesGrid';
import ContactModal from './components/shared/ContactModal';
import FeatureDetailModal from './components/landing/FeatureDetailModal';
import ToastNotification from './components/shared/ToastNotification';
import LandingFooter from './components/landing/LandingFooter';
import { useTheme } from './context/ThemeContext';
import { useRewards } from './hooks/useRewards';
import { LANDING_FEATURES } from './config/features';

const specialEliteFont = { fontFamily: '"Special Elite", cursive' };
const DARK_MODE_PRICE = 100;
const DAILY_POINTS = 50;

export default function Home() {
  const {
    isDarkMode,
    setIsDarkMode,
    isDarkModeUnlocked,
    coins,
    dailyClaimed
  } = useTheme();

  const {
    animatingCoins,
    justClaimed,
    toast,
    claimDailyPoints,
    purchaseDarkMode
  } = useRewards(DAILY_POINTS);

  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const iconColor = isDarkMode ? 'text-white' : 'text-black';

  const handleDarkModeToggle = () => {
    if (!isDarkModeUnlocked) {
      return; // Handled by tooltips or purchase flow in grid
    }
    setIsDarkMode(!isDarkMode);
  };

  const isFirstVisit = !dailyClaimed;
  const highlightDarkMode = justClaimed && !isDarkModeUnlocked;

  return (
    <div className={`relative min-h-screen lg:h-screen w-full overflow-y-auto lg:overflow-hidden font-sans transition-colors duration-500 flex flex-col ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-black'}`}>
      <ToastNotification message={toast} isDarkMode={isDarkMode} />
      <FloatingIconsLayer isDarkMode={isDarkMode} />

      <Navbar {...{
        isDarkMode,
        setIsDarkMode,
        handleDarkModeToggle,
        isDarkModeUnlocked,
        coins,
        animatingCoins,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        specialEliteFont,
        iconColor
      }} />

      {/* First-visit welcome banner */}
      {isFirstVisit && (
        <div className={`mx-6 mb-2 px-4 py-2.5 rounded-xl flex items-center justify-between text-sm font-semibold z-10 relative
          ${isDarkMode ? 'bg-[#54A388]/20 border border-[#54A388]/40 text-[#54A388]' : 'bg-indigo-50 border border-indigo-200 text-indigo-700'}`}>
          <span>Welcome! Claim your <b>free daily reward</b> on the right to get started →</span>
          <span className="text-xs opacity-60 hidden sm:block">+{DAILY_POINTS} coins waiting for you</span>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 py-2 overflow-y-auto lg:overflow-hidden content-center">
        <HeroSection isDarkMode={isDarkMode} iconColor={iconColor} specialEliteFont={specialEliteFont} onContactClick={() => setIsContactOpen(true)} />
        <FeaturesGrid
          {...{
            isDarkMode,
            iconColor,
            specialEliteFont,
            coins,
            DARK_MODE_PRICE,
            isDarkModeUnlocked,
            purchaseDarkMode: () => purchaseDarkMode(DARK_MODE_PRICE),
            DAILY_POINTS,
            dailyClaimed,
            claimDailyPoints,
            features: LANDING_FEATURES,
            setSelectedFeature
          }}
          highlightDaily={isFirstVisit}
          highlightDarkMode={highlightDarkMode}
        />
      </main>

      <FeatureDetailModal feature={selectedFeature} onClose={() => setSelectedFeature(null)} isDarkMode={isDarkMode} iconColor={iconColor} specialEliteFont={specialEliteFont} />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} isDarkMode={isDarkMode} iconColor={undefined} />
      <LandingFooter isDarkMode={isDarkMode} />
    </div>
  );
}
