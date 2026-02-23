interface HeroSectionProps {
  isDarkMode: boolean;
  iconColor: string;
  specialEliteFont: React.CSSProperties;
  onContactClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ isDarkMode, iconColor, specialEliteFont, onContactClick }) => {
  const dark = isDarkMode;
  const accent = dark ? 'text-[#54A388]' : 'text-indigo-600';
  const muted = dark ? 'text-white/80' : 'text-slate-500';

  return (
    <div className="lg:col-span-5 flex flex-col justify-center lg:pb-12 space-y-4">
      <div className="space-y-3">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${dark ? 'bg-[#43256E]/30 border-[#54A388] text-[#54A388]' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
          Digital Economy for Education
        </div>
        <h1 className="text-5xl lg:text-6xl font-bold leading-[1.1]" style={specialEliteFont}>
          Learn. Earn.<br />
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${dark ? 'from-[#C1B2FF] to-[#54A388]' : 'from-indigo-600 to-blue-500'}`}>
            Evolve.
          </span>
        </h1>
        <p className={`text-lg leading-relaxed max-w-md ${muted}`}>
          The first LMS that simulates a real digital economy. Turn grades into currency, master financial literacy.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 max-w-md">
        <div className="relative flex-1">
          <input
            type="email"
            placeholder="Enter your email"
            className={`w-full h-full px-4 py-2.5 rounded-xl border outline-none transition-all ${dark ? 'bg-white/5 border-white/20 text-white focus:border-[#54A388] focus:bg-white/10' : 'bg-white border-slate-200 focus:border-indigo-500'}`}
          />
        </div>
        <button
          onClick={onContactClick}
          className={`px-6 py-2.5 rounded-xl font-bold text-base shadow-xl hover:scale-105 active:scale-95 transition-all whitespace-nowrap ${dark ? 'bg-[#54A388] text-[#161316] shadow-[#54A388]/20 hover:bg-[#488e76]' : 'bg-indigo-600 text-white shadow-indigo-500/30 hover:bg-indigo-700'}`}
        >
          Contact Us
        </button>
      </div>

      <div className={`pt-4 flex items-center gap-6 border-t ${dark ? 'border-white/20' : 'border-slate-200/60'}`}>
        {[['12k+', 'Active Students'], ['45+', 'Partner Colleges']].map(([num, label], i) => (
          <div key={label} className="flex items-center gap-6">
            {i > 0 && <div className={`w-px h-8 ${dark ? 'bg-white/20' : 'bg-slate-200'}`} />}
            <div className="flex flex-col">
              <span className={`text-2xl font-black ${iconColor}`}>{num}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wide ${accent}`}>{label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
