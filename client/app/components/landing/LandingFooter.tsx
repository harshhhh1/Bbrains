interface LandingFooterProps {
  isDarkMode: boolean;
}

const LandingFooter: React.FC<LandingFooterProps> = ({ isDarkMode }) => (
  <footer className={`flex-none w-full py-4 text-center text-xs backdrop-blur-sm z-10 ${isDarkMode ? 'border-t border-white/10 text-white/40' : 'border-t border-slate-200 text-slate-400'}`}>
    <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p>&copy; {new Date().getFullYear()} Bbrains. All rights reserved.</p>
      <div className="flex items-center gap-4">
        {['Privacy Policy', 'Terms of Service', 'Contact'].map(l => <a key={l} href="#" className="hover:underline">{l}</a>)}
      </div>
    </div>
  </footer>
);

export default LandingFooter;
