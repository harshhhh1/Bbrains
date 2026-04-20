import React, { useState, useEffect } from 'react';

interface AchievementUnlockedProps {
  title?: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
}

const AchievementUnlocked = ({ 
  title = "Achievement Unlocked", 
  description = "Level Up!", 
  duration = 4000, 
  onClose 
}: AchievementUnlockedProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Mount the component first, then trigger the CSS transition
    setShouldRender(true);
    const showTimer = setTimeout(() => setIsVisible(true), 50);

    // Trigger the exit animation before the duration ends
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      // Wait for the exit transition (500ms) to finish before unmounting
      setTimeout(() => {
        setShouldRender(false);
        if (onClose) onClose();
      }, 500);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  if (!shouldRender) return null;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex justify-center w-full max-w-sm pointer-events-none">
      <div
        className={`flex items-center gap-4 bg-[#1a1a1a] text-white p-2 pr-6 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-gray-800 transition-all duration-500 ease-out ${
          isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-12 opacity-0 scale-95'
        }`}
      >
        {/* Animated Trophy/Star Icon Wrapper */}
        <div className="flex-shrink-0 bg-green-500 rounded-full p-2.5 animate-[pulse_2s_ease-in-out_infinite]">
          <svg 
            className="w-6 h-6 text-[#1a1a1a]" 
            fill="currentColor" 
            viewBox="0 0 20 20" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        
        {/* Text Details */}
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">
            {title}
          </span>
          <span className="text-sm font-semibold text-gray-100 tracking-wide">
            {description}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AchievementUnlocked;