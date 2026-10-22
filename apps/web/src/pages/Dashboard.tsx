import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api/axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [feed, setFeed] = useState<any>({ events: [], opportunities: [], clubs: [] });
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
    } else {
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [feedRes, clubsRes] = await Promise.all([
        api.get('/feed'),
        api.get('/organizations/my')
      ]);
      setFeed(feedRes.data);
      setMyClubs(clubsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xl">Loading Campus Feed...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">CampusHub</h1>
          <div className="hidden md:flex space-x-4 font-medium text-gray-600">
            <Link to="/dashboard" className="text-blue-600">Feed</Link>
            <Link to="/organizations" className="hover:text-blue-600">Clubs</Link>
            <Link to="/events" className="hover:text-blue-600">Events</Link>
            <Link to="/opportunities" className="hover:text-blue-600">Opportunities</Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">{user.role}</span>
          <button onClick={handleLogout} className="text-sm font-semibold text-red-500 hover:text-red-700">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: My Clubs */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">My Clubs</h2>
            <div className="space-y-3">
              {myClubs.map(membership => (
                <div key={membership.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <h3 className="font-bold text-sm text-gray-800">{membership.organization.name}</h3>
                  <p className="text-xs text-green-600 font-semibold mt-1">{membership.role}</p>
                </div>
              ))}
              {myClubs.length === 0 && <p className="text-sm text-gray-500">You haven't joined any clubs yet.</p>}
            </div>
            <Link to="/organizations" className="mt-4 block text-center text-sm text-blue-600 font-semibold hover:underline">Explore Clubs ?</Link>
          </div>
        </div>

        {/* Right Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Upcoming Events */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">?? Upcoming Events</h2>
              <Link to="/events" className="text-sm text-blue-600 font-semibold">View All</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {feed.events.map((event: any) => (
                <div key={event.id} className="border p-4 rounded-lg hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-lg text-blue-700">{event.title}</h3>
                  <p className="text-sm text-gray-500 font-semibold mb-2">{event.organization?.name}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>
                  <p className="text-xs text-gray-500 mt-3 font-medium">?? {new Date(event.startDate).toLocaleDateString()}</p>
                </div>
              ))}
              {feed.events.length === 0 && <p className="text-sm text-gray-500">No upcoming events.</p>}
            </div>
          </div>

          {/* External Opportunities */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">?? Opportunities</h2>
              <Link to="/opportunities" className="text-sm text-blue-600 font-semibold">View All</Link>
            </div>
            <div className="space-y-3">
              {feed.opportunities.map((opp: any) => (
                <div key={opp.id} className="border-l-4 border-purple-500 p-4 bg-purple-50 rounded-r-lg">
                  <h3 className="font-bold text-lg text-purple-800">{opp.title}</h3>
                  <p className="text-sm text-gray-700 line-clamp-2">{opp.description}</p>
                  <p className="text-xs text-red-600 mt-2 font-bold">Deadline: {new Date(opp.deadline).toLocaleDateString()}</p>
                </div>
              ))}
              {feed.opportunities.length === 0 && <p className="text-sm text-gray-500">No new opportunities.</p>}
            </div>
          </div>

          {/* Discover New Clubs */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">?? Discover Clubs</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {feed.clubs.map((club: any) => (
                <div key={club.id} className="bg-green-50 border border-green-200 px-4 py-2 rounded-full">
                  <span className="text-sm font-bold text-green-800">{club.name}</span>
                </div>
              ))}
              {feed.clubs.length === 0 && <p className="text-sm text-gray-500">No clubs found.</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
