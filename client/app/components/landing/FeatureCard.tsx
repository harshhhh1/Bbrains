import Link from 'next/link';
import { ArrowRightIcon } from '../shared/Icons';
import { Feature } from '@/app/config/features';

interface FeatureCardProps {
  feature: Feature | null;
  isDarkMode: boolean;
  iconColor: string;
  specialEliteFont: React.CSSProperties;
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature, isDarkMode, iconColor, specialEliteFont, onClick }) => {
  const dark = isDarkMode;

  if (!feature) {
    return (
      <Link href="/features" className={`group p-3 sm:p-4 rounded-xl border border-dashed flex flex-col items-center justify-center text-center transition-all
        ${dark ? 'border-white/30 hover:bg-[#43256E]/20 hover:border-white' : 'border-slate-300 hover:bg-indigo-50/50 hover:border-indigo-500'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${dark ? 'bg-[#43256E] text-white' : 'bg-slate-100 text-black'}`}>
          <ArrowRightIcon />
        </div>
        <span className={`font-bold text-xs sm:text-sm ${iconColor}`} style={specialEliteFont}>And Many More...</span>
      </Link>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`group p-4 rounded-2xl border cursor-pointer backdrop-blur-md relative overflow-hidden min-h-[140px] flex flex-col justify-between transition-all duration-300
        ${dark ? 'bg-[#161316]/60 border-white/20 hover:border-[#54A388]' : 'bg-white/80 border-slate-200 hover:border-indigo-500 shadow-sm'}`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${dark ? 'bg-[#43256E] text-white' : 'bg-indigo-50 text-black'}`}>
        {feature.icon}
      </div>
      <div>
        <h3 className={`text-lg font-bold mb-1 ${iconColor}`} style={specialEliteFont}>{feature.title}</h3>
        <p className={`text-xs leading-relaxed ${dark ? 'text-white/70' : 'text-slate-500'}`}>{feature.shortDesc}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
