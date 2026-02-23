import { ClockIcon } from '../shared/Icons';

interface UpcomingDeadlineProps {
  isDarkMode: boolean;
}

const UpcomingDeadline: React.FC<UpcomingDeadlineProps> = ({ isDarkMode }) => {
  const dark = isDarkMode;
  return (
    <div className={`col-span-2 p-3 rounded-xl border flex items-center justify-between ${dark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-100'}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${dark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}><ClockIcon /></div>
        <div>
          <h4 className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-800'}`}>Physics Final</h4>
          <p className={`text-[10px] ${dark ? 'text-white/60' : 'text-slate-500'}`}>Due in 2 hours</p>
        </div>
      </div>
      <div className={`text-xs font-bold px-2 py-1 rounded border ${dark ? 'border-red-500/50 text-red-400' : 'border-red-200 text-red-600'}`}>
        High Priority
      </div>
    </div>
  );
};

export default UpcomingDeadline;
