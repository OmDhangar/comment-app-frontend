import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../context/notificationContext';

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
    // You can also redirect or open comment thread if needed
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="p-2 hover:bg-gray-100 rounded-full relative"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

        {open && (
            <div className="absolute left-0 mt-2 min-w-[250px] max-w-[90vw] bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">No notifications</div>
            ) : (
                <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                    <li
                    key={notification.id}
                    className={`p-3 hover:bg-gray-100 cursor-pointer ${!notification.isRead ? 'bg-gray-50' : ''}`}
                    onClick={() => handleNotificationClick(notification.id)}
                    >
                    <div className="text-sm font-medium text-gray-800">{notification.message}</div>
                    <div className="text-xs text-gray-500">{new Date(notification.createdAt).toLocaleString()}</div>
                    </li>
                ))}
                </ul>
            )}
            </div>
        )}
</div>

  );
};
