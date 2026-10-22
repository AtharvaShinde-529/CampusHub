import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axios';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [feed, setFeed] = useState<any>({ events: [], opportunities: [], clubs: [] });
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [guardedClubs, setGuardedClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) navigate('/');
    else fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [feedRes, myClubsRes] = await Promise.all([api.get('/feed'), api.get('/organizations/my')]);
      setFeed(feedRes.data);
      setMyClubs(myClubsRes.data);
      
      if (user.role === 'FACULTY') {
        const guardedRes = await api.get('/organizations/guarded');
        setGuardedClubs(guardedRes.data);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading Feed...</div>;

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        
        {/* Left Column: My Clubs & Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">?? My Clubs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myClubs.map(c => (
                <div key={c.id} className="border p-4 rounded-lg bg-gray-50">
                  <h3 className="font-bold text-blue-700">{c.organization.name}</h3>
                  <p className="text-sm text-gray-500 font-semibold mb-3">Role: {c.role}</p>
                  {c.role === 'CLUB_HEAD' && (
                    <Link to={`/organizations/${c.organization.id}/manage`} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Manage Club</Link>
                  )}
                </div>
              ))}
              {myClubs.length === 0 && <p className="text-sm text-gray-500">You haven't joined any clubs yet.</p>}
            </div>
          </div>

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
