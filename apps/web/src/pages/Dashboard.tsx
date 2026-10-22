import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [feed, setFeed] = useState<any>({ events: [], opportunities: [], clubs: [] });
  const [guardedClubs, setGuardedClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/');
    else fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [feedRes] = await Promise.all([api.get('/feed')]);
      setFeed(feedRes.data);
      
      if (user.role === 'FACULTY') {
        const guardedRes = await api.get('/organizations/guarded');
        setGuardedClubs(guardedRes.data);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading Feed...</div>;

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">CampusHub</h1>
          <div className="hidden md:flex space-x-4 font-medium text-gray-600">
            <Link to="/dashboard" className="text-blue-600">Feed</Link>
            <Link to="/organizations" className="hover:text-blue-600">Clubs</Link>
            <Link to="/recruitment" className="hover:text-blue-600">Recruitment</Link>
            <Link to="/events" className="hover:text-blue-600">Events</Link>
            <Link to="/opportunities" className="hover:text-blue-600">Opportunities</Link>
            {user.role === 'ADMIN' && <Link to="/admin/approvals" className="text-red-600 font-bold hover:text-red-800">Approvals</Link>}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/profile" className="text-sm font-semibold text-blue-600 hover:underline">My Profile</Link>
          <button onClick={() => { localStorage.clear(); navigate('/'); }} className="text-sm font-semibold text-red-500 hover:text-red-700">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        
        {/* Left Column: Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">?? Upcoming Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feed.events.map((e: any) => (
                <div key={e.id} className="border p-4 rounded-lg bg-gray-50">
                  <h3 className="font-bold text-blue-700">{e.title}</h3>
                  <p className="text-xs text-gray-500">{new Date(e.startDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column: Opportunities & Faculty View */}
        <div className="space-y-6">
          {user.role === 'FACULTY' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border-t-4 border-blue-500">
              <h2 className="text-xl font-bold mb-4 text-blue-800">????? Clubs I Mentor</h2>
              {guardedClubs.map(c => (
                <div key={c.id} className="border p-3 rounded mb-2 bg-blue-50">
                  <h3 className="font-bold text-sm">{c.name}</h3>
                  <p className="text-xs text-gray-600">Members: {c.memberships.length}</p>
                </div>
              ))}
              {guardedClubs.length === 0 && <p className="text-sm text-gray-500">No clubs assigned yet.</p>}
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">?? Opportunities</h2>
            <div className="space-y-3">
              {feed.opportunities.map((o: any) => (
                <div key={o.id} className="border-l-4 border-purple-500 pl-3">
                  <h3 className="font-bold text-purple-800 text-sm">{o.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
