import { XIcon } from './Icons';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  iconColor: string | undefined;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, isDarkMode, iconColor }) => {
  if (!isOpen) return null;
  const dark = isDarkMode;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${dark ? 'bg-[#161316] border border-white/30' : 'bg-white'}`}>
        <div className={`flex items-center justify-between p-6 border-b ${dark ? 'border-white/10 bg-[#43256E]/20' : 'border-slate-100 bg-slate-50/50'}`}>
          <h3 className={`text-xl font-bold ${iconColor}`}>Get in Touch</h3>
          <button onClick={onClose} className={`p-2 rounded-full ${dark ? 'text-white hover:bg-[#43256E]' : 'text-black hover:bg-slate-100'}`}><XIcon /></button>
        </div>
        <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); onClose(); }}>
          {['Full Name', 'Institution', 'Email'].map((label) => (
            <div key={label} className="space-y-1">
              <label className={`text-xs font-bold uppercase ${dark ? 'text-[#54A388]' : 'text-slate-500'}`}>{label}</label>
              <input required className={`w-full px-4 py-3 rounded-lg border outline-none ${dark ? 'bg-[#161316] border-white/30 text-white focus:border-[#54A388]' : 'bg-white border-slate-200 focus:border-indigo-500'}`} />
            </div>
          ))}
          <div className="space-y-1">
            <label className={`text-xs font-bold uppercase ${dark ? 'text-[#54A388]' : 'text-slate-500'}`}>Message</label>
            <textarea rows={3} required className={`w-full px-4 py-3 rounded-lg border outline-none resize-none ${dark ? 'bg-[#161316] border-white/30 text-white focus:border-[#54A388]' : 'bg-white border-slate-200 focus:border-indigo-500'}`} />
          </div>
          <button type="submit" className={`w-full py-3 mt-2 font-bold rounded-lg shadow-lg ${dark ? 'bg-[#54A388] text-[#161316]' : 'bg-indigo-600 text-white'}`}>
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
