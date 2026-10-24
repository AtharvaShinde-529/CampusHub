import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/axios';
import { Bell, Hexagon, LogOut, Settings as SettingsIcon, Search, Building2, Calendar, Rocket, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || '{}'));
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>({ users: [], organizations: [], events: [], opportunities: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        const res = await api.get('/users/profile');
        const { id, email, globalRole, avatarUrl } = res.data;
        const currentUser = { id, email, role: globalRole, avatarUrl };
        localStorage.setItem('user', JSON.stringify(currentUser));
        setUser(currentUser);
      } catch (err) {}
    };
    fetchLatestUser();
    const handleUpdate = () => setUser(JSON.parse(localStorage.getItem('user') || '{}'));
    window.addEventListener('userUpdated', handleUpdate);
    return () => window.removeEventListener('userUpdated', handleUpdate);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Debounced Search
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults({ users: [], organizations: [], events: [], opportunities: [] });
      setShowSearchDropdown(false);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/search?q=${searchQuery}`);
        setSearchResults(res.data);
        setShowSearchDropdown(true);
      } catch (err) { console.error(err); }
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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

  const handleSearchNavigation = (path: string) => {
    setSearchQuery('');
    setShowSearchDropdown(false);
    navigate(path);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const navLinks = [
    { name: 'Feed', path: '/dashboard' },
    { name: 'Clubs', path: '/organizations' },
    { name: 'Calendar', path: '/calendar' },
    { name: 'Recruitment', path: '/recruitment' },
    { name: 'Opportunities', path: '/opportunities' },
    { name: 'Messages', path: '/chat' },
    { name: 'Exchange', path: '/exchange' },
  ];

  const hasResults = searchResults.users.length > 0 || searchResults.organizations.length > 0 || searchResults.events.length > 0 || searchResults.opportunities.length > 0;

  return (
    <nav className="sticky top-0 z-50 glass no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          
          <Link to="/dashboard" className="flex items-center gap-2 group shrink-0">
            <div className="bg-brand-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <Hexagon className="text-white fill-white/20" size={24} />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Campus<span className="text-brand-600 dark:text-brand-500">Hub</span>
            </span>
          </Link>

          {/* Global Search Bar */}
          <div className="relative flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search campus..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-full bg-slate-100 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => { if (hasResults) setShowSearchDropdown(true); }}
                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
              />
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {showSearchDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50 max-h-[80vh] overflow-y-auto"
                >
                  {!hasResults && searchQuery.length >= 2 && !isSearching && (
                    <div className="p-4 text-center text-sm text-slate-500">No results found for "{searchQuery}"</div>
                  )}
                  {isSearching && <div className="p-4 text-center text-sm text-slate-500">Searching...</div>}

                  {/* Users */}
                  {searchResults.users.length > 0 && (
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">People</p>
                      {searchResults.users.map((u: any) => (
                        <div key={u.id} onClick={() => handleSearchNavigation(`/user/${u.id}`)} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition">
                          {u.avatarUrl ? <img src={u.avatarUrl} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs"><UserIcon size={14}/></div>}
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white">{u.name}</p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Organizations */}
                  {searchResults.organizations.length > 0 && (
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">Clubs</p>
                      {searchResults.organizations.map((o: any) => (
                        <div key={o.id} onClick={() => handleSearchNavigation('/organizations')} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition">
                          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><Building2 size={16}/></div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{o.name}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Events */}
                  {searchResults.events.length > 0 && (
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="text-xs font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">Events</p>
                      {searchResults.events.map((e: any) => (
                        <div key={e.id} onClick={() => handleSearchNavigation('/events')} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition">
                          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Calendar size={16}/></div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{e.title}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Opportunities */}
                  {searchResults.opportunities.length > 0 && (
                    <div className="p-2">
                      <p className="text-xs font-bold text-slate-400 px-2 py-1 uppercase tracking-wider">Opportunities</p>
                      {searchResults.opportunities.map((o: any) => (
                        <div key={o.id} onClick={() => handleSearchNavigation('/opportunities')} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition">
                          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Rocket size={16}/></div>
                          <p className="text-sm font-bold text-slate-800 dark:text-white">{o.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden lg:flex space-x-1 shrink-0">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link key={link.name} to={link.path} className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${isActive ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-500' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  {link.name}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="relative">
              <button onClick={() => { setShowDropdown(!showDropdown); setShowProfile(false); }} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800">{unreadCount}</span>
                )}
              </button>
              <AnimatePresence>
                {showDropdown && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white">Notifications</div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-4 border-b border-slate-100 dark:border-slate-700 cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-700/50 ${n.isRead ? 'opacity-60' : 'bg-brand-50/50 dark:bg-brand-900/20'}`}>
                          <p className="font-semibold text-sm text-slate-800 dark:text-white">{n.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
                        </div>
                      ))}
                      {notifications.length === 0 && <div className="p-8 text-center text-slate-400 text-sm">No new notifications.</div>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button onClick={() => { setShowProfile(!showProfile); setShowDropdown(false); }} className="flex items-center gap-2 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="h-8 w-8 rounded-full object-cover border-2 border-brand-500" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-brand-600 to-purple-500 text-white flex items-center justify-center font-bold text-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
              <AnimatePresence>
                {showProfile && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 py-2">
                    <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 mb-1">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.email}</p>
                    </div>
                    <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                      <SettingsIcon size={16} /> Settings
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700">
                      <LogOut size={16} /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
