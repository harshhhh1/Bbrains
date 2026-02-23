import Link from 'next/link';
import { CoinIcon, SunIcon, MoonIcon, LockIcon, DashboardIcon, XIcon, MenuIcon } from '../shared/Icons';

interface NavbarProps {
  isDarkMode: boolean;
  handleDarkModeToggle: () => void;
  isDarkModeUnlocked: boolean;
  coins: number;
  animatingCoins: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  specialEliteFont: React.CSSProperties;
  iconColor: string;
}

const Navbar: React.FC<NavbarProps> = ({
  isDarkMode,
  handleDarkModeToggle,
  isDarkModeUnlocked,
  coins,
  animatingCoins,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  specialEliteFont,
  iconColor
}) => {
  const dark = isDarkMode;
  const btnBase = `p-2.5 rounded-full transition-all border relative ${dark ? 'border-white/20 hover:bg-white/10 text-white' : 'border-slate-300 hover:bg-slate-100 text-black'}`;

  return (
    <header className="flex-none flex items-center justify-between px-6 py-4 z-20 backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg ${dark ? 'bg-[#54A388] text-[#161316]' : 'bg-indigo-600 text-white'}`}>B</div>
        <span className={`text-2xl font-bold tracking-tight ${iconColor}`} style={specialEliteFont}>Brains</span>
      </Link>

      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-4">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${dark ? 'bg-[#161316]/50 border-white/30' : 'bg-white border-slate-200'}`}
          style={animatingCoins ? { animation: 'coinPulse 0.3s ease-in-out' } : {}}
        >
          <span className={iconColor}><CoinIcon size={20} /></span>
          <span className={`font-bold text-sm ${iconColor}`}>{coins}</span>
        </div>

        <button onClick={handleDarkModeToggle} className={`${btnBase} ${!isDarkModeUnlocked ? 'opacity-60 cursor-not-allowed' : ''}`}>
          {dark ? <SunIcon /> : <MoonIcon />}
          {!isDarkModeUnlocked && <span className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5"><LockIcon /></span>}
        </button>

        <Link href="/login" className={`text-sm font-bold transition-all ${dark ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-black'}`}>
          Login
        </Link>

        <Link href="/dashboard" className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border transition-all shadow-sm
          ${dark ? 'bg-[#161316] border-white text-white hover:bg-white hover:text-[#161316]' : 'bg-white border-slate-200 text-black hover:border-indigo-600 hover:text-indigo-600'}`}>
          <span className={iconColor}><DashboardIcon /></span>
          <span>Go to Dashboard</span>
        </Link>
      </div>

      {/* Mobile */}
      <div className="flex sm:hidden items-center gap-2">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${dark ? 'bg-[#161316]/50 border-white/20' : 'bg-white border-slate-200'}`}>
          <span className={iconColor}><CoinIcon size={14} /></span>
          <span className={`font-bold ${iconColor}`}>{coins}</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`p-2 rounded-lg transition-all ${dark ? 'text-white hover:bg-white/10' : 'text-black hover:bg-slate-100'}`}>
          {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className={`sm:hidden absolute top-16 left-0 right-0 z-30 mx-4 rounded-xl shadow-2xl overflow-hidden
          ${dark ? 'bg-[#161316] border border-white/20' : 'bg-white border border-slate-200'}`}>
          <div className="p-4 flex flex-col gap-3">
            <button onClick={handleDarkModeToggle} className={`flex items-center justify-between w-full p-3 rounded-lg border ${dark ? 'border-white/20 text-white' : 'border-slate-300 text-black'}`}>
              <span className="text-sm font-semibold">Dark Mode</span>
              <div className="relative">
                {dark ? <SunIcon /> : <MoonIcon />}
                {!isDarkModeUnlocked && <span className="absolute -top-1 -right-1 bg-red-500 rounded-full p-0.5 scale-75"><LockIcon /></span>}
              </div>
            </button>
            <Link href="/login" className={`flex items-center justify-center p-3 rounded-lg border text-sm font-semibold ${dark ? 'border-white/20 text-white' : 'border-slate-300 text-black'}`}>
              Login
            </Link>
            <Link href="/dashboard" className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold border transition-all
              ${dark ? 'bg-[#161316] border-white text-white hover:bg-white hover:text-[#161316]' : 'bg-white border-slate-200 text-black hover:border-indigo-600'}`}>
              <DashboardIcon /> Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
