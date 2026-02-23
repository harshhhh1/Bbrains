import { GiftIcon } from '../shared/Icons';

// highlight=true when this is the first visit and user hasn't claimed yet
interface DailyRewardCardProps {
  isDarkMode: boolean;
  iconColor: string;
  specialEliteFont: React.CSSProperties;
  DAILY_POINTS: number;
  dailyClaimed: boolean;
  claimDailyPoints: () => void;
  highlight: boolean;
}

const DailyRewardCard: React.FC<DailyRewardCardProps> = ({ isDarkMode, iconColor, specialEliteFont, DAILY_POINTS, dailyClaimed, claimDailyPoints, highlight }) => {
  const dark = isDarkMode;

  if (dailyClaimed) {
    return (
      <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 ${dark ? 'bg-[#161316]/40 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
        <span className="text-2xl">🎉</span>
        <span className={`text-sm font-bold ${dark ? 'text-green-400' : 'text-green-600'}`}>Claimed Today!</span>
        <span className={`text-[10px] ${dark ? 'text-white/40' : 'text-slate-400'}`}>Come back tomorrow</span>
      </div>
    );
  }

  return (
    <div
      onClick={claimDailyPoints}
      className={`p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group
        ${dark
          ? 'bg-gradient-to-br from-[#54A388]/20 to-[#43256E]/20 border-[#54A388]/40 hover:border-[#54A388]'
          : 'bg-white border-indigo-100 hover:border-indigo-400'
        }
        ${highlight ? (dark ? 'ring-2 ring-[#54A388] shadow-lg shadow-[#54A388]/30' : 'ring-2 ring-indigo-400 shadow-lg shadow-indigo-400/30') : 'hover:scale-[1.02]'}
      `}
      style={highlight ? { animation: 'claimPulse 2s ease-in-out infinite' } : {}}
    >
      {/* "Claim first!" badge */}
      {highlight && (
        <div className={`absolute -top-1 -right-1 px-2 py-0.5 rounded-bl-lg rounded-tr-xl text-[9px] font-black uppercase tracking-wider
          ${dark ? 'bg-[#54A388] text-[#161316]' : 'bg-indigo-600 text-white'}`}>
          Start here!
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <span className={`p-2 rounded-lg ${dark ? 'bg-[#54A388]/20 text-[#54A388]' : 'bg-indigo-50 text-indigo-600'}`}>
          <GiftIcon />
        </span>
        <span className={`text-sm font-black ${dark ? 'text-[#54A388]' : 'text-indigo-600'}`}>+{DAILY_POINTS} 🪙</span>
      </div>

      <h4 className={`font-bold text-sm ${iconColor}`} style={specialEliteFont}>Daily Reward</h4>
      <p className={`text-[10px] mt-0.5 ${dark ? 'text-white/60' : 'text-slate-400'}`}>
        {highlight ? 'Tap to claim your free coins!' : 'Click to claim!'}
      </p>

      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
};

export default DailyRewardCard;
