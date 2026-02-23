interface ToastNotificationProps {
  message: string | null;
  isDarkMode: boolean;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, isDarkMode }) => {
  if (!message) return null;
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-2xl font-semibold text-sm"
      style={{
        background: isDarkMode ? '#54A388' : '#4f46e5',
        color: isDarkMode ? '#161316' : 'white',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      {message}
    </div>
  );
};

export default ToastNotification;
