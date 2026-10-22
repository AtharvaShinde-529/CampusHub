import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { Bell } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Optional: poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) { console.error(err); }
  };

  const markAsRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center space-x-6">
        <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">CampusHub</h1>
        <div className="hidden md:flex space-x-4 font-medium text-gray-600">
          <Link to="/dashboard" className="hover:text-blue-600">Feed</Link>
          <Link to="/organizations" className="hover:text-blue-600">Clubs</Link>
          <Link to="/recruitment" className="hover:text-blue-600">Recruitment</Link>
          <Link to="/events" className="hover:text-blue-600">Events</Link>
          <Link to="/opportunities" className="hover:text-blue-600">Opportunities</Link>
          {user.role === 'ADMIN' && <Link to="/admin" className="text-red-600 font-bold hover:text-red-800">Admin Panel</Link>}
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        {/* Notification Bell */}
        <div className="relative">
          <button onClick={() => setShowDropdown(!showDropdown)} className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-xl z-50">
              <div className="p-3 border-b font-bold text-gray-700">Notifications</div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${n.isRead ? 'opacity-50' : 'bg-blue-50'}`}>
                    <p className="font-semibold text-sm">{n.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{n.message}</p>
                  </div>
                ))}
                {notifications.length === 0 && <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>}
              </div>
            </div>
          )}
        </div>

        <Link to="/profile" className="text-sm font-semibold text-blue-600 hover:underline">My Profile</Link>
        <button onClick={handleLogout} className="text-sm font-semibold text-red-500 hover:text-red-700">Logout</button>
      </div>
    </nav>
  );
}
