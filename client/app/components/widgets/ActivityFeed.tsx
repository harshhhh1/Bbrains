import { BellIcon } from '../shared/Icons';

interface ActivityFeedProps {
  isDarkMode: boolean;
  iconColor: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ isDarkMode, iconColor }) => {
  const dark = isDarkMode;
  const muted = dark ? 'text-white/60' : 'text-slate-400';

  return (
    <div className={`p-4 rounded-2xl border flex flex-col justify-center space-y-2 ${dark ? 'bg-[#161316]/40 border-white/10' : 'bg-white/60 border-slate-100'}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className={`${iconColor} opacity-70`}><BellIcon /></span>
        <span className={`text-xs font-bold uppercase tracking-wider ${muted}`}>Activity</span>
      </div>
      <p className={`text-xs truncate ${dark ? 'text-white/80' : 'text-slate-600'}`}><b>Sarah</b> submitted <i>Math Quiz</i></p>
      <p className={`text-xs truncate ${muted}`}><b>Alex</b> reached Lvl 5</p>
    </div>
  );
};

export default ActivityFeed;
