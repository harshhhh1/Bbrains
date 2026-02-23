import { XIcon } from '../shared/Icons';
import { Feature } from '@/app/config/features';

interface FeatureDetailModalProps {
  feature: Feature | null;
  onClose: () => void;
  isDarkMode: boolean;
  iconColor: string;
  specialEliteFont: React.CSSProperties;
}

const FeatureDetailModal: React.FC<FeatureDetailModalProps> = ({ feature, onClose, isDarkMode, iconColor, specialEliteFont }) => {
  if (!feature) return null;
  const dark = isDarkMode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <div
        className={`relative w-full max-w-lg p-8 rounded-3xl shadow-2xl ${dark ? 'bg-[#161316] border border-[#54A388] text-white' : 'bg-white text-black'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div className={`p-4 rounded-2xl ${dark ? 'bg-[#43256E] text-white' : 'bg-indigo-100 text-black'}`}>{feature.icon}</div>
          <button onClick={onClose} className="p-2 hover:opacity-70"><XIcon /></button>
        </div>
        <h2 className={`text-3xl font-bold mb-4 ${iconColor}`} style={specialEliteFont}>{feature.title}</h2>
        <p className={`text-lg leading-relaxed ${dark ? 'text-white/90' : 'text-slate-700'}`}>{feature.fullDesc}</p>
        <button
          onClick={onClose}
          className={`mt-8 w-full py-3 rounded-xl font-bold ${dark ? 'bg-[#54A388] text-[#161316]' : 'bg-indigo-600 text-white'}`}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default FeatureDetailModal;
