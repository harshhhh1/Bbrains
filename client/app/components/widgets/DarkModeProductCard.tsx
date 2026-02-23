import { MoonIcon, CoinIcon } from '../shared/Icons';

// highlight=true when daily was just claimed and dark mode isn't bought yet — nudge the user
interface DarkModeProductCardProps {
  isDarkMode: boolean;
  iconColor: string;
  specialEliteFont: React.CSSProperties;
  DARK_MODE_PRICE: number;
  isDarkModeUnlocked: boolean;
  coins: number;
  purchaseDarkMode: () => void;
  highlight: boolean;
}

const DarkModeProductCard: React.FC<DarkModeProductCardProps> = ({ isDarkMode, iconColor, specialEliteFont, DARK_MODE_PRICE, isDarkModeUnlocked, coins, purchaseDarkMode, highlight }) => {
  const dark = isDarkMode;
  const canAfford = coins >= DARK_MODE_PRICE;

  const btnClass = isDarkModeUnlocked
    ? 'border border-green-500 text-green-500 cursor-not-allowed'
    : canAfford
      ? `${dark ? 'bg-[#54A388] text-[#161316]' : 'bg-indigo-600 text-white'} hover:scale-[1.02] shadow-lg cursor-pointer`
      : `${dark ? 'bg-white/10 text-white/30' : 'bg-slate-100 text-slate-400'} cursor-not-allowed`;

  return (
    <div className={`row-span-2 p-5 rounded-2xl border flex flex-col justify-between relative overflow-hidden group transition-all
      ${dark ? 'bg-[#161316]/60 border-white/20' : 'bg-white/80 border-slate-200'}
      ${highlight && !isDarkModeUnlocked ? (dark ? 'ring-2 ring-[#54A388] shadow-xl shadow-[#54A388]/20' : 'ring-2 ring-indigo-400 shadow-xl shadow-indigo-400/20') : ''}
    `}
      style={highlight && !isDarkModeUnlocked ? { animation: 'claimPulse 2.5s ease-in-out infinite' } : {}}
    >
      {/* Decorative moon bg */}
      <div className={`absolute top-0 right-0 p-3 opacity-10 ${iconColor}`}><MoonIcon /></div>

      {/* "Unlock next!" badge shown after daily claim */}
      {highlight && !isDarkModeUnlocked && (
        <div className={`absolute -top-1 -right-1 px-2 py-0.5 rounded-bl-lg rounded-tr-xl text-[9px] font-black uppercase tracking-wider
          ${dark ? 'bg-[#54A388] text-[#161316]' : 'bg-indigo-600 text-white'}`}>
          Unlock next!
        </div>
      )}

      <div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl shadow-lg ${dark ? 'bg-[#43256E] text-[#C1B2FF]' : 'bg-indigo-100 text-indigo-600'}`}>
          🌙
        </div>
        <h3 className={`text-xl font-bold mb-1 ${iconColor}`} style={specialEliteFont}>Dark Mode</h3>
        <p className={`text-xs leading-relaxed ${dark ? 'text-white/70' : 'text-slate-500'}`}>
          Unlock a premium dark theme for your entire experience.
        </p>

        {/* Progress bar when close to affording */}
        {!isDarkModeUnlocked && (
          <div className="mt-3">
            <div className={`flex justify-between text-[10px] mb-1 ${dark ? 'text-white/50' : 'text-slate-400'}`}>
              <span>{coins} / {DARK_MODE_PRICE} coins</span>
              {canAfford && <span className={`font-bold ${dark ? 'text-[#54A388]' : 'text-indigo-600'}`}>Ready!</span>}
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${dark ? 'bg-white/10' : 'bg-slate-100'}`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${dark ? 'bg-[#54A388]' : 'bg-indigo-500'}`}
                style={{ width: `${Math.min((coins / DARK_MODE_PRICE) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-1 mb-3">
          <span className={iconColor}><CoinIcon size={14} /></span>
          <span className={`text-lg font-bold ${iconColor}`}>{DARK_MODE_PRICE}</span>
        </div>
        <button
          onClick={purchaseDarkMode}
          disabled={isDarkModeUnlocked || !canAfford}
          className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${btnClass}`}
        >
          {isDarkModeUnlocked ? '✓ Purchased' : canAfford ? 'Buy Now' : `Need ${DARK_MODE_PRICE - coins} more coins`}
        </button>
      </div>
    </div>
  );
};

export default DarkModeProductCard;
